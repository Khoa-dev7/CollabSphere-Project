# app/models/peer_review.py
from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, UniqueConstraint
from datetime import datetime
from app.database import Base


class PeerReview(Base):
    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))   # người đánh giá
    reviewee_id = Column(Integer, ForeignKey("users.id"))   # người được đánh giá
    team_id = Column(Integer, ForeignKey("teams.id"))

    score = Column(Integer)  # 1 → 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint(
            "reviewer_id",
            "reviewee_id",
            "team_id",
            name="unique_peer_review"
        ),
    )
