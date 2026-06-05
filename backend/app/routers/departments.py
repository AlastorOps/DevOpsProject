from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Department, Employee, User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentListResponse
from app.dependencies import get_current_user, require_hr

router = APIRouter(prefix="/departments", tags=["departments"])


def _enrich(dept: Department, db: Session) -> DepartmentResponse:
    count = db.query(func.count(Employee.id)).filter(Employee.department_id == dept.id).scalar()
    return DepartmentResponse(
        id=dept.id,
        name=dept.name,
        head=dept.head,
        budget=dept.budget,
        status=dept.status,
        employee_count=count,
        created_at=dept.created_at,
        updated_at=dept.updated_at,
    )


@router.get("", response_model=DepartmentListResponse)
def list_departments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Department)
    if search:
        q = q.filter(Department.name.ilike(f"%{search}%"))
    total = q.count()
    departments = q.order_by(Department.name.asc()).offset((page - 1) * limit).limit(limit).all()
    return DepartmentListResponse(
        departments=[_enrich(d, db) for d in departments],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(dept_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return _enrich(dept, db)


@router.post("", response_model=DepartmentResponse, status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    if db.query(Department).filter(Department.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Department name already exists")
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return _enrich(dept, db)


@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    if payload.name and payload.name != dept.name:
        if db.query(Department).filter(Department.name == payload.name, Department.id != dept_id).first():
            raise HTTPException(status_code=409, detail="Department name already exists")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(dept, field, value)

    db.commit()
    db.refresh(dept)
    return _enrich(dept, db)


@router.delete("/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
