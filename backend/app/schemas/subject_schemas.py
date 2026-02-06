from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubjectBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None

class SubjectOut(SubjectBase):
    id: int
    class Config:
        from_attributes = True

class SyllabusBase(BaseModel):
    subject_id: int
    version: str
    content: Optional[str] = None

class SyllabusCreate(SyllabusBase):
    pass

class SyllabusOut(SyllabusBase):
    id: int
    class Config:
        from_attributes = True

class ClassBase(BaseModel):
    name: str
    lecturer_id: int

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    lecturer_id: Optional[int] = None

class ClassOut(ClassBase):
    id: int
    created_at: datetime
    code: Optional[str] = None
    lecturer_name: Optional[str] = None
    credits: Optional[int] = 3
    syllabus: Optional[str] = None
    student_count: Optional[int] = 0
    is_enrolled: Optional[bool] = False
    
    class Config:
        from_attributes = True
