from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from fastapi import HTTPException, status
from app.models.base_models import User
from app.utils.email import send_reset_password_email
from app.core.security import get_password_hash
from app.schemas.user_schemas import UserUpdate

async def generate_password_reset_token(db: Session, email: str):
    """
    Tạo token khôi phục mật khẩu và gửi email hướng dẫn cho người dùng.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Không tiết lộ email có tồn tại hay không vì lý do bảo mật
        return True
    
    # Tạo token ngẫu nhiên
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    # Hết hạn sau 1 giờ
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    # Gửi email thực tế
    await send_reset_password_email(user.email, token)
    return True

def reset_password(db: Session, token: str, new_password: str):
    """
    Đặt lại mật khẩu mới nếu token còn hiệu lực.
    """
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
    """
    Cập nhật thông tin hồ sơ người dùng.
    Hỗ trợ đổi mật khẩu nếu có trường 'password'.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        user.password_hash = get_password_hash(update_data["password"])
        del update_data["password"]
    
    # Cập nhật các trường dữ liệu động
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100, role: str = None):
    """
    Lấy danh sách người dùng, có thể lọc theo vai trò.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    """
    Tìm người dùng qua ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return user

def delete_user(db: Session, user_id: int):
    """
    Xóa tài khoản người dùng khỏi hệ thống.
    """
    user = get_user_by_id(db, user_id)
    db.delete(user)
    db.commit()
    return True
