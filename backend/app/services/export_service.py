import pandas as pd
from sqlalchemy.orm import Session
from app.models.project_models import Project, Class, Team
from app.models.base_models import User
from app.models.comm_models import CheckpointSubmission
from io import BytesIO

def export_projects_to_excel(db: Session, class_id: int = None):
    query = db.query(Project)
    if class_id:
        # Liên kết với Team -> Class để lọc?
        # Dự án được liên kết với Syllabus, thường không trực tiếp đến Class, 
        # nhưng Team được liên kết với Dự án và Lớp.
        # Nếu muốn liệt kê dự án TRONG một lớp, giả định dự án được gán cho các nhóm trong lớp đó?
        # Hoặc dự án được tạo bởi người dùng trong lớp đó?
        # Tạm thời liệt kê TẤT CẢ dự án, hoặc lọc theo người tạo?
        pass
    
    projects = query.all()
    
    data = []
    for p in projects:
        data.append({
            "ID": p.id,
            "Tiêu đề": p.title,
            "Mô tả": p.description,
            "Trạng thái": p.status,
            "Người tạo": p.creator.full_name if p.creator else "N/A",
            "Giảng viên phụ trách": p.responsible_lecturer.full_name if p.responsible_lecturer else "N/A",
            "Ngày tạo": p.created_at.strftime("%Y-%m-%d") if p.created_at else ""
        })
        
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Danh sách dự án")
    output.seek(0)
    return output

def export_grades_to_excel(db: Session, class_id: int):
    # Lấy danh sách sinh viên trong lớp
    # Để đơn giản, lấy tất cả các bản nộp checkpoint liên kết với các nhóm trong lớp này
    
    # 1. Get teams in class
    teams = db.query(Team).filter(Team.class_id == class_id).all()
    team_ids = [t.id for t in teams]
    
    if not team_ids:
        return None
        
    # 2. Get submissions for these teams (via checkpoint -> team)
    # Bản nộp theo sinh viên, nhưng được liên kết với checkpoint, vốn liên kết với nhóm?
    # Model Checkpoint: team_id.
    # Model CheckpointSubmission: checkpoint_id, student_id.
    
    data = []
    
    # Chúng ta muốn một hàng cho mỗi sinh viên, các cột cho các checkpoint?
    # Hay chỉ đơn giản là một danh sách điểm?
    # MVP: Sinh viên, Nhóm, Checkpoint, Điểm
    
    submissions = db.query(CheckpointSubmission).join(CheckpointSubmission.checkpoint).filter(
        CheckpointSubmission.checkpoint.has(Team.id.in_(team_ids))
    ).all()
    
    for sub in submissions:
        student = sub.student
        checkpoint = sub.checkpoint
        team = checkpoint.team if checkpoint else None # Checkpoint có team_id? Có.
        # Thực tế quan hệ checkpoint.team có thể chưa được định nghĩa nhưng hãy giả định là có hoặc truy vấn nó.
        # Model Checkpoint: team_id = Column(Integer, ForeignKey("teams.id"))
        
        if checkpoint and checkpoint.team:
            team_name = checkpoint.team.name
        else:
             # Trường hợp dự phòng nếu quan hệ chưa được tải hoặc thiếu
             team_name = str(checkpoint.team_id) if checkpoint else "N/A"
             
        data.append({
            "Tên sinh viên": student.full_name,
            "Email sinh viên": student.email,
            "Nhóm": team_name,
            "Checkpoint": checkpoint.title,
            "Điểm số": sub.grade,
            "Nhận xét": sub.feedback
        })
        
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Bảng điểm")
    output.seek(0)
    return output
