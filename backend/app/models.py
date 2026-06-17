import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    String, Integer, Boolean, Date, DateTime,
    Numeric, ForeignKey, Text, UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    head: Mapped[Optional[str]] = mapped_column(String(100))
    budget: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    status: Mapped[str] = mapped_column(String(20), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employees: Mapped[list["Employee"]] = relationship("Employee", back_populates="department")
    positions: Mapped[list["Position"]] = relationship("Position", back_populates="department")


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"))
    level: Mapped[Optional[str]] = mapped_column(String(20))
    max_slots: Mapped[int] = mapped_column(Integer, default=0)
    salary_min: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    salary_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="positions")
    employees: Mapped[list["Employee"]] = relationship("Employee", back_populates="position")


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    emp_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    personal_email: Mapped[Optional[str]] = mapped_column(String(255))
    work_email: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    gender: Mapped[Optional[str]] = mapped_column(String(10))
    dob: Mapped[Optional[date]] = mapped_column(Date)
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    address: Mapped[Optional[str]] = mapped_column(Text)
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"))
    position_id: Mapped[Optional[int]] = mapped_column(ForeignKey("positions.id", ondelete="SET NULL"))
    hire_date: Mapped[Optional[date]] = mapped_column(Date)
    employment_type: Mapped[Optional[str]] = mapped_column(String(20))
    salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    photo_path: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="employees")
    position: Mapped[Optional["Position"]] = relationship("Position", back_populates="employees")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="employee", uselist=False)
    attendance_records: Mapped[list["Attendance"]] = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests: Mapped[list["LeaveRequest"]] = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    leave_balances: Mapped[list["LeaveBalance"]] = relationship("LeaveBalance", back_populates="employee", cascade="all, delete-orphan")
    payrolls: Mapped[list["Payroll"]] = relationship("Payroll", back_populates="employee", cascade="all, delete-orphan")
    reviews: Mapped[list["PerformanceReview"]] = relationship(
        "PerformanceReview", foreign_keys="[PerformanceReview.employee_id]",
        back_populates="employee", cascade="all, delete-orphan"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="Employee")
    status: Mapped[str] = mapped_column(String(20), default="Active")
    employee_id: Mapped[Optional[str]] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"))
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped[Optional["Employee"]] = relationship("Employee", back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    @property
    def photo_path(self) -> Optional[str]:
        return self.employee.photo_path if self.employee else None


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("employee_id", "date", name="uix_attendance_employee_date"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    check_in: Mapped[Optional[str]] = mapped_column(String(10))
    check_out: Mapped[Optional[str]] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="attendance_records")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    leave_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)
    from_date: Mapped[date] = mapped_column(Date, nullable=False)
    to_date: Mapped[date] = mapped_column(Date, nullable=False)
    days: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    document_path: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="leave_requests")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    __table_args__ = (UniqueConstraint("employee_id", "leave_type", name="uix_leave_balance_emp_type"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)
    used: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="leave_balances")


class Payroll(Base):
    __tablename__ = "payroll"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payroll_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    basic: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    bonus: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    deductions: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    net: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    month: Mapped[str] = mapped_column(String(20), nullable=False)
    paid_on: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="payrolls")
    items: Mapped[list["PayslipItem"]] = relationship("PayslipItem", back_populates="payroll", cascade="all, delete-orphan")


class PayslipItem(Base):
    __tablename__ = "payslip_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    payroll_id: Mapped[str] = mapped_column(ForeignKey("payroll.id", ondelete="CASCADE"), nullable=False)
    item_type: Mapped[str] = mapped_column(String(20), nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    payroll: Mapped["Payroll"] = relationship("Payroll", back_populates="items")


class PerformanceReview(Base):
    __tablename__ = "performance_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    reviewer_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    reviewer_name: Mapped[Optional[str]] = mapped_column(String(100))
    cycle: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[str] = mapped_column(String(20), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    comments: Mapped[Optional[str]] = mapped_column(Text)
    review_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped["Employee"] = relationship("Employee", foreign_keys=[employee_id], back_populates="reviews")
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewer_id])


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    permissions: Mapped[list["RolePermission"]] = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    permission: Mapped[str] = mapped_column(String(100), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    role: Mapped["Role"] = relationship("Role", back_populates="permissions")


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    org_name: Mapped[Optional[str]] = mapped_column(String(200))
    reg_number: Mapped[Optional[str]] = mapped_column(String(100))
    headquarters: Mapped[Optional[str]] = mapped_column(Text)
    logo_path: Mapped[Optional[str]] = mapped_column(String(500))
    language: Mapped[str] = mapped_column(String(5), default="en")
    theme: Mapped[str] = mapped_column(String(10), default="light")
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    sms_notifications: Mapped[bool] = mapped_column(Boolean, default=False)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    two_fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    backups_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="notifications")
    color: Mapped[str] = mapped_column(String(20), default="primary")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
