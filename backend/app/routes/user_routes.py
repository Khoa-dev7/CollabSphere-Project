from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import user_service
from app.schemas.user_schemas import UserOut, UserUpdate
from app.models.base_models import User
from app.core.permissions import PermissionChecker, Permissions
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return user_service.update_user_profile(db, current_user.id, user_in)

@router.get("/", response_model=List[UserOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def list_users(role: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_service.get_users(db, skip, limit, role)

@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def view_user(user_id: int, db: Session = Depends(get_db)):
    return user_service.get_user_by_id(db, user_id)

@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def admin_update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    return user_service.update_user_profile(db, user_id, user_in)

@router.delete("/{user_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user_service.delete_user(db, user_id)
    return {"message": "Xóa người dùng thành công"}
