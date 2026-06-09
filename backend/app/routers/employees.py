import os
import re
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.database import get_db
from app.models import Employee, Department, User, LeaveBalance
from app import auth as auth_utils
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse
from app.dependencies import get_current_user, require_hr

router = APIRouter(prefix="/employees", tags=["employees"])

LEAVE_DEFAULTS = {
    "Annual Leave": 14,
    "Sick Leave": 14,
    "Personal Leave": 5,
    "Maternity / Paternity Leave": 90,
    "Emergency Leave": 3,
}


def _generate_emp_id(db: Session) -> str:
    rows = db.query(Employee.emp_id).filter(Employee.emp_id.ilike("EMP%")).all()
    if not rows:
        return "EMP-001"
    nums = [int(m.group()) for row in rows if (m := re.search(r'\d+', row[0]))]
    num = max(nums) + 1 if nums else 1
    return f"EMP-{str(num).zfill(3)}"


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: str = Query(""),
    dept: str = Query(""),
    status: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Employee).options(joinedload(Employee.department), joinedload(Employee.position))

    if current_user.role == "Employee" and current_user.employee_id:
        q = q.filter(Employee.id == current_user.employee_id)

    if search:
        like = f"%{search}%"
        q = q.filter(or_(Employee.name.ilike(like), Employee.work_email.ilike(like), Employee.emp_id.ilike(like)))
    if dept:
        q = q.filter(Employee.department.has(Department.name == dept))
    if status:
        q = q.filter(Employee.status == status)

    total = q.count()
    employees = q.order_by(Employee.emp_id.asc()).offset((page - 1) * limit).limit(limit).all()
    return EmployeeListResponse(employees=employees, total=total, page=page, limit=limit)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("Admin", "HR Manager", "Manager") and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    employee = (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.position))
        .filter(Employee.id == employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    emp_id = payload.emp_id or _generate_emp_id(db)

    if db.query(Employee).filter(Employee.emp_id == emp_id).first():
        raise HTTPException(status_code=409, detail="Employee ID already exists")

    if payload.work_email and db.query(Employee).filter(Employee.work_email == payload.work_email).first():
        raise HTTPException(status_code=409, detail="Work email already in use")

    employee = Employee(
        emp_id=emp_id,
        name=payload.name,
        gender=payload.gender,
        dob=payload.dob,
        phone=payload.phone,
        personal_email=payload.personal_email,
        address=payload.address,
        department_id=payload.department_id,
        position_id=payload.position_id,
        hire_date=payload.hire_date,
        employment_type=payload.employment_type,
        salary=payload.salary,
        work_email=payload.work_email,
        status="Active",
    )
    db.add(employee)
    db.flush()

    for leave_type, total in LEAVE_DEFAULTS.items():
        db.add(LeaveBalance(employee_id=employee.id, leave_type=leave_type, used=0, total=total))

    if payload.work_email and payload.user_password:
        if db.query(User).filter(User.email == payload.work_email).first():
            raise HTTPException(status_code=409, detail="User account with this email already exists")
        user = User(
            name=payload.name,
            email=payload.work_email,
            password_hash=auth_utils.hash_password(payload.user_password),
            role=payload.user_role or "Employee",
            status="Active" if payload.account_active else "Inactive",
            employee_id=employee.id,
        )
        db.add(user)

    db.commit()
    db.refresh(employee)

    return (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.position))
        .filter(Employee.id == employee.id)
        .first()
    )


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if payload.work_email and payload.work_email != employee.work_email:
        if db.query(Employee).filter(Employee.work_email == payload.work_email, Employee.id != employee_id).first():
            raise HTTPException(status_code=409, detail="Work email already in use")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.position))
        .filter(Employee.id == employee.id)
        .first()
    )


@router.post("/{employee_id}/photo")
async def upload_employee_photo(
    employee_id: str,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    upload_dir = Path(os.getenv("UPLOAD_DIR", "uploads")) / "employees"
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(photo.filename).suffix.lower() if photo.filename else ".jpg"
    filename = f"{employee_id}{ext}"
    content = await photo.read()
    with open(upload_dir / filename, "wb") as f:
        f.write(content)

    employee.photo_path = f"employees/{filename}"
    db.commit()
    return {"photo_path": employee.photo_path}


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
