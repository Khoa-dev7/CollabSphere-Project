from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import eval_service
from app.schemas.eval_schemas import FeedbackCreate, PeerReviewCreate, TeamMemberEvaluation
from app.core.permissions import PermissionChecker, Permissions
from app.models.base_models import User
from typing import List

router = APIRouter()

@router.post("/lecturer-feedback", dependencies=[Depends(PermissionChecker(Permissions.EVALUATE_STUDENTS))])
def give_feedback(feedback_in: FeedbackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API để giảng viên đưa ra nhận xét và điểm số cho bài nộp của sinh viên.
    Yêu cầu quyền: EVALUATE_STUDENTS.
    """
    return eval_service.provide_lecturer_feedback(db, feedback_in)

@router.post("/peer-review")
def submit_peer_review(review_in: PeerReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API để sinh viên gửi đánh giá cho các thành viên khác trong nhóm của mình.
    Hệ thống sẽ kiểm tra xem người dùng có thực sự thuộc nhóm đó không trước khi lưu.
    """
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, review_in.team_id, current_user.role)
    return eval_service.submit_peer_review(db, current_user.id, review_in)

from app.routes.security_deps import verify_team_access

@router.get("/team/{team_id}/summary", response_model=List[TeamMemberEvaluation], dependencies=[Depends(verify_team_access)])
def get_team_evaluation(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API lấy bản tóm tắt kết quả đánh giá đồng đẳng của một nhóm.
    Chỉ cho phép Giảng viên hoặc Trưởng bộ môn xem dữ liệu này.
    """
    if current_user.role not in ["Lecturer", "Head"]:
        raise HTTPException(status_code=403, detail="Truy cập bị từ chối")
    return eval_service.get_team_evaluation_summary(db, team_id)

# --- Rubric Assessment Routes (Các tuyến đường đánh giá theo tiêu chí) ---

from app.schemas.eval_schemas import RubricAssessmentCreate, RubricAssessmentOut
from app.services import rubric_assessment_service
from typing import Optional

@router.post("/rubric-assessments", response_model=RubricAssessmentOut, dependencies=[Depends(PermissionChecker(Permissions.EVALUATE_STUDENTS))])
def create_assessment(assessment_in: RubricAssessmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API tạo mới một bản chấm điểm theo Rubric cho một đối tượng (Dự án/Nhóm/Sinh viên).
    """
    # Thêm logic để xác minh xem người dùng có thể chấm điểm hay không (Giảng viên/Trưởng bộ môn)
    if current_user.role not in ["Lecturer", "Head", "Admin"]:
         raise HTTPException(status_code=403, detail="Chỉ giảng viên mới có thể chấm điểm đánh giá")
    return rubric_assessment_service.create_assessment(db, assessment_in, current_user.id)

@router.get("/rubric-assessments", response_model=List[RubricAssessmentOut])
def list_assessments(
    project_id: Optional[int] = None, 
    team_id: Optional[int] = None, 
    checkpoint_id: Optional[int] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    API danh sách các bản đánh giá dựa trên các tiêu chí lọc.
    Quy tắc bảo mật:
    - Nhân viên/Giảng viên có thể xem toàn bộ.
    - Sinh viên chỉ có thể xem điểm số của chính mình.
    """
    # Bảo mật: 
    # 1. Staff/Head/Lecturer có thể xem tất cả.
    # 2. Sinh viên chỉ có thể xem của chính mình (hoặc của nhóm mình nếu được chỉ định).
    if current_user.role == "Student":
        if student_id and student_id != current_user.id:
             raise HTTPException(status_code=403, detail="Sinh viên chỉ có thể xem các đánh giá của chính mình")
        # Đảm bảo student_id được đặt là chính mình nếu không được cung cấp và họ không phải là nhân viên
        if not student_id and not team_id:
            student_id = current_user.id
            
    return rubric_assessment_service.get_assessments_by_target(db, project_id, team_id, checkpoint_id, student_id)

@router.get("/teams/{team_id}/evaluations")
def get_team_evaluations_for_grading(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    API lấy thông tin phục vụ trang Chấm điểm của Giảng viên.
    Trả về: Danh sách tiêu chí Rubric của dự án và danh sách sinh viên kèm điểm số hiện tại (nếu có).
    """
    from app.models.project_models import Team, TeamMember
    from app.models.eval_models import RubricAssessment, RubricAssessmentItem
    
    # Kiểm tra quyền truy cập
    if current_user.role not in ["Lecturer", "Head", "Staff", "Admin"]:
        raise HTTPException(status_code=403, detail="Không có quyền truy cập")
    
    # Tìm kiếm nhóm
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
        
    if not team.project_id:
        raise HTTPException(status_code=400, detail="Nhóm chưa được gán cho dự án")
    
    # Lấy bộ tiêu chí (Rubric) của dự án
    rubric = eval_service.get_rubric_for_project(db, team.project_id)
    
    # Định dạng lại danh sách các tiêu chí
    criteria = [
        {"id": c.id, "name": c.title, "weight": c.weight * 100}
        for c in rubric.criteria
    ]
    
    # Lấy danh sách thành viên nhóm và điểm số hiện tại của họ
    team_members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    students = []
    
    for tm in team_members:
        # Tìm bản chấm điểm mới nhất cho sinh viên này
        assessment = db.query(RubricAssessment).filter(
            RubricAssessment.rubric_id == rubric.id,
            RubricAssessment.team_id == team_id,
            RubricAssessment.student_id == tm.user_id
        ).first()
        
        scores = {}
        if assessment:
            # Thu thập điểm số từng thành phần
            for item in assessment.items:
                scores[item.criteria_id] = item.score
        
        students.append({
            "id": tm.user.id,
            "name": tm.user.full_name,
            "scores": scores,
            "feedback": assessment.feedback if assessment else ""
        })
    
    return {
        "rubric_id": rubric.id,
        "criteria": criteria,
        "students": students
    }

@router.post("/evaluations/bulk")
async def save_bulk_evaluations(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    API lưu điểm hàng loạt cho sinh viên trong cùng một nhóm.
    Thường được gọi từ trang Chấm điểm của Giảng viên.
    """
    print(f"DEBUG: POST /evaluations/bulk called by {current_user.email}")
    if current_user.role not in ["Lecturer", "Head", "Staff", "Admin"]:
        raise HTTPException(status_code=403, detail="Không có quyền chấm điểm")
    
    team_id = payload.get("team_id")
    evaluations = payload.get("evaluations")
    
    if not team_id or not evaluations:
        raise HTTPException(status_code=400, detail="Thiếu team_id hoặc dữ liệu chấm điểm")
        
    return await eval_service.save_bulk_evaluations(db, current_user.id, team_id, evaluations)

@router.get("/student/my-grades")
def get_my_grades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    API để sinh viên tự xem toàn bộ điểm số các dự án của mình.
    """
    if current_user.role != "Student":
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có thể xem điểm")
    return eval_service.get_student_grades(db, current_user.id)
