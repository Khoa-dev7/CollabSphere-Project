from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import models
from app.models.models import TeamRole


def get_team_member(
    db: Session,
    team_id: int,
    user_id: int
) -> models.TeamMember:
    member = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.student_id == user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=403,
            detail="Bạn không thuộc team này"
        )

    return member


def require_team_member(
    db: Session,
    team_id: int,
    user_id: int
):
    return get_team_member(db, team_id, user_id)


def require_team_leader(
    db: Session,
    team_id: int,
    user_id: int
):
    member = get_team_member(db, team_id, user_id)

    if member.role != TeamRole.LEADER:
        raise HTTPException(
            status_code=403,
            detail="Chỉ team leader mới có quyền thực hiện"
        )

    return member
