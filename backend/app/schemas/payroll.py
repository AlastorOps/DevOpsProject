from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class PayslipItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item_type: str
    label: str
    amount: Decimal

    @field_validator('amount')
    @classmethod
    def amount_non_negative(cls, v):
        if v < 0:
            raise ValueError('Item amount cannot be negative')
        return v


class PayrollCreate(BaseModel):
    employee_id: str
    basic: Decimal
    bonus: Decimal = Decimal("0")
    deductions: Decimal = Decimal("0")
    month: str
    earnings_items: Optional[list[PayslipItemSchema]] = None
    deduction_items: Optional[list[PayslipItemSchema]] = None

    @field_validator('basic')
    @classmethod
    def basic_non_negative(cls, v):
        if v < 0:
            raise ValueError('Basic salary cannot be negative')
        return v

    @field_validator('bonus')
    @classmethod
    def bonus_non_negative(cls, v):
        if v < 0:
            raise ValueError('Bonus cannot be negative')
        return v

    @field_validator('deductions')
    @classmethod
    def deductions_non_negative(cls, v):
        if v < 0:
            raise ValueError('Deductions cannot be negative')
        return v

    @model_validator(mode='after')
    def net_pay_non_negative(self):
        net = self.basic + self.bonus - self.deductions
        if net < 0:
            raise ValueError(
                'Net pay cannot be negative — deductions exceed basic salary plus bonus'
            )
        return self


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
