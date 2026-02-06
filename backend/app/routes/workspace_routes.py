from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import workspace_service
from app.schemas.task_schemas import TaskOut, TaskCreate, TaskUpdate, TaskBulkUpdate
from app.models.base_models import User

router = APIRouter()

@router.get("/tasks/me/list", response_model=List[TaskOut])
def get_my_tasks(
    limit: int = 5, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return workspace_service.get_user_tasks(db, current_user.id, limit=limit)

@router.post("/tasks", response_model=TaskOut)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task_in.team_id, current_user.role)
    return workspace_service.create_task(db, task_in, current_user.id)

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify access to task's team
    from app.models.project_models import Task
    from app.routes.security_deps import verify_team_access_manual
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy công việc")
    verify_team_access_manual(db, current_user.id, db_task.team_id, current_user.role)
    
    return workspace_service.update_task(db, task_id, task_in, current_user.id)

from app.routes.security_deps import verify_team_access

@router.get("/tasks/{task_id}", response_model=TaskOut)
def view_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    workspace_service.delete_task(db, task_id, current_user.id)
    return {"message": "Xóa công việc thành công"}

@router.get("/teams/{team_id}/tasks", response_model=List[TaskOut], dependencies=[Depends(verify_team_access)])
def get_team_tasks(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.get_team_tasks(db, team_id)

@router.put("/tasks/bulk-update", response_model=List[TaskOut])
def bulk_update_tasks(task_data: TaskBulkUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify access for at least one task or all (simplifying: check first task)
    if not task_data.tasks:
        return []
    
    from app.models.project_models import Task
    first_task = db.query(Task).filter(Task.id == task_data.tasks[0].id).first()
    if first_task:
        from app.routes.security_deps import verify_team_access_manual
        verify_team_access_manual(db, current_user.id, first_task.team_id, current_user.role)
    
    return workspace_service.bulk_update_tasks(db, task_data, current_user.id)

from app.schemas.task_schemas import TaskCommentCreate, TaskCommentOut

@router.post("/tasks/{task_id}/comments", response_model=TaskCommentOut)
def add_task_comment(task_id: int, comment: TaskCommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    
    return workspace_service.create_task_comment(db, task_id, current_user.id, comment)

@router.get("/tasks/{task_id}/comments", response_model=List[TaskCommentOut])
def get_task_comments(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    
    return workspace_service.get_task_comments(db, task_id)

from fastapi import UploadFile, File
from app.schemas.resource_schemas import ResourceOut, ResourceCreate
from app.services import resource_service

@router.post("/tasks/{task_id}/attachments", response_model=ResourceOut)
def upload_task_attachment(
    task_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    
    file_url = resource_service.upload_file(file)
    resource_in = ResourceCreate(
        name=file.filename,
        file_type=file.content_type,
        file_url=file_url,
        owner_id=current_user.id,
        task_id=task_id,
        team_id=task.team_id # Also link to team for easier cleanup/listing
    )
    return resource_service.create_resource(db, resource_in)

@router.get("/tasks/{task_id}/attachments", response_model=List[ResourceOut])
def get_task_attachments(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    
    return resource_service.get_task_resources(db, task_id)

from app.schemas.task_schemas import TaskMove, TaskOut

@router.put("/tasks/{task_id}/move", response_model=TaskOut)
def move_task(task_id: int, move_data: TaskMove, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = workspace_service.get_task_by_id(db, task_id)
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, task.team_id, current_user.role)
    
    return workspace_service.move_task(db, task_id, move_data, current_user.id)

from app.schemas.project_schemas import MilestoneQuestionOut, MilestoneAnswerCreate, MilestoneAnswerOut, TeamMilestoneUpdate
from app.routes.security_deps import verify_team_leader

@router.get("/teams/{team_id}/milestones/{milestone_id}/questions", response_model=List[MilestoneQuestionOut])
def get_milestone_questions(team_id: int, milestone_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify access to team
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    return workspace_service.get_milestone_questions(db, milestone_id)

@router.post("/teams/{team_id}/milestone-questions/{question_id}/answers", response_model=MilestoneAnswerOut)
def answer_milestone_question(team_id: int, question_id: int, answer_in: MilestoneAnswerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    return workspace_service.answer_milestone_question(db, question_id, current_user.id, team_id, answer_in)

@router.put("/teams/{team_id}/milestones/{milestone_id}/status", dependencies=[Depends(verify_team_leader)])
def update_milestone_status(team_id: int, milestone_id: int, status_in: TeamMilestoneUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # verify_team_leader dependency handles the check
    return workspace_service.mark_milestone_done(db, milestone_id, team_id, status_in.is_done)

from app.schemas.checkpoint_schemas import CheckpointCreate, CheckpointOut, CheckpointUpdate, CheckpointAssign, CheckpointSubmissionCreate, CheckpointSubmissionOut

@router.post("/teams/{team_id}/checkpoints", response_model=CheckpointOut, dependencies=[Depends(verify_team_leader)])
def create_checkpoint(team_id: int, checkpoint_in: CheckpointCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.create_checkpoint(db, team_id, checkpoint_in)

@router.get("/teams/{team_id}/checkpoints", response_model=List[CheckpointOut])
def list_checkpoints(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    return workspace_service.get_team_checkpoints(db, team_id)

@router.put("/teams/{team_id}/checkpoints/{checkpoint_id}", response_model=CheckpointOut, dependencies=[Depends(verify_team_leader)])
def update_checkpoint(team_id: int, checkpoint_id: int, checkpoint_in: CheckpointUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.update_checkpoint(db, checkpoint_id, checkpoint_in)

@router.post("/teams/{team_id}/checkpoints/{checkpoint_id}/assign", dependencies=[Depends(verify_team_leader)])
def assign_checkpoint(team_id: int, checkpoint_id: int, assign_in: CheckpointAssign, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.assign_checkpoint_members(db, checkpoint_id, assign_in.user_ids)

@router.post("/teams/{team_id}/checkpoints/{checkpoint_id}/submit", response_model=CheckpointSubmissionOut)
def submit_checkpoint(team_id: int, checkpoint_id: int, submission_in: CheckpointSubmissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    return workspace_service.submit_checkpoint(db, checkpoint_id, current_user.id, submission_in)

from app.schemas.user_schemas import UserOut

@router.get("/teams/me/members", response_model=List[UserOut])
def get_my_team_members(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.get_user_team_members(db, current_user.id)

@router.get("/teams/{team_id}/members", response_model=List[UserOut], dependencies=[Depends(verify_team_access)])
def get_team_members_by_id(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workspace_service.get_team_members(db, team_id)

@router.get("/teams/me")
def get_my_team(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get current user's team information with milestones"""
    return workspace_service.get_user_team_info(db, current_user.id)
