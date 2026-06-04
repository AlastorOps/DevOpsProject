from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserTokenPayload"


class UserTokenPayload(BaseModel):
    id: str
    name: str
    email: str
    role: str
    employee_id: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


TokenResponse.model_rebuild()
