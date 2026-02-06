from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import rubric_service
from app.schemas.eval_schemas import RubricOut, RubricCreate, RubricUpdate
from app.models.base_models import User
from app.core.permissions import PermissionChecker, Permissions

router = APIRouter()

@router.post("/", response_model=RubricOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def create_rubric(rubric_in: RubricCreate, db: Session = Depends(get_db)):
    return rubric_service.create_rubric(db, rubric_in)

@router.get("/", response_model=List[RubricOut])
def list_rubrics(subject_id: Optional[int] = None, project_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return rubric_service.get_rubrics(db, subject_id, project_id)

@router.get("/{rubric_id}", response_model=RubricOut)
def view_rubric(rubric_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return rubric_service.get_rubric(db, rubric_id)

@router.put("/{rubric_id}", response_model=RubricOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def update_rubric(rubric_id: int, rubric_in: RubricUpdate, db: Session = Depends(get_db)):
    return rubric_service.update_rubric(db, rubric_id, rubric_in)

@router.delete("/{rubric_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def delete_rubric(rubric_id: int, db: Session = Depends(get_db)):
    rubric_service.delete_rubric(db, rubric_id)
    return {"message": "Xóa Rubric thành công"}

@router.post("/{rubric_id}/clone", response_model=RubricOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def clone_rubric(rubric_id: int, target_project_id: Optional[int] = None, target_subject_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not target_project_id and not target_subject_id:
        raise HTTPException(status_code=400, detail="Phải xác định target_project_id hoặc target_subject_id")
    return rubric_service.clone_rubric(db, rubric_id, target_project_id, target_subject_id)
