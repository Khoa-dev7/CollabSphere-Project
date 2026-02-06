from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CheckpointBase(BaseModel):
    title: str
    description: Optional[str] = None

class CheckpointCreate(CheckpointBase):
    pass

class CheckpointUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_done: Optional[bool] = None

class CheckpointAssign(BaseModel):
    user_ids: List[int]

class CheckpointSubmissionCreate(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None

class CheckpointSubmissionOut(BaseModel):
    id: int
    student_id: int
    content: Optional[str]
    file_url: Optional[str]
    grade: Optional[float]
    feedback: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class CheckpointOut(CheckpointBase):
    id: int
    team_id: int
    is_done: bool
    created_at: datetime
    assignments: List[int] = [] # List of user IDs? Or objects? simpler IDs for now or we create AssigneeOut
    submissions: List[CheckpointSubmissionOut] = []
    
    class Config:
        from_attributes = True
