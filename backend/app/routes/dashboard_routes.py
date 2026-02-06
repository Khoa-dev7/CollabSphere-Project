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
    """
    Lấy các thông số thống kê cá nhân (vd: số dự án đang tham gia, tiến độ công việc cá nhân).
    """
    return dashboard_service.get_user_stats(db, current_user.id)

@router.get("/stats")
def get_general_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy dữ liệu thống kê tổng quan của hệ thống (vd: tổng số SV, giảng viên, dự án).
    Dành cho trang Dashboard chính.
    """
    return dashboard_service.get_general_stats(db)

@router.get("/projects/distribution")
def get_project_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy tỉ lệ phân bổ trạng thái dự án (vd: Bao nhiêu % đang chờ, đã duyệt, hoàn thành).
    """
    return dashboard_service.get_project_status_distribution(db)

@router.get("/tasks/distribution")
def get_task_distribution(
    team_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy tỉ lệ phân bổ trạng thái công việc (Todo/Doing/Done) cho một nhóm hoặc toàn bộ.
    """
    return dashboard_service.get_task_status_distribution(db, team_id)

@router.get("/users/distribution")
def get_user_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy tỉ lệ phân bổ người dùng theo vai trò (Bao nhiêu SV, GV, Staff...).
    """
    return dashboard_service.get_user_role_distribution(db)
