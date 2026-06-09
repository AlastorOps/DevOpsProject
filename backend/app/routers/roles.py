from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Role, RolePermission, User
from app.schemas.role import RoleCreate, PermissionUpdate, RoleResponse
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/roles", tags=["roles"])

DEFAULT_MODULES = {
    "Dashboard Module": ["View Analytics", "Edit Widgets"],
    "Employee Module": ["View Directory", "Add/Delete", "Modify Records", "Document Access"],
    "Payroll Module": ["Process Salaries", "Tax Reporting", "Bonus Management"],
    "Attendance & Leave": ["View Attendance", "Approve Leaves", "Overtime Control"],
}


@router.get("", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Role).all()


@router.get("/{role_name}/permissions", response_model=RoleResponse)
def get_role_permissions(role_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("", response_model=RoleResponse, status_code=201)
def create_role(
    payload: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(Role).filter(Role.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Role name already exists")

    role = Role(name=payload.name, description=payload.description, is_system=False)
    db.add(role)
    db.flush()

    for module, permissions in DEFAULT_MODULES.items():
        for perm in permissions:
            db.add(RolePermission(role_id=role.id, module=module, permission=perm, enabled=False))

    db.commit()
    db.refresh(role)
    return role


@router.put("/{role_name}", response_model=RoleResponse)
def update_role_permissions(
    role_name: str,
    payload: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=403, detail="System role permissions cannot be modified")

    for key, enabled in payload.permissions.items():
        parts = key.split("|", 1)
        if len(parts) != 2:
            continue
        module, permission = parts
        perm = db.query(RolePermission).filter(
            RolePermission.role_id == role.id,
            RolePermission.module == module,
            RolePermission.permission == permission,
        ).first()
        if perm:
            perm.enabled = enabled
        else:
            db.add(RolePermission(role_id=role.id, module=module, permission=permission, enabled=enabled))

    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_name}", status_code=204)
def delete_role(
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=403, detail="System roles cannot be deleted")
    db.delete(role)
    db.commit()
