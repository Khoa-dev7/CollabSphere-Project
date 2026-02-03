from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.database import get_db
from app.core.deps import RoleChecker


router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    user=Depends(RoleChecker([models.UserRole.LECTURER]))
):
    p = models.Project(
        **project.dict(),
        created_by_id=user.id,
        status=models.ProjectStatus.PENDING
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{project_id}/status")
def update_status(
    project_id: int,
    data: schemas.ProjectStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(RoleChecker([models.UserRole.HEAD_DEPARTMENT]))
):
    p = db.query(models.Project).get(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    p.status = data.status
    db.commit()
    return {"message": "Updated"}
