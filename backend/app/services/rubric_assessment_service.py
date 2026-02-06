from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.eval_models import RubricAssessment, RubricAssessmentItem, RubricCriteria
from app.schemas.eval_schemas import RubricAssessmentCreate

def create_assessment(db: Session, assessment_in: RubricAssessmentCreate, evaluator_id: int):
    # Calculate grade
    total_score = 0.0
    items_data = []
    
    # Cần xác thực rằng các tiêu chí thuộc về rubric
    criteria_map = {c.id: c for c in db.query(RubricCriteria).filter(RubricCriteria.rubric_id == assessment_in.rubric_id).all()}
    
    for item in assessment_in.items:
        if item.criteria_id not in criteria_map:
            continue # specific error handling could go here
            
        crit = criteria_map[item.criteria_id]
        # Kiểm tra điểm tối đa
        score = min(item.score, crit.max_score)
        total_score += score * crit.weight # Tổng có trọng số đơn giản? Hay trung bình có trọng số?
        # Nếu trọng số là "multiplier", thì sum(score * weight). Nếu trọng số là phần trăm, thì...
        # Giả sử trọng số là một hệ số nhân hiện tại (ví dụ: 1.0, 0.5, 2.0)
        
        items_data.append({
            "criteria_id": item.criteria_id,
            "score": score,
            "comment": item.comment
        })
        
    db_assessment = RubricAssessment(
        rubric_id=assessment_in.rubric_id,
        evaluator_id=evaluator_id,
        project_id=assessment_in.project_id,
        team_id=assessment_in.team_id,
        checkpoint_id=assessment_in.checkpoint_id,
        student_id=assessment_in.student_id,
        total_score=total_score,
        feedback=assessment_in.feedback
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    for item_data in items_data:
        db_item = RubricAssessmentItem(
            assessment_id=db_assessment.id,
            criteria_id=item_data["criteria_id"],
            score=item_data["score"],
            comment=item_data["comment"]
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

def get_assessment(db: Session, assessment_id: int):
    return db.query(RubricAssessment).filter(RubricAssessment.id == assessment_id).first()

def get_assessments_by_target(db: Session, project_id: int = None, team_id: int = None, checkpoint_id: int = None, student_id: int = None):
    query = db.query(RubricAssessment)
    if project_id:
        query = query.filter(RubricAssessment.project_id == project_id)
    if team_id:
        query = query.filter(RubricAssessment.team_id == team_id)
    if checkpoint_id:
        query = query.filter(RubricAssessment.checkpoint_id == checkpoint_id)
    if student_id:
        query = query.filter(RubricAssessment.student_id == student_id)
    return query.all()
