from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

# 1. Bảng Người dùng (Giảng viên & Sinh viên)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String, default="student") # student, lecturer, admin

    # Quan hệ ngược (để truy vấn ngược lại user thuộc nhóm nào)
    teams = relationship("TeamMember", back_populates="student")

# 2. Bảng Lớp học
class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True) # Mã lớp: INT3306 
    lecturer_id = Column(Integer, ForeignKey("users.id"))

    projects = relationship("Project", back_populates="classroom")

# 3. Bảng Dự án (Project)
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))

    classroom = relationship("Class", back_populates="projects")
    teams = relationship("Team", back_populates="project")

# 4. Bảng Nhóm (Team)
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Nhóm 1, Nhóm 2...
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="teams")
    members = relationship("TeamMember", back_populates="team")

# 5. Bảng Thành viên nhóm (Bảng trung gian quan trọng nhất)
class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    is_leader = Column(Boolean, default=False)

    team = relationship("Team", back_populates="members")
    student = relationship("User", back_populates="teams")