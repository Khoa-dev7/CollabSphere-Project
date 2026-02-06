from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.models.base_models import User
from app.models.project_models import TeamMember

def verify_team_access(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Xác minh xem người dùng hiện tại có thuộc về team được chỉ định hay không.
    """
    if current_user.role in ["Admin", "Lecturer", "Head"]:
        return True
        
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập vào dữ liệu của nhóm này"
        )
    return True

from app.models.project_models import Team

def verify_team_leader(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Kiểm tra xem người dùng hiện tại có phải là NHÓM TRƯỞNG của nhóm được chỉ định hay không.
    """
    if current_user.role in ["Admin", "Lecturer", "Head"]:
        return True
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")
        
    if team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Nhóm trưởng mới có quyền thực hiện hành động này"
        )
    return True

def verify_user_owner(target_user_id: int, current_user: User = Depends(get_current_user)):
    """
    Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của dữ liệu (target_user_id) hay không.
    """
    if current_user.role == "Admin":
        return True
        
    if current_user.id != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập vào dữ liệu của người dùng khác"
        )
    return True

def verify_team_access_manual(db: Session, user_id: int, team_id: int, user_role: str):
    """
    Xác minh quyền truy cập team thủ công (thường dùng trong routes không có dependencies).
    """
    if user_role in ["Admin", "Lecturer", "Head"]:
        return True
    
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không thuộc nhóm này"
        )
    return True

def verify_room_access(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.comm_models import ChatRoomMember
    
    # Admin possibly can see all rooms? Let's say yes for now
    if current_user.role == "Admin":
        return True
        
    membership = db.query(ChatRoomMember).filter(
        ChatRoomMember.room_id == room_id,
        ChatRoomMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this chat room"
        )
    return True
