from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import ai_service
from app.schemas.ai_schemas import AISuggestionRequest
from app.models.base_models import User

router = APIRouter()

@router.post("/brainstorm")
def brainstorm(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API yêu cầu AI hỗ trợ lên ý tưởng (Brainstorming) cho dự án hoặc công việc.
    """
    return {
        "response": ai_service.brainstorm_ideas(db, request.context, current_user.id, request.team_id)
    }

@router.post("/guidance")
def guidance(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API yêu cầu AI cung cấp hướng dẫn (Guidance) tổng quan cho dự án.
    """
    return {
        "response": ai_service.get_project_guidance(db, request.context, current_user.id, request.team_id)
    }

@router.post("/chat")
def chat(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API trò chuyện trực tiếp (Chat) với Trợ lý AI.
    """
    return {
        "response": ai_service.ask_ai(request.context, db=db, team_id=request.team_id)
    }

@router.post("/task-guidance")
def task_guidance(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API yêu cầu AI hướng dẫn chi tiết cách thực hiện một Nhiệm vụ (Task) cụ thể.
    """
    return {
        "response": ai_service.get_task_guidance(db, request.context, current_user.id, request.team_id)
    }
