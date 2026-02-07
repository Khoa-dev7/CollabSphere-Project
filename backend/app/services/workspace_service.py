from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.project_models import Task, Team
from app.schemas.task_schemas import TaskCreate, TaskUpdate, TaskBulkUpdate
from typing import List
from app.services.activity_log_service import log_activity

def create_task(db: Session, task_in: TaskCreate, user_id: int):
    db_task = Task(**task_in.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    log_activity(
        db=db,
        user_id=user_id,
        team_id=db_task.team_id,
        action=f"đã tạo nhiệm vụ '{db_task.title}'",
        target_type="task",
        target_id=db_task.id
    )
    
    return db_task

def update_task(db: Session, task_id: int, task_in: TaskUpdate, user_id: int):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")
    
    old_status = db_task.status
    update_data = task_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    
    if "status" in update_data and update_data["status"] != old_status:
        log_activity(
            db=db,
            user_id=user_id,
            team_id=db_task.team_id,
            action=f"đã chuyển nhiệm vụ '{db_task.title}' sang trạng thái {db_task.status}",
            target_type="task",
            target_id=db_task.id
        )
        
    return db_task

def get_team_tasks(db: Session, team_id: int):
    return db.query(Task).filter(Task.team_id == team_id).order_by(Task.order.asc()).all()

def get_user_tasks(db: Session, user_id: int, limit: int = 20):
    return db.query(Task).filter(Task.assigned_to == user_id)\
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())\
        .limit(limit).all()

def bulk_update_tasks(db: Session, task_data: TaskBulkUpdate, user_id: int):
    results = []
    for item in task_data.tasks:
        db_task = db.query(Task).filter(Task.id == item.id).first()
        if not db_task:
            continue
        
        old_status = db_task.status
        if item.status:
            db_task.status = item.status
        if item.order is not None:
            db_task.order = item.order
            
        db.commit()
        db.refresh(db_task)
        
        if item.status and item.status != old_status:
            log_activity(
                db=db,
                user_id=user_id,
                team_id=db_task.team_id,
                action=f"đã chuyển nhiệm vụ '{db_task.title}' sang {db_task.status}",
                target_type="task",
                target_id=db_task.id
            )
        results.append(db_task)
    return results

from app.schemas.project_schemas import MilestoneAnswerCreate, MilestoneQuestionOut, MilestoneAnswerOut, TeamMilestoneUpdate
from app.routes.security_deps import verify_team_leader
from app.schemas.task_schemas import TaskMove

