# app/schemas/chat.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRoomCreate(BaseModel):
    name: str
    team_id: Optional[int] = None
    project_id: Optional[int] = None


class ChatMessageCreate(BaseModel):
    content: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    content: Optional[str]
    file_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
