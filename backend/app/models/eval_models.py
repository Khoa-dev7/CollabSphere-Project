from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Rubric(Base):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    is_template = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subject = relationship("Subject")
    project = relationship("Project")
    criteria = relationship("RubricCriteria", back_populates="rubric", cascade="all, delete-orphan")

class RubricCriteria(Base):
    __tablename__ = "rubric_criteria"
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    max_score = Column(Float, nullable=False)
    weight = Column(Float, default=1.0)
    order = Column(Integer, default=0)
    
    rubric = relationship("Rubric", back_populates="criteria")

class RubricAssessment(Base):
    __tablename__ = "rubric_assessments"
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), index=True)
    evaluator_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Target: Can be a project, a team, or a specific student submission (checkpoint)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    total_score = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    rubric = relationship("Rubric")
    evaluator = relationship("User", foreign_keys=[evaluator_id])
    items = relationship("RubricAssessmentItem", back_populates="assessment", cascade="all, delete-orphan")

class RubricAssessmentItem(Base):
    __tablename__ = "rubric_assessment_items"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("rubric_assessments.id"))
    criteria_id = Column(Integer, ForeignKey("rubric_criteria.id"))
    score = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    
    assessment = relationship("RubricAssessment", back_populates="items")
    criteria = relationship("RubricCriteria")
