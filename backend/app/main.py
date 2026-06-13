import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from prometheus_fastapi_instrumentator import Instrumentator
import os

from app.config import settings
from app.database import engine, SessionLocal
from app.models import Base, User, Role, RolePermission, SystemSettings
from app import auth as auth_utils
from app.limiter import limiter

from app.routers import auth, employees, departments, positions, attendance, leave, payroll, performance, users, roles, settings as settings_router, dashboard, reports

DEFAULT_MODULES = {
    "Dashboard Module": ["View Analytics", "Edit Widgets"],
    "Employee Module": ["View Directory", "Add/Delete", "Modify Records", "Document Access"],
    "Payroll Module": ["Process Salaries", "Tax Reporting", "Bonus Management"],
    "Attendance & Leave": ["View Attendance", "Approve Leaves", "Overtime Control"],
}

SYSTEM_ROLES = [
    ("Admin", "Full system access"),
    ("HR Manager", "HR and employee management"),
    ("Manager", "Team and performance management"),
    ("Employee", "Personal profile and attendance"),
]

SYSTEM_ROLE_PERMS = {
    "Admin": {
        "Dashboard Module": {"View Analytics": True, "Edit Widgets": True},
        "Employee Module": {"View Directory": True, "Add/Delete": True, "Modify Records": True, "Document Access": True},
        "Payroll Module": {"Process Salaries": True, "Tax Reporting": True, "Bonus Management": True},
        "Attendance & Leave": {"View Attendance": True, "Approve Leaves": True, "Overtime Control": True},
    },
    "HR Manager": {
        "Dashboard Module": {"View Analytics": True, "Edit Widgets": False},
        "Employee Module": {"View Directory": True, "Add/Delete": True, "Modify Records": True, "Document Access": True},
        "Payroll Module": {"Process Salaries": True, "Tax Reporting": True, "Bonus Management": False},
        "Attendance & Leave": {"View Attendance": True, "Approve Leaves": True, "Overtime Control": True},
    },
    "Manager": {
        "Dashboard Module": {"View Analytics": True, "Edit Widgets": False},
        "Employee Module": {"View Directory": True, "Add/Delete": False, "Modify Records": True, "Document Access": False},
        "Payroll Module": {"Process Salaries": False, "Tax Reporting": False, "Bonus Management": True},
        "Attendance & Leave": {"View Attendance": True, "Approve Leaves": True, "Overtime Control": True},
    },
    "Employee": {
        "Dashboard Module": {"View Analytics": True, "Edit Widgets": False},
        "Employee Module": {"View Directory": True, "Add/Delete": False, "Modify Records": False, "Document Access": False},
        "Payroll Module": {"Process Salaries": False, "Tax Reporting": False, "Bonus Management": False},
        "Attendance & Leave": {"View Attendance": True, "Approve Leaves": False, "Overtime Control": False},
    },
}


def _seed(db):
    for role_name, description in SYSTEM_ROLES:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name, description=description, is_system=True)
            db.add(role)
            db.flush()

        role_perms = SYSTEM_ROLE_PERMS.get(role_name, {})
        for module, perm_map in role_perms.items():
            for perm_name, enabled in perm_map.items():
                existing = db.query(RolePermission).filter(
                    RolePermission.role_id == role.id,
                    RolePermission.module == module,
                    RolePermission.permission == perm_name,
                ).first()
                if existing:
                    existing.enabled = enabled
                else:
                    db.add(RolePermission(role_id=role.id, module=module, permission=perm_name, enabled=enabled))

    if not db.query(User).filter(User.email == "admin@company.com").first():
        db.add(User(
            id=str(uuid.uuid4()),
            name="System Administrator",
            email="admin@company.com",
            password_hash=auth_utils.hash_password(settings.admin_password),
            role="Admin",
            status="Active",
        ))

    if not db.query(SystemSettings).filter(SystemSettings.id == 1).first():
        db.add(SystemSettings(id=1, org_name="EMS Operations"))

    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed(db)
    finally:
        db.close()

    upload_dirs = [
        os.path.join(settings.upload_dir, "leave_documents"),
        os.path.join(settings.upload_dir, "logos"),
        os.path.join(settings.upload_dir, "employees"),
    ]
    for d in upload_dirs:
        os.makedirs(d, exist_ok=True)

    yield


app = FastAPI(
    title="EMS Operations API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.enable_docs else None,
    redoc_url="/redoc" if settings.enable_docs else None,
    openapi_url="/openapi.json" if settings.enable_docs else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

Instrumentator().instrument(app).expose(app)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(positions.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(performance.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(settings_router.router)
app.include_router(dashboard.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
