from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.project_models import Project, Task, Team
from app.models.base_models import User

def get_general_stats(db: Session):
    total_projects = db.query(func.count(Project.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_teams = db.query(func.count(Team.id)).scalar()
    
    return {
        "total_projects": total_projects,
        "total_users": total_users,
        "total_teams": total_teams
    }

def get_project_status_distribution(db: Session):
    # Nhóm theo trạng thái
    stats = db.query(Project.status, func.count(Project.id)).group_by(Project.status).all()
    return [{"status": s, "count": c} for s, c in stats]

def get_task_status_distribution(db: Session, team_id: int = None):
    query = db.query(Task.status, func.count(Task.id))
    if team_id:
        query = query.filter(Task.team_id == team_id)
    
    stats = query.group_by(Task.status).all()
    return [{"status": s, "count": c} for s, c in stats]

def get_user_role_distribution(db: Session):
    stats = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    return [{"role": r, "count": c} for r, c in stats]

def get_user_stats(db: Session, user_id: int):
    # active_courses: count of projects user is in
    from app.models.project_models import TeamMember, Team, Project, Task
    from app.models.comm_models import Notification
    
    active_courses = db.query(func.count(Project.id))\
        .join(Team, Team.project_id == Project.id)\
        .join(TeamMember, TeamMember.team_id == Team.id)\
        .filter(TeamMember.user_id == user_id).scalar() or 0
        
    active_tasks = db.query(func.count(Task.id))\
        .filter(Task.assigned_to == user_id)\
        .filter(Task.status != "Done").scalar() or 0
        
    unread_notifications = db.query(func.count(Notification.id))\
        .filter(Notification.recipient_id == user_id)\
        .filter(Notification.is_read == False).scalar() or 0
        
    first_team = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    team_id = first_team.team_id if first_team else None
        
    return {
        "active_courses": active_courses,
        "active_tasks": active_tasks,
        "unread_notifications": unread_notifications,
        "gpa": "N/A",
        "team_id": team_id
    }
