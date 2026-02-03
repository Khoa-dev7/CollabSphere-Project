from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import models
from app.schemas.peer_review import (
    PeerReviewCreate,
    PeerReviewResponse,
    PeerReviewAverage
)
from app.core.deps import get_current_user
from app.dependencies.team import check_team_member
from app.services.notification_service import create_notification

router = APIRouter(prefix="/peer-reviews", tags=["Peer Review"])

MIN_TEAM_MEMBERS = 2


# =====================================================
# CREATE PEER REVIEW
# =====================================================
@router.post("/", response_model=PeerReviewResponse)
def create_peer_review(
    data: PeerReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if data.reviewee_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Không thể tự đánh giá bản thân"
        )

    reviewer = db.query(models.TeamMember).filter_by(
        team_id=data.team_id,
        user_id=current_user.id
    ).first()
    if not reviewer:
        raise HTTPException(status_code=403, detail="Không thuộc team")

    reviewee = db.query(models.TeamMember).filter_by(
        team_id=data.team_id,
        user_id=data.reviewee_id
    ).first()
    if not reviewee:
        raise HTTPException(
            status_code=400,
            detail="Người này không thuộc team"
        )

    member_count = db.query(models.TeamMember).filter_by(
        team_id=data.team_id
    ).count()
    if member_count < MIN_TEAM_MEMBERS:
        raise HTTPException(
            status_code=400,
            detail="Team phải có ít nhất 2 thành viên để peer review"
        )

    review = models.PeerReview(
        reviewer_id=current_user.id,
        reviewee_id=data.reviewee_id,
        team_id=data.team_id,
        score=data.score,
        comment=data.comment
    )

    db.add(review)
    try:
        db.commit()
        db.refresh(review)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Bạn đã đánh giá người này rồi"
        )

    create_notification(
        db=db,
        user_id=data.reviewee_id,
        title="Bạn vừa nhận được một đánh giá",
        message=f"{current_user.full_name} đã đánh giá bạn trong nhóm",
        type="peer_review"
    )

    return review


# =====================================================
# GET AVERAGE SCORE
# =====================================================
@router.get("/average/{user_id}", response_model=PeerReviewAverage)
def get_average_score(
    user_id: int,
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    member = db.query(models.TeamMember).filter_by(
        team_id=team_id,
        user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Không thuộc team")

    result = (
        db.query(
            func.avg(models.PeerReview.score),
            func.count(models.PeerReview.id)
        )
        .filter(
            models.PeerReview.reviewee_id == user_id,
            models.PeerReview.team_id == team_id
        )
        .first()
    )

    return {
        "user_id": user_id,
        "average_score": round(result[0], 2) if result[0] else 0,
        "total_reviews": result[1]
    }


# =====================================================
# LIST TEAM REVIEWS
# =====================================================
@router.get(
    "/team/{team_id}",
    dependencies=[Depends(check_team_member)]
)
def list_team_reviews(
    team_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(models.PeerReview)
        .filter(models.PeerReview.team_id == team_id)
        .all()
    )
