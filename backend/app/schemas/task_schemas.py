from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Todo"
    priority: str = "Medium"
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    order: int = 0

class TaskCreate(TaskBase):
    team_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    order: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    team_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class KanbanColumn(BaseModel):
    title: str
    tasks: List[TaskOut]

class TaskBulkUpdateItem(BaseModel):
    id: int
    status: Optional[str] = None
    order: Optional[int] = None

class TaskBulkUpdate(BaseModel):
    tasks: List[TaskBulkUpdateItem]

class TaskCommentBase(BaseModel):
    content: str

class TaskCommentCreate(TaskCommentBase):
    pass

class TaskCommentOut(TaskCommentBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskMove(BaseModel):
    new_status: str
    new_order: int
