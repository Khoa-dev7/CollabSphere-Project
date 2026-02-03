from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.schemas.schemas import (
    TeamCreate,
    TeamResponse,
    AddMemberRequest
)
from app.core.deps import get_current_user
from app.services.notification_service import create_notification
from app.dependencies.team import (
    check_team_member,
    require_roles
)

router = APIRouter(prefix="/teams", tags=["Teams"])

MAX_TEAM_MEMBERS = 5


# =====================================================
# CREATE TEAM
# =====================================================
@router.post("/", response_model=TeamResponse)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    team = models.Team(
        name=data.name,
        class_id=data.class_id,
        project_id=data.project_id,
        created_by=current_user.id
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    leader = models.TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role=models.TeamRole.LEADER
    )
    db.add(leader)
    db.commit()

    return team


# =====================================================
# ADD MEMBER (LEADER ONLY + NOTIFICATION)
# =====================================================
@router.post(
    "/{team_id}/members",
    dependencies=[Depends(require_roles(models.TeamRole.LEADER))]
)
def add_member(
    team_id: int,
    data: AddMemberRequest,
    db: Session = Depends(get_db)
):
    team = db.get(models.Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team không tồn tại")

    count = (
        db.query(models.TeamMember)
        .filter_by(team_id=team_id)
        .count()
    )
    if count >= MAX_TEAM_MEMBERS:
        raise HTTPException(
            status_code=400,
            detail=f"Team đã đủ {MAX_TEAM_MEMBERS} thành viên"
        )

    exists = (
        db.query(models.TeamMember)
        .filter_by(team_id=team_id, user_id=data.user_id)
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="User đã trong team")

    member = models.TeamMember(
        team_id=team_id,
        user_id=data.user_id,
        role=models.TeamRole.MEMBER
    )
    db.add(member)
    db.commit()

    # 🔔 Notification realtime
    create_notification(
        db=db,
        user_id=data.user_id,
        title="Bạn đã được thêm vào nhóm",
        message=f"Bạn đã được thêm vào nhóm '{team.name}'",
        type="team"
    )

    return {"message": "Đã thêm thành viên"}


# =====================================================
# REMOVE MEMBER (LEADER ONLY + NOTIFICATION)
# =====================================================
@router.delete(
    "/{team_id}/members/{user_id}",
    dependencies=[Depends(require_roles(models.TeamRole.LEADER))]
)
def remove_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Leader không thể tự xoá chính mình"
        )

    member = (
        db.query(models.TeamMember)
        .filter_by(team_id=team_id, user_id=user_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Thành viên không tồn tại")

    team = db.get(models.Team, team_id)

    db.delete(member)
    db.commit()

    # 🔔 Notification realtime
    create_notification(
        db=db,
        user_id=user_id,
        title="Bạn đã bị xoá khỏi nhóm",
        message=f"Bạn đã bị xoá khỏi nhóm '{team.name}'",
        type="team"
    )

    return {"message": "Đã xóa thành viên"}


# =====================================================
# LIST MEMBERS (MEMBER / LEADER)
# =====================================================
@router.get(
    "/{team_id}/members",
    dependencies=[Depends(check_team_member)]
)
def list_members(
    team_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(models.User)
        .join(models.TeamMember)
        .filter(models.TeamMember.team_id == team_id)
        .all()
    )
