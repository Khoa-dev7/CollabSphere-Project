import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
# Import all models to ensure SQLAlchemy mappers are initialized correctly
from app.models import base_models, project_models, comm_models, eval_models
from app.models.comm_models import Resource

def migrate_resource_urls():
    db = SessionLocal()
    try:
        resources = db.query(Resource).filter(Resource.file_url.like('%http://localhost:5000%')).all()
        if not resources:
            print("Không tìm thấy tài liệu nào cần cập nhật port.")
            return

        print(f"Tìm thấy {len(resources)} tài liệu cần cập nhật.")
        for r in resources:
            old_url = r.file_url
            new_url = old_url.replace("http://localhost:5000", "http://localhost:8000")
            r.file_url = new_url
            print(f"Cập nhật: {old_url} -> {new_url}")
        
        db.commit()
        print("Cập nhật dữ liệu thành công!")
    except Exception as e:
        print(f"Lỗi khi cập nhật dữ liệu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_resource_urls()
