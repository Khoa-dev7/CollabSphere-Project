from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import models
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import (
    get_current_user,
    get_password_hash,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# =====================
# GET PROFILE
# =====================
@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: models.User = Depends(get_current_user),
):
    return current_user


# =====================
# UPDATE PROFILE
# =====================
@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name

    if data.password:
        current_user.hashed_password = get_password_hash(
            data.password
        )

    db.commit()
    db.refresh(current_user)

    return current_user
