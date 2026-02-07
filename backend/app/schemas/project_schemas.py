from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user_schemas import UserOut

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = 0

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneOut(MilestoneBase):
    id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    syllabus_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_members: Optional[int] = 5
    is_public: Optional[bool] = True
    difficulty_level: Optional[str] = "Medium"
    tags: Optional[str] = None
    lecturer_id: Optional[int] = None

class ProjectCreate(ProjectBase):
    milestones: List[MilestoneCreate] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    objectives: Optional[str] = None
    syllabus_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_members: Optional[int] = None
    is_public: Optional[bool] = None
    difficulty_level: Optional[str] = None
    tags: Optional[str] = None
    milestones: Optional[List[MilestoneCreate]] = None
    lecturer_id: Optional[int] = None

class ProjectOut(ProjectBase):
    id: int
    creator_id: int
    status: str
    created_at: datetime
    milestones: List[MilestoneOut] = []
    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str
    class_id: int
    project_id: Optional[int] = None
    leader_id: Optional[int] = None

class TeamCreate(TeamBase):
    member_ids: List[int] = []
    project_title: Optional[str] = None

class TeamOut(TeamBase):
    id: int
    created_at: datetime
    members: List[UserOut] = []
    class Config:
        from_attributes = True

class MilestoneQuestionBase(BaseModel):
    content: str

class MilestoneQuestionCreate(MilestoneQuestionBase):
    pass

class MilestoneQuestionOut(MilestoneQuestionBase):
    id: int
    milestone_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class MilestoneAnswerCreate(BaseModel):
    content: str

class MilestoneAnswerOut(BaseModel):
    id: int
    content: str
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TeamMilestoneUpdate(BaseModel):
    is_done: bool
