from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models

MIN_TEAM_MEMBERS = 2
MAX_TEAM_MEMBERS = 5


def check_team_capacity(team_id: int):
    def checker(db: Session = Depends(get_db)):
        count = db.query(models.TeamMember).filter_by(
            team_id=team_id
        ).count()

        if count >= MAX_TEAM_MEMBERS:
            raise HTTPException(
                status_code=400,
                detail=f"Team đã đủ {MAX_TEAM_MEMBERS} thành viên"
            )

        return True

    return checker


def require_min_members(team_id: int):
    def checker(db: Session = Depends(get_db)):
        count = db.query(models.TeamMember).filter_by(
            team_id=team_id
        ).count()

        if count < MIN_TEAM_MEMBERS:
            raise HTTPException(
                status_code=400,
                detail=f"Team phải có ít nhất {MIN_TEAM_MEMBERS} thành viên"
            )

        return True

    return checker
