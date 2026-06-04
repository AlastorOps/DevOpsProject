from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app import auth as auth_utils
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, UserTokenPayload
from app.dependencies import get_current_user
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not auth_utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.status != "Active":
        raise HTTPException(status_code=403, detail="Account is inactive")

    user.last_login = datetime.utcnow()
    db.commit()

    token_data = {"sub": user.id}
    return TokenResponse(
        access_token=auth_utils.create_access_token(token_data),
        refresh_token=auth_utils.create_refresh_token(token_data),
        user=UserTokenPayload(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            employee_id=user.employee_id,
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = auth_utils.decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.status != "Active":
        raise HTTPException(status_code=401, detail="User not found or inactive")

    token_data = {"sub": user.id}
    return TokenResponse(
        access_token=auth_utils.create_access_token(token_data),
        refresh_token=auth_utils.create_refresh_token(token_data),
        user=UserTokenPayload(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            employee_id=user.employee_id,
        ),
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return UserTokenPayload(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        employee_id=current_user.employee_id,
    )
