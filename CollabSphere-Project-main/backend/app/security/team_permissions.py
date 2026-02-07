from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models
from app.core.security import get_current_user


def check_team_member(team_id: int):
    def _check(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
    ):
        member = (
            db.query(models.TeamMember)
            .filter_by(
                team_id=team_id,
                user_id=current_user.id
            )
            .first()
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="Không có quyền truy cập team này"
            )

        return True

    return _check
