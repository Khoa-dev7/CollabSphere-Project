from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from app.models import models
from app.core.security import get_password_hash
from app.core.deps import get_current_user
from app.models.models import UserRole

router = APIRouter(prefix="/import/users", tags=["Import Excel"])


@router.post("")
def import_users(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Chỉ ADMIN được import")

    df = pd.read_excel(file.file)

    success = 0
    errors = []

    for index, row in df.iterrows():
        try:
            if db.query(models.User).filter_by(email=row["email"]).first():
                raise Exception("Email đã tồn tại")

            user = models.User(
                email=row["email"],
                full_name=row["full_name"],
                hashed_password=get_password_hash(str(row["password"])),
                role=UserRole(row["role"]),
                is_active=True
            )
            db.add(user)
            db.commit()
            success += 1

        except Exception as e:
            db.rollback()
            errors.append({
                "row": index + 2,
                "error": str(e)
            })

    return {
        "imported": success,
        "failed": len(errors),
        "errors": errors
    }
