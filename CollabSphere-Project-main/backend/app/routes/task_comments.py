# app/routes/task_comments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.core.deps import get_current_user
from app.realtime.socket import sio, connected_users

router = APIRouter(prefix="/tasks", tags=["Task Comments"])


def check_task_permission(db, task_id, user_id):
    task = db.query(models.Task).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task không tồn tại")

    member = db.query(models.TeamMember).filter_by(
        team_id=task.column.team_id,
        student_id=user_id
    ).first()

    if not member:
        raise HTTPException(status_code=403)

    return task


# =====================
# CREATE COMMENT
# =====================
@router.post("/{task_id}/comments")
def create_comment(
    task_id: int,
    content: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    task = check_task_permission(db, task_id, current_user.id)

    comment = models.TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=content
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    # 🔔 REALTIME
    members = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == task.column.team_id,
        models.TeamMember.student_id != current_user.id
    ).all()

    for m in members:
        sid = connected_users.get(m.student_id)
        if sid:
            sio.start_background_task(
                sio.emit,
                "notification",
                {
                    "type": "TASK_COMMENT",
                    "task_id": task_id,
                    "content": content,
                    "by": current_user.full_name
                },
                to=sid
            )

    return comment


# =====================
# LIST COMMENTS
# =====================
@router.get("/{task_id}/comments")
def list_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    check_task_permission(db, task_id, current_user.id)

    return db.query(models.TaskComment).filter(
        models.TaskComment.task_id == task_id
    ).order_by(models.TaskComment.created_at.asc()).all()
