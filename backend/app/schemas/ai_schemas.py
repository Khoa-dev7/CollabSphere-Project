from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AIInteractionBase(BaseModel):
    team_id: Optional[int] = None
    prompt: str
    interaction_type: str

class AIInteractionCreate(AIInteractionBase):
    user_id: int
    response: str

class AIInteractionOut(AIInteractionBase):
    id: int
    user_id: int
    response: str
    created_at: datetime
    class Config:
        from_attributes = True

class AISuggestionRequest(BaseModel):
    context: str
    team_id: Optional[int] = None
