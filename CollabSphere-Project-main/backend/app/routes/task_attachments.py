# app/routes/task_attachments.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
from uuid import uuid4

from app.database import get_db
from app.models import models
from app.models.models import TeamRole
from app.core.deps import get_current_user
from app.realtime.socket import sio, connected_users

router = APIRouter(prefix="/tasks", tags=["Task Attachments"])

UPLOAD_DIR = "uploads/tasks"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =====================================================
# PERMISSION CHECK (MEMBER / LEADER)
# =====================================================
def check_task_permission(
    db: Session,
    task_id: int,
    user_id: int,
    require_leader: bool = False
):
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
        raise HTTPException(status_code=403, detail="Không có quyền truy cập task")

    if require_leader and member.role != TeamRole.LEADER:
        raise HTTPException(
            status_code=403,
            detail="Chỉ LEADER mới có quyền thực hiện hành động này"
        )

    return task


# =====================================================
# UPLOAD ATTACHMENT (MEMBER)
# =====================================================
@router.post("/{task_id}/attachments")
def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    task = check_task_permission(db, task_id, current_user.id)

    task_dir = f"{UPLOAD_DIR}/task_{task_id}"
    os.makedirs(task_dir, exist_ok=True)

    # 🔐 tránh trùng tên file
    safe_filename = f"{uuid4().hex}_{file.filename}"
    file_path = os.path.join(task_dir, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = models.Attachment(
        filename=file.filename,
        file_path=file_path,
        task_id=task_id
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    # 🔔 REALTIME NOTIFICATION
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
                    "type": "TASK_ATTACHMENT",
                    "task_id": task_id,
                    "filename": attachment.filename,
                    "by": current_user.full_name
                },
                to=sid
            )

    return {
        "id": attachment.id,
        "filename": attachment.filename
    }


# =====================================================
# LIST ATTACHMENTS (MEMBER)
# =====================================================
@router.get("/{task_id}/attachments")
def list_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    check_task_permission(db, task_id, current_user.id)

    return db.query(models.Attachment).filter(
        models.Attachment.task_id == task_id
    ).all()


# =====================================================
# DELETE ATTACHMENT (LEADER ONLY)
# =====================================================
@router.delete("/{task_id}/attachments/{attachment_id}")
def delete_attachment(
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    task = check_task_permission(
        db,
        task_id,
        current_user.id,
        require_leader=True
    )

    attachment = db.query(models.Attachment).filter(
        models.Attachment.id == attachment_id,
        models.Attachment.task_id == task_id
    ).first()

    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment không tồn tại")

    if attachment.file_path and os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)

    db.delete(attachment)
    db.commit()

    # 🔔 REALTIME DELETE NOTIFICATION
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
                    "type": "TASK_ATTACHMENT_DELETE",
                    "task_id": task_id,
                    "attachment_id": attachment_id,
                    "by": current_user.full_name
                },
                to=sid
            )

    return {"success": True}
