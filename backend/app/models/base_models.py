from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    """
    Bảng lưu trữ thông tin Người dùng của hệ thống.
    Hỗ trợ nhiều vai trò khác nhau như Admin, Staff, Head, Lecturer, Student.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False) # Tên đăng nhập
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String) # Họ và tên đầy đủ
    password_hash = Column(String, nullable=False) # Mật khẩu đã mã hóa
    role = Column(String, nullable=False) # Vai trò: Admin, Staff, Head (Trưởng bộ môn), Lecturer (Giảng viên), Student (Sinh viên)
    is_active = Column(Boolean, default=True) # Trạng thái hoạt động
    avatar_url = Column(String, nullable=True) # Đường dẫn ảnh đại diện
    bio = Column(Text, nullable=True) # Giới thiệu bản thân
    phone = Column(String, nullable=True) # Số điện thoại
    reset_token = Column(String, nullable=True) # Token để khôi phục mật khẩu
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Các mối quan hệ (Relationships)
    classes = relationship("ClassMember", back_populates="user")
    teams = relationship("TeamMember", back_populates="user")
    sent_messages = relationship("ChatMessage", back_populates="sender")
    submissions = relationship("CheckpointSubmission", back_populates="student")
    notifications = relationship("Notification", back_populates="recipient")

class Subject(Base):
    """
    Bảng lưu trữ danh mục các Môn học.
    """
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False) # Mã môn học (vd: INT1234)
    name = Column(String, nullable=False) # Tên môn học
    description = Column(Text)
    
    syllabuses = relationship("Syllabus", back_populates="subject")

class Syllabus(Base):
    """
    Bảng lưu trữ các phiên bản Đề cương của một môn học.
    """
    __tablename__ = "syllabuses"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    version = Column(String) # Phiên bản (vd: 2023, 2024)
    content = Column(Text) # Nội dung tóm tắt đề cương
    
    subject = relationship("Subject", back_populates="syllabuses")
    projects = relationship("Project", back_populates="syllabus")
