from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import export_service
from app.models.base_models import User
from app.core.permissions import PermissionChecker, Permissions

router = APIRouter()

@router.get("/projects", dependencies=[Depends(PermissionChecker(Permissions.VIEW_ACTIVITY_LOG))])
def export_projects(db: Session = Depends(get_db)):
    file_stream = export_service.export_projects_to_excel(db)
    headers = {
        'Content-Disposition': 'attachment; filename="bao_cao_du_an.xlsx"'
    }
    return StreamingResponse(iter([file_stream.getvalue()]), headers=headers)

@router.get("/grades/{class_id}", dependencies=[Depends(PermissionChecker(Permissions.VIEW_ACTIVITY_LOG))])
def export_grades(class_id: int, db: Session = Depends(get_db)):
    file_stream = export_service.export_grades_to_excel(db, class_id)
    if not file_stream:
        return {"error": "Không tìm thấy dữ liệu cho lớp học này"}
        
    headers = {
        'Content-Disposition': f'attachment; filename="bang_diem_lop_{class_id}.xlsx"'
    }
    return StreamingResponse(iter([file_stream.getvalue()]), headers=headers)
