from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from jose import JWTError
from app.database import get_db
from app.models import User
from app import auth

bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = auth.decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = (
        db.query(User)
        .options(joinedload(User.employee))
        .filter(User.id == user_id)
        .first()
    )
    if not user or user.status != "Active":
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_hr(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("Admin", "HR Manager"):
        raise HTTPException(status_code=403, detail="HR Manager access required")
    return current_user


def require_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("Admin", "HR Manager", "Manager"):
        raise HTTPException(status_code=403, detail="Manager access required")
    return current_user
