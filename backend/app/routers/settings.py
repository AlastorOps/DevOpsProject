import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    SystemSettings, Employee, User, Attendance, LeaveRequest,
    LeaveBalance, Payroll, PayslipItem, PerformanceReview, Notification,
)
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.dependencies import require_admin
from app.config import settings as app_settings

router = APIRouter(prefix="/settings", tags=["settings"])

ALLOWED_IMG_EXTS = {".jpg", ".jpeg", ".png", ".svg", ".webp"}


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    row = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not row:
        row = SystemSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    row = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not row:
        row = SystemSettings(id=1)
        db.add(row)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(row, field, value)

    db.commit()
    db.refresh(row)
    return row


@router.post("/logo", response_model=SettingsResponse)
async def upload_logo(
    logo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    ext = os.path.splitext(logo.filename)[1].lower()
    if ext not in ALLOWED_IMG_EXTS:
        raise HTTPException(status_code=422, detail="Invalid image format")

    content = await logo.read()
    upload_dir = os.path.join(app_settings.upload_dir, "logos")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    row = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not row:
        row = SystemSettings(id=1)
        db.add(row)

    if row.logo_path and os.path.exists(row.logo_path):
        os.remove(row.logo_path)

    row.logo_path = filepath
    db.commit()
    db.refresh(row)
    return row


@router.post("/reset", status_code=204)
def reset_system(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    db.query(Notification).delete()
    db.query(PerformanceReview).delete()
    db.query(PayslipItem).delete()
    db.query(Payroll).delete()
    db.query(LeaveRequest).delete()
    db.query(Attendance).delete()
    db.query(LeaveBalance).update({"used": 0})
    db.commit()
