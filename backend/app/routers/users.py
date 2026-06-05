import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app import auth as auth_utils
from app.schemas.user import UserCreate, UserUpdate, UserStatusUpdate, UserResponse, UserListResponse, PasswordChange
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/export")
def export_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.query(User).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "name", "email", "role", "status", "last_login"])
    writer.writeheader()
    for u in users:
        writer.writerow({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "last_login": u.last_login.isoformat() if u.last_login else "",
        })
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"},
    )


@router.get("", response_model=UserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    role: str = Query(""),
    status: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    q = db.query(User)
    if search:
        like = f"%{search}%"
        q = q.filter((User.name.ilike(like)) | (User.email.ilike(like)))
    if role:
        q = q.filter(User.role == role)
    if status:
        q = q.filter(User.status == status)
    total = q.count()
    users = q.order_by(User.created_at.asc()).offset((page - 1) * limit).limit(limit).all()
    return UserListResponse(users=users, total=total, page=page, limit=limit)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=auth_utils.hash_password(payload.password),
        role=payload.role,
        status=payload.status,
        employee_id=payload.employee_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email and payload.email != user.email:
        if db.query(User).filter(User.email == payload.email, User.id != user_id).first():
            raise HTTPException(status_code=409, detail="Email already in use")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own account status")
    user.status = payload.status
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()


@router.get("/profile/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile/me", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email and payload.email != current_user.email:
        if db.query(User).filter(User.email == payload.email, User.id != current_user.id).first():
            raise HTTPException(status_code=409, detail="Email already in use")

    allowed = {"name", "email"}
    for field, value in payload.model_dump(exclude_none=True).items():
        if field in allowed:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/profile/password", status_code=204)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not auth_utils.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=422, detail="Passwords do not match")
    current_user.password_hash = auth_utils.hash_password(payload.new_password)
    db.commit()
