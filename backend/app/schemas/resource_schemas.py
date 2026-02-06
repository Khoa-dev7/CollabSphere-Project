from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResourceBase(BaseModel):
    name: str
    file_type: str
    team_id: Optional[int] = None
    class_id: Optional[int] = None
    milestone_id: Optional[int] = None
    checkpoint_id: Optional[int] = None
    task_id: Optional[int] = None

class ResourceCreate(ResourceBase):
    file_url: str
    owner_id: int

class ResourceOut(ResourceBase):
    id: int
    file_url: str
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True
