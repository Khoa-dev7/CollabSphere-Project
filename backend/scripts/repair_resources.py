import sys
import os
import uuid
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.comm_models import Resource

def repair_resources():
    db = SessionLocal()
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "uploads")
    
    if not os.path.exists(upload_dir):
        print(f"Directory not found: {upload_dir}")
        return

    files = [f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))]
    print(f"Tìm thấy {len(files)} tệp tin trong thư mục uploads.")

    team_id = 5 # Nhóm 1
    owner_id = 5 # student_test

    for filename in files:
        # Check if resource already exists with this filename in URL
        existing = db.query(Resource).filter(Resource.file_url.like(f"%{filename}")).first()
        if existing:
            print(f"Tài nguyên đã tồn tại cho tệp: {filename}")
            continue

        # Create new resource
        new_resource = Resource(
            name=filename, # fallback name
            file_type="pdf" if filename.endswith(".pdf") else "other",
            file_url=f"http://localhost:8000/api/static/uploads/{filename}",
            owner_id=owner_id,
            team_id=team_id,
            created_at=datetime.utcnow()
        )
        db.add(new_resource)
        print(f"Đã đăng ký tài nguyên mới cho tệp: {filename}")

    try:
        db.commit()
        print("Sửa lỗi hoàn tất!")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_resources()
