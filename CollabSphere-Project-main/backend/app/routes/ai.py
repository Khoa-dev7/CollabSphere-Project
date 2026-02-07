from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.ai_service import suggest_task_solution
from app.core.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


class TaskAISuggestRequest(BaseModel):
    description: str
    role: str = "student"
    level: str = "medium"


@router.post("/task-suggestion")
def ai_task_suggestion(
    data: TaskAISuggestRequest,
    current_user=Depends(get_current_user)
):
    result = suggest_task_solution(
        task_description=data.description,
        role=data.role,
        level=data.level
    )

    return {
        "user": current_user.full_name,
        "ai_suggestion": result
    }
