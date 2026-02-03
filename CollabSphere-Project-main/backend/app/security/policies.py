from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import models


def can_view_user(
    db: Session,
    current_user_id: int,
    target_user_id: int
):
    if current_user_id == target_user_id:
        return True

    # cùng team thì cho xem
    same_team = (
        db.query(models.TeamMember)
        .join(models.Team)
        .filter(
            models.TeamMember.user_id == current_user_id,
            models.TeamMember.team_id.in_(
                db.query(models.TeamMember.team_id)
                .filter(models.TeamMember.user_id == target_user_id)
            )
        )
        .first()
    )

    if same_team:
        return True

    raise HTTPException(status_code=403, detail="IDOR detected")


def can_view_task(
    db: Session,
    current_user_id: int,
    task_id: int
):
    task = db.query(models.Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task không tồn tại")

    if task.assignee_id == current_user_id:
        return True

    member = (
        db.query(models.TeamMember)
        .filter_by(
            team_id=task.team_id,
            user_id=current_user_id
        )
        .first()
    )

    if not member:
        raise HTTPException(status_code=403, detail="IDOR detected")

    return True