def get_task_by_id(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")
    return task

def delete_task(db: Session, task_id: int, user_id: int):
    task = get_task_by_id(db, task_id)
    team_id = task.team_id
    task_title = task.title
    
    db.delete(task)
    db.commit()
    
    log_activity(
        db=db,
        user_id=user_id,
        team_id=team_id,
        action=f"đã xóa nhiệm vụ '{task_title}'",
        target_type="task",
        target_id=task_id
    )
    
    return True

def move_task(db: Session, task_id: int, move_data: TaskMove, user_id: int):
    task = get_task_by_id(db, task_id)
    old_status = task.status
    old_order = task.order
    new_status = move_data.new_status
    new_order = move_data.new_order
    
    if old_status == new_status:
        # Sắp xếp lại trong cùng một cột
        if old_order == new_order:
            return task
        
        # Lấy danh sách các công việc trong cột này
        tasks = db.query(Task).filter(
            Task.team_id == task.team_id, 
            Task.status == old_status
        ).order_by(Task.order.asc()).all()
        
        # Xóa công việc khỏi danh sách tạm thời
        tasks = [t for t in tasks if t.id != task_id]
        
        # Chèn vào vị trí mới
        if new_order < 0: new_order = 0
        if new_order > len(tasks): new_order = len(tasks)
        
        tasks.insert(new_order, task)
        
        # Đánh lại chỉ số thứ tự (index)
        for index, t in enumerate(tasks):
            t.order = index
            t.status = new_status # Should be same
            
    else:
        # Di chuyển sang cột khác
        # 1. Cập nhật cột cũ: Xóa và đánh lại chỉ số
        source_tasks = db.query(Task).filter(
            Task.team_id == task.team_id, 
            Task.status == old_status
        ).order_by(Task.order.asc()).all()
        
        source_tasks = [t for t in source_tasks if t.id != task_id]
        for index, t in enumerate(source_tasks):
            t.order = index
            
        # 2. Cập nhật cột mới: Chèn và đánh lại chỉ số
        dest_tasks = db.query(Task).filter(
            Task.team_id == task.team_id, 
            Task.status == new_status
        ).order_by(Task.order.asc()).all()
        
        if new_order < 0: new_order = 0
        if new_order > len(dest_tasks): new_order = len(dest_tasks)
        
        dest_tasks.insert(new_order, task)
        
        for index, t in enumerate(dest_tasks):
            t.order = index
            t.status = new_status

    db.flush()
    db.commit()
    db.refresh(task)
    
    try:
        log_activity(
            db=db,
            user_id=user_id,
            team_id=task.team_id,
            action=f"đã chuyển nhiệm vụ '{task.title}' từ {old_status} sang {new_status}",
            target_type="task",
            target_id=task.id
        )
    except Exception as e:
        # Ghi nhật ký là tác vụ không quan trọng, không làm lỗi hành động di chuyển
        pass
    
    return task

from app.models.project_models import TaskComment, MilestoneAnswer, TeamMilestone, MilestoneQuestion, TeamMember, ProjectMilestone, Project, Class
from app.schemas.task_schemas import TaskCommentCreate
from app.models.comm_models import Checkpoint, CheckpointAssignee, CheckpointSubmission
from app.schemas.checkpoint_schemas import CheckpointCreate, CheckpointUpdate, CheckpointSubmissionCreate
from app.models.base_models import User

def create_task_comment(db: Session, task_id: int, user_id: int, comment_in: TaskCommentCreate):
    task = get_task_by_id(db, task_id) # Xác minh công việc tồn tại
    db_comment = TaskComment(
        task_id=task_id,
        user_id=user_id,
        content=comment_in.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Tùy chọn: Ghi nhật ký hoặc thông báo
    log_activity(
        db=db,
        user_id=user_id,
        team_id=task.team_id,
        action=f"đã bình luận về nhiệm vụ '{task.title}'",
        target_type="task",
        target_id=task.id
    )
    return db_comment

def get_task_comments(db: Session, task_id: int):
    # Xác minh công việc tồn tại
    get_task_by_id(db, task_id)
    return db.query(TaskComment).filter(TaskComment.task_id == task_id).order_by(TaskComment.created_at.asc()).all()

def answer_milestone_question(db: Session, question_id: int, user_id: int, team_id: int, answer_in: MilestoneAnswerCreate):
    db_answer = MilestoneAnswer(
        question_id=question_id, 
        user_id=user_id, 
        team_id=team_id,
        content=answer_in.content
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

def get_milestone_questions(db: Session, milestone_id: int):
    return db.query(MilestoneQuestion).filter(MilestoneQuestion.milestone_id == milestone_id).all()

def mark_milestone_done(db: Session, milestone_id: int, team_id: int, is_done: bool):
    team_ms = db.query(TeamMilestone).filter(
        TeamMilestone.milestone_id == milestone_id,
        TeamMilestone.team_id == team_id
    ).first()
    
    if not team_ms:
        import datetime
        team_ms = TeamMilestone(milestone_id=milestone_id, team_id=team_id, is_done=is_done)
        if is_done:
            team_ms.completed_at = datetime.datetime.now()
        db.add(team_ms)
    else:
        team_ms.is_done = is_done
        if is_done:
            import datetime
            team_ms.completed_at = datetime.datetime.now()
            
    db.commit()
    db.refresh(team_ms)
    return team_ms

def create_checkpoint(db: Session, team_id: int, checkpoint_in: CheckpointCreate):
    db_checkpoint = Checkpoint(
        team_id=team_id,
        title=checkpoint_in.title,
        description=checkpoint_in.description
    )
    db.add(db_checkpoint)
    db.commit()
    db.refresh(db_checkpoint)
    return db_checkpoint

def update_checkpoint(db: Session, checkpoint_id: int, update_in: CheckpointUpdate):
    checkpoint = db.query(Checkpoint).filter(Checkpoint.id == checkpoint_id).first()
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Không tìm thấy Checkpoint")
    
    update_data = update_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(checkpoint, key, value)
        
    db.commit()
    db.refresh(checkpoint)
    return checkpoint

def assign_checkpoint_members(db: Session, checkpoint_id: int, user_ids: List[int]):
    # Xóa cái cũ? Hay thêm vào? Thường là ghi đè để đơn giản hóa trong PUT
    db.query(CheckpointAssignee).filter(CheckpointAssignee.checkpoint_id == checkpoint_id).delete()
    
    for uid in user_ids:
        assignee = CheckpointAssignee(checkpoint_id=checkpoint_id, user_id=uid)
        db.add(assignee)
    
    db.commit()
    return True

def submit_checkpoint(db: Session, checkpoint_id: int, student_id: int, submission_in: CheckpointSubmissionCreate):
    # Kiểm tra nếu đã tồn tại
    submission = db.query(CheckpointSubmission).filter(
        CheckpointSubmission.checkpoint_id == checkpoint_id,
        CheckpointSubmission.student_id == student_id
    ).first()
    
    if submission:
        if submission_in.content: submission.content = submission_in.content
        if submission_in.file_url: submission.file_url = submission_in.file_url
    else:
        submission = CheckpointSubmission(
            checkpoint_id=checkpoint_id,
            student_id=student_id,
            content=submission_in.content,
            file_url=submission_in.file_url
        )
        db.add(submission)
        
    db.commit()
    db.refresh(submission)
    return submission

def get_team_checkpoints(db: Session, team_id: int):
    return db.query(Checkpoint).filter(Checkpoint.team_id == team_id).all()

def get_checkpoint_by_id(db: Session, checkpoint_id: int):
    cp = db.query(Checkpoint).filter(Checkpoint.id == checkpoint_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Không tìm thấy Checkpoint")
    return cp

def get_user_team_members(db: Session, user_id: int):
    # Tìm các nhóm mà người dùng này tham gia
    member_record = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not member_record:
        return []
    
    team_id = member_record.team_id
    # Lấy tất cả thành viên của nhóm đó
    members = db.query(User).join(TeamMember).filter(TeamMember.team_id == team_id).all()
    
    return members

def get_team_members(db: Session, team_id: int):
    # Lấy tất cả thành viên của nhóm cụ thể
    members = db.query(User).join(TeamMember).filter(TeamMember.team_id == team_id).all()
    return members

def get_user_team_info(db: Session, user_id: int, team_id: int = None):
    """
    Lấy thông tin nhóm của người dùng.
    - Nếu có team_id: Kiểm tra quyền truy cập và trả về nhóm đó.
    - Nếu không có team_id: Trả về nhóm gần nhất (hoặc đầu tiên) mà người dùng tham gia.
    """
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
        
    team = None
    role_lower = user.role.lower()
    
    if role_lower in ["lecturer", "head", "admin", "staff"]:
        if team_id:
            team = db.query(Team).filter(Team.id == team_id).first()
        else:
            if role_lower == "admin":
                team = db.query(Team).first()
            else:
                # Tìm lớp mà giảng viên dạy
                first_class = db.query(Class).filter(Class.lecturer_id == user_id).first()
                if first_class:
                    team = db.query(Team).filter(Team.class_id == first_class.id).first()
                if not team:
                    team = db.query(Team).first()
                    
        if not team:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhóm nào")
            
    else:
        # Logistic dành cho Sinh viên
        if team_id:
            # Kiểm tra xem sinh viên có thực sự nằm trong nhóm này không
            member_record = db.query(TeamMember).filter(
                TeamMember.user_id == user_id, 
                TeamMember.team_id == team_id
            ).first()
            if member_record:
                team = db.query(Team).filter(Team.id == team_id).first()
        else:
            # Lấy nhóm mới nhất mà sinh viên tham gia
            member_record = db.query(TeamMember).filter(TeamMember.user_id == user_id).order_by(TeamMember.id.desc()).first()
            if member_record:
                team = db.query(Team).filter(Team.id == member_record.team_id).first()
        
        if not team:
            return None # Trả về None để Frontend xử lý trạng thái Empty
    
    # Lấy các mốc thời gian (milestones) của dự án
    milestones = []
    if team.project_id:
        project_milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == team.project_id).order_by(ProjectMilestone.order.asc()).all()
        
        for ms in project_milestones:
            # Kiểm tra xem nhóm đã hoàn thành milestone này chưa
            team_ms = db.query(TeamMilestone).filter(
                TeamMilestone.team_id == team.id,
                TeamMilestone.milestone_id == ms.id
            ).first()
            
            milestones.append({
                "id": ms.id,
                "title": ms.title,
                "description": ms.description,
                "is_done": team_ms.is_done if team_ms else False,
                "completed_at": team_ms.completed_at if team_ms else None
            })
    
    # Lấy số lượng thành viên
    member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
    
    # Lấy chi tiết dự án
    project_title = None
    project_desc = None
    if team.project_id:
        project = db.query(Project).filter(Project.id == team.project_id).first()
        if project:
            project_title = project.title
            project_desc = project.description

    # Lấy chi tiết nhóm trưởng
    leader_name = None
    leader_email = None
    if team.leader_id:
        leader = db.query(User).filter(User.id == team.leader_id).first()
        if leader:
            leader_name = leader.full_name
            leader_email = leader.email

    return {
        "id": team.id,
        "name": team.name,
        "leader_id": team.leader_id,
        "leader_name": leader_name,
        "leader_email": leader_email,
        "project_id": team.project_id,
        "project_title": project_title,
        "project_description": project_desc,
        "member_count": member_count,
        "milestones": milestones
    }
