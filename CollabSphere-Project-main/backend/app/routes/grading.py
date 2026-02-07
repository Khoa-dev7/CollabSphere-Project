# app/routes/grading.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.services.grading_service import calculate_final_score
from app.models import models

# ❗❗ PHẢI KHAI BÁO ROUTER TRƯỚC
router = APIRouter(prefix="/grading", tags=["Grading"])


@router.get("/teams/{team_id}/students/{student_id}/final-score")
def get_final_score(
    team_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    score = calculate_final_score(db, student_id, team_id)

    return {
        "student_id": student_id,
        "team_id": team_id,
        "final_score": score
    }
