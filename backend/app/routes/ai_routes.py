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
    return {
        "response": ai_service.brainstorm_ideas(db, request.context, current_user.id, request.team_id)
    }

@router.post("/guidance")
def guidance(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "response": ai_service.get_project_guidance(db, request.context, current_user.id, request.team_id)
    }

@router.post("/chat")
def chat(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "response": ai_service.ask_ai(request.context, db=db, team_id=request.team_id)
    }

@router.post("/task-guidance")
def task_guidance(request: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "response": ai_service.get_task_guidance(db, request.context, current_user.id, request.team_id)
    }
