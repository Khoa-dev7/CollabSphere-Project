# app/services/file_upload.py
import uuid
import os

UPLOAD_DIR = "uploads/chat"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_chat_file(file):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(file.file.read())

    return f"/static/chat/{filename}"
