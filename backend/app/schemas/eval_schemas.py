from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class FeedbackBase(BaseModel):
    checkpoint_id: int
    comment: str
    grade: float

class FeedbackCreate(FeedbackBase):
    pass

class PeerReviewBase(BaseModel):
    reviewee_id: int
    team_id: int
    score: float
    comment: Optional[str] = None
    is_anonymous: bool = True

class PeerReviewCreate(PeerReviewBase):
    pass

class PeerReviewOut(PeerReviewBase):
    id: int
    reviewer_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TeamMemberEvaluation(BaseModel):
    user_id: int
    full_name: str
    average_score: float
    scores: List[float] # Danh sách điểm chi tiết
    review_count: int

# Rubric Schemas
class RubricCriteriaBase(BaseModel):
    title: str
    description: Optional[str] = None
    max_score: float
    weight: Optional[float] = 1.0
    order: Optional[int] = 0

class RubricCriteriaCreate(RubricCriteriaBase):
    pass

class RubricCriteriaOut(RubricCriteriaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class RubricBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: Optional[int] = None
    project_id: Optional[int] = None
    is_template: Optional[bool] = False

class RubricCreate(RubricBase):
    criteria: List[RubricCriteriaCreate] = []

class RubricUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    criteria: Optional[List[RubricCriteriaCreate]] = None

class RubricOut(RubricBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    criteria: List[RubricCriteriaOut] = []
    
    model_config = ConfigDict(from_attributes=True)

# Rubric Assessment Schemas
class RubricAssessmentItemCreate(BaseModel):
    criteria_id: int
    score: float
    comment: Optional[str] = None

class RubricAssessmentCreate(BaseModel):
    rubric_id: int
    project_id: Optional[int] = None
    team_id: Optional[int] = None
    checkpoint_id: Optional[int] = None
    student_id: Optional[int] = None
    items: List[RubricAssessmentItemCreate]
    feedback: Optional[str] = None

class RubricAssessmentItemOut(BaseModel):
    id: int
    criteria_id: int
    score: float
    comment: Optional[str] = None
    criteria: RubricCriteriaOut
    model_config = ConfigDict(from_attributes=True)

class RubricAssessmentOut(BaseModel):
    id: int
    evaluator_id: int
    total_score: float
    feedback: Optional[str] = None
    created_at: datetime
    items: List[RubricAssessmentItemOut]
    
    model_config = ConfigDict(from_attributes=True)
