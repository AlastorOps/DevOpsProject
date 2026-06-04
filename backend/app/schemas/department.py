from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


class DepartmentCreate(BaseModel):
    name: str
    head: Optional[str] = None
    budget: Optional[Decimal] = None
    status: str = "Active"


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    head: Optional[str] = None
    budget: Optional[Decimal] = None
    status: Optional[str] = None


class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    head: Optional[str] = None
    budget: Optional[Decimal] = None
    status: str
    employee_count: int = 0
    created_at: datetime
    updated_at: datetime


class DepartmentListResponse(BaseModel):
    departments: list[DepartmentResponse]
    total: int
    page: int
    limit: int
