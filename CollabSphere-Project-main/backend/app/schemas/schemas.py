from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

from app.models.models import UserRole, ProjectStatus

# =====================================================
# AUTH & USER
# =====================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


class AccountUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# =====================================================
# SUBJECT & CLASS
# =====================================================

class SubjectCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True


class ClassCreate(BaseModel):
    name: str
    code: str
    subject_id: int
    lecturer_id: Optional[int] = None


class ClassResponse(BaseModel):
    id: int
    name: str
    code: str
    subject_name: Optional[str] = None
    lecturer_name: Optional[str] = None

    class Config:
        from_attributes = True


# =====================================================
# PROJECT MANAGEMENT
# =====================================================

class ProjectCreate(BaseModel):
    title: str
    description: str
    objectives: str
    milestones_info: str
    subject_id: int


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus


class ProjectResponse(BaseModel):
    id: int
    title: str
    status: ProjectStatus

    class Config:
        from_attributes = True


# =====================================================
# PASSWORD RESET (OTP 6 SỐ)
# =====================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)
# =====================================================
# TASK & KANBAN
# =====================================================

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    column_id: int
    position: float = 0


class TaskMove(BaseModel):
    new_column_id: Optional[int] = None
    new_position: float


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    position: float
    column_id: int
    assignee_id: Optional[int]

    class Config:
        from_attributes = True
# =====================================================
# TEAM
# =====================================================

class TeamCreate(BaseModel):
    name: str
    class_id: int
    project_id: int


class TeamResponse(BaseModel):
    id: int
    name: str
    class_id: int
    project_id: int
    created_by: int

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    user_id: int
