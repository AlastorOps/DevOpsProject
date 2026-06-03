from datetime import date, datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    Employee, Attendance, LeaveRequest, Payroll,
    Department, Notification, User, LeaveBalance,
)
from app.dependencies import get_current_user

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/stats")
def admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    total_employees = db.query(func.count(Employee.id)).scalar()
    total_departments = db.query(func.count(Department.id)).scalar()

    attendance_today = db.query(Attendance.status, func.count(Attendance.id)).filter(
        Attendance.date == today
    ).group_by(Attendance.status).all()
    att = {row[0]: row[1] for row in attendance_today}

    pending_leaves = db.query(func.count(LeaveRequest.id)).filter(LeaveRequest.status == "Pending").scalar()

    payroll_agg = db.query(func.sum(Payroll.net)).filter(
        Payroll.status == "Paid",
        func.date_part("month", Payroll.paid_on) == today.month,
        func.date_part("year", Payroll.paid_on) == today.year,
    ).scalar()
    monthly_payroll = float(payroll_agg or 0)

    return {
        "total_employees": total_employees,
        "active_today": att.get("Present", 0) + att.get("Late", 0),
        "monthly_payroll": monthly_payroll,
        "total_departments": total_departments,
        "present": att.get("Present", 0),
        "late": att.get("Late", 0),
        "absent": att.get("Absent", 0),
        "on_leave": att.get("On Leave", 0),
        "pending_leaves": pending_leaves,
    }


@router.get("/dashboard/charts")
def dashboard_charts(
    period: str = "Weekly",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    if period == "Weekly":
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    else:
        first_day = today.replace(day=1)
        days = []
        d = first_day
        while d <= today:
            days.append(d)
            d = d + timedelta(days=1)

    results = db.query(
        Attendance.date,
        Attendance.status,
        func.count(Attendance.id),
    ).filter(
        Attendance.date.in_(days)
    ).group_by(Attendance.date, Attendance.status).all()

    data: dict[str, dict] = {}
    for d in days:
        data[d.isoformat()] = {"date": d.isoformat(), "present": 0, "absent": 0, "late": 0, "on_leave": 0}

    for row in results:
        key = row[0].isoformat()
        if key in data:
            status_key = row[1].lower().replace(" ", "_")
            data[key][status_key] = row[2]

    return {"period": period, "data": list(data.values())}


@router.get("/my-dashboard/stats")
def employee_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.employee_id:
        raise HTTPException(status_code=404, detail="No employee profile linked to this account")

    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    today = date.today()
    first_of_month = today.replace(day=1)

    attendance_rows = db.query(Attendance.status, func.count(Attendance.id)).filter(
        Attendance.employee_id == employee.id,
        Attendance.date >= first_of_month,
        Attendance.date <= today,
    ).group_by(Attendance.status).all()
    att = {row[0]: row[1] for row in attendance_rows}
    total_days = sum(att.values())

    balances = db.query(LeaveBalance).filter(LeaveBalance.employee_id == employee.id).all()
    leave_balance = [
        {"leave_type": b.leave_type, "used": b.used, "total": b.total, "remaining": max(b.total - b.used, 0)}
        for b in balances
    ]

    recent_payroll = db.query(Payroll).filter(
        Payroll.employee_id == employee.id
    ).order_by(Payroll.created_at.desc()).first()

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(10).all()

    unread_count = db.query(func.count(Notification.id)).filter(
        Notification.user_id == current_user.id,
        Notification.read.is_(False),
    ).scalar()

    return {
        "employee": {
            "id": employee.id,
            "emp_id": employee.emp_id,
            "name": employee.name,
            "email": employee.work_email or employee.personal_email,
            "status": employee.status,
        },
        "attendance_this_month": {
            "present": att.get("Present", 0),
            "late": att.get("Late", 0),
            "absent": att.get("Absent", 0),
            "on_leave": att.get("On Leave", 0),
            "total_days": total_days,
        },
        "leave_balance": leave_balance,
        "recent_payroll": {
            "payroll_id": recent_payroll.payroll_id if recent_payroll else None,
            "month": recent_payroll.month if recent_payroll else None,
            "net": float(recent_payroll.net) if recent_payroll else None,
            "status": recent_payroll.status if recent_payroll else None,
        },
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "body": n.body,
                "icon": n.icon,
                "color": n.color,
                "read": n.read,
                "time": n.created_at.isoformat(),
            }
            for n in notifications
        ],
        "unread_notifications": unread_count,
    }


@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "icon": n.icon,
            "color": n.color,
            "read": n.read,
            "time": n.created_at.isoformat(),
        }
        for n in notifications
    ]


@router.put("/notifications/{notification_id}/read", status_code=204)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = True
    db.commit()


@router.put("/notifications/read-all", status_code=204)
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read.is_(False),
    ).update({"read": True})
    db.commit()
