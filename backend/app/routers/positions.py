from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models import Position, Department, Employee, User
from app.schemas.position import PositionCreate, PositionUpdate, PositionResponse, PositionListResponse
from app.dependencies import get_current_user, require_hr

router = APIRouter(prefix="/positions", tags=["positions"])


def _headcounts(db: Session, position_ids: list[int]) -> dict[int, int]:
    """Active, non-deleted employee count per position, computed live from the Employees table."""
    if not position_ids:
        return {}
    rows = (
        db.query(Employee.position_id, func.count(Employee.id))
        .filter(Employee.position_id.in_(position_ids), Employee.status == "Active")
        .group_by(Employee.position_id)
        .all()
    )
    return dict(rows)


def _enrich(pos: Position, headcount: int) -> PositionResponse:
    return PositionResponse(
        id=pos.id,
        title=pos.title,
        department_id=pos.department_id,
        department=pos.department,
        level=pos.level,
        max_slots=pos.max_slots,
        headcount=headcount,
        openings=max(0, pos.max_slots - headcount),
        salary_min=pos.salary_min,
        salary_max=pos.salary_max,
        created_at=pos.created_at,
        updated_at=pos.updated_at,
    )


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
    counts = _headcounts(db, [p.id for p in positions])
    return PositionListResponse(
        positions=[_enrich(p, counts.get(p.id, 0)) for p in positions],
        total=total, page=page, limit=limit,
    )


@router.get("/{position_id}", response_model=PositionResponse)
def get_position(position_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    position = db.query(Position).options(joinedload(Position.department)).filter(Position.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return _enrich(position, _headcounts(db, [position.id]).get(position.id, 0))


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
    position = db.query(Position).options(joinedload(Position.department)).filter(Position.id == position.id).first()
    return _enrich(position, _headcounts(db, [position.id]).get(position.id, 0))


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
    position = db.query(Position).options(joinedload(Position.department)).filter(Position.id == position.id).first()
    return _enrich(position, _headcounts(db, [position.id]).get(position.id, 0))


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
