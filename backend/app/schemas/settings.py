from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class SettingsUpdate(BaseModel):
    org_name: Optional[str] = None
    reg_number: Optional[str] = None
    headquarters: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    two_fa_enabled: Optional[bool] = None
    backups_enabled: Optional[bool] = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_name: Optional[str] = None
    reg_number: Optional[str] = None
    headquarters: Optional[str] = None
    logo_path: Optional[str] = None
    language: str
    theme: str
    email_notifications: bool
    sms_notifications: bool
    push_notifications: bool
    two_fa_enabled: bool
    backups_enabled: bool
    updated_at: datetime
