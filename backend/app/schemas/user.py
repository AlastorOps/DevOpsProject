from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, Literal
from datetime import datetime

UserRole = Literal["Admin", "HR Manager", "Manager", "Employee"]


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = "Employee"
    status: str = "Active"
    employee_id: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    employee_id: Optional[str] = None


class UserStatusUpdate(BaseModel):
    status: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str
    status: str
    employee_id: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    limit: int
