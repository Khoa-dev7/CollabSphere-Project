from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import project_service
from app.schemas.project_schemas import ProjectOut, ProjectCreate, TeamOut, TeamCreate, ProjectUpdate
from app.models.base_models import User
from app.core.permissions import PermissionChecker, Permissions

router = APIRouter()

@router.post("/projects", response_model=ProjectOut, dependencies=[Depends(PermissionChecker(Permissions.CREATE_PROJECT))])
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return project_service.create_project(db, project_in, current_user.id)

@router.get("/projects", response_model=List[ProjectOut])
def list_projects(creator_id: int = None, lecturer_id: int = None, status: str = None, syllabus_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return project_service.get_projects(db, creator_id, lecturer_id, status, syllabus_id, skip, limit)

@router.get("/projects/{project_id}", response_model=ProjectOut)
def view_project(project_id: int, db: Session = Depends(get_db)):
    return project_service.get_project_by_id(db, project_id)

@router.put("/projects/{project_id}", response_model=ProjectOut, dependencies=[Depends(PermissionChecker(Permissions.APPROVE_PROJECT))])
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db)):
    # Note: Only staff/admin can update projects or creator if pending
    return project_service.update_project(db, project_id, project_in, current_user.id)

@router.delete("/projects/{project_id}", dependencies=[Depends(PermissionChecker(Permissions.APPROVE_PROJECT))])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project_service.delete_project(db, project_id)
    return {"message": "Xóa dự án thành công"}

@router.post("/projects/generate-milestones")
def generate_milestones(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # AI Milestone generation
    return project_service.generate_milestones_ai(db, subject_id, current_user.id)

@router.put("/projects/{project_id}/approve", dependencies=[Depends(PermissionChecker(Permissions.APPROVE_PROJECT))])
def approve_project(project_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return project_service.approve_project(db, project_id, status, current_user.id)

@router.get("/teams", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all teams with member information"""
    from app.models.project_models import Team, TeamMember
    from app.schemas.user_schemas import UserOut
    
    # Get teams based on user role
    if current_user.role == "Lecturer":
        # Lecturers see teams from their classes
        from app.models.project_models import Class
        lecturer_classes = db.query(Class).filter(Class.lecturer_id == current_user.id).all()
        class_ids = [c.id for c in lecturer_classes]
        teams = db.query(Team).filter(Team.class_id.in_(class_ids)).all() if class_ids else []
    elif current_user.role == "Student":
        # Students see teams they're in
        team_members = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
        team_ids = [tm.team_id for tm in team_members]
        teams = db.query(Team).filter(Team.id.in_(team_ids)).all() if team_ids else []
    else:
        # Staff/Admin see all teams
        teams = db.query(Team).all()
    
    # Populate members for each team
    result = []
    for team in teams:
        team_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        member_users = [tm.user for tm in team_members]
        
        team_dict = {
            "id": team.id,
            "name": team.name,
            "class_id": team.class_id,
            "project_id": team.project_id,
            "leader_id": team.leader_id,
            "created_at": team.created_at,
            "members": member_users
        }
        result.append(team_dict)
    
    return result

@router.post("/teams", response_model=TeamOut)
def create_team(team_in: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "Lecturer":
        raise HTTPException(status_code=403, detail="Chỉ Giảng viên mới có quyền tạo nhóm")
    return project_service.create_team(db, team_in)
@router.post("/teams/{team_id}/members/{user_id}", response_model=TeamOut)
def add_team_member(team_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Add a member to a team - only Lecturer of the class or Team Leader can do this"""
    from app.models.project_models import Team, Class
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
    
    # Check permissions
    is_lecturer = False
    is_leader = False
    
    if current_user.role == "Lecturer":
        # Check if lecturer teaches this class
        class_obj = db.query(Class).filter(Class.id == team.class_id).first()
        if class_obj and class_obj.lecturer_id == current_user.id:
            is_lecturer = True
    elif current_user.role == "Student":
        # Check if student is the team leader
        if team.leader_id == current_user.id:
            is_leader = True
            
    # Staff/Admin also have permission
    is_staff = current_user.role in ["Staff", "Admin", "Head"]
    
    if not (is_lecturer or is_leader or is_staff):
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm thành viên vào nhóm này")
    
    project_service.add_team_member(db, team_id, user_id, current_user.id)
    return db.query(Team).filter(Team.id == team_id).first()

@router.delete("/teams/{team_id}/members/{user_id}")
def remove_team_member(team_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Remove a member from a team - only Lecturer of the class or Team Leader can do this"""
    from app.models.project_models import Team, Class
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
    
    # Check permissions
    is_lecturer = False
    is_leader = False
    
    if current_user.role == "Lecturer":
        # Check if lecturer teaches this class
        class_obj = db.query(Class).filter(Class.id == team.class_id).first()
        if class_obj and class_obj.lecturer_id == current_user.id:
            is_lecturer = True
    elif current_user.role == "Student":
        # Check if student is the team leader
        if team.leader_id == current_user.id:
            is_leader = True
            
    is_staff = current_user.role in ["Staff", "Admin", "Head"]
    
    if not (is_lecturer or is_leader or is_staff):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa thành viên khỏi nhóm này")
    
    # Protection: Leader cannot remove themselves
    if team.leader_id == user_id:
        raise HTTPException(status_code=400, detail="Nhóm trưởng không thể tự rời khỏi nhóm. Vui lòng chuyển quyền nhóm trưởng trước.")
    
    project_service.remove_team_member(db, team_id, user_id, current_user.id)
    return {"message": "Đã xóa thành viên khỏi nhóm"}

from app.schemas.project_schemas import MilestoneQuestionCreate, MilestoneQuestionOut

@router.post("/milestones/{milestone_id}/questions", response_model=MilestoneQuestionOut, dependencies=[Depends(PermissionChecker(Permissions.CREATE_PROJECT))])
def create_milestone_question(milestone_id: int, question_in: MilestoneQuestionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return project_service.create_milestone_question(db, milestone_id, question_in)

@router.post("/{project_id}/assign-to-class/{class_id}", dependencies=[Depends(PermissionChecker(Permissions.ASSIGN_PROJECT_GLOBAL))])
def assign_to_class(project_id: int, class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Note: Using APPROVE_PROJECT perm as this is a Head/Lecturer action
    return project_service.assign_project_to_class(db, class_id, project_id)
