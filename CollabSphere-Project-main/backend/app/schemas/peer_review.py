from pydantic import BaseModel, Field
from typing import Optional


class PeerReviewCreate(BaseModel):
    reviewee_id: int
    team_id: int
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class PeerReviewResponse(BaseModel):
    reviewer_id: int
    reviewee_id: int
    score: int
    comment: Optional[str]

    class Config:
        from_attributes = True


class PeerReviewAverage(BaseModel):
    user_id: int
    average_score: float
    total_reviews: int
