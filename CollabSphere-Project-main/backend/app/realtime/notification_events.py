from app.realtime.socket import manager

async def push_notification(user_id: int, notification):
    await manager.send_to_user(
        user_id,
        {
            "event": "notification",
            "data": {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "created_at": notification.created_at.isoformat()
            }
        }
    )
