from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/projects/{project_id}/progress")
def task_progress(project_id: int, db: Session = Depends(get_db)):
    """
    Dữ liệu biểu đồ tiến độ task
    """
    return DashboardService.task_progress(db, project_id)


@router.get("/projects/{project_id}/completion-rate")
def completion_rate(project_id: int, db: Session = Depends(get_db)):
    """
    Tỉ lệ hoàn thành project
    """
    return DashboardService.completion_rate_by_project(db, project_id)
