from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.core.security import get_current_user


def check_user_owner(user_id: int):
    """
    IDOR check:
    - User chỉ được truy cập tài nguyên của chính mình
    - Admin thì được phép
    """
    def _checker(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if current_user.role == "admin":
            return

        if current_user.id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Không có quyền truy cập tài nguyên này"
            )

    return _checker
def check_team_member(team_id: int):
    def _checker(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        is_member = db.query(models.TeamMember).filter_by(
            team_id=team_id,
            user_id=current_user.id
        ).first()

        if not is_member:
            raise HTTPException(
                status_code=403,
                detail="Bạn không thuộc team này"
            )

    return _checker
