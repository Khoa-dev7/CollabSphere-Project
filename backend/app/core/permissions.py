from fastapi import HTTPException, status, Depends
from typing import List
from app.models.base_models import User
from app.routes.auth_routes import get_current_user

# Define granular permissions
class Permissions:
    # Admin / System Permissions
    MANAGE_USERS = "manage_users"
    VIEW_ACTIVITY_LOG = "view_activity_log"
    VIEW_SYSTEM_DASHBOARD = "view_system_dashboard"
    
    # Staff / Academic Data Permissions
    MANAGE_ACADEMIC_DATA = "manage_academic_data" # Subjects, Syllabus, Classes
    
    # Head / Quality Control Permissions
    APPROVE_PROJECT = "approve_project"
    ASSIGN_PROJECT_GLOBAL = "assign_project_global"
    VIEW_ALL_PROJECTS = "view_all_projects"
    
    # Lecturer / Teaching Permissions
    CREATE_PROJECT = "create_project"
    MANAGE_TEAMS = "manage_teams"
    EVALUATE_STUDENTS = "evaluate_students"
    
    # Shared / Student Permissions
    TEAM_WORKSPACE = "team_workspace"
    SUBMIT_WORK = "submit_work"
    PEER_REVIEW = "peer_review"
    TEAM_CHAT = "team_chat"
    
    # AI
    GENERATE_AI = "generate_ai"

# Role to Permission mapping
ROLE_PERMISSIONS = {
    "Admin": [
        Permissions.MANAGE_USERS,
        Permissions.VIEW_ACTIVITY_LOG,
        Permissions.VIEW_SYSTEM_DASHBOARD,
        Permissions.GENERATE_AI,
    ],
    "Staff": [
        Permissions.MANAGE_USERS, # Account import
        Permissions.MANAGE_ACADEMIC_DATA,
        Permissions.VIEW_SYSTEM_DASHBOARD,
        Permissions.GENERATE_AI,
    ],
    "Head": [
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.APPROVE_PROJECT,
        Permissions.ASSIGN_PROJECT_GLOBAL,
        Permissions.GENERATE_AI,
        Permissions.TEAM_CHAT, # For monitoring
    ],
    "Lecturer": [
        Permissions.CREATE_PROJECT,
        Permissions.MANAGE_TEAMS,
        Permissions.EVALUATE_STUDENTS,
        Permissions.TEAM_WORKSPACE,
        Permissions.TEAM_CHAT,
        Permissions.GENERATE_AI,
    ],
    "Student": [
        Permissions.TEAM_WORKSPACE,
        Permissions.SUBMIT_WORK,
        Permissions.PEER_REVIEW,
        Permissions.TEAM_CHAT,
        Permissions.GENERATE_AI,
    ]
}

def has_permission(role: str, permission: str) -> bool:
    role_perms = ROLE_PERMISSIONS.get(role, [])
    return permission in role_perms

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_user)):
        if not has_permission(current_user.role, self.required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn không có quyền thực hiện hành động này: {self.required_permission}"
            )
        return True
