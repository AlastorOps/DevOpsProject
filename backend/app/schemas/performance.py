from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import date, datetime


class PerformanceCreate(BaseModel):
    employee_id: str
    cycle: str
    stars: int
    comments: Optional[str] = Field(default=None, max_length=5000)
    review_date: Optional[date] = None

    @field_validator("stars")
    @classmethod
    def validate_stars(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Stars must be between 1 and 5")
        return v


class EmployeeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    emp_id: str
    name: str
    photo_path: Optional[str] = None
    department: Optional["DeptBrief"] = None
    position: Optional["PosBrief"] = None


class DeptBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class PosBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str


class PerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    employee: Optional[EmployeeBrief] = None
    reviewer_id: Optional[str] = None
    reviewer_name: Optional[str] = None
    cycle: str
    rating: str
    stars: int
    comments: Optional[str] = None
    review_date: date
    created_at: datetime
    updated_at: datetime


class PerformanceStats(BaseModel):
    average_stars: float
    total_reviews: int
    pending_count: int
    excellent_count: int
    good_count: int
    average_count: int
    poor_count: int


class PerformanceListResponse(BaseModel):
    reviews: list[PerformanceResponse]
    total: int
    page: int
    limit: int


EmployeeBrief.model_rebuild()
