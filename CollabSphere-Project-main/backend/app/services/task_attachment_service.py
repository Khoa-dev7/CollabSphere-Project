import os
import shutil
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models import models
from app.models.models import TeamRole
from app.realtime.socket import sio, connected_users

UPLOAD_DIR = "uploads/tasks"


class TaskAttachmentService:

    # =====================
    # PERMISSION CHECK
    # =====================
    @staticmethod
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
                detail="Chỉ leader mới có quyền thực hiện hành động này"
            )

        return task

    # =====================
    # UPLOAD ATTACHMENT
    # =====================
    @staticmethod
    def upload_attachment(
        db: Session,
        task_id: int,
        file: UploadFile,
        current_user
    ):
        task = TaskAttachmentService.check_task_permission(
            db, task_id, current_user.id
        )

        task_dir = f"{UPLOAD_DIR}/task_{task_id}"
        os.makedirs(task_dir, exist_ok=True)

        file_path = f"{task_dir}/{file.filename}"

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
                        "filename": file.filename,
                        "by": current_user.full_name
                    },
                    to=sid
                )

        return attachment

    # =====================
    # LIST ATTACHMENTS
    # =====================
    @staticmethod
    def list_attachments(
        db: Session,
        task_id: int,
        current_user
    ):
        TaskAttachmentService.check_task_permission(
            db, task_id, current_user.id
        )

        return db.query(models.Attachment).filter(
            models.Attachment.task_id == task_id
        ).all()

    # =====================
    # DELETE ATTACHMENT (LEADER)
    # =====================
    @staticmethod
    def delete_attachment(
        db: Session,
        task_id: int,
        attachment_id: int,
        current_user
    ):
        task = TaskAttachmentService.check_task_permission(
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

        if os.path.exists(attachment.file_path):
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

        return True
