from sqlalchemy import func
from app.models.comm_models import CheckpointSubmission, PeerReview
from app.models.project_models import Team, TeamMember
from app.models.base_models import User
from app.schemas.eval_schemas import FeedbackCreate, PeerReviewCreate

def provide_lecturer_feedback(db: Session, feedback_in: FeedbackCreate):
    """
    Giảng viên cung cấp phản hồi và điểm số cho một bài nộp Checkpoint.
    """
    submission = db.query(CheckpointSubmission).filter(CheckpointSubmission.checkpoint_id == feedback_in.checkpoint_id).first()
    if submission:
        submission.feedback = feedback_in.comment
        submission.grade = feedback_in.grade
        db.commit()
        db.refresh(submission)
    return submission

def submit_peer_review(db: Session, reviewer_id: int, review_in: PeerReviewCreate):
    """
    Sinh viên gửi đánh giá đồng đẳng cho thành viên trong cùng nhóm.
    """
    # Kiểm tra xem người đánh giá và người được đánh giá có cùng nhóm không
    reviewer_in_team = db.query(TeamMember).filter(TeamMember.team_id == review_in.team_id, TeamMember.user_id == reviewer_id).first()
    reviewee_in_team = db.query(TeamMember).filter(TeamMember.team_id == review_in.team_id, TeamMember.user_id == review_in.reviewee_id).first()
    
    if not reviewer_in_team or not reviewee_in_team:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Cả người đánh giá và người được đánh giá phải cùng một nhóm")

    # Kiểm tra xem đã có đánh giá chưa
    existing_review = db.query(PeerReview).filter(
        PeerReview.reviewer_id == reviewer_id,
        PeerReview.reviewee_id == review_in.reviewee_id,
        PeerReview.team_id == review_in.team_id
    ).first()

    if existing_review:
        # Cập nhật đánh giá cũ
        existing_review.score = review_in.score
        existing_review.comment = review_in.comment
        existing_review.created_at = func.now() # Cập nhật thời gian
        db.add(existing_review) # Explicit add for update
        db.commit()
        db.refresh(existing_review)
        return existing_review
    else:
        # Tạo bản ghi đánh giá mới
        db_review = PeerReview(
            reviewer_id=reviewer_id,
            **review_in.dict()
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review

def get_student_peer_reviews(db: Session, reviewer_id: int, team_id: int):
    """
    Lấy danh sách các đánh giá mà sinh viên này đã thực hiện trong một nhóm cụ thể.
    """
    return db.query(PeerReview).filter(
        PeerReview.reviewer_id == reviewer_id,
        PeerReview.team_id == team_id
    ).all()

def get_team_evaluation_summary(db: Session, team_id: int):
    """
    Lấy bản tóm tắt kết quả đánh giá đồng đẳng của toàn bộ thành viên trong nhóm.
    Tính toán điểm dựa trên ĐÁNH GIÁ MỚI NHẤT từ mỗi người chấm (lọc bỏ các bản ghi cũ/trùng lặp).
    """
    # 1. Lấy tất cả thành viên trong nhóm
    members = db.query(User).join(TeamMember).filter(TeamMember.team_id == team_id).all()
    
    # 2. Lấy TẤT CẢ các đánh giá của nhóm, sắp xếp giảm dần theo thời gian và ID để lấy cái mới nhất
    all_reviews = db.query(PeerReview).filter(PeerReview.team_id == team_id)\
        .order_by(PeerReview.created_at.desc(), PeerReview.id.desc()).all()

    summary = []
    
    for member in members:
        # Lấy danh sách đánh giá MÀ thành viên này NHẬN ĐƯỢC
        reviews_received = [r for r in all_reviews if r.reviewee_id == member.id]
        
        # Lọc: Chỉ giữ lại đánh giá MỚI NHẤT từ mỗi người chấm (reviewer)
        # Vì đã sort desc, nên đánh giá đầu tiên gặp từ mỗi reviewer chính là cái mới nhất
        latest_reviews_map = {}
        for r in reviews_received:
            if r.reviewer_id not in latest_reviews_map:
                latest_reviews_map[r.reviewer_id] = r
        
        final_reviews = list(latest_reviews_map.values())
        
        # Chỉ lấy danh sách điểm số thô
        details_scores = [r.score for r in final_reviews]
        
        # KHÔNG TÍNH TRUNG BÌNH - Để giảng viên tự đánh giá
        # average_score = 0.0 (removed)
            
        summary.append({
            "user_id": member.id,
            "full_name": member.full_name,
            "average_score": 0.0, # Frontend không dùng nữa
            "scores": details_scores,
            "review_count": len(final_reviews)
        })
    return summary

from app.models.eval_models import RubricAssessment, RubricAssessmentItem, RubricCriteria, Rubric
from sqlalchemy.orm import Session

def get_rubric_for_project(db: Session, project_id: int):
    """
    Tìm hoặc tạo mới một Rubric mặc định cho dự án.
    Nếu dự án chưa có Rubric, hệ thống sẽ tự động tạo một cái với 4 tiêu chí mặc định.
    """
    rubric = db.query(Rubric).filter(Rubric.project_id == project_id).first()
    if not rubric:
        # Tạo Rubric mặc định
        rubric = Rubric(title=f"Rubric for Project {project_id}", project_id=project_id)
        db.add(rubric)
        db.commit()
        db.refresh(rubric)
        
        # Thêm các tiêu chí (Criteria) mẫu
        default_criteria = [
            ("Chuyên cần", 20),
            ("Đóng góp", 30),
            ("Kỹ năng", 30),
            ("Thái độ", 20)
        ]
        for idx, (name, weight) in enumerate(default_criteria):
            crit = RubricCriteria(
                rubric_id=rubric.id,
                title=name,
                max_score=10.0,
                weight=weight / 100.0,
                order=idx
            )
            db.add(crit)
        db.commit()
        db.refresh(rubric)
    return rubric

async def save_bulk_evaluations(db: Session, evaluator_id: int, team_id: int, evaluations_data: list):
    """
    Lưu hàng loạt kết quả chấm điểm dự án cho nhiều sinh viên trong một nhóm.
    """
    from app.services import rubric_assessment_service
    from app.schemas.eval_schemas import RubricAssessmentCreate, RubricAssessmentItemCreate
    
    # Lấy thông tin nhóm để lấy project_id
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Nhóm không tồn tại")
    if not team.project_id:
        raise HTTPException(status_code=400, detail="Nhóm chưa được gán dự án")
        
    rubric = get_rubric_for_project(db, team.project_id)
    
    saved_count = 0
    # Nhóm dữ liệu đánh giá theo student_id
    student_scores = {}
    for ev in evaluations_data:
        s_id_raw = ev.get("student_id")
        if s_id_raw is None: continue
        s_id = int(s_id_raw)
        if s_id not in student_scores:
            student_scores[s_id] = {"scores": [], "feedback": ev.get("feedback")}
        student_scores[s_id]["scores"].append(ev)
        
    for student_id, scores_data in student_scores.items():
        # Kiểm tra xem đã có bản đánh giá nào tồn tại cho sinh viên này chưa
        assessment = db.query(RubricAssessment).filter(
            RubricAssessment.rubric_id == rubric.id,
            RubricAssessment.team_id == team_id,
            RubricAssessment.student_id == student_id
        ).first()
        
        items_payload = []
        for s in scores_data["scores"]:
            try:
                c_id = int(s["criteria_id"])
                score_val = float(s["score"])
                items_payload.append(RubricAssessmentItemCreate(criteria_id=c_id, score=score_val))
            except (ValueError, TypeError):
                continue
        
        assessment_in = RubricAssessmentCreate(
            rubric_id=rubric.id,
            team_id=team_id,
            project_id=team.project_id,
            student_id=student_id,
            items=items_payload,
            feedback=scores_data["feedback"]
        )
        
        if assessment:
            # Cập nhật bản đánh giá hiện có
            # 1. Xoá các điểm thành phần cũ
            db.query(RubricAssessmentItem).filter(RubricAssessmentItem.assessment_id == assessment.id).delete()
            
            # 2. Thêm mới các điểm thành phần và tính lại tổng điểm
            total_score = 0
            criteria_map = {c.id: c for c in rubric.criteria}
            for item in items_payload:
                crit = criteria_map.get(item.criteria_id)
                if crit:
                    # Điểm cuối cùng = Điểm tiêu chí * Trọng số
                    total_score += item.score * crit.weight
                    db_item = RubricAssessmentItem(
                        assessment_id=assessment.id,
                        criteria_id=item.criteria_id,
                        score=item.score
                    )
                    db.add(db_item)
            
            assessment.total_score = total_score
            assessment.feedback = assessment_in.feedback
            db.add(assessment)
            db.commit() # Lưu thay đổi cho từng sinh viên để đảm bảo ổn định
        else:
            # Tạo bản đánh giá hoàn toàn mới
            rubric_assessment_service.create_assessment(db, assessment_in, evaluator_id)
        
        # Gửi thông báo cho sinh viên được chấm điểm
        try:
            from app.services.notification_service import create_notification
            await create_notification(
                db, 
                recipient_id=student_id, 
                content=f"Giảng viên đã cập nhật điểm cho dự án của bạn tại nhóm {team.name}.",
                type="success",
                related_link="/my-grades"
            )
        except Exception as e:
            print(f"Notification error (non-fatal): {e}")
            
        saved_count += 1
        
    return {"message": f"Đã lưu thành công {saved_count} sinh viên"}

def get_student_grades(db: Session, student_id: int):
    """
    Lấy danh sách tất cả các điểm số (thông qua Rubric) của một sinh viên.
    """
    assessments = db.query(RubricAssessment).filter(RubricAssessment.student_id == student_id).all()
    result = []
    for a in assessments:
        result.append({
            "project_name": a.rubric.project.title if a.rubric.project else "N/A",
            "total_score": round(a.total_score, 2),
            "feedback": a.feedback,
            "date": a.created_at.strftime("%d/%m/%Y"),
            "details": [
                {
                    "criteria": item.criteria.title,
                    "score": item.score,
                    "weight": item.criteria.weight * 100
                } for item in a.items
            ]
        })
    return result

def calculate_final_score(db: Session, assessment_id: int):
    """
    Tính toán thủ công tổng điểm của một bản đánh giá dựa trên các điểm thành phần và trọng số.
    """
    assessment = db.query(RubricAssessment).filter(RubricAssessment.id == assessment_id).first()
    if not assessment:
        return None
    
    # Lấy tất cả các chi tiết điểm số thành phần
    items = db.query(RubricAssessmentItem).filter(RubricAssessmentItem.assessment_id == assessment_id).all()
    
    total_score = 0.0
    for item in items:
        # Lấy tiêu chí để biết trọng số
        criteria = db.query(RubricCriteria).filter(RubricCriteria.id == item.criteria_id).first()
        if criteria:
            # Công thức: Điểm thành phần * Trọng số (thường 0.0 - 1.0)
            total_score += item.score * criteria.weight
            
    assessment.total_score = total_score
    db.commit()
    db.refresh(assessment)
    return assessment
