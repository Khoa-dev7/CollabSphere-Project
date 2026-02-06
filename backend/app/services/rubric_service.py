from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.eval_models import Rubric, RubricCriteria
from app.schemas.eval_schemas import RubricCreate, RubricUpdate

def create_rubric(db: Session, rubric_in: RubricCreate):
    db_rubric = Rubric(
        title=rubric_in.title,
        description=rubric_in.description,
        subject_id=rubric_in.subject_id,
        project_id=rubric_in.project_id,
        is_template=rubric_in.is_template
    )
    db.add(db_rubric)
    db.commit()
    db.refresh(db_rubric)
    
    for crit in rubric_in.criteria:
        db_crit = RubricCriteria(
            rubric_id=db_rubric.id,
            title=crit.title,
            description=crit.description,
            max_score=crit.max_score,
            weight=crit.weight,
            order=crit.order
        )
        db.add(db_crit)
    
    db.commit()
    db.refresh(db_rubric)
    return db_rubric

def get_rubrics(db: Session, subject_id: int = None, project_id: int = None):
    query = db.query(Rubric)
    if subject_id:
        query = query.filter(Rubric.subject_id == subject_id)
    if project_id:
        query = query.filter(Rubric.project_id == project_id)
    return query.all()

def get_rubric(db: Session, rubric_id: int):
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Không tìm thấy Rubric")
    return rubric

def update_rubric(db: Session, rubric_id: int, rubric_in: RubricUpdate):
    db_rubric = get_rubric(db, rubric_id)
    
    if rubric_in.title:
        db_rubric.title = rubric_in.title
    if rubric_in.description:
        db_rubric.description = rubric_in.description
        
    if rubric_in.criteria is not None:
        # Cập nhật đơn giản: xóa các tiêu chí cũ và thêm các tiêu chí mới (hoặc logic cập nhật phức tạp)
        # Để đơn giản, chúng tôi sẽ thay thế chúng nếu được cung cấp
        db.query(RubricCriteria).filter(RubricCriteria.rubric_id == rubric_id).delete()
        for crit in rubric_in.criteria:
            db_crit = RubricCriteria(
                rubric_id=db_rubric.id,
                title=crit.title,
                description=crit.description,
                max_score=crit.max_score,
                weight=crit.weight,
                order=crit.order
            )
            db.add(db_crit)
            
    db.commit()
    db.refresh(db_rubric)
    return db_rubric

def delete_rubric(db: Session, rubric_id: int):
    db_rubric = get_rubric(db, rubric_id)
    db.delete(db_rubric)
    db.commit()
    return True

def clone_rubric(db: Session, source_rubric_id: int, target_project_id: int = None, target_subject_id: int = None):
    source_rubric = get_rubric(db, source_rubric_id)
    
    new_rubric = Rubric(
        title=f"{source_rubric.title} (Bản sao)",
        description=source_rubric.description,
        project_id=target_project_id,
        subject_id=target_subject_id,
        is_template=False if target_project_id else True
    )
    db.add(new_rubric)
    db.commit()
    db.refresh(new_rubric)
    
    for crit in source_rubric.criteria:
        new_crit = RubricCriteria(
            rubric_id=new_rubric.id,
            title=crit.title,
            description=crit.description,
            max_score=crit.max_score,
            weight=crit.weight,
            order=crit.order
        )
        db.add(new_crit)
        
    db.commit()
    db.refresh(new_rubric)
    return new_rubric
