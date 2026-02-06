from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import resource_service
from app.schemas.resource_schemas import ResourceOut, ResourceCreate
from app.models.base_models import User

router = APIRouter()

@router.post("/upload", response_model=ResourceOut)
def upload_resource(
    name: str,
    file_type: str,
    team_id: Optional[int] = None,
    class_id: Optional[int] = None,
    milestone_id: Optional[int] = None,
    checkpoint_id: Optional[int] = None,
    task_id: Optional[int] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_url = resource_service.upload_file(file)
    resource_in = ResourceCreate(
        name=name,
        file_type=file_type,
        file_url=file_url,
        owner_id=current_user.id,
        team_id=team_id,
        class_id=class_id,
        milestone_id=milestone_id,
        checkpoint_id=checkpoint_id,
        task_id=task_id
    )
    return resource_service.create_resource(db, resource_in)

@router.get("/teams/{team_id}", response_model=List[ResourceOut])
def get_team_resources(
    team_id: int, 
    milestone_id: Optional[int] = None, 
    checkpoint_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return resource_service.get_team_resources(db, team_id, milestone_id, checkpoint_id)

@router.get("/classes/{class_id}", response_model=List[ResourceOut])
def get_class_resources(class_id: int, db: Session = Depends(get_db)):
    return resource_service.get_class_resources(db, class_id)

@router.get("/tasks/{task_id}", response_model=List[ResourceOut])
def get_task_resources(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return resource_service.get_task_resources(db, task_id)

@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Có thể thêm kiểm tra quyền sở hữu ở đây nếu cần
    resource_service.delete_resource(db, resource_id)
    return {"message": "Xóa tài nguyên thành công"}
