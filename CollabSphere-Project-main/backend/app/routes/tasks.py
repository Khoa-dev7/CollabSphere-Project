from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.security.policies import can_view_task
from app.models import models
from app.schemas.schemas import TaskCreate, TaskMove, TaskResponse
from app.database import get_db
from app.realtime.socket import sio
from app.core.deps import get_current_user
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    # 1. Lưu task vào DB
    t = models.Task(
        title=task.title,
        column_id=task.column_id,
        assignee_id=user.id
    )
    db.add(t)
    db.commit()
    db.refresh(t)

    # 2. Emit realtime qua Socket.IO
    col = db.get(models.TaskColumn, task.column_id)
    if col:
        await sio.emit(
            "TASK_CREATED",
            TaskResponse.model_validate(t).model_dump(),
            room=f"team_{col.team_id}"
        )

    return t


@router.put("/{task_id}/move")
async def move_task(
    task_id: int,
    data: TaskMove,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    t = db.get(models.Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.new_column_id is not None:
        t.column_id = data.new_column_id

    t.position = data.new_position
    db.commit()

    return {"message": "Task moved"}
@router.put("/tasks/{task_id}")
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    old_status = task.status
    task.status = status
    db.commit()

    # 🔥 GHI NHẬT KÝ
    log_activity(
        db=db,
        user_id=current_user.id,
        action="UPDATE_TASK_STATUS",
        description=f"{current_user.full_name} đã chuyển nhiệm vụ '{task.title}' từ '{old_status}' sang '{status}'",
        related_type="task",
        related_id=task.id
    )

    return {"message": "Updated"}
@router.get("/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    can_view_task(db, current_user.id, task_id)

    task = db.query(models.Task).get(task_id)
    return task