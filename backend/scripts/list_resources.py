import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.comm_models import Resource

def list_resources():
    db = SessionLocal()
    try:
        resources = db.query(Resource).all()
        print(f"Tổng cộng có {len(resources)} tài nguyên trong DB:")
        for r in resources:
            print(f"ID: {r.id} | Name: {r.name} | URL: {r.file_url}")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_resources()
