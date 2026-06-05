from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Position, Department, User
from app.schemas.position import PositionCreate, PositionUpdate, PositionResponse, PositionListResponse
from app.dependencies import get_current_user, require_hr

router = APIRouter(prefix="/positions", tags=["positions"])


@router.get("", response_model=PositionListResponse)
def list_positions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    dept: str = Query(""),
    level: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Position).options(joinedload(Position.department))

    if search:
        q = q.filter(Position.title.ilike(f"%{search}%"))
    if level:
        q = q.filter(Position.level == level)
    if dept:
        q = q.filter(Position.department.has(Department.name == dept))

    total = q.count()
    positions = q.order_by(Position.title.asc()).offset((page - 1) * limit).limit(limit).all()
    return PositionListResponse(positions=positions, total=total, page=page, limit=limit)


@router.post("", response_model=PositionResponse, status_code=201)
def create_position(
    payload: PositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    position = Position(**payload.model_dump())
    db.add(position)
    db.commit()
    db.refresh(position)
    return db.query(Position).options(joinedload(Position.department)).filter(Position.id == position.id).first()


@router.put("/{position_id}", response_model=PositionResponse)
def update_position(
    position_id: int,
    payload: PositionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    position = db.query(Position).filter(Position.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(position, field, value)

    db.commit()
    db.refresh(position)
    return db.query(Position).options(joinedload(Position.department)).filter(Position.id == position.id).first()


@router.delete("/{position_id}", status_code=204)
def delete_position(
    position_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    position = db.query(Position).filter(Position.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    db.delete(position)
    db.commit()
