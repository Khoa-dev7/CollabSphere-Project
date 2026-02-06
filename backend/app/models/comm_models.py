from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class ChatMessage(Base):
    """
    Bảng lưu trữ các tin nhắn trong phòng Chat của Nhóm.
    Hỗ trợ cả tin nhắn văn bản và tệp đính kèm.
    """
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=True) # Nội dung văn bản
    file_url = Column(String, nullable=True) # URL tệp nếu có
    file_type = Column(String, nullable=True) # Loại tệp: image, doc, zip...
    is_file = Column(Boolean, default=False) # Đánh dấu nếu tin nhắn này là một tệp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sender = relationship("User", back_populates="sent_messages")

class ChatRoom(Base):
    """
    Quản lý các phòng Chat (dành cho phát triển mở rộng sau này).
    """
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_group = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    members = relationship("ChatRoomMember", back_populates="room")

class ChatRoomMember(Base):
    """
    Quản lý thành viên tham gia vào các phòng Chat.
    """
    __tablename__ = "chat_room_members"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    room = relationship("ChatRoom", back_populates="members")
    user = relationship("User")

class ActivityLog(Base):
    """
    Lưu trữ nhật ký hoạt động của người dùng (vd: tạo nhóm, nộp bài, phân việc...).
    """
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    action = Column(String, nullable=False) # Mô tả hành động (vd: "đã di chuyển nhiệm vụ X sang Done")
    target_type = Column(String) # Loại đối tượng bị tác động (task, project, team...)
    target_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class Resource(Base):
    """
    Bảng quản lý tài nguyên/tệp tin được tải lên hệ thống (Tài liệu môn học, file đính kèm task...).
    """
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Tên tệp hiển thị
    file_url = Column(String, nullable=False) # Đường dẫn lưu trữ/URL
    file_type = Column(String) # vd: doc, slide, image, pdf...
    owner_id = Column(Integer, ForeignKey("users.id")) # Người sở hữu
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True) # Thuộc nhóm nào
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True) # Thuộc lớp nào
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"), nullable=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="attachments")

class AIInteraction(Base):
    """
    Lưu trữ lịch sử tương tác giữa người dùng/nhóm với Trợ lý AI.
    """
    __tablename__ = "ai_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    prompt = Column(Text, nullable=False) # Câu hỏi/Yêu cầu của người dùng
    response = Column(Text, nullable=False) # Phản hồi từ AI
    interaction_type = Column(String) # Loại tương tác: Brainstorming, Guidance, MilestoneGen...
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    team = relationship("Team", back_populates="ai_interactions")

class Checkpoint(Base):
    """
    Các mốc kiểm tra định kỳ (Checkpoint) mà Nhóm cần nộp báo cáo.
    """
    __tablename__ = "checkpoints"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    title = Column(String, nullable=False) # Tiêu đề báo cáo
    description = Column(Text) # Yêu cầu chi tiết
    is_done = Column(Boolean, default=False) # Đánh dấu nếu đã hoàn thành/duyệt
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    submissions = relationship("CheckpointSubmission", back_populates="checkpoint")
    assignments = relationship("CheckpointAssignee", back_populates="checkpoint", cascade="all, delete-orphan")
    team = relationship("Team", back_populates="checkpoints")

class CheckpointAssignee(Base):
    """
    Phân công người chịu trách nhiệm chính cho một Checkpoint trong nhóm.
    """
    __tablename__ = "checkpoint_assignees"
    id = Column(Integer, primary_key=True, index=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    checkpoint = relationship("Checkpoint", back_populates="assignments")
    user = relationship("User")

class CheckpointSubmission(Base):
    """
    Bảng lưu trữ bài nộp thực tế cho Checkpoint (Nội dung, tệp tin, điểm số).
    """
    __tablename__ = "checkpoint_submissions"
    id = Column(Integer, primary_key=True, index=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text) # Nội dung tóm tắt/giải trình
    file_url = Column(String, nullable=True) # Đường dẫn tới báo cáo tệp tin
    feedback = Column(Text, nullable=True) # Phản hồi từ giảng viên
    grade = Column(Float, nullable=True) # Điểm số cho checkpoint này
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    checkpoint = relationship("Checkpoint", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

class PeerReview(Base):
    """
    Bảng lưu trữ kết quả Đánh giá đồng đẳng (Sinh viên trong nhóm chấm điểm lẫn nhau).
    """
    __tablename__ = "peer_reviews"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id")) # Người chấm
    reviewee_id = Column(Integer, ForeignKey("users.id")) # Người được chấm
    team_id = Column(Integer, ForeignKey("teams.id"))
    score = Column(Float, nullable=False) # Điểm số
    comment = Column(Text, nullable=True) # Ý kiến nhận xét
    is_anonymous = Column(Boolean, default=True) # Chế độ ẩn danh
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
    team = relationship("Team", back_populates="peer_reviews")

class Notification(Base):
    """
    Bảng lưu trữ các thông báo gửi tới người dùng.
    """
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id")) # Người nhận
    content = Column(String, nullable=False) # Nội dung thông báo
    type = Column(String, default="info") # Loại: info, warning, success
    is_read = Column(Boolean, default=False) # Đã đọc hay chưa
    related_link = Column(String, nullable=True) # Liên kết đi kèm (vd: tới trang dự án)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    recipient = relationship("User", back_populates="notifications")
