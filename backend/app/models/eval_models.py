from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Rubric(Base):
    """
    Model đại diện cho một bộ tiêu chí đánh giá (Rubric).
    Một Rubric có thể thuộc về một môn học (Subject) hoặc một dự án (Project) cụ thể.
    """
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False) # Tiêu đề bộ tiêu chí
    description = Column(Text, nullable=True) # Mô tả chi tiết
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True) # Liên kết với môn học
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True) # Liên kết với dự án
    is_template = Column(Boolean, default=False) # Đánh dấu nếu đây là bộ tiêu chí mẫu
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subject = relationship("Subject")
    project = relationship("Project")
    # Danh sách các tiêu chí thành phần trong bộ tiêu chí này
    criteria = relationship("RubricCriteria", back_populates="rubric", cascade="all, delete-orphan")

class RubricCriteria(Base):
    """
    Model đại diện cho một tiêu chí đánh giá thành phần trong Rubric.
    Ví dụ: 'Chuyên cần', 'Đóng góp kỹ thuật', 'Kỹ năng thuyết trình'.
    """
    __tablename__ = "rubric_criteria"
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"))
    title = Column(String, nullable=False) # Tên tiêu chí
    description = Column(Text, nullable=True) # Mô tả cách đánh giá tiêu chí này
    max_score = Column(Float, nullable=False) # Điểm tối đa cho tiêu chí này (thường là 10)
    weight = Column(Float, default=1.0) # Trọng số của tiêu chí trong tổng điểm (ví dụ: 0.2 = 20%)
    order = Column(Integer, default=0) # Thứ tự hiển thị
    
    rubric = relationship("Rubric", back_populates="criteria")

class RubricAssessment(Base):
    """
    Model đại diện cho một bản đánh giá cụ thể dựa trên Rubric.
    Bản đánh giá này ghi lại điểm số mà người đánh giá (Evaluator) chấm cho một đối tượng (Dự án, Nhóm, hoặc Sinh viên).
    """
    __tablename__ = "rubric_assessments"
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), index=True) # Sử dụng bộ tiêu chí nào
    evaluator_id = Column(Integer, ForeignKey("users.id"), index=True) # Ai là người chấm điểm
    
    # Đối tượng được đánh giá: Có thể là dự án, nhóm, submission checkpoint hoặc sinh viên cụ thể
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Sinh viên được chấm điểm trực tiếp
    
    total_score = Column(Float, default=0.0) # Tổng điểm cuối cùng sau khi tính trọng số
    feedback = Column(Text, nullable=True) # Nhận xét tổng quát của người chấm
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    rubric = relationship("Rubric")
    evaluator = relationship("User", foreign_keys=[evaluator_id])
    # Chi tiết điểm số cho từng tiêu chí thành phần
    items = relationship("RubricAssessmentItem", back_populates="assessment", cascade="all, delete-orphan")
    team = relationship("Team", back_populates="assessments")

class RubricAssessmentItem(Base):
    """
    Model đại diện cho điểm số của một tiêu chí cụ thể trong một bản đánh giá.
    """
    __tablename__ = "rubric_assessment_items"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("rubric_assessments.id")) # Thuộc bản đánh giá nào
    criteria_id = Column(Integer, ForeignKey("rubric_criteria.id")) # Chấm cho tiêu chí nào
    score = Column(Float, nullable=False) # Điểm số đạt được
    comment = Column(Text, nullable=True) # Nhận xét riêng cho tiêu chí này
    
    assessment = relationship("RubricAssessment", back_populates="items")
    criteria = relationship("RubricCriteria")
