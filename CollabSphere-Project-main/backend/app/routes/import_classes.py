from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from app.models import models
from app.core.deps import get_current_user
from app.models.models import UserRole

router = APIRouter(prefix="/import/classes", tags=["Import Excel"])


@router.post("")
def import_classes(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.LECTURER]:
        raise HTTPException(status_code=403, detail="Không đủ quyền")

    df = pd.read_excel(file.file)

    success = 0
    errors = []

    for index, row in df.iterrows():
        try:
            subject = db.query(models.Subject).get(row["subject_id"])
            if not subject:
                raise Exception("Subject không tồn tại")

            cls = models.Class(
                name=row["name"],
                code=row["code"],
                subject_id=row["subject_id"],
                lecturer_id=row.get("lecturer_id")
            )
            db.add(cls)
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
