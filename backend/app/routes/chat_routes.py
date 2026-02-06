from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import chat_service, resource_service
from app.schemas.chat_schemas import ChatMessageOut, ChatHistoryResponse
from app.models.base_models import User

router = APIRouter()

from app.routes.security_deps import verify_team_access
from app.socket_events import sio

@router.get("/teams/{team_id}", response_model=ChatHistoryResponse, dependencies=[Depends(verify_team_access)])
def get_team_chat(team_id: int, page: int = 1, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages, total = chat_service.get_team_chat_history(db, team_id, page, limit)
    return {
        "messages": messages,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("/teams/{team_id}/upload", response_model=ChatMessageOut)
async def upload_chat_file(team_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    file_url = resource_service.upload_file(file)
    file_type = file.content_type.split('/')[0] if file.content_type else "file"
    saved_msg = chat_service.save_chat_file(db, team_id, current_user.id, file_url, file_type)
    
    # Broadcast to socket
    try:
        msg_data = ChatMessageOut.model_validate(saved_msg)
        msg_dict = msg_data.model_dump()
        msg_dict['created_at'] = msg_dict['created_at'].isoformat() if msg_dict.get('created_at') else None
        msg_dict['sender_name'] = current_user.full_name
        
        await sio.emit('receive_message', msg_dict, room=f"team_{team_id}")
    except Exception as e:
        print(f"Error broadcasting chat message: {e}")
    
    return saved_msg

# --- Room Endpoints ---

from app.schemas.chat_schemas import ChatRoomCreate, ChatRoomOut
from app.routes.security_deps import verify_room_access

@router.post("/rooms", response_model=ChatRoomOut)
def create_room(room_in: ChatRoomCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return chat_service.create_chat_room(db, room_in, current_user.id)

@router.get("/rooms", response_model=List[ChatRoomOut])
def list_my_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return chat_service.get_user_rooms(db, current_user.id)

@router.get("/rooms/{room_id}", response_model=ChatHistoryResponse, dependencies=[Depends(verify_room_access)])
def get_room_chat(room_id: int, page: int = 1, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages, total = chat_service.get_room_chat_history(db, room_id, page, limit)
    return {
        "messages": messages,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("/rooms/{room_id}/upload", response_model=ChatMessageOut, dependencies=[Depends(verify_room_access)])
async def upload_room_chat_file(room_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_url = resource_service.upload_file(file)
    file_type = file.content_type.split('/')[0] if file.content_type else "file"
    saved_msg = chat_service.save_chat_file(db, None, current_user.id, file_url, file_type, room_id=room_id)
    
    # Broadcast to socket
    try:
        msg_data = ChatMessageOut.model_validate(saved_msg)
        msg_dict = msg_data.model_dump()
        msg_dict['created_at'] = msg_dict['created_at'].isoformat() if msg_dict.get('created_at') else None
        msg_dict['sender_name'] = current_user.full_name
        
        await sio.emit('receive_message', msg_dict, room=f"room_{room_id}")
    except Exception as e:
        print(f"Error broadcasting chat message: {e}")
    
    return saved_msg

# --- Text Message Endpoints ---
from app.schemas.chat_schemas import ChatMessageCreate

@router.post("/teams/{team_id}/messages", response_model=ChatMessageOut)
async def send_team_message(team_id: int, msg_in: ChatMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.routes.security_deps import verify_team_access_manual
    verify_team_access_manual(db, current_user.id, team_id, current_user.role)
    msg_in.team_id = team_id
    msg_in.sender_id = current_user.id
    msg_in.is_file = False
    
    saved_msg = chat_service.save_message(db, msg_in)
    
    # Broadcast to socket
    msg_data = ChatMessageOut.from_orm(saved_msg)
    # Serialize datetime for JSON
    msg_dict = msg_data.dict()
    msg_dict['created_at'] = msg_dict['created_at'].isoformat()
    if not msg_dict.get('sender_name'):
        msg_dict['sender_name'] = current_user.full_name
        
    await sio.emit('receive_message', msg_dict, room=f"team_{team_id}")
    
    return saved_msg

@router.post("/rooms/{room_id}/messages", response_model=ChatMessageOut, dependencies=[Depends(verify_room_access)])
async def send_room_message(room_id: int, msg_in: ChatMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg_in.room_id = room_id
    msg_in.sender_id = current_user.id
    msg_in.is_file = False
    
    saved_msg = chat_service.save_message(db, msg_in)
    
    # Broadcast to socket
    msg_data = ChatMessageOut.from_orm(saved_msg)
    msg_dict = msg_data.dict()
    msg_dict['created_at'] = msg_dict['created_at'].isoformat()
    if not msg_dict.get('sender_name'):
        msg_dict['sender_name'] = current_user.full_name
        
    await sio.emit('receive_message', msg_dict, room=f"room_{room_id}")
    
    return saved_msg
