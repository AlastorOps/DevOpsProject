from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PositionCreate(BaseModel):
    title: str
    department_id: Optional[int] = None
    level: Optional[str] = None
    max_slots: int = 0
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None


class PositionUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    level: Optional[str] = None
    max_slots: Optional[int] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None


class DepartmentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class PositionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    department_id: Optional[int] = None
    department: Optional[DepartmentBrief] = None
    level: Optional[str] = None
    max_slots: int
    headcount: int = 0
    openings: int = 0
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime


class PositionListResponse(BaseModel):
    positions: list[PositionResponse]
    total: int
    page: int
    limit: int
