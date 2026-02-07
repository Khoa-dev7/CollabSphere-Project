from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ActivityLogBase(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    team_id: Optional[int] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: int

class ActivityLogOut(ActivityLogBase):
    id: int
    user_id: int
    created_at: datetime
    actor_name: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    team_name: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = super().model_validate(obj, **kwargs)
        # Bổ sung actor_name từ relationship user
        if hasattr(obj, 'user') and obj.user:
            data.actor_name = obj.user.full_name
        
        # Bổ sung team_name từ relationship team
        if hasattr(obj, 'team') and obj.team:
            data.team_name = obj.team.name
            
        # Map target_type -> entity_type và target_id -> entity_id cho Frontend
        data.entity_type = obj.target_type
        data.entity_id = obj.target_id
        return data
