import logging
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import User
from app import auth as auth_utils
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshRequest, UserTokenPayload,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.dependencies import get_current_user
from app.limiter import limiter
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("ems.auth")


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.employee)).filter(User.email == payload.email).first()
    if not user or not auth_utils.verify_password(payload.password, user.password_hash):
        logger.warning("Failed login attempt for email=%s ip=%s", payload.email, request.client.host)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.status != "Active":
        logger.warning("Inactive account login attempt for email=%s", payload.email)
        raise HTTPException(status_code=403, detail="Account is inactive")

    user.last_login = datetime.utcnow()
    db.commit()

    logger.info("Successful login for user_id=%s email=%s ip=%s", user.id, user.email, request.client.host)
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
            photo_path=user.employee.photo_path if user.employee else None,
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

    user = db.query(User).options(joinedload(User.employee)).filter(User.id == user_id).first()
    if not user or user.status != "Active":
        raise HTTPException(status_code=401, detail="User not found or inactive")

    logger.info("Token refreshed for user_id=%s", user.id)
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
            photo_path=user.employee.photo_path if user.employee else None,
        ),
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    logger.info("User logged out user_id=%s", current_user.id)
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return 200 to prevent email enumeration
    if user and user.status == "Active":
        token = secrets.token_urlsafe(32)
        user.reset_token = auth_utils.hash_password(token)
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        logger.info("Password reset token generated for user_id=%s", user.id)
        # TODO: send token via email (e.g. via SMTP or a transactional email service).
        return {"message": "If that email exists, a reset link has been sent."}
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=422, detail="Passwords do not match")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    user = db.query(User).filter(
        User.reset_token != None,  # noqa: E711
        User.reset_token_expires > datetime.utcnow(),
    ).all()

    matched = next((u for u in user if auth_utils.verify_password(payload.token, u.reset_token)), None)
    if not matched:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    matched.password_hash = auth_utils.hash_password(payload.new_password)
    matched.reset_token = None
    matched.reset_token_expires = None
    db.commit()
    logger.info("Password reset completed for user_id=%s", matched.id)
    return {"message": "Password updated successfully"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return UserTokenPayload(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        employee_id=current_user.employee_id,
    )
