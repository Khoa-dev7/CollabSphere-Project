from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.db.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.schemas.user_schemas import UserOut, Token, LoginRequest, UserCreate, ForgotPasswordRequest, ResetPasswordRequest
from app.services import auth_service, user_service
from app.models.base_models import User

router = APIRouter()

# Cấu hình OAuth2 với URL đăng nhập
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Dependency để lấy thông tin người dùng hiện tại từ JWT Token.
    Được sử dụng để bảo vệ các API yêu cầu đăng nhập.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã và xác thực token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Tìm kiếm người dùng trong cơ sở dữ liệu
    user = auth_service.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
        
    # Kiểm tra nếu tài khoản bị khóa
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản của bạn đã bị khóa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

async def get_optional_user(db: Session = Depends(get_db), token: str | None = Depends(oauth2_scheme)):
    """
    Dependency lấy thông tin người dùng nếu có token (không bắt buộc).
    Sử dụng cho các API có thể hoạt động ở chế độ khách hoặc thành viên.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return auth_service.get_user_by_username(db, username=username)
    except Exception:
        return None

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    API Đăng nhập: Kiểm tra thông tin và cấp mã truy cập (Access & Refresh Token).
    """
    username = form_data.username
    password = form_data.password
        
    user = auth_service.authenticate_user(db, LoginRequest(username=username, password=password))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Tạo JSON Web Token
    access_token = create_access_token(subject=user.username)
    refresh_token = create_refresh_token(subject=user.username)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    API Làm mới Access Token khi đã hết hạn sử dụng Refresh Token.
    """
    return auth_service.refresh_access_token(db, refresh_token)

@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    API Đăng xuất: Ghi lại lịch sử thoát hệ thống.
    """
    auth_service.log_user_logout(db, current_user.id)
    return {"message": "Đăng xuất thành công"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin chi tiết của người dùng đang đăng nhập.
    """
    return current_user

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    API Đăng ký tài khoản mới.
    """
    return auth_service.create_user(db, user_in)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    API Quên mật khẩu: Gửi email chứa token khôi phục.
    """
    await user_service.generate_password_reset_token(db, request.email)
    return {"message": "Nếu email tồn tại, một mã khôi phục đã được gửi đi."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    API Đặt lại mật khẩu mới thông qua token khôi phục.
    """
    user_service.reset_password(db, request.token, request.new_password)
    return {"message": "Mật khẩu đã được khôi phục thành công."}
