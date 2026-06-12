from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional
from datetime import date, datetime


class LeaveRequestCreate(BaseModel):
    employee_id: str
    leave_type: str
    from_date: date
    to_date: date
    reason: str

    @model_validator(mode="after")
    def validate_dates(self):
        if self.to_date < self.from_date:
            raise ValueError("to_date must be on or after from_date")
        return self


class LeaveStatusUpdate(BaseModel):
    note: Optional[str] = None


class EmployeeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    emp_id: str
    name: str
    photo_path: Optional[str] = None
    department: Optional["DeptBrief"] = None


class DeptBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class LeaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    leave_id: str
    employee_id: str
    employee: Optional[EmployeeBrief] = None
    leave_type: str
    from_date: date
    to_date: date
    days: int
    reason: str
    document_path: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class LeaveListResponse(BaseModel):
    requests: list[LeaveResponse]
    total: int
    page: int
    limit: int


class LeaveBalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    leave_type: str
    used: int
    total: int
    remaining: int


class LeaveBalanceUpdate(BaseModel):
    total: int


EmployeeBrief.model_rebuild()
