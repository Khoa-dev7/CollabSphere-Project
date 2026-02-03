from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.core.deps import get_current_user
from app.models.models import TeamRole

router = APIRouter(prefix="/tasks", tags=["Task Dependencies"])


def check_leader(db, task_id, user_id):
    task = db.query(models.Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task không tồn tại")

    member = db.query(models.TeamMember).filter_by(
        team_id=task.column.team_id,
        student_id=user_id
    ).first()

    if not member or member.role != TeamRole.LEADER:
        raise HTTPException(status_code=403, detail="Chỉ leader được cấu hình dependency")

    return task


# =====================
# ADD DEPENDENCY
# =====================
@router.post("/{task_id}/dependencies/{depends_on_id}")
def add_dependency(
    task_id: int,
    depends_on_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if task_id == depends_on_id:
        raise HTTPException(status_code=400, detail="Task không thể phụ thuộc chính nó")

    check_leader(db, task_id, current_user.id)

    exists = db.query(models.TaskDependency).filter_by(
        task_id=task_id,
        depends_on_id=depends_on_id
    ).first()

    if exists:
        raise HTTPException(status_code=400, detail="Dependency đã tồn tại")

    dep = models.TaskDependency(
        task_id=task_id,
        depends_on_id=depends_on_id
    )

    db.add(dep)
    db.commit()

    return {"success": True}


# =====================
# LIST DEPENDENCIES
# =====================
@router.get("/{task_id}/dependencies")
def list_dependencies(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    task = db.query(models.Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404)

    return db.query(models.TaskDependency).filter_by(
        task_id=task_id
    ).all()


# =====================
# REMOVE DEPENDENCY
# =====================
@router.delete("/{task_id}/dependencies/{depends_on_id}")
def remove_dependency(
    task_id: int,
    depends_on_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    check_leader(db, task_id, current_user.id)

    dep = db.query(models.TaskDependency).filter_by(
        task_id=task_id,
        depends_on_id=depends_on_id
    ).first()

    if not dep:
        raise HTTPException(status_code=404)

    db.delete(dep)
    db.commit()

    return {"success": True}
