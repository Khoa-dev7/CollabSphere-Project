from sqlalchemy.orm import Session
from app.models.notification import Notification

import asyncio
from typing import Optional

# Socket.IO (optional – tránh crash nếu chưa setup)
try:
    from app.realtime.socket import sio
except ImportError:
    sio = None

def _get_connected_users() -> dict:
    """
    Lấy connected_users nếu tồn tại, không thì trả dict rỗng
    → tránh ImportError & vòng import
    """
    try:
        from app.realtime import socket
        return getattr(socket, "connected_users", {})
    except Exception:
        return {}


async def emit_notification(user_id: int, payload: dict):
    """
    Gửi notification realtime nếu user đang online
    (safe – không làm crash server)
    """
    if not sio:
        return

    connected_users = _get_connected_users()
    sid = connected_users.get(user_id)

    if sid:
        await sio.emit(
            "notification",
            payload,
            to=sid
        )

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: Optional[str] = None
):
    noti = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type
    )
    db.add(noti)
    db.commit()
    db.refresh(noti)

    # 🔔 Realtime emit (non-blocking, safe)
    try:
        asyncio.create_task(
            emit_notification(
                user_id,
                {
                    "id": noti.id,
                    "title": noti.title,
                    "message": noti.message,
                    "type": noti.type,
                    "is_read": noti.is_read,
                    "created_at": noti.created_at.isoformat()
                }
            )
        )
    except RuntimeError:
        # chạy ngoài event loop (VD: alembic, script)
        pass

    return noti

def get_user_notifications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int
):
    noti = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()

    if noti:
        noti.is_read = True
        db.commit()

    return noti

def mark_all_as_read(
    db: Session,
    user_id: int
):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

def count_unread(
    db: Session,
    user_id: int
) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()
