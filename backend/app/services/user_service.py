from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from fastapi import HTTPException, status
from app.models.base_models import User
from app.utils.email import send_reset_password_email
from app.core.security import get_password_hash
from app.schemas.user_schemas import UserUpdate

async def generate_password_reset_token(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Chúng ta không muốn làm lộ sự tồn tại của người dùng, nhưng để phát triển nội bộ thì có thể bỏ qua.
        # Tuy nhiên, tuân thủ các thực hành tốt nhất:
        return True
    
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    await send_reset_password_email(user.email, token)
    return True

def reset_password(db: Session, token: str, new_password: str):
    user = db.query(User).filter(
        User.reset_token == token,
        User.reset_token_expiry > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Mã khôi phục không hợp lệ hoặc đã hết hạn")
    
    user.password_hash = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return True

def update_user_profile(db: Session, user_id: int, user_in: UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        user.password_hash = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100, role: str = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    db.delete(user)
    db.commit()
    return True
