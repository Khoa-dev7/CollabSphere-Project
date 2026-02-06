from sqlalchemy.orm import Session
from app.models.comm_models import ChatMessage, ChatRoom, ChatRoomMember
from app.schemas.chat_schemas import ChatMessageCreate, ChatRoomCreate

def save_message(db: Session, msg_in: ChatMessageCreate):
    db_msg = ChatMessage(**msg_in.dict())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_team_chat_history(db: Session, team_id: int, page: int = 1, limit: int = 50):
    offset = (page - 1) * limit
    messages = db.query(ChatMessage).filter(ChatMessage.team_id == team_id).order_by(ChatMessage.created_at.desc()).offset(offset).limit(limit).all()
    total = db.query(ChatMessage).filter(ChatMessage.team_id == team_id).count()
    # Map sender names
    for m in messages:
        m.sender_name = m.sender.full_name if m.sender else "Unknown"
    return messages, total

def get_room_chat_history(db: Session, room_id: int, page: int = 1, limit: int = 50):
    offset = (page - 1) * limit
    messages = db.query(ChatMessage).filter(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.desc()).offset(offset).limit(limit).all()
    total = db.query(ChatMessage).filter(ChatMessage.room_id == room_id).count()
    # Map sender names
    for m in messages:
        m.sender_name = m.sender.full_name if m.sender else "Unknown"
    return messages, total

def save_chat_file(db: Session, team_id: int, sender_id: int, file_url: str, file_type: str, room_id: int = None):
    db_msg = ChatMessage(
        team_id=team_id,
        room_id=room_id,
        sender_id=sender_id,
        file_url=file_url,
        file_type=file_type,
        is_file=True,
        content=f"Đã gửi một {file_type}"
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def create_chat_room(db: Session, room_in: ChatRoomCreate, creator_id: int):
    db_room = ChatRoom(
        name=room_in.name,
        is_group=room_in.is_group,
        created_by=creator_id
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    
    # Add creator
    db.add(ChatRoomMember(room_id=db_room.id, user_id=creator_id))
    
    # Add other members
    for uid in room_in.member_ids:
        if uid != creator_id:
            db.add(ChatRoomMember(room_id=db_room.id, user_id=uid))
            
    db.commit()
    return db_room

def get_user_rooms(db: Session, user_id: int):
    # Join ChatRoomMember to find rooms for user
    return db.query(ChatRoom).join(ChatRoomMember).filter(ChatRoomMember.user_id == user_id).all()
