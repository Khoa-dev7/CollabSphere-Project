from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.database import get_db
from app.models import models
from app.schemas.schemas import (
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.core.security import get_password_hash

router = APIRouter(tags=["Password"], prefix="/password")


# ==========================
# 1️⃣ GỬI OTP RESET PASSWORD
# ==========================
@router.post("/forgot")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại")

    # 🔹 Sinh mã OTP 6 chữ số
    reset_code = f"{random.randint(0, 999999):06d}"

    user.reset_code = reset_code
    user.reset_code_expire = datetime.utcnow() + timedelta(minutes=10)

    db.commit()

    # 🚨 DEMO: trả OTP ra luôn
    return {
        "message": "Mã reset mật khẩu đã được gửi",
        "reset_code": reset_code
    }


# ==========================
# 2️⃣ XÁC NHẬN RESET PASSWORD
# ==========================
@router.post("/reset")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại")

    if (
        user.reset_code != data.code
        or not user.reset_code_expire
        or user.reset_code_expire < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=400,
            detail="Mã xác thực không hợp lệ hoặc đã hết hạn"
        )

    user.hashed_password = get_password_hash(data.new_password[:72])

    # 🔹 Xoá OTP sau khi dùng
    user.reset_code = None
    user.reset_code_expire = None

    db.commit()

    return {"message": "Đổi mật khẩu thành công"}
