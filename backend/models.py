# backend/models.py
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

# --- ENUMS (Định nghĩa các loại dữ liệu cố định) ---
class UserRole(enum.Enum):
    ADMIN = 'Admin'
    HEAD_DEPARTMENT = 'Head Department'
    STAFF = 'Staff'
    LECTURER = 'Lecturer'
    STUDENT = 'Student'

class ProjectStatus(enum.Enum):
    PENDING = 'Pending'
    APPROVED = 'Approved'
    DENIED = 'Denied'

class MessageType(enum.Enum):
    TEXT = 'text'
    IMAGE = 'image'
    FILE = 'file'

# --- CORE MODELS (Người dùng, Môn học, Lớp học) ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    # Quan hệ ngược để truy cập từ TeamMember
    # team_memberships = db.relationship('TeamMember', back_populates='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'email': self.email, 'role': self.role.value}

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    syllabus_url = db.Column(db.String(255))

class ClassRoom(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    lecturer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Dự án đang chạy trong lớp (Project được gán cho lớp)
    current_project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)

    subject = db.relationship('Subject')
    lecturer = db.relationship('User')
    current_project = db.relationship('Project', foreign_keys=[current_project_id])

# --- PROJECT MANAGEMENT (Quản lý dự án) ---
class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    objectives = db.Column(db.Text)
    status = db.Column(db.Enum(ProjectStatus), default=ProjectStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    milestones = db.relationship('ProjectMilestone', backref='project', cascade="all, delete-orphan")
    owner = db.relationship('User', foreign_keys=[owner_id])
    subject = db.relationship('Subject')

class ProjectMilestone(db.Model):
    __tablename__ = 'project_milestones'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description}

# --- TEAM & MEMBERS (Nhóm sinh viên) ---
class TeamMember(db.Model):
    __tablename__ = 'team_members'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), primary_key=True)
    is_leader = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship("User")

class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))
    
    # Quan hệ
    memberships = db.relationship('TeamMember', backref='team', cascade="all, delete-orphan")
    columns = db.relationship('TaskColumn', backref='team', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id, 
            'name': self.name, 
            'class_id': self.class_id,
            'members': [m.user.username for m in self.memberships]
        }

# --- TASK & KANBAN (Quản lý công việc) ---
class TaskColumn(db.Model):
    __tablename__ = 'task_columns'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50)) # To Do, Doing, Done
    position = db.Column(db.Integer, default=0)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    
    tasks = db.relationship('Task', backref='column', order_by='Task.position', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'position': self.position,
            'tasks': [t.to_dict() for t in self.tasks]
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    position = db.Column(db.Integer, default=0)
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    column_id = db.Column(db.Integer, db.ForeignKey('task_columns.id'))
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    attachments = db.relationship('Attachment', backref='task', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'description': self.description,
            'position': self.position, 'column_id': self.column_id,