from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional
from datetime import date, datetime


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None

    @model_validator(mode="after")
    def validate_times(self):
        if self.status in ("Present", "Late"):
            if not self.check_in:
                raise ValueError("check_in required for Present/Late status")
        return self


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None


class EmployeeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    emp_id: str
    name: str
    photo_path: Optional[str] = None


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    employee: Optional[EmployeeBrief] = None
    date: date
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    hours: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class TodayAttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    date: date
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: Optional[str] = None
    elapsed_seconds: Optional[int] = None
    hours: Optional[str] = None


class AttendanceStats(BaseModel):
    present: int
    late: int
    absent: int
    on_leave: int
    total: int


class AttendanceListResponse(BaseModel):
    records: list[AttendanceResponse]
    total: int
    page: int
    limit: int
