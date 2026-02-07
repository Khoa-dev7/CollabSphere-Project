from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Class(Base):
    """
    Bảng lưu trữ thông tin về Lớp học (khóa học cụ thể trong học kỳ).
    """
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Tên lớp học
    lecturer_id = Column(Integer, ForeignKey("users.id")) # ID của giảng viên phụ trách
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lecturer = relationship("User", foreign_keys=[lecturer_id])
    members = relationship("ClassMember", back_populates="classroom")
    teams = relationship("Team", back_populates="classroom")
    assigned_projects = relationship("ClassProject", back_populates="classroom")

class ClassMember(Base):
    """
    Bảng trung gian lưu trữ danh sách sinh viên tham gia vào một lớp học.
    """
    __tablename__ = "class_members"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    classroom = relationship("Class", back_populates="members")
    user = relationship("User", back_populates="classes")

class ClassProject(Base):
    """
    Bảng trung gian để giao các Đề tài (Project) cho một Lớp học cụ thể.
    """
    __tablename__ = "class_projects"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    classroom = relationship("Class", back_populates="assigned_projects")
    project = relationship("Project", back_populates="assigned_classes")

class Project(Base):
    """
    Bảng lưu trữ thông tin chung về các Đề tài/Dự án.
    Dự án có thể được tạo bởi bất kỳ ai (thường là Staff hoặc Lecturer) và cần được duyệt.
    """
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False) # Tiêu đề dự án
    description = Column(Text) # Mô tả chi tiết
    objectives = Column(Text) # Mục tiêu cần đạt được
    syllabus_id = Column(Integer, ForeignKey("syllabuses.id")) # Liên kết với đề cương môn học
    creator_id = Column(Integer, ForeignKey("users.id")) # ID của người tạo bản nháp
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Giảng viên phụ trách chuyên môn
    status = Column(String, default="Pending") # Trạng thái: Pending (Chờ), Approved (Duyệt), Denied (Từ chối)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    max_members = Column(Integer, default=5) # Số lượng thành viên tối đa trong 1 nhóm
    is_public = Column(Boolean, default=True) # Có hiển thị công khai không
    difficulty_level = Column(String) # Mức độ: Easy, Medium, Hard
    tags = Column(String) # Gắn thẻ từ khóa (Ngôn ngữ, Công nghệ...)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    syllabus = relationship("Syllabus", back_populates="projects")
    creator = relationship("User", foreign_keys=[creator_id])
    responsible_lecturer = relationship("User", foreign_keys=[lecturer_id])
    milestones = relationship("ProjectMilestone", back_populates="project")
    assigned_teams = relationship("Team", back_populates="project")
    assigned_classes = relationship("ClassProject", back_populates="project")

class ProjectMilestone(Base):
    """
    Bảng lưu trữ các Mốc thời gian (Milestone) của một dự án.
    Dùng để theo dõi tiến độ công việc theo từng giai đoạn.
    """
    __tablename__ = "project_milestones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer) # Thứ tự thực hiện (0, 1, 2...)
    
    project = relationship("Project", back_populates="milestones")
    questions = relationship("MilestoneQuestion", back_populates="milestone", cascade="all, delete-orphan")

class MilestoneQuestion(Base):
    """
    Câu hỏi khảo sát hoặc hướng dẫn đi kèm theo từng Milestone.
    """
    __tablename__ = "milestone_questions"
    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    milestone = relationship("ProjectMilestone", back_populates="questions")
    answers = relationship("MilestoneAnswer", back_populates="question", cascade="all, delete-orphan")

class MilestoneAnswer(Base):
    """
    Câu trả lời hoặc kết quả nộp của Nhóm cho các câu hỏi ở từng Milestone.
    """
    __tablename__ = "milestone_answers"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("milestone_questions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    content = Column(Text, nullable=False) # Nội dung câu trả lời
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    question = relationship("MilestoneQuestion", back_populates="answers")
    user = relationship("User")
    team = relationship("Team", back_populates="milestone_answers")

class TeamMilestone(Base):
    """
    Theo dõi trạng thái hoàn thành Milestone chi tiết cho từng Nhóm.
    """
    __tablename__ = "team_milestones"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    milestone_id = Column(Integer, ForeignKey("project_milestones.id"))
    is_done = Column(Boolean, default=False) # Đã hoàn thành hay chưa
    completed_at = Column(DateTime(timezone=True), nullable=True)

class Team(Base):
    """
    Bảng lưu trữ thông tin về Nhóm sinh viên thực hiện dự án.
    Chứa các liên kết tới các module chức năng như Chat, Task, Assess...
    """
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Tên nhóm
    class_id = Column(Integer, ForeignKey("classes.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    leader_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nhóm trưởng
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    classroom = relationship("Class", back_populates="teams")
    project = relationship("Project", back_populates="assigned_teams")
    leader = relationship("User", foreign_keys=[leader_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="team", cascade="all, delete-orphan")
    checkpoints = relationship("Checkpoint", back_populates="team", cascade="all, delete-orphan")
    assessments = relationship("RubricAssessment", back_populates="team", cascade="all, delete-orphan")
    # Các mối quan hệ 1 chiều với tính năng xóa hàng loạt (cascade)
    messages = relationship("ChatMessage", primaryjoin="ChatMessage.team_id == Team.id", cascade="all, delete-orphan", viewonly=False)
    activity_logs = relationship("ActivityLog", back_populates="team", cascade="all, delete-orphan")
    resources = relationship("Resource", primaryjoin="Resource.team_id == Team.id", cascade="all, delete-orphan", viewonly=False)
    milestone_answers = relationship("MilestoneAnswer", back_populates="team", cascade="all, delete-orphan")
    milestone_statuses = relationship("TeamMilestone", primaryjoin="TeamMilestone.team_id == Team.id", cascade="all, delete-orphan", viewonly=False)
    peer_reviews = relationship("PeerReview", back_populates="team", cascade="all, delete-orphan")
    ai_interactions = relationship("AIInteraction", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    """
    Bảng trung gian lưu thành viên của Nhóm và tỉ lệ đóng góp.
    """
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    contribution_percentage = Column(Float, default=0.0) # Tỉ lệ % đóng góp trong dự án
    
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="teams")

class Task(Base):
    """
    Bảng lưu trữ các Nhiệm vụ (Task) trong bảng Kanban của Nhóm.
    """
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    title = Column(String, nullable=False) # Tên công việc
    description = Column(Text) # Chi tiết công việc
    status = Column(String, default="Todo") # Trạng thái: Todo, Doing (In Progress), Done
    priority = Column(String, default="Medium") # Ưu tiên: High, Medium, Low
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # Người thực hiện
    due_date = Column(DateTime) # Hạn chót
    order = Column(Integer, default=0) # Thứ tự sắp xếp trong cột
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    team = relationship("Team", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
    attachments = relationship("Resource", back_populates="task")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")

class TaskComment(Base):
    """
    Bình luận trao đổi trong từng Nhiệm vụ cụ thể.
    """
    __tablename__ = "task_comments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    task = relationship("Task", back_populates="comments")
    user = relationship("User")
