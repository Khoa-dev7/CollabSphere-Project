from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services import dashboard_service
from app.routes.auth_routes import get_current_user
from app.models.base_models import User
from typing import List, Dict, Any

router = APIRouter()

@router.get("/me/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dashboard_service.get_user_stats(db, current_user.id)

@router.get("/stats")
def get_general_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine visibility based on role? For now, open to auth users
    return dashboard_service.get_general_stats(db)

@router.get("/projects/distribution")
def get_project_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dashboard_service.get_project_status_distribution(db)

@router.get("/tasks/distribution")
def get_task_distribution(
    team_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dashboard_service.get_task_status_distribution(db, team_id)

@router.get("/users/distribution")
def get_user_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dashboard_service.get_user_role_distribution(db)
