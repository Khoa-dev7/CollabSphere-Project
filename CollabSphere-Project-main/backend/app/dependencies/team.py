from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.core.deps import get_current_user


# =====================================================
# GET TEAM MEMBER
# =====================================================
def get_team_member(
    team_id: int,
    db: Session,
    user_id: int
):
    return (
        db.query(models.TeamMember)
        .filter_by(team_id=team_id, user_id=user_id)
        .first()
    )


# =====================================================
# CHECK USER THUỘC TEAM
# =====================================================
def check_team_member(
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    member = get_team_member(team_id, db, current_user.id)
    if not member:
        raise HTTPException(
            status_code=403,
            detail="Không thuộc team"
        )
    return member


# =====================================================
# REQUIRE ROLE (LEADER / MEMBER)
# =====================================================
def require_roles(*roles):
    def checker(
        team_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
    ):
        member = get_team_member(team_id, db, current_user.id)
        if not member:
            raise HTTPException(
                status_code=403,
                detail="Không thuộc team"
            )

        if member.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Không đủ quyền"
            )

        return member

    return checker


# =====================================================
# VALIDATE SỐ LƯỢNG THÀNH VIÊN TỐI ĐA
# =====================================================
def check_team_capacity(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).get(team_id)
    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team không tồn tại"
        )

    current_members = (
        db.query(models.TeamMember)
        .filter(models.TeamMember.team_id == team_id)
        .count()
    )

    # Nếu chưa có field max_members → mặc định 5
    max_members = getattr(team, "max_members", 5)

    if current_members >= max_members:
        raise HTTPException(
            status_code=400,
            detail="Nhóm đã đủ số lượng thành viên"
        )

    return team


# =====================================================
# REQUIRE SỐ THÀNH VIÊN TỐI THIỂU (PEER REVIEW)
# =====================================================
def require_min_team_members(
    team_id: int,
    min_members: int = 2,
    db: Session = Depends(get_db)
):
    count = (
        db.query(models.TeamMember)
        .filter(models.TeamMember.team_id == team_id)
        .count()
    )

    if count < min_members:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Nhóm phải có ít nhất {min_members} "
                "thành viên để thực hiện peer review"
            )
        )

    return True
