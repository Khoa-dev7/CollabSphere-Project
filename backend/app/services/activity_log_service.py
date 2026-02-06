from sqlalchemy.orm import Session
from app.models.comm_models import ActivityLog
from app.schemas.activity_schemas import ActivityLogCreate

def log_activity(db: Session, user_id: int, action: str, target_type: str = None, target_id: int = None, team_id: int = None):
    """
    Dịch vụ nội bộ để ghi lại nhật ký hoạt động.
    """
    db_log = ActivityLog(
        user_id=user_id,
        team_id=team_id,
        action=action,
        target_type=target_type,
        target_id=target_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

from app.models.base_models import User

def get_team_activities(db: Session, team_id: int, limit: int = 20):
    return db.query(ActivityLog).join(User).filter(ActivityLog.team_id == team_id).order_by(ActivityLog.created_at.desc()).limit(limit).all()

def get_system_activities(db: Session, limit: int = 50, skip: int = 0):
    """
    Lấy tất cả các hoạt động cho chế độ xem quản trị.
    """
    return db.query(ActivityLog).join(User).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
