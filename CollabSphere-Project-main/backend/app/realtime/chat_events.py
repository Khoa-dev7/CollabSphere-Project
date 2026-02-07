from app.realtime.socket import sio
from app.database import SessionLocal
from app.models import models
from datetime import datetime


@sio.event
async def join_room(sid, data):
    """
    data = { "room_id": 1 }
    """
    room = f"chat_{data['room_id']}"
    sio.enter_room(sid, room)

    await sio.emit(
        "system",
        {"message": "Đã vào phòng chat"},
        to=sid
    )


@sio.event
async def leave_room(sid, data):
    room = f"chat_{data['room_id']}"
    sio.leave_room(sid, room)
@sio.event
async def send_message(sid, data):
    """
    data = {
        "room_id": 1,
        "sender_id": 5,
        "content": "Hello mọi người"
    }
    """
    db = SessionLocal()

    try:
        message = models.ChatMessage(
            room_id=data["room_id"],
            sender_id=data["sender_id"],
            content=data.get("content")
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        await sio.emit(
            "new_message",
            {
                "id": message.id,
                "room_id": message.room_id,
                "sender_id": message.sender_id,
                "content": message.content,
                "created_at": message.created_at.isoformat()
            },
            room=f"chat_{data['room_id']}"
        )

    finally:
        db.close()
