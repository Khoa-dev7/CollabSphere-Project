from sqlalchemy import func
from app.models.comm_models import CheckpointSubmission, PeerReview
from app.models.project_models import Team, TeamMember
from app.models.base_models import User
from app.schemas.eval_schemas import FeedbackCreate, PeerReviewCreate

def provide_lecturer_feedback(db: Session, feedback_in: FeedbackCreate):
    submission = db.query(CheckpointSubmission).filter(CheckpointSubmission.checkpoint_id == feedback_in.checkpoint_id).first()
    if submission:
        submission.feedback = feedback_in.comment
        submission.grade = feedback_in.grade
        db.commit()
        db.refresh(submission)
    return submission

def submit_peer_review(db: Session, reviewer_id: int, review_in: PeerReviewCreate):
    # Kiểm tra xem họ có cùng nhóm không
    reviewer_in_team = db.query(TeamMember).filter(TeamMember.team_id == review_in.team_id, TeamMember.user_id == reviewer_id).first()
    reviewee_in_team = db.query(TeamMember).filter(TeamMember.team_id == review_in.team_id, TeamMember.user_id == review_in.reviewee_id).first()
    
    if not reviewer_in_team or not reviewee_in_team:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Cả người đánh giá và người được đánh giá phải cùng một nhóm")

    db_review = PeerReview(
        reviewer_id=reviewer_id,
        **review_in.dict()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_team_evaluation_summary(db: Session, team_id: int):
    # Lấy tất cả thành viên
    members = db.query(User).join(TeamMember).filter(TeamMember.team_id == team_id).all()
    
    summary = []
    for member in members:
        # Tính điểm trung bình
        stats = db.query(
            func.avg(PeerReview.score).label("avg_score"),
            func.count(PeerReview.id).label("count")
        ).filter(PeerReview.team_id == team_id, PeerReview.reviewee_id == member.id).first()
        
        summary.append({
            "user_id": member.id,
            "full_name": member.full_name,
            "average_score": float(stats.avg_score) if stats.avg_score else 0.0,
            "review_count": stats.count
        })
    return summary

from app.models.eval_models import RubricAssessment, RubricAssessmentItem, RubricCriteria, Rubric
from sqlalchemy.orm import Session

def get_rubric_for_project(db: Session, project_id: int):
    """Finds or creates a default rubric for a project"""
    rubric = db.query(Rubric).filter(Rubric.project_id == project_id).first()
    if not rubric:
        # Create a default rubric
        rubric = Rubric(title=f"Rubric for Project {project_id}", project_id=project_id)
        db.add(rubric)
        db.commit()
        db.refresh(rubric)
        
        # Add default criteria
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

def save_bulk_evaluations(db: Session, evaluator_id: int, team_id: int, evaluations_data: list):
    """Saves multiple assessments at once"""
    from app.services import rubric_assessment_service
    from app.schemas.eval_schemas import RubricAssessmentCreate, RubricAssessmentItemCreate
    
    # Get the project_id from team
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team or not team.project_id:
        return {"error": "Nhóm hoặc dự án không hợp lệ"}
        
    rubric = get_rubric_for_project(db, team.project_id)
    
    saved_count = 0
    # Group evaluations by student_id
    student_scores = {}
    for ev in evaluations_data:
        s_id = ev.get("student_id")
        if s_id not in student_scores:
            student_scores[s_id] = []
        student_scores[s_id].append(ev)
        
    for student_id, scores in student_scores.items():
        # Check if an assessment already exists
        assessment = db.query(RubricAssessment).filter(
            RubricAssessment.rubric_id == rubric.id,
            RubricAssessment.team_id == team_id,
            RubricAssessment.student_id == student_id
        ).first()
        
        items = [
            RubricAssessmentItemCreate(criteria_id=s["criteria_id"], score=s["score"])
            for s in scores
        ]
        
        assessment_in = RubricAssessmentCreate(
            rubric_id=rubric.id,
            team_id=team_id,
            project_id=team.project_id,
            student_id=student_id,
            items=items
        )
        
        if assessment:
            # Update existing (simplified: delete items and recreate)
            db.query(RubricAssessmentItem).filter(RubricAssessmentItem.assessment_id == assessment.id).delete()
            # Recalculate total
            total_score = 0
            criteria_map = {c.id: c for c in rubric.criteria}
            for item in items:
                crit = criteria_map.get(item.criteria_id)
                if crit:
                    total_score += item.score * crit.weight
                    db_item = RubricAssessmentItem(
                        assessment_id=assessment.id,
                        criteria_id=item.criteria_id,
                        score=item.score
                    )
                    db.add(db_item)
            assessment.total_score = total_score
            db.commit()
        else:
            rubric_assessment_service.create_assessment(db, assessment_in, evaluator_id)
        saved_count += 1
        
    return {"message": f"Đã lưu {saved_count} bản đánh giá"}

def get_student_grades(db: Session, student_id: int):
    """Returns all assessments for a student"""
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
    assessment = db.query(RubricAssessment).filter(RubricAssessment.id == assessment_id).first()
    if not assessment:
        return None
    
    # Lấy tất cả các tiêu chí
    items = db.query(RubricAssessmentItem).filter(RubricAssessmentItem.assessment_id == assessment_id).all()
    
    total_score = 0.0
    for item in items:
        # Lấy tiêu chí để tìm trọng số
        criteria = db.query(RubricCriteria).filter(RubricCriteria.id == item.criteria_id).first()
        if criteria:
            # Công thức: Điểm thành phần * Trọng số
            # Giả định điểm thành phần đã được quy đổi (ví dụ: 8/10) hoặc thô?
            # Thông thường điểm là thô (ví dụ: 8) và điểm tối đa là 10.
            # Nếu trọng số là phần trăm (ví dụ: 0.3), thì 8 * 0.3 = 2.4.
            total_score += item.score * criteria.weight
            
    assessment.total_score = total_score
    db.commit()
    db.refresh(assessment)
    return assessment
