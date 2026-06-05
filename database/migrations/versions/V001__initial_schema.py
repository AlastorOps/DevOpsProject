"""Initial schema — all tables

Revision ID: V001
Revises:
Create Date: 2026-06-05
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "V001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── roles ─────────────────────────────────────────────────
    op.create_table(
        "roles",
        sa.Column("id",          sa.Integer(),     autoincrement=True, nullable=False),
        sa.Column("name",        sa.String(50),    nullable=False),
        sa.Column("description", sa.String(255),   nullable=True),
        sa.Column("is_system",   sa.Boolean(),     nullable=False, server_default="false"),
        sa.Column("created_at",  sa.DateTime(),    nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # ── departments ───────────────────────────────────────────
    op.create_table(
        "departments",
        sa.Column("id",         sa.Integer(),        autoincrement=True, nullable=False),
        sa.Column("name",       sa.String(100),      nullable=False),
        sa.Column("head",       sa.String(100),      nullable=True),
        sa.Column("budget",     sa.Numeric(15, 2),   nullable=True),
        sa.Column("status",     sa.String(20),       nullable=False, server_default="Active"),
        sa.Column("created_at", sa.DateTime(),       nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(),       nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # ── positions ─────────────────────────────────────────────
    op.create_table(
        "positions",
        sa.Column("id",            sa.Integer(),      autoincrement=True, nullable=False),
        sa.Column("title",         sa.String(100),    nullable=False),
        sa.Column("department_id", sa.Integer(),      nullable=True),
        sa.Column("level",         sa.String(20),     nullable=True),
        sa.Column("headcount",     sa.Integer(),      nullable=False, server_default="0"),
        sa.Column("openings",      sa.Integer(),      nullable=False, server_default="0"),
        sa.Column("salary_min",    sa.Numeric(15, 2), nullable=True),
        sa.Column("salary_max",    sa.Numeric(15, 2), nullable=True),
        sa.Column("created_at",    sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",    sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── employees ─────────────────────────────────────────────
    op.create_table(
        "employees",
        sa.Column("id",              sa.String(36),     nullable=False),
        sa.Column("emp_id",          sa.String(20),     nullable=False),
        sa.Column("name",            sa.String(100),    nullable=False),
        sa.Column("personal_email",  sa.String(255),    nullable=True),
        sa.Column("work_email",      sa.String(255),    nullable=True),
        sa.Column("gender",          sa.String(10),     nullable=True),
        sa.Column("dob",             sa.Date(),         nullable=True),
        sa.Column("phone",           sa.String(30),     nullable=True),
        sa.Column("address",         sa.Text(),         nullable=True),
        sa.Column("department_id",   sa.Integer(),      nullable=True),
        sa.Column("position_id",     sa.Integer(),      nullable=True),
        sa.Column("hire_date",       sa.Date(),         nullable=True),
        sa.Column("employment_type", sa.String(20),     nullable=True),
        sa.Column("salary",          sa.Numeric(15, 2), nullable=True),
        sa.Column("status",          sa.String(20),     nullable=False, server_default="Active"),
        sa.Column("created_at",      sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",      sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["position_id"],   ["positions.id"],   ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("emp_id"),
        sa.UniqueConstraint("work_email"),
    )

    # ── users ─────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",            sa.String(36),  nullable=False),
        sa.Column("name",          sa.String(100), nullable=False),
        sa.Column("email",         sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role",          sa.String(30),  nullable=False, server_default="Employee"),
        sa.Column("status",        sa.String(20),  nullable=False, server_default="Active"),
        sa.Column("employee_id",   sa.String(36),  nullable=True),
        sa.Column("last_login",    sa.DateTime(),  nullable=True),
        sa.Column("created_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    # ── attendance ────────────────────────────────────────────
    op.create_table(
        "attendance",
        sa.Column("id",          sa.String(36), nullable=False),
        sa.Column("employee_id", sa.String(36), nullable=False),
        sa.Column("date",        sa.Date(),     nullable=False),
        sa.Column("check_in",    sa.String(10), nullable=True),
        sa.Column("check_out",   sa.String(10), nullable=True),
        sa.Column("status",      sa.String(20), nullable=False),
        sa.Column("created_at",  sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",  sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("employee_id", "date", name="uix_attendance_employee_date"),
    )

    # ── leave_requests ────────────────────────────────────────
    op.create_table(
        "leave_requests",
        sa.Column("id",            sa.String(36),  nullable=False),
        sa.Column("leave_id",      sa.String(20),  nullable=False),
        sa.Column("employee_id",   sa.String(36),  nullable=False),
        sa.Column("leave_type",    sa.String(50),  nullable=False),
        sa.Column("from_date",     sa.Date(),      nullable=False),
        sa.Column("to_date",       sa.Date(),      nullable=False),
        sa.Column("days",          sa.Integer(),   nullable=False),
        sa.Column("reason",        sa.Text(),      nullable=False),
        sa.Column("document_path", sa.String(500), nullable=True),
        sa.Column("status",        sa.String(20),  nullable=False, server_default="Pending"),
        sa.Column("created_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("leave_id"),
    )

    # ── leave_balances ────────────────────────────────────────
    op.create_table(
        "leave_balances",
        sa.Column("id",          sa.Integer(),  autoincrement=True, nullable=False),
        sa.Column("employee_id", sa.String(36), nullable=False),
        sa.Column("leave_type",  sa.String(50), nullable=False),
        sa.Column("used",        sa.Integer(),  nullable=False, server_default="0"),
        sa.Column("total",       sa.Integer(),  nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("employee_id", "leave_type", name="uix_leave_balance_emp_type"),
    )

    # ── payroll ───────────────────────────────────────────────
    op.create_table(
        "payroll",
        sa.Column("id",          sa.String(36),     nullable=False),
        sa.Column("payroll_id",  sa.String(20),     nullable=False),
        sa.Column("employee_id", sa.String(36),     nullable=False),
        sa.Column("basic",       sa.Numeric(15, 2), nullable=False),
        sa.Column("bonus",       sa.Numeric(15, 2), nullable=False, server_default="0"),
        sa.Column("deductions",  sa.Numeric(15, 2), nullable=False, server_default="0"),
        sa.Column("net",         sa.Numeric(15, 2), nullable=False),
        sa.Column("status",      sa.String(20),     nullable=False, server_default="Pending"),
        sa.Column("month",       sa.String(20),     nullable=False),
        sa.Column("paid_on",     sa.Date(),         nullable=True),
        sa.Column("created_at",  sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",  sa.DateTime(),     nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("payroll_id"),
    )

    # ── payslip_items ─────────────────────────────────────────
    op.create_table(
        "payslip_items",
        sa.Column("id",        sa.Integer(),      autoincrement=True, nullable=False),
        sa.Column("payroll_id",sa.String(36),     nullable=False),
        sa.Column("item_type", sa.String(20),     nullable=False),
        sa.Column("label",     sa.String(100),    nullable=False),
        sa.Column("amount",    sa.Numeric(15, 2), nullable=False),
        sa.ForeignKeyConstraint(["payroll_id"], ["payroll.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── performance_reviews ───────────────────────────────────
    op.create_table(
        "performance_reviews",
        sa.Column("id",            sa.String(36),  nullable=False),
        sa.Column("employee_id",   sa.String(36),  nullable=False),
        sa.Column("reviewer_id",   sa.String(36),  nullable=True),
        sa.Column("reviewer_name", sa.String(100), nullable=True),
        sa.Column("cycle",         sa.String(100), nullable=False),
        sa.Column("rating",        sa.String(20),  nullable=False),
        sa.Column("stars",         sa.Integer(),   nullable=False),
        sa.Column("comments",      sa.Text(),      nullable=True),
        sa.Column("review_date",   sa.Date(),      nullable=False),
        sa.Column("created_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at",    sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"],     ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── role_permissions ──────────────────────────────────────
    op.create_table(
        "role_permissions",
        sa.Column("id",         sa.Integer(),     autoincrement=True, nullable=False),
        sa.Column("role_id",    sa.Integer(),     nullable=False),
        sa.Column("module",     sa.String(100),   nullable=False),
        sa.Column("permission", sa.String(100),   nullable=False),
        sa.Column("enabled",    sa.Boolean(),     nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── system_settings ───────────────────────────────────────
    op.create_table(
        "system_settings",
        sa.Column("id",                  sa.Integer(),   nullable=False),
        sa.Column("org_name",            sa.String(200), nullable=True),
        sa.Column("reg_number",          sa.String(100), nullable=True),
        sa.Column("headquarters",        sa.Text(),      nullable=True),
        sa.Column("logo_path",           sa.String(500), nullable=True),
        sa.Column("language",            sa.String(5),   nullable=False, server_default="en"),
        sa.Column("theme",               sa.String(10),  nullable=False, server_default="light"),
        sa.Column("email_notifications", sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("sms_notifications",   sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("push_notifications",  sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("two_fa_enabled",      sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("backups_enabled",     sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("updated_at",          sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── notifications ─────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id",         sa.Integer(),   autoincrement=True, nullable=False),
        sa.Column("user_id",    sa.String(36),  nullable=False),
        sa.Column("title",      sa.String(200), nullable=False),
        sa.Column("body",       sa.Text(),      nullable=False),
        sa.Column("icon",       sa.String(50),  nullable=False, server_default="notifications"),
        sa.Column("color",      sa.String(20),  nullable=False, server_default="primary"),
        sa.Column("read",       sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(),  nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── indexes ───────────────────────────────────────────────
    op.create_index("idx_employees_department",    "employees",           ["department_id"])
    op.create_index("idx_employees_position",      "employees",           ["position_id"])
    op.create_index("idx_employees_status",        "employees",           ["status"])
    op.create_index("idx_attendance_date",         "attendance",          ["date"])
    op.create_index("idx_attendance_status",       "attendance",          ["status"])
    op.create_index("idx_attendance_employee",     "attendance",          ["employee_id"])
    op.create_index("idx_leave_requests_employee", "leave_requests",      ["employee_id"])
    op.create_index("idx_leave_requests_status",   "leave_requests",      ["status"])
    op.create_index("idx_leave_requests_type",     "leave_requests",      ["leave_type"])
    op.create_index("idx_payroll_employee",        "payroll",             ["employee_id"])
    op.create_index("idx_payroll_status",          "payroll",             ["status"])
    op.create_index("idx_payroll_month",           "payroll",             ["month"])
    op.create_index("idx_perf_reviews_emp",        "performance_reviews", ["employee_id"])
    op.create_index("idx_notifications_user",      "notifications",       ["user_id"])
    op.create_index("idx_users_role",              "users",               ["role"])
    op.create_index("idx_users_status",            "users",               ["status"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("system_settings")
    op.drop_table("role_permissions")
    op.drop_table("performance_reviews")
    op.drop_table("payslip_items")
    op.drop_table("payroll")
    op.drop_table("leave_balances")
    op.drop_table("leave_requests")
    op.drop_table("attendance")
    op.drop_table("users")
    op.drop_table("employees")
    op.drop_table("positions")
    op.drop_table("departments")
    op.drop_table("roles")
