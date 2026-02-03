# app/routes/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_as_read,
    count_unread
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )


@router.put("/{notification_id}/read")
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    noti = mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )

    if not noti:
        raise HTTPException(
            status_code=404,
            detail="Notification không tồn tại"
        )

    return {"success": True}


@router.put("/read-all")
def read_all(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    mark_all_as_read(db, current_user.id)
    return {"success": True}


@router.get("/unread/count")
def unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return {"unread": count_unread(db, current_user.id)}
