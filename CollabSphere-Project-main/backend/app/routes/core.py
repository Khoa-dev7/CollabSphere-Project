from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.database import get_db
from app.core.deps import RoleChecker

router = APIRouter(prefix="", tags=["Core"])

@router.post("/subjects/", response_model=schemas.SubjectResponse)
def create_subject(
    subject: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    user=Depends(RoleChecker([models.UserRole.STAFF]))
):
    sub = models.Subject(**subject.dict())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.post("/classes/", response_model=schemas.ClassResponse)
def create_class(
    cls: schemas.ClassCreate,
    db: Session = Depends(get_db),
    user=Depends(RoleChecker([models.UserRole.STAFF]))
):
    c = models.Class(**cls.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
