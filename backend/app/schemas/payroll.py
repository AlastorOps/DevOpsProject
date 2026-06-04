from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class PayslipItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item_type: str
    label: str
    amount: Decimal


class PayrollCreate(BaseModel):
    employee_id: str
    basic: Decimal
    bonus: Decimal = Decimal("0")
    deductions: Decimal = Decimal("0")
    month: str
    earnings_items: Optional[list[PayslipItemSchema]] = None
    deduction_items: Optional[list[PayslipItemSchema]] = None


class EmployeeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    emp_id: str
    name: str
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


class PayrollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    payroll_id: str
    employee_id: str
    employee: Optional[EmployeeBrief] = None
    basic: Decimal
    bonus: Decimal
    deductions: Decimal
    net: Decimal
    status: str
    month: str
    paid_on: Optional[date] = None
    created_at: datetime
    updated_at: datetime


class PayslipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    payroll_id: str
    employee: Optional[EmployeeBrief] = None
    month: str
    earnings: list[PayslipItemSchema]
    deductions_items: list[PayslipItemSchema]
    total_earnings: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    status: str
    paid_on: Optional[date] = None


class PayrollStats(BaseModel):
    total_payroll: Decimal
    paid: Decimal
    pending: Decimal
    total_bonus: Decimal
    total_deductions: Decimal
    record_count: int


class PayrollListResponse(BaseModel):
    records: list[PayrollResponse]
    total: int
    page: int
    limit: int


EmployeeBrief.model_rebuild()
