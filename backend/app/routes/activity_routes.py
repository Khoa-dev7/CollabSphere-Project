from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import activity_log_service
from app.schemas.activity_schemas import ActivityLogOut
from app.models.base_models import User

router = APIRouter()

@router.get("/teams/{team_id}", response_model=List[ActivityLogOut])
def get_team_activity_logs(team_id: int, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access
    verify_team_access(team_id, current_user, db)
    # Lấy nhật ký hoạt động của nhóm
    return activity_log_service.get_team_activities(db, team_id, limit)

from app.core.permissions import PermissionChecker, Permissions

@router.get("/system", response_model=List[ActivityLogOut], dependencies=[Depends(PermissionChecker(Permissions.VIEW_ACTIVITY_LOG))])
def get_system_activity_logs(limit: int = 50, skip: int = 0, db: Session = Depends(get_db)):
    return activity_log_service.get_system_activities(db, limit, skip)
