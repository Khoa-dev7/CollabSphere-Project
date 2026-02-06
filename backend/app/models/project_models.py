from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lecturer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lecturer = relationship("User", foreign_keys=[lecturer_id])
    members = relationship("ClassMember", back_populates="classroom")
    teams = relationship("Team", back_populates="classroom")
    assigned_projects = relationship("ClassProject", back_populates="classroom")

class ClassMember(Base):
    __tablename__ = "class_members"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    classroom = relationship("Class", back_populates="members")
    user = relationship("User", back_populates="classes")

class ClassProject(Base):
    __tablename__ = "class_projects"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    classroom = relationship("Class", back_populates="assigned_projects")
    project = relationship("Project", back_populates="assigned_classes")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    objectives = Column(Text)
    syllabus_id = Column(Integer, ForeignKey("syllabuses.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="Pending") # Pending, Approved, Denied
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    max_members = Column(Integer, default=5)
    is_public = Column(Boolean, default=True)
    difficulty_level = Column(String) # Easy, Medium, Hard
    tags = Column(String) # Comma-separated or JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    syllabus = relationship("Syllabus", back_populates="projects")
    creator = relationship("User", foreign_keys=[creator_id])
    responsible_lecturer = relationship("User", foreign_keys=[lecturer_id])
    milestones = relationship("ProjectMilestone", back_populates="project")
    assigned_teams = relationship("Team", back_populates="project")
    assigned_classes = relationship("ClassProject", back_populates="project")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer)
    
    project = relationship("Project", back_populates="milestones")
    questions = relationship("MilestoneQuestion", back_populates="milestone", cascade="all, delete-orphan")

class MilestoneQuestion(Base):
    __tablename__ = "milestone_questions"
    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    milestone = relationship("ProjectMilestone", back_populates="questions")
    answers = relationship("MilestoneAnswer", back_populates="question", cascade="all, delete-orphan")

class MilestoneAnswer(Base):
    __tablename__ = "milestone_answers"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("milestone_questions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    question = relationship("MilestoneQuestion", back_populates="answers")
    user = relationship("User")
    team = relationship("Team")

class TeamMilestone(Base):
    __tablename__ = "team_milestones"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"))
    is_done = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    leader_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    classroom = relationship("Class", back_populates="teams")
    project = relationship("Project", back_populates="assigned_teams")
    leader = relationship("User", foreign_keys=[leader_id])
    members = relationship("TeamMember", back_populates="team")
    tasks = relationship("Task", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    contribution_percentage = Column(Float, default=0.0)
    
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="teams")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="Todo") # Todo, In Progress, Done
    priority = Column(String, default="Medium")
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    due_date = Column(DateTime)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    team = relationship("Team", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
    attachments = relationship("Resource", back_populates="task")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")

class TaskComment(Base):
    __tablename__ = "task_comments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    task = relationship("Task", back_populates="comments")
    user = relationship("User")
