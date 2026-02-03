import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File

router = APIRouter(prefix="", tags=["Files"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # đảm bảo thư mục tồn tại

@router.post("/upload/")
def upload(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, name)

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {
        "filename": name,
        "url": f"/static/{name}"
    }
