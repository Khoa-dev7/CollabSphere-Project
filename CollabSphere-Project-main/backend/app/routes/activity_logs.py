from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.core.deps import get_current_user


router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)

@router.get("/")
def get_activity_logs(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lấy danh sách nhật ký hoạt động (mới nhất trước)
    """
    return db.query(ActivityLog)\
        .order_by(ActivityLog.created_at.desc())\
        .limit(limit)\
        .all()
