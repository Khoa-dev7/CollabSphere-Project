from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models import models
from app.realtime.socket import sio, connected_users

router = APIRouter(prefix="/tasks", tags=["Kanban Move"])


# =====================
# PERMISSION CHECK
# =====================
def check_task_permission(db: Session, task_id: int, user_id: int):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task không tồn tại")

    team_id = task.column.team_id

    member = db.query(models.TeamMember).filter_by(
        team_id=team_id,
        student_id=user_id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Không có quyền thao tác task")

    return task


# =====================
# DEPENDENCY CHECK
# =====================
def check_task_dependencies(db: Session, task: models.Task):
    """
    Nếu task có dependency mà chưa DONE → chặn move sang Doing / Done
    """
    dependencies = db.query(models.TaskDependency).filter(
        models.TaskDependency.task_id == task.id
    ).all()

    for dep in dependencies:
        if dep.depends_on.column.title.lower() != "done":
            raise HTTPException(
                status_code=400,
                detail=f"Task phụ thuộc '{dep.depends_on.title}' chưa hoàn thành"
            )


# =====================
# MOVE TASK (DRAG & DROP)
# =====================
@router.put("/{task_id}/move")
def move_task(
    task_id: int,
    column_id: int,
    new_position: float,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Logic:
    - Check permission
    - Check dependency
    - Đổi column_id nếu cần
    - Update position (float)
    """

    task = check_task_permission(db, task_id, current_user.id)

    # Validate column mới
    column = db.query(models.TaskColumn).filter(
        models.TaskColumn.id == column_id
    ).first()

    if not column:
        raise HTTPException(status_code=404, detail="Column không tồn tại")

    # Đảm bảo cùng team
    if column.team_id != task.column.team_id:
        raise HTTPException(status_code=403, detail="Không thể move task sang team khác")

    # =====================
    # 🔒 CHECK DEPENDENCY
    # =====================
    # Chỉ check khi move sang column khác
    if column_id != task.column_id:
        check_task_dependencies(db, task)

    # =====================
    # UPDATE TASK
    # =====================
    task.column_id = column_id
    task.position = new_position

    db.commit()
    db.refresh(task)

    # =====================
    # 🔔 REALTIME KANBAN MOVE
    # =====================
    members = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == column.team_id,
        models.TeamMember.student_id != current_user.id
    ).all()

    for m in members:
        sid = connected_users.get(m.student_id)
        if sid:
            sio.start_background_task(
                sio.emit,
                "TASK_MOVED",
                {
                    "task_id": task.id,
                    "column_id": column_id,
                    "position": task.position,
                    "by": current_user.full_name
                },
                to=sid
            )

    return {
        "success": True,
        "task_id": task.id,
        "column_id": column_id,
        "position": task.position
    }
