from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models import PerformanceReview, Employee, Department, User
from app.schemas.performance import (
    PerformanceCreate, PerformanceResponse, PerformanceStats,
    PerformanceListResponse,
)
from app.dependencies import get_current_user, require_manager

router = APIRouter(prefix="/performance", tags=["performance"])

STARS_TO_RATING = {5: "Excellent", 4: "Good", 3: "Average", 2: "Average", 1: "Poor"}


@router.get("/stats", response_model=PerformanceStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(PerformanceReview.rating, func.count(PerformanceReview.id)).group_by(PerformanceReview.rating).all()
    counts = {row[0]: row[1] for row in rows}
    total = sum(counts.values())

    avg_result = db.query(func.avg(PerformanceReview.stars)).scalar()
    avg = round(float(avg_result or 0), 2)

    pending = db.query(func.count(Employee.id)).filter(
        ~Employee.id.in_(db.query(PerformanceReview.employee_id))
    ).scalar()

    return PerformanceStats(
        average_stars=avg,
        total_reviews=total,
        pending_count=pending,
        excellent_count=counts.get("Excellent", 0),
        good_count=counts.get("Good", 0),
        average_count=counts.get("Average", 0),
        poor_count=counts.get("Poor", 0),
    )


@router.get("", response_model=PerformanceListResponse)
def list_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    dept: str = Query(""),
    rating: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(PerformanceReview).options(
        joinedload(PerformanceReview.employee).joinedload(Employee.department),
        joinedload(PerformanceReview.employee).joinedload(Employee.position),
    )

    if search:
        q = q.filter(PerformanceReview.employee.has(Employee.name.ilike(f"%{search}%")))
    if rating:
        q = q.filter(PerformanceReview.rating == rating)
    if dept:
        q = q.filter(PerformanceReview.employee.has(Employee.department.has(Department.name == dept)))

    total = q.count()
    reviews = q.order_by(PerformanceReview.review_date.desc()).offset((page - 1) * limit).limit(limit).all()
    return PerformanceListResponse(reviews=reviews, total=total, page=page, limit=limit)


@router.post("", response_model=PerformanceResponse, status_code=201)
def create_review(
    payload: PerformanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    if not db.query(Employee).filter(Employee.id == payload.employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")

    rating = STARS_TO_RATING.get(payload.stars, "Average")

    review = PerformanceReview(
        employee_id=payload.employee_id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.name,
        cycle=payload.cycle,
        rating=rating,
        stars=payload.stars,
        comments=payload.comments,
        review_date=payload.review_date or date_type.today(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return db.query(PerformanceReview).options(
        joinedload(PerformanceReview.employee).joinedload(Employee.department),
        joinedload(PerformanceReview.employee).joinedload(Employee.position),
    ).filter(PerformanceReview.id == review.id).first()


@router.get("/employee/{employee_id}", response_model=PerformanceListResponse)
def employee_reviews(
    employee_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(PerformanceReview).options(
        joinedload(PerformanceReview.employee).joinedload(Employee.department),
        joinedload(PerformanceReview.employee).joinedload(Employee.position),
    ).filter(PerformanceReview.employee_id == employee_id)
    total = q.count()
    reviews = q.order_by(PerformanceReview.review_date.desc()).offset((page - 1) * limit).limit(limit).all()
    return PerformanceListResponse(reviews=reviews, total=total, page=page, limit=limit)
