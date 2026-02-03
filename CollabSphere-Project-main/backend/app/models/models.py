# app/models/models.py
from sqlalchemy import (
    Column, Integer, String, Boolean,
    ForeignKey, Enum as SAEnum, Text, Float, DateTime, Index
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

# ===================== ENUMS =====================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    HEAD_DEPARTMENT = "head_dept"
    LECTURER = "lecturer"
    STUDENT = "student"


class ProjectStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class TeamRole(str, enum.Enum):
    LEADER = "LEADER"
    MEMBER = "MEMBER"


# ===================== USER =====================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)

    role = Column(
        SAEnum(UserRole, name="user_role_enum", create_constraint=True),
        nullable=False,
        default=UserRole.STUDENT,
        index=True
    )

    is_active = Column(Boolean, default=True)

    reset_code = Column(String(6), index=True)
    reset_code_expire = Column(DateTime)

    team_memberships = relationship(
        "TeamMember",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    tasks_assigned = relationship(
        "Task",
        back_populates="assignee"
    )


# ===================== SUBJECT / CLASS =====================

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)

    classes = relationship("Class", back_populates="subject")
    projects = relationship("Project", back_populates="subject")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)

    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    lecturer_id = Column(Integer, ForeignKey("users.id"), index=True)

    subject = relationship("Subject", back_populates="classes")
    lecturer = relationship("User")

    projects = relationship("Project", back_populates="classroom")
    teams = relationship("Team", back_populates="classroom")


# ===================== PROJECT =====================

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    objectives = Column(Text)
    milestones_info = Column(Text)

    status = Column(
        SAEnum(ProjectStatus, name="project_status_enum", create_constraint=True),
        default=ProjectStatus.PENDING,
        nullable=False,
        index=True
    )

    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), index=True)

    subject = relationship("Subject", back_populates="projects")
    created_by = relationship("User")
    classroom = relationship("Class", back_populates="projects")

    teams = relationship(
        "Team",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    rubrics = relationship(
        "Rubric",
        back_populates="project",
        cascade="all, delete-orphan"
    )


# ===================== TEAM =====================

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), index=True)

    project = relationship("Project", back_populates="teams")
    classroom = relationship("Class", back_populates="teams")

    members = relationship(
        "TeamMember",
        back_populates="team",
        cascade="all, delete-orphan"
    )

    task_columns = relationship(
        "TaskColumn",
        back_populates="team",
        cascade="all, delete-orphan"
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)

    role = Column(
        SAEnum(TeamRole, name="team_role_enum", create_constraint=True),
        default=TeamRole.MEMBER,
        nullable=False
    )

    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    student = relationship("User", back_populates="team_memberships")

    __table_args__ = (
        Index("idx_team_member_unique", "team_id", "student_id"),
    )


# ===================== TASK / KANBAN =====================

class TaskColumn(Base):
    __tablename__ = "task_columns"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    position = Column(Integer, nullable=False)

    team_id = Column(Integer, ForeignKey("teams.id"), index=True)

    team = relationship("Team", back_populates="task_columns")
    tasks = relationship(
        "Task",
        back_populates="column",
        cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    position = Column(Float, default=60000.0, index=True)

    column_id = Column(Integer, ForeignKey("task_columns.id"), index=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), index=True)

    column = relationship("TaskColumn", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")

    attachments = relationship(
        "Attachment",
        back_populates="task",
        cascade="all, delete-orphan"
    )

    comments = relationship(
        "TaskComment",
        back_populates="task",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_tasks_column_position", "column_id", "position"),
    )


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    task_id = Column(Integer, ForeignKey("tasks.id"), index=True)

    task = relationship("Task", back_populates="attachments")


class TaskComment(Base):
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)

    task_id = Column(Integer, ForeignKey("tasks.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="comments")
    user = relationship("User")


# ===================== RUBRIC =====================

class Rubric(Base):
    __tablename__ = "rubrics"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"), index=True)

    project = relationship("Project", back_populates="rubrics")

    criteria = relationship(
        "RubricCriteria",
        back_populates="rubric",
        cascade="all, delete-orphan"
    )


class RubricCriteria(Base):
    __tablename__ = "rubric_criteria"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    max_score = Column(Float, nullable=False)

    rubric_id = Column(Integer, ForeignKey("rubrics.id"), index=True)

    rubric = relationship("Rubric", back_populates="criteria")


# ===================== TASK DEPENDENCY =====================

class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(Integer, primary_key=True)

    task_id = Column(Integer, ForeignKey("tasks.id"), index=True)
    depends_on_id = Column(Integer, ForeignKey("tasks.id"), index=True)

    task = relationship(
        "Task",
        foreign_keys=[task_id],
        backref="dependencies"
    )

    depends_on = relationship(
        "Task",
        foreign_keys=[depends_on_id]
    )


# ===================== GRADING =====================

class GradingCriteria(Base):
    __tablename__ = "grading_criteria"

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    name = Column(String, index=True)     # peer_review, task, attendance
    weight = Column(Float)
