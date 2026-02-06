from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user, get_optional_user
from app.services import notification_service
from app.models.base_models import User
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()

from typing import List, Optional

class NotificationOut(BaseModel):
    """
    Schema định dạng thông báo trả về cho người dùng.
    """
    id: int
    content: str # Nội dung thông báo
    type: str # Phân loại: info, warning, success
    is_read: bool # Trạng thái đã đọc hay chưa
    related_link: Optional[str] = None # Liên kết liên quan (vd: trang dự án)
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    limit: int = 20, 
    skip: int = 0, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_optional_user)
):
    """
    API lấy danh sách các thông báo của người dùng hiện tại (có phân trang).
    """
    if not current_user:
        return []
    return notification_service.get_my_notifications(db, current_user.id, limit=limit, skip=skip)

@router.put("/{notification_id}/read")
def read_notification(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API đánh dấu một thông báo cụ thể là đã đọc.
    """
    success = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")
    return {"message": "Đã đánh dấu là đã đọc"}

@router.put("/read-all")
def read_all_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
    """
    notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "Đã đánh dấu tất cả là đã đọc"}

class ReportIn(BaseModel):
    """
    Schema cho yêu cầu báo cáo lỗi/vấn đề.
    """
    content: str

from app.utils.email import send_report_email
from fastapi import BackgroundTasks

@router.post("/report-issue")
async def report_issue(report: ReportIn, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    """
    API báo cáo lỗi hệ thống: Gửi nội dung qua email tới quản trị viên.
    Sử dụng BackgroundTasks để không làm gián đoạn trải nghiệm người dùng.
    """
    # Gửi email tới admin trong background
    background_tasks.add_task(send_report_email, current_user.email, report.content)
    return {"message": "Báo cáo đã được gửi tới quản trị viên"}
