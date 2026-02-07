from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
from app.models.project_models import Project, ProjectMilestone, Team, TeamMember
from app.models.base_models import User
from app.schemas.project_schemas import ProjectCreate, TeamCreate
import boto3
import json
from app.core.config import settings
from app.services import ai_service

def create_project(db: Session, project_in: ProjectCreate, creator_id: int):
    """
    Tạo một dự án mới cùng với các mốc thời gian (milestones) đi kèm.
    Mặc định trạng thái dự án khi mới tạo là 'Pending' (Chờ duyệt).
    """
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
    """
    Sử dụng Trí tuệ nhân tạo (AI) để gợi ý các mốc thời gian (milestones) phù hợp cho môn học.
    """
    # Lấy thông tin môn học/đề cương để làm ngữ cảnh
    # Đây là phiên bản cải tiến của logic giả lập trước đó
    prompt = f"Generate project milestones for a subject with ID {subject_id}."
    response = ai_service.get_project_guidance(db, prompt, user_id)
    
    log_activity(
        db=db,
        user_id=user_id,
        action=f"đã tạo các milestone bằng AI cho môn học {subject_id}",
        target_type="ai",
        target_id=subject_id
    )
    
    # Phân tích phản hồi thành các milestones (đơn giản hóa cho tác vụ này)
    return [
        {"title": "AI Generated Milestone", "description": response[:200], "order": 1}
    ]

async def approve_project(db: Session, project_id: int, status: str, user_id: int):
    """
    Phê duyệt hoặc từ chối một đề xuất dự án.
    Gửi thông báo đến người tạo dự án sau khi hành động hoàn tất.
    """
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

    # Kích hoạt thông báo cho người tạo
    from app.services.notification_service import create_notification
    msg = "duyệt" if status == "Approved" else ("từ chối" if status == "Rejected" else status)
    await create_notification(
        db, 
        recipient_id=project.creator_id, 
        content=f"Dự án '{project.title}' của bạn đã được {msg}.",
        type="info" if status == "Approved" else "warning",
        related_link="/profile" # Or project list page
    )
    
    return project

def create_team(db: Session, team_in: TeamCreate):
    """
    Tạo một nhóm làm việc mới.
    Nếu có 'project_title', hệ thống sẽ tự động tạo Project và bộ Rubric chấm điểm mẫu cho nhóm này.
    """
    # Logic: Nếu có tên dự án, tự động tạo Dự án mới và Rubric đi kèm
    created_project_id = team_in.project_id
    
    if team_in.project_title:
        # Lấy thông tin lớp học để tìm Giảng viên (Người tạo)
        from app.models.project_models import Class
        class_obj = db.query(Class).filter(Class.id == team_in.class_id).first()
        creator_id = class_obj.lecturer_id if class_obj else None

        # 1. Tạo Dự án
        new_project = Project(
            title=team_in.project_title,
            description=f"Dự án được giao cho nhóm {team_in.name}",
            creator_id=creator_id,
            lecturer_id=creator_id,
            status="Approved", # Tự động duyệt
            syllabus_id=None 
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        created_project_id = new_project.id
        
        # 2. Tạo Rubric mặc định cho Dự án này
        from app.models.eval_models import Rubric, RubricCriteria
        new_rubric = Rubric(
            title=f"Rubric: {team_in.project_title}",
            description="Rubric đánh giá mặc định",
            project_id=new_project.id
        )
        db.add(new_rubric)
        db.commit()
        db.refresh(new_rubric)
        
        # 3. Thêm các tiêu chí mặc định
        default_criteria = [
            {"title": "Tính năng", "weight": 40, "max_score": 10},
            {"title": "Giao diện (UI/UX)", "weight": 30, "max_score": 10},
            {"title": "Báo cáo & Thuyết trình", "weight": 30, "max_score": 10}
        ]
        
        for idx, crit in enumerate(default_criteria):
            db_crit = RubricCriteria(
                rubric_id=new_rubric.id,
                title=crit["title"],
                weight=crit["weight"] / 100.0,
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
    
    
    # Đảm bảo nhóm trưởng được thêm vào danh sách thành viên
    members_to_add = set(team_in.member_ids)
    if team_in.leader_id:
        members_to_add.add(team_in.leader_id)

    for user_id in members_to_add:
        member = TeamMember(team_id=db_team.id, user_id=user_id)
        db.add(member)
    db.commit()
    db.refresh(db_team)
    
    # Ghi nhật ký tạo nhóm
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
async def add_team_member(db: Session, team_id: int, user_id: int, actor_id: int = None):
    """
    Thêm một thành viên mới vào nhóm.
    Kiểm tra giới hạn số lượng thành viên tối đa của dự án (nếu có định nghĩa).
    """
    # Kiểm tra xem nhóm có tồn tại không
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
        
    # Kiểm tra giới hạn thành viên tối đa của dự án
    if team.project and team.project.max_members:
        current_count = db.query(TeamMember).filter(TeamMember.team_id == team_id).count()
        if current_count >= team.project.max_members:
            raise HTTPException(status_code=400, detail=f"Nhóm đã đạt số lượng thành viên tối đa là {team.project.max_members} người")
    
    # Kiểm tra xem người dùng đã có trong nhóm chưa
    existing = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
    if existing:
        return existing
        
    member = TeamMember(team_id=team_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    
    if actor_id:
        target_user = db.query(User).filter(User.id == user_id).first()
        from app.services.activity_log_service import log_activity
        log_activity(
            db=db,
            user_id=actor_id,
            team_id=team_id,
            action=f"đã thêm {target_user.full_name if target_user else 'thành viên'} vào nhóm",
            target_type="user",
            target_id=user_id
        )
        
        # Trigger Notification
        try:
            from app.services.notification_service import create_notification
            await create_notification(
                db,
                recipient_id=user_id,
                content=f"Bạn đã được thêm vào nhóm '{team.name}'.",
                type="success",
                related_link="/workspace"
            )
        except Exception as e:
            print(f"Notification error: {e}")
        
    return member

async def remove_team_member(db: Session, team_id: int, user_id: int, actor_id: int = None):
    """Xoá một thành viên khỏi nhóm và gửi thông báo cảnh báo."""
    member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Thành viên không nằm trong nhóm này")
    
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if actor_id:
        target_user = db.query(User).filter(User.id == user_id).first()
        from app.services.activity_log_service import log_activity
        log_activity(
            db=db,
            user_id=actor_id,
            team_id=team_id,
            action=f"đã xóa {target_user.full_name if target_user else 'thành viên'} khỏi nhóm",
            target_type="user",
            target_id=user_id
        )
        
        # Trigger Notification
        try:
            from app.services.notification_service import create_notification
            await create_notification(
                db,
                recipient_id=user_id,
                content=f"Bạn đã bị xóa khỏi nhóm '{team.name if team else 'của mình'}'.",
                type="warning"
            )
        except Exception as e:
            print(f"Notification error: {e}")
        
    db.delete(member)
    db.commit()
    return True
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
    
    # Xử lý milestones nếu được cung cấp
    if "milestones" in update_data:
        # Cài đặt đơn giản: xóa cũ, thêm mới
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
    # Kiểm tra xem đã được giao chưa
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

def delete_team(db: Session, team_id: int):
    """Xóa một nhóm và tất cả dữ liệu liên quan qua cascade"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return None
    
    db.delete(team)
    db.commit()
    return True
