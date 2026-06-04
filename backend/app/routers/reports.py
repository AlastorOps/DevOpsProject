from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models import Employee, Attendance, LeaveRequest, Payroll, PerformanceReview, Department, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])

REPORT_TYPES = [
    {"id": "headcount", "name": "Headcount Report", "description": "Employee count by department and status"},
    {"id": "payroll", "name": "Payroll Summary", "description": "Salary totals and payment status"},
    {"id": "leave", "name": "Leave Report", "description": "Leave requests by type and status"},
    {"id": "attendance", "name": "Attendance Report", "description": "Attendance rates and trends"},
    {"id": "performance", "name": "Performance Report", "description": "Review ratings distribution"},
]


@router.get("")
def list_report_types(current_user: User = Depends(get_current_user)):
    return REPORT_TYPES


@router.post("/generate")
def generate_report(
    report_type: str = Query(...),
    dept_filter: str = Query(""),
    period_filter: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager", "Manager"):
        raise HTTPException(status_code=403, detail="Access denied")

    if report_type == "payroll" and current_user.role not in ("Admin", "HR Manager"):
        raise HTTPException(status_code=403, detail="Payroll reports require HR Manager or Admin access")

    if report_type == "headcount":
        return _headcount_report(db, dept_filter)
    elif report_type == "payroll":
        return _payroll_report(db, dept_filter, period_filter)
    elif report_type == "leave":
        return _leave_report(db, dept_filter, period_filter)
    elif report_type == "attendance":
        return _attendance_report(db, dept_filter, period_filter)
    elif report_type == "performance":
        return _performance_report(db, dept_filter)
    else:
        return {"error": "Unknown report type"}


def _headcount_report(db: Session, dept_filter: str):
    q = db.query(
        Department.name,
        func.count(Employee.id).label("total"),
        func.sum(case((Employee.status == "Active", 1), else_=0)).label("active"),
        func.sum(case((Employee.status == "Inactive", 1), else_=0)).label("inactive"),
    ).outerjoin(Employee, Employee.department_id == Department.id)

    if dept_filter:
        q = q.filter(Department.name == dept_filter)

    rows = q.group_by(Department.name).all()
    total_employees = db.query(func.count(Employee.id)).scalar()
    active = db.query(func.count(Employee.id)).filter(Employee.status == "Active").scalar()

    return {
        "type": "headcount",
        "summary": {"total_employees": total_employees, "active": active, "inactive": total_employees - active},
        "by_department": [
            {"department": r[0], "total": r[1] or 0, "active": r[2] or 0, "inactive": r[3] or 0}
            for r in rows
        ],
    }


def _payroll_report(db: Session, dept_filter: str, period_filter: str):
    summary_q = db.query(
        func.count(Payroll.id),
        func.sum(Payroll.net),
        func.sum(Payroll.bonus),
        func.sum(case((Payroll.status == "Paid", 1), else_=0)),
    )
    if period_filter:
        summary_q = summary_q.filter(Payroll.month == period_filter)
    if dept_filter:
        summary_q = summary_q.join(Payroll.employee).join(Employee.department).filter(Department.name == dept_filter)

    row = summary_q.first()
    total_records = row[0] or 0
    total_net = float(row[1] or 0)
    total_bonus = float(row[2] or 0)
    paid_count = row[3] or 0

    dept_q = db.query(
        Department.name,
        func.sum(Payroll.net).label("net"),
        func.count(Payroll.id).label("count"),
    ).join(Payroll.employee).join(Employee.department)

    if period_filter:
        dept_q = dept_q.filter(Payroll.month == period_filter)
    if dept_filter:
        dept_q = dept_q.filter(Department.name == dept_filter)

    dept_rows = dept_q.group_by(Department.name).all()

    return {
        "type": "payroll",
        "summary": {
            "total_records": total_records,
            "total_net": total_net,
            "total_bonus": total_bonus,
            "paid": paid_count,
            "pending": total_records - paid_count,
        },
        "by_department": [
            {"department": r[0], "total_net": float(r[1] or 0), "employee_count": r[2] or 0}
            for r in dept_rows
        ],
    }


def _leave_report(db: Session, dept_filter: str, period_filter: str):
    q = db.query(LeaveRequest)
    if dept_filter:
        q = q.join(LeaveRequest.employee).join(Employee.department).filter(Department.name == dept_filter)

    rows = q.all()
    by_type: dict = {}
    by_status = {"Pending": 0, "Approved": 0, "Rejected": 0}

    for r in rows:
        by_type[r.leave_type] = by_type.get(r.leave_type, 0) + 1
        by_status[r.status] = by_status.get(r.status, 0) + 1

    return {
        "type": "leave",
        "summary": {"total": len(rows), **by_status},
        "by_type": [{"leave_type": lt, "count": count} for lt, count in by_type.items()],
    }


def _attendance_report(db: Session, dept_filter: str, period_filter: str):
    q = db.query(
        Attendance.status,
        func.count(Attendance.id),
    )
    if dept_filter:
        q = q.join(Attendance.employee).join(Employee.department).filter(Department.name == dept_filter)

    rows = q.group_by(Attendance.status).all()
    by_status = {row[0]: row[1] for row in rows}
    total = sum(by_status.values())
    present = by_status.get("Present", 0)
    late = by_status.get("Late", 0)
    attendance_rate = round((present + late) / total * 100, 1) if total else 0

    return {
        "type": "attendance",
        "summary": {
            "total_records": total,
            "attendance_rate": attendance_rate,
            "Present": present,
            "Late": late,
            "Absent": by_status.get("Absent", 0),
            "On Leave": by_status.get("On Leave", 0),
        },
    }


def _performance_report(db: Session, dept_filter: str):
    q = db.query(PerformanceReview)
    if dept_filter:
        q = q.join(PerformanceReview.employee).join(Employee.department).filter(Department.name == dept_filter)

    rows = q.all()
    by_rating: dict = {}
    stars_total = 0
    for r in rows:
        by_rating[r.rating] = by_rating.get(r.rating, 0) + 1
        stars_total += r.stars

    avg = round(stars_total / len(rows), 2) if rows else 0

    return {
        "type": "performance",
        "summary": {"total_reviews": len(rows), "average_stars": avg},
        "by_rating": [{"rating": rating, "count": count} for rating, count in by_rating.items()],
    }
