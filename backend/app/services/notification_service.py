from sqlalchemy.orm import Session
from app.models.comm_models import Notification
from typing import List

# Đối tượng Socket.IO giả lập - trong ứng dụng thực tế, cái này sẽ được dùng để đẩy thông báo thời gian thực.
class SocketManager:
    async def emit(self, event, data, room=None):
        """
        Giả lập việc phát tín hiệu (emit) tới các client đang kết nối.
        """
        # Trong một triển khai thực tế: sio.emit(event, data, room=room)
        print(f"PHÁT SOCKET: {event} tới {room} với dữ liệu {data}")

socket_manager = SocketManager()

async def create_notification(db: Session, recipient_id: int, content: str, type: str = "info", related_link: str = None):
    """
    Tạo một thông báo mới trong DB và đẩy tin nhắn thời gian thực qua Socket.
    """
    notification = Notification(
        recipient_id=recipient_id,
        content=content,
        type=type,
        related_link=related_link
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Đẩy tin nhắn thời gian thực tới người nhận
    await socket_manager.emit("new_notification", {
        "id": notification.id,
        "content": notification.content,
        "type": notification.type,
        "related_link": notification.related_link,
        "created_at": str(notification.created_at)
    }, room=f"user_{recipient_id}")
    
    return notification

def get_my_notifications(db: Session, user_id: int, limit: int = 20, skip: int = 0):
    """
    Lấy danh sách thông báo cá nhân, sắp xếp theo thời gian mới nhất.
    """
    return db.query(Notification).filter(
        Notification.recipient_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()

def mark_as_read(db: Session, notification_id: int, user_id: int):
    """
    Đánh dấu một thông báo cụ thể là đã đọc.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.recipient_id == user_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        return True
    return False

def mark_all_as_read(db: Session, user_id: int):
    """
    Đánh dấu tất cả thông báo của người dùng là đã đọc.
    """
    db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read == False).update({Notification.is_read: True})
    db.commit()
    return True
