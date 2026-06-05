import os
import uuid
from datetime import date as date_type, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import LeaveRequest, LeaveBalance, Employee, User, Notification
from app.schemas.leave import (
    LeaveResponse, LeaveListResponse, LeaveBalanceResponse,
    LeaveBalanceUpdate, LeaveStatusUpdate,
)
from app.dependencies import get_current_user, require_hr, require_manager
from app.config import settings

router = APIRouter(prefix="/leave", tags=["leave"])

ALLOWED_EXTS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _generate_leave_id(db: Session) -> str:
    year = datetime.utcnow().year
    last = (
        db.query(LeaveRequest.leave_id)
        .filter(LeaveRequest.leave_id.like(f"LV-{year}-%"))
        .order_by(LeaveRequest.leave_id.desc())
        .first()
    )
    if not last:
        return f"LV-{year}-0001"
    try:
        num = int(last[0].split("-")[2]) + 1
    except (IndexError, ValueError):
        num = db.query(LeaveRequest).filter(LeaveRequest.leave_id.like(f"LV-{year}-%")).count() + 1
    return f"LV-{year}-{str(num).zfill(4)}"


def _notify_user(db: Session, employee_id: str, title: str, body: str, icon: str = "notifications", color: str = "primary"):
    user = db.query(User).filter(User.employee_id == employee_id).first()
    if user:
        db.add(Notification(user_id=user.id, title=title, body=body, icon=icon, color=color))


@router.get("", response_model=LeaveListResponse)
def list_leave(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(""),
    leave_type: str = Query(""),
    employee_id: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(LeaveRequest).options(
        joinedload(LeaveRequest.employee).joinedload(Employee.department)
    )

    if current_user.role == "Employee" and current_user.employee_id:
        q = q.filter(LeaveRequest.employee_id == current_user.employee_id)
    else:
        if employee_id:
            q = q.filter(LeaveRequest.employee_id == employee_id)

    if status:
        q = q.filter(LeaveRequest.status == status)
    if leave_type:
        q = q.filter(LeaveRequest.leave_type == leave_type)

    total = q.count()
    requests = q.order_by(LeaveRequest.leave_id.asc()).offset((page - 1) * limit).limit(limit).all()
    return LeaveListResponse(requests=requests, total=total, page=page, limit=limit)


@router.post("", response_model=LeaveResponse, status_code=201)
async def create_leave(
    employee_id: str = Form(...),
    leave_type: str = Form(...),
    from_date: date_type = Form(...),
    to_date: date_type = Form(...),
    reason: str = Form(...),
    document: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if to_date < from_date:
        raise HTTPException(status_code=422, detail="to_date must be on or after from_date")

    if current_user.role == "Employee" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="You can only submit leave requests for yourself")

    if not db.query(Employee).filter(Employee.id == employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")

    document_path = None
    if document and document.filename:
        ext = os.path.splitext(document.filename)[1].lower()
        if ext not in ALLOWED_EXTS:
            raise HTTPException(status_code=422, detail="Only PDF, JPG, and PNG files are allowed")
        content = await document.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=422, detail="File exceeds 10MB limit")
        upload_dir = os.path.join(settings.upload_dir, "leave_documents")
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        document_path = filepath

    days = (to_date - from_date).days + 1

    leave = LeaveRequest(
        leave_id=_generate_leave_id(db),
        employee_id=employee_id,
        leave_type=leave_type,
        from_date=from_date,
        to_date=to_date,
        days=days,
        reason=reason,
        document_path=document_path,
        status="Pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)

    return db.query(LeaveRequest).options(
        joinedload(LeaveRequest.employee).joinedload(Employee.department)
    ).filter(LeaveRequest.id == leave.id).first()


@router.put("/{leave_id}/approve", response_model=LeaveResponse)
def approve_leave(
    leave_id: str,
    payload: LeaveStatusUpdate = LeaveStatusUpdate(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != "Pending":
        raise HTTPException(status_code=409, detail="Leave request is not pending")

    balance = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == leave.employee_id,
        LeaveBalance.leave_type == leave.leave_type,
    ).first()
    if balance and (balance.total - balance.used) < leave.days:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient leave balance: {balance.total - balance.used} day(s) remaining, {leave.days} requested"
        )

    leave.status = "Approved"

    if balance:
        balance.used = balance.used + leave.days

    _notify_user(
        db, leave.employee_id,
        "Leave Approved",
        f"Your {leave.leave_type} request from {leave.from_date} to {leave.to_date} has been approved.",
        icon="check_circle",
        color="success",
    )
    db.commit()
    db.refresh(leave)

    return db.query(LeaveRequest).options(
        joinedload(LeaveRequest.employee).joinedload(Employee.department)
    ).filter(LeaveRequest.id == leave.id).first()


@router.put("/{leave_id}/reject", response_model=LeaveResponse)
def reject_leave(
    leave_id: str,
    payload: LeaveStatusUpdate = LeaveStatusUpdate(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != "Pending":
        raise HTTPException(status_code=409, detail="Leave request is not pending")

    leave.status = "Rejected"

    _notify_user(
        db, leave.employee_id,
        "Leave Rejected",
        f"Your {leave.leave_type} request from {leave.from_date} to {leave.to_date} has been rejected.",
        icon="cancel",
        color="error",
    )
    db.commit()
    db.refresh(leave)

    return db.query(LeaveRequest).options(
        joinedload(LeaveRequest.employee).joinedload(Employee.department)
    ).filter(LeaveRequest.id == leave.id).first()


@router.get("/employee/{employee_id}/balance", response_model=list[LeaveBalanceResponse])
def get_leave_balance(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager", "Manager") and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    balances = db.query(LeaveBalance).filter(LeaveBalance.employee_id == employee_id).all()
    return [
        LeaveBalanceResponse(
            leave_type=b.leave_type,
            used=b.used,
            total=b.total,
            remaining=max(b.total - b.used, 0),
        )
        for b in balances
    ]


@router.put("/employee/{employee_id}/balance", response_model=LeaveBalanceResponse)
def update_leave_balance(
    employee_id: str,
    payload: LeaveBalanceUpdate,
    leave_type: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    balance = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == employee_id,
        LeaveBalance.leave_type == leave_type,
    ).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Leave balance not found")
    if payload.total < balance.used:
        raise HTTPException(
            status_code=422,
            detail=f"Total ({payload.total}) cannot be less than already used ({balance.used})"
        )

    balance.total = payload.total
    db.commit()
    db.refresh(balance)
    return LeaveBalanceResponse(
        leave_type=balance.leave_type,
        used=balance.used,
        total=balance.total,
        remaining=max(balance.total - balance.used, 0),
    )


@router.get("/employee/{employee_id}", response_model=LeaveListResponse)
def employee_leave_history(
    employee_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager", "Manager") and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    q = db.query(LeaveRequest).options(
        joinedload(LeaveRequest.employee).joinedload(Employee.department)
    ).filter(LeaveRequest.employee_id == employee_id)
    total = q.count()
    requests = q.order_by(LeaveRequest.leave_id.asc()).offset((page - 1) * limit).limit(limit).all()
    return LeaveListResponse(requests=requests, total=total, page=page, limit=limit)
