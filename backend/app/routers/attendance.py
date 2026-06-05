from datetime import date as date_type, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from app.database import get_db
from app.models import Attendance, Employee, Department, User
from app.schemas.attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    AttendanceStats, AttendanceListResponse,
)
from app.dependencies import get_current_user, require_hr

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _calc_hours(check_in: str, check_out: str) -> str | None:
    if not check_in or not check_out:
        return None
    try:
        from datetime import timedelta
        fmt = "%H:%M"
        ci = datetime.strptime(check_in, fmt)
        co = datetime.strptime(check_out, fmt)
        diff = co - ci
        if diff.total_seconds() < 0:
            diff += timedelta(days=1)  # overnight shift (e.g. 22:00 → 06:00)
        h, rem = divmod(int(diff.total_seconds()), 3600)
        m = rem // 60
        return f"{h}h {m}m"
    except ValueError:
        return None


@router.get("/stats", response_model=AttendanceStats)
def get_stats(
    target_date: date_type = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = target_date or date_type.today()
    results = db.query(Attendance.status, func.count(Attendance.id)).filter(Attendance.date == d).group_by(Attendance.status).all()
    counts = {row[0]: row[1] for row in results}
    total = sum(counts.values())
    return AttendanceStats(
        present=counts.get("Present", 0),
        late=counts.get("Late", 0),
        absent=counts.get("Absent", 0),
        on_leave=counts.get("On Leave", 0),
        total=total,
    )


@router.get("", response_model=AttendanceListResponse)
def list_attendance(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=500),
    target_date: date_type = Query(default=None),
    dept: str = Query(""),
    status: str = Query(""),
    employee_id: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Attendance).options(joinedload(Attendance.employee).joinedload(Employee.department))

    if target_date:
        q = q.filter(Attendance.date == target_date)
    if status:
        q = q.filter(Attendance.status == status)
    if employee_id:
        q = q.filter(Attendance.employee_id == employee_id)
    if dept:
        q = q.filter(Attendance.employee.has(Employee.department.has(Department.name == dept)))

    total = q.count()
    records = q.order_by(Attendance.created_at.asc()).offset((page - 1) * limit).limit(limit).all()

    enriched = []
    for r in records:
        resp = AttendanceResponse.model_validate(r)
        resp.hours = _calc_hours(r.check_in, r.check_out)
        enriched.append(resp)

    return AttendanceListResponse(records=enriched, total=total, page=page, limit=limit)


@router.post("", response_model=AttendanceResponse, status_code=201)
def create_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    if not db.query(Employee).filter(Employee.id == payload.employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Attendance).filter(
        and_(Attendance.employee_id == payload.employee_id, Attendance.date == payload.date)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Attendance already recorded for this employee on this date")

    record = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
        check_in=payload.check_in,
        check_out=payload.check_out,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    resp = AttendanceResponse.model_validate(
        db.query(Attendance).options(joinedload(Attendance.employee)).filter(Attendance.id == record.id).first()
    )
    resp.hours = _calc_hours(record.check_in, record.check_out)
    return resp


@router.put("/{record_id}", response_model=AttendanceResponse)
def update_attendance(
    record_id: str,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    record = db.query(Attendance).filter(Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    resp = AttendanceResponse.model_validate(
        db.query(Attendance).options(joinedload(Attendance.employee)).filter(Attendance.id == record.id).first()
    )
    resp.hours = _calc_hours(record.check_in, record.check_out)
    return resp


@router.get("/employee/{employee_id}", response_model=AttendanceListResponse)
def employee_attendance(
    employee_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager", "Manager") and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    q = db.query(Attendance).options(joinedload(Attendance.employee)).filter(Attendance.employee_id == employee_id)
    total = q.count()
    records = q.order_by(Attendance.date.desc()).offset((page - 1) * limit).limit(limit).all()

    enriched = []
    for r in records:
        resp = AttendanceResponse.model_validate(r)
        resp.hours = _calc_hours(r.check_in, r.check_out)
        enriched.append(resp)

    return AttendanceListResponse(records=enriched, total=total, page=page, limit=limit)
