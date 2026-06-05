import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
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


def _seed(db):
    for role_name, description in SYSTEM_ROLES:
        if not db.query(Role).filter(Role.name == role_name).first():
            role = Role(name=role_name, description=description, is_system=True)
            db.add(role)
            db.flush()
            for module, perms in DEFAULT_MODULES.items():
                all_enabled = role_name == "Admin"
                for perm in perms:
                    db.add(RolePermission(role_id=role.id, module=module, permission=perm, enabled=all_enabled))

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
    ]
    for d in upload_dirs:
        os.makedirs(d, exist_ok=True)

    yield


app = FastAPI(title="EMS Operations API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

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
