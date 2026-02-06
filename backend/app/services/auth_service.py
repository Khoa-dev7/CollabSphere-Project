from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.base_models import User
from app.schemas.user_schemas import UserCreate, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.services.activity_log_service import log_activity
from jose import jwt
from app.core.config import settings

def authenticate_user(db: Session, login_data: LoginRequest):
    """
    Xác thực thông tin đăng nhập của người dùng.
    Kiểm tra tên đăng nhập/email và mật khẩu.
    """
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username)
    ).first()
    if not user:
        return False
    # Kiểm tra mật khẩu (đã hash)
    if not verify_password(login_data.password, user.password_hash):
        log_activity(db, user.id, "Đăng nhập thất bại: Sai mật khẩu", "auth")
        return False
        
    # Kiểm tra trạng thái tài khoản
    if not user.is_active:
        log_activity(db, user.id, "Đăng nhập bị từ chối: Tài khoản bị khóa", "auth")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin."
        )

    log_activity(db, user.id, "Đăng nhập thành công", "auth")
    return user

def get_user_by_username(db: Session, username: str):
    """
    Tìm kiếm người dùng theo tên đăng nhập.
    """
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user_in: UserCreate):
    """
    Tạo người dùng mới trong hệ thống (Đăng ký).
    """
    # Kiểm tra trùng lặp tên đăng nhập/email
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã được đăng ký")
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        password_hash=get_password_hash(user_in.password), # Hash mật khẩu trước khi lưu
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    log_activity(db, db_user.id, "Đã đăng ký tài khoản", "auth")
    return db_user

def refresh_access_token(db: Session, refresh_token: str):
    """
    Cấp Access Token mới dựa trên Refresh Token hợp lệ.
    """
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("token_type") != "refresh":
            raise HTTPException(status_code=401, detail="Mã làm mới không hợp lệ")
        
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Dữ liệu mã làm mới không hợp lệ")
            
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Không tìm thấy người dùng")
            
        new_access_token = create_access_token(subject=user.username)
        return {"access_token": new_access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Không thể xác thực mã làm mới")

def log_user_logout(db: Session, user_id: int):
    """
    Ghi nhật ký khi người dùng đăng xuất.
    """
    log_activity(db, user_id, "Người dùng đăng xuất", "auth")
