import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
# Import all models
from app.models import base_models, project_models, comm_models, eval_models
from app.models.comm_models import Resource

def cleanup_invalid_resources():
    db = SessionLocal()
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "uploads")
    
    try:
        resources = db.query(Resource).all()
        to_delete = []
        
        for r in resources:
            filename = r.file_url.split("/")[-1]
            file_path = os.path.join(upload_dir, filename)
            
            if not os.path.exists(file_path):
                print(f"File không tồn tại: {file_path}. Sẽ xóa bản ghi ID {r.id}")
                to_delete.append(r)
        
        for r in to_delete:
            db.delete(r)
            
        db.commit()
        print(f"Đã xóa {len(to_delete)} bản ghi lỗi.")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_invalid_resources()
