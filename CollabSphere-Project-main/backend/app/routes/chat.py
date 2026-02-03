from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas.chat import (
    ChatRoomCreate,
    ChatMessageCreate,
    ChatMessageResponse
)
from app.core.deps import get_current_user
from app.services.file_upload import save_chat_file
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/chat", tags=["Chat"])
@router.post("/rooms")
def create_room(
    data: ChatRoomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    room = models.ChatRoom(
        name=data.name,
        team_id=data.team_id,
        project_id=data.project_id
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    log_activity(
        db,
        current_user.id,
        "CREATE_CHAT_ROOM",
        f"{current_user.full_name} đã tạo phòng chat '{room.name}'",
        "chat_room",
        room.id
    )

    return room
@router.post("/rooms/{room_id}/messages", response_model=ChatMessageResponse)
def send_message(
    room_id: int,
    data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    msg = models.ChatMessage(
        room_id=room_id,
        sender_id=current_user.id,
        content=data.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return msg
@router.post("/rooms/{room_id}/upload", response_model=ChatMessageResponse)
def upload_file(
    room_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    file_url = save_chat_file(file)

    msg = models.ChatMessage(
        room_id=room_id,
        sender_id=current_user.id,
        file_url=file_url
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return msg
@router.get("/rooms/{room_id}/messages", response_model=List[ChatMessageResponse])
def get_messages(
    room_id: int,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    offset = (page - 1) * limit

    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.room_id == room_id)
        .order_by(models.ChatMessage.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return messages
