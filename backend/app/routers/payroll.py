from datetime import date as date_type, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models import Payroll, PayslipItem, Employee, Department, User, Notification
from app.schemas.payroll import (
    PayrollCreate, PayrollResponse, PayrollStats,
    PayrollListResponse, PayslipResponse, PayslipItemSchema,
)
from app.dependencies import get_current_user, require_hr
from app.limiter import limiter

router = APIRouter(prefix="/payroll", tags=["payroll"])


def _generate_payroll_id(db: Session) -> str:
    from datetime import timezone as _tz
    year = datetime.now(_tz.utc).year
    last = (
        db.query(Payroll.payroll_id)
        .filter(Payroll.payroll_id.like(f"PR-{year}-%"))
        .order_by(Payroll.payroll_id.desc())
        .first()
    )
    if not last:
        return f"PR-{year}-001"
    try:
        num = int(last[0].split("-")[2]) + 1
    except (IndexError, ValueError):
        num = db.query(Payroll).filter(Payroll.payroll_id.like(f"PR-{year}-%")).count() + 1
    return f"PR-{year}-{str(num).zfill(3)}"


def _notify_user(db: Session, employee_id: str, title: str, body: str):
    user = db.query(User).filter(User.employee_id == employee_id).first()
    if user:
        db.add(Notification(user_id=user.id, title=title, body=body, icon="payments", color="success"))


def _build_default_items(basic: Decimal, bonus: Decimal, deductions: Decimal) -> tuple[list, list]:
    earnings = [{"item_type": "earning", "label": "Basic Salary", "amount": basic}]
    if bonus > 0:
        earnings.append({"item_type": "earning", "label": "Bonus", "amount": bonus})
    deduction_items = []
    if deductions > 0:
        deduction_items.append({"item_type": "deduction", "label": "Deductions", "amount": deductions})
    return earnings, deduction_items


@router.get("/stats", response_model=PayrollStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(
        Payroll.status,
        func.sum(Payroll.net),
        func.sum(Payroll.bonus),
        func.sum(Payroll.deductions),
        func.count(Payroll.id),
    ).group_by(Payroll.status).all()

    total = paid = pending = Decimal("0")
    total_bonus = total_deductions = Decimal("0")
    record_count = 0

    for row in rows:
        net_sum = Decimal(str(row[1] or 0))
        bonus_sum = Decimal(str(row[2] or 0))
        ded_sum = Decimal(str(row[3] or 0))
        count = row[4] or 0
        total += net_sum
        total_bonus += bonus_sum
        total_deductions += ded_sum
        record_count += count
        if row[0] == "Paid":
            paid += net_sum
        else:
            pending += net_sum

    return PayrollStats(
        total_payroll=total,
        paid=paid,
        pending=pending,
        total_bonus=total_bonus,
        total_deductions=total_deductions,
        record_count=record_count,
    )


@router.get("", response_model=PayrollListResponse)
def list_payroll(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(""),
    dept: str = Query(""),
    month: str = Query(""),
    search: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Payroll).options(
        joinedload(Payroll.employee).joinedload(Employee.department),
        joinedload(Payroll.employee).joinedload(Employee.position),
    )

    if current_user.role == "Employee" and current_user.employee_id:
        q = q.filter(Payroll.employee_id == current_user.employee_id)
    if status:
        q = q.filter(Payroll.status == status)
    if month:
        q = q.filter(Payroll.month == month)
    if dept:
        q = q.filter(Payroll.employee.has(Employee.department.has(Department.name == dept)))
    if search:
        q = q.filter(Payroll.employee.has(Employee.name.ilike(f"%{search}%")))

    total = q.count()
    records = q.order_by(Payroll.payroll_id.asc()).offset((page - 1) * limit).limit(limit).all()
    return PayrollListResponse(records=records, total=total, page=page, limit=limit)


@router.post("", response_model=PayrollResponse, status_code=201)
@limiter.limit("20/minute")
def create_payroll(
    request: Request,
    payload: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    if not db.query(Employee).filter(Employee.id == payload.employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")

    net = payload.basic + payload.bonus - payload.deductions

    record = Payroll(
        payroll_id=_generate_payroll_id(db),
        employee_id=payload.employee_id,
        basic=payload.basic,
        bonus=payload.bonus,
        deductions=payload.deductions,
        net=net,
        month=payload.month,
        status="Pending",
    )
    db.add(record)
    db.flush()

    earnings_items, deduction_items = _build_default_items(payload.basic, payload.bonus, payload.deductions)

    if payload.earnings_items:
        earnings_items = [i.model_dump() for i in payload.earnings_items]
    if payload.deduction_items:
        deduction_items = [i.model_dump() for i in payload.deduction_items]

    for item in earnings_items + deduction_items:
        db.add(PayslipItem(payroll_id=record.id, **item))

    db.commit()
    db.refresh(record)

    return db.query(Payroll).options(
        joinedload(Payroll.employee).joinedload(Employee.department),
        joinedload(Payroll.employee).joinedload(Employee.position),
    ).filter(Payroll.id == record.id).first()


@router.put("/{payroll_id}/approve", response_model=PayrollResponse)
@limiter.limit("20/minute")
def approve_payroll(
    request: Request,
    payroll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    record = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    if record.status == "Paid":
        raise HTTPException(status_code=409, detail="Payroll already paid")

    record.status = "Paid"
    record.paid_on = date_type.today()

    _notify_user(
        db, record.employee_id,
        "Salary Processed",
        f"Your salary for {record.month} has been processed (net: ${float(record.net):,.2f}).",
    )
    db.commit()
    db.refresh(record)

    return db.query(Payroll).options(
        joinedload(Payroll.employee).joinedload(Employee.department),
        joinedload(Payroll.employee).joinedload(Employee.position),
    ).filter(Payroll.id == record.id).first()


@router.get("/{payroll_id}/payslip", response_model=PayslipResponse)
def get_payslip(
    payroll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Payroll).options(
        joinedload(Payroll.employee).joinedload(Employee.department),
        joinedload(Payroll.employee).joinedload(Employee.position),
        joinedload(Payroll.items),
    ).filter(Payroll.id == payroll_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Payroll record not found")

    if current_user.role not in ("Admin", "HR Manager") and current_user.employee_id != record.employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    earnings = [PayslipItemSchema.model_validate(i) for i in record.items if i.item_type == "earning"]
    deductions = [PayslipItemSchema.model_validate(i) for i in record.items if i.item_type == "deduction"]

    return PayslipResponse(
        id=record.id,
        payroll_id=record.payroll_id,
        employee=record.employee,
        month=record.month,
        earnings=earnings,
        deductions_items=deductions,
        total_earnings=sum(i.amount for i in earnings),
        total_deductions=sum(i.amount for i in deductions),
        net_pay=record.net,
        status=record.status,
        paid_on=record.paid_on,
    )


@router.delete("/{payroll_id}", status_code=204)
def delete_payroll(
    payroll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    record = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    if record.status == "Paid":
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a paid payroll record. Only pending records can be removed."
        )
    db.delete(record)
    db.commit()


@router.get("/employee/{employee_id}", response_model=PayrollListResponse)
def employee_payroll_history(
    employee_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager") and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    q = db.query(Payroll).options(
        joinedload(Payroll.employee).joinedload(Employee.department),
        joinedload(Payroll.employee).joinedload(Employee.position),
    ).filter(Payroll.employee_id == employee_id)
    total = q.count()
    records = q.order_by(Payroll.payroll_id.asc()).offset((page - 1) * limit).limit(limit).all()
    return PayrollListResponse(records=records, total=total, page=page, limit=limit)
