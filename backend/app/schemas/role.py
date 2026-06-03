from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class PermissionUpdate(BaseModel):
    permissions: dict[str, bool]


class RolePermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    module: str
    permission: str
    enabled: bool


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    is_system: bool
    permissions: list[RolePermissionResponse]
    created_at: datetime
