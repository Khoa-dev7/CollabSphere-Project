from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    team_id: Optional[int] = None
    # room_id: Optional[int] = None  # TODO: Uncomment when room_id is added to database
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    is_file: bool = False

class ChatMessageCreate(ChatMessageBase):
    sender_id: Optional[int] = None

class ChatMessageOut(ChatMessageBase):
    id: int
    sender_id: int
    sender_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageOut]
    total: int
    page: int
    limit: int

class ChatRoomCreate(BaseModel):
    name: str
    is_group: bool = True
    member_ids: List[int] = []

class ChatRoomOut(BaseModel):
    id: int
    name: str
    is_group: bool
    created_by: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
