from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.schemas.schemas import UserResponse, UserUpdate
from app.core.deps import get_current_user
from app.core.security import get_password_hash

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
def get_profile(
    current_user: models.User = Depends(get_current_user),
):
    """
    Lấy thông tin profile của user đang đăng nhập
    """
    return current_user


@router.put(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Cập nhật profile:
    - full_name (optional)
    - password (optional, >= 6 ký tự)
    """

    if data.full_name is not None:
        current_user.full_name = data.full_name

    if data.password is not None:
        if len(data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu phải ≥ 6 ký tự"
            )

        # bcrypt chỉ nhận tối đa 72 bytes
        current_user.hashed_password = get_password_hash(
            data.password[:72]
        )

    db.commit()
    db.refresh(current_user)
    return current_user
