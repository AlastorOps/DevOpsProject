from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class DepartmentCreate(BaseModel):
    name: str
    head: Optional[str] = None
    budget: Optional[Decimal] = None
    status: str = "Active"

    @field_validator("budget")
    @classmethod
    def budget_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("Annual budget cannot be negative.")
        return v


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    head: Optional[str] = None
    budget: Optional[Decimal] = None
    status: Optional[str] = None

    @field_validator("budget")
    @classmethod
    def budget_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("Annual budget cannot be negative.")
        return v


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
