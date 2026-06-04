from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date, datetime
from decimal import Decimal

UserRole = Literal["Admin", "HR Manager", "Manager", "Employee"]


class EmployeeCreate(BaseModel):
    name: str
    gender: Optional[str] = None
    dob: Optional[date] = None
    phone: Optional[str] = None
    personal_email: Optional[str] = None
    address: Optional[str] = None
    emp_id: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    hire_date: Optional[date] = None
    employment_type: Optional[str] = None
    salary: Optional[Decimal] = None
    work_email: Optional[str] = None
    user_password: Optional[str] = None
    user_role: Optional[UserRole] = "Employee"
    account_active: bool = True


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    personal_email: Optional[str] = None
    work_email: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[date] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    hire_date: Optional[date] = None
    employment_type: Optional[str] = None
    salary: Optional[Decimal] = None
    status: Optional[str] = None


class DepartmentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class PositionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    emp_id: str
    name: str
    personal_email: Optional[str] = None
    work_email: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    department: Optional[DepartmentBrief] = None
    position_id: Optional[int] = None
    position: Optional[PositionBrief] = None
    hire_date: Optional[date] = None
    employment_type: Optional[str] = None
    salary: Optional[Decimal] = None
    status: str
    created_at: datetime
    updated_at: datetime


class EmployeeListResponse(BaseModel):
    employees: list[EmployeeResponse]
    total: int
    page: int
    limit: int
