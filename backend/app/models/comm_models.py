from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    # room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=True)  # TODO: Add this column to DB
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=True) # Content can be null if it's just a file
    file_url = Column(String, nullable=True)
    file_type = Column(String, nullable=True) # image, doc, etc.
    is_file = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sender = relationship("User", back_populates="sent_messages")
    # room = relationship("ChatRoom", back_populates="messages")  # TODO: Uncomment when room_id is added

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_group = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # messages = relationship("ChatMessage", back_populates="room")  # TODO: Uncomment when room_id is added to ChatMessage
    members = relationship("ChatRoomMember", back_populates="room")

class ChatRoomMember(Base):
    __tablename__ = "chat_room_members"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    room = relationship("ChatRoom", back_populates="members")
    user = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    action = Column(String, nullable=False) # e.g., "moved task X to Done"
    target_type = Column(String) # task, project, team, etc.
    target_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String) # doc, slide, image, etc.
    owner_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"), nullable=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="attachments")

class AIInteraction(Base):
    __tablename__ = "ai_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    interaction_type = Column(String) # Brainstorming, Guidance, MilestoneGen
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Checkpoint(Base):
    __tablename__ = "checkpoints"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    submissions = relationship("CheckpointSubmission", back_populates="checkpoint")
    assignments = relationship("CheckpointAssignee", back_populates="checkpoint", cascade="all, delete-orphan")
    team = relationship("Team")

class CheckpointAssignee(Base):
    __tablename__ = "checkpoint_assignees"
    id = Column(Integer, primary_key=True, index=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    checkpoint = relationship("Checkpoint", back_populates="assignments")
    user = relationship("User")

class CheckpointSubmission(Base):
    __tablename__ = "checkpoint_submissions"
    id = Column(Integer, primary_key=True, index=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    file_url = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    grade = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    checkpoint = relationship("Checkpoint", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

class PeerReview(Base):
    __tablename__ = "peer_reviews"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewee_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    score = Column(Float, nullable=False) # 1-5 or 1-10
    comment = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
    team = relationship("Team")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    type = Column(String, default="info") # info, warning, success
    is_read = Column(Boolean, default=False)
    related_link = Column(String, nullable=True) # e.g., /projects/1
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    recipient = relationship("User", back_populates="notifications")
