from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # Admin, Staff, Head, Lecturer, Student
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    classes = relationship("ClassMember", back_populates="user")
    teams = relationship("TeamMember", back_populates="user")
    sent_messages = relationship("ChatMessage", back_populates="sender")
    submissions = relationship("CheckpointSubmission", back_populates="student")
    notifications = relationship("Notification", back_populates="recipient")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    
    syllabuses = relationship("Syllabus", back_populates="subject")

class Syllabus(Base):
    __tablename__ = "syllabuses"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    version = Column(String)
    content = Column(Text)
    
    subject = relationship("Subject", back_populates="syllabuses")
    projects = relationship("Project", back_populates="syllabus")
