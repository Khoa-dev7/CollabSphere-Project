from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
from app.models.project_models import Project, ProjectMilestone, Team, TeamMember
from app.schemas.project_schemas import ProjectCreate, TeamCreate
import boto3
import json
from app.core.config import settings
from app.services import ai_service

def create_project(db: Session, project_in: ProjectCreate, creator_id: int):
    db_project = Project(
        title=project_in.title,
        description=project_in.description,
        objectives=project_in.objectives,
        syllabus_id=project_in.syllabus_id,
        creator_id=creator_id,
        lecturer_id=project_in.lecturer_id,
        status="Pending"
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    for ms in project_in.milestones:
        db_ms = ProjectMilestone(
            project_id=db_project.id,
            title=ms.title,
            description=ms.description,
            order=ms.order
        )
        db.add(db_ms)
    db.commit()
    db.refresh(db_project)
    return db_project

from app.services.activity_log_service import log_activity

def generate_milestones_ai(db: Session, subject_id: int, user_id: int):
    # Fetch subject/syllabus info for context
    # This is a refinement of the previous mock logic
    prompt = f"Generate project milestones for a subject with ID {subject_id}."
    response = ai_service.get_project_guidance(db, prompt, user_id)
    
    log_activity(
        db=db,
        user_id=user_id,
        action=f"đã tạo các milestone bằng AI cho môn học {subject_id}",
        target_type="ai",
        target_id=subject_id
    )
    
    # Parse the response into milestones (simplified for this task)
    return [
        {"title": "AI Generated Milestone", "description": response[:200], "order": 1}
    ]

def approve_project(db: Session, project_id: int, status: str, user_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.status = status
    db.commit()
    
    log_activity(
        db=db,
        user_id=user_id,
        action=f"dự án '{project.title}' đã được {status}",
        target_type="project",
        target_id=project.id
    )
    
    return project

def create_team(db: Session, team_in: TeamCreate):
    # Logic: If project_title is provided, create a new Project and Rubric automatically
    created_project_id = team_in.project_id
    
    if team_in.project_title:
        # Fetch Class to get the Lecturer (Creator)
        from app.models.project_models import Class
        class_obj = db.query(Class).filter(Class.id == team_in.class_id).first()
        creator_id = class_obj.lecturer_id if class_obj else None

        # 1. Create Project
        new_project = Project(
            title=team_in.project_title,
            description=f"Dự án được giao cho nhóm {team_in.name}",
            creator_id=creator_id,
            lecturer_id=creator_id,
            status="Approved", # Auto-approve
            syllabus_id=None 
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        created_project_id = new_project.id
        
        # 2. Create Default Rubric for this Project
        from app.models.eval_models import Rubric, RubricCriteria
        new_rubric = Rubric(
            title=f"Rubric: {team_in.project_title}",
            description="Rubric đánh giá mặc định",
            project_id=new_project.id
        )
        db.add(new_rubric)
        db.commit()
        db.refresh(new_rubric)
        
        # 3. Add default criteria
        default_criteria = [
            {"title": "Tính năng", "weight": 40, "max_score": 10},
            {"title": "Giao diện (UI/UX)", "weight": 30, "max_score": 10},
            {"title": "Báo cáo & Thuyết trình", "weight": 30, "max_score": 10}
        ]
        
        for idx, crit in enumerate(default_criteria):
            db_crit = RubricCriteria(
                rubric_id=new_rubric.id,
                title=crit["title"],
                weight=crit["weight"],
                max_score=crit["max_score"],
                order=idx
            )
            db.add(db_crit)
        db.commit()

    db_team = Team(
        name=team_in.name,
        class_id=team_in.class_id,
        project_id=created_project_id,
        leader_id=team_in.leader_id
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    
    # Ensure leader is added as a member
    members_to_add = set(team_in.member_ids)
    if team_in.leader_id:
        members_to_add.add(team_in.leader_id)

    for user_id in members_to_add:
        member = TeamMember(team_id=db_team.id, user_id=user_id)
        db.add(member)
    db.commit()
    db.refresh(db_team)
    
    # Log team creation
    if team_in.leader_id:
        log_activity(
            db=db,
            user_id=team_in.leader_id, # Actually should be creator or lecturer
            team_id=db_team.id,
            action=f"đã tạo nhóm '{db_team.name}'",
            target_type="team",
            target_id=db_team.id
        )
    
    return db_team
def add_team_member(db: Session, team_id: int, user_id: int, actor_id: int = None):
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
        
    # Check project max_members limit
    if team.project and team.project.max_members:
        current_count = db.query(TeamMember).filter(TeamMember.team_id == team_id).count()
        if current_count >= team.project.max_members:
            raise HTTPException(status_code=400, detail=f"Nhóm đã đạt số lượng thành viên tối đa là {team.project.max_members} người")
    
    # Check if user already in team
    existing = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
    if existing:
        return existing
        
    member = TeamMember(team_id=team_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    
    if actor_id:
        target_user = db.query(User).filter(User.id == user_id).first()
        log_activity(
            db=db,
            user_id=actor_id,
            team_id=team_id,
            action=f"đã thêm {target_user.full_name if target_user else 'thành viên'} vào nhóm",
            target_type="user",
            target_id=user_id
        )
        
    return member

def remove_team_member(db: Session, team_id: int, user_id: int, actor_id: int = None):
    member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Thành viên không nằm trong nhóm này")
    
    if actor_id:
        target_user = db.query(User).filter(User.id == user_id).first()
        log_activity(
            db=db,
            user_id=actor_id,
            team_id=team_id,
            action=f"đã xóa {target_user.full_name if target_user else 'thành viên'} khỏi nhóm",
            target_type="user",
            target_id=user_id
        )
        
    db.delete(member)
    db.commit()
    return True

def get_projects(db: Session, creator_id: int = None, lecturer_id: int = None, status: str = None, syllabus_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(Project)
    if creator_id:
        query = query.filter(Project.creator_id == creator_id)
    if lecturer_id:
        query = query.filter(Project.lecturer_id == lecturer_id)
    if status:
        query = query.filter(Project.status == status)
    if syllabus_id:
        query = query.filter(Project.syllabus_id == syllabus_id)
    return query.offset(skip).limit(limit).all()

def get_project_by_id(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án")
    return project

from app.schemas.project_schemas import ProjectUpdate

def update_project(db: Session, project_id: int, project_in: ProjectUpdate, actor_id: int = None):
    db_project = get_project_by_id(db, project_id)
    update_data = project_in.dict(exclude_unset=True)
    
    # Handle milestones if provided
    if "milestones" in update_data:
        # Simple implementation: delete old, add new
        db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).delete()
        for ms in update_data["milestones"]:
            db_ms = ProjectMilestone(project_id=project_id, **ms)
            db.add(db_ms)
        del update_data["milestones"]

    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project_by_id(db, project_id)
    db.delete(db_project)
    db.commit()
    return True

from app.models.project_models import MilestoneQuestion
from app.schemas.project_schemas import MilestoneQuestionCreate

def create_milestone_question(db: Session, milestone_id: int, question_in: MilestoneQuestionCreate):
    db_question = MilestoneQuestion(milestone_id=milestone_id, content=question_in.content)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

from app.models.project_models import ClassProject

def assign_project_to_class(db: Session, class_id: int, project_id: int):
    # Check if already assigned
    existing = db.query(ClassProject).filter(
        ClassProject.class_id == class_id,
        ClassProject.project_id == project_id
    ).first()
    if existing:
        return existing
        
    db_cp = ClassProject(class_id=class_id, project_id=project_id)
    db.add(db_cp)
    db.commit()
    db.refresh(db_cp)
    return db_cp
