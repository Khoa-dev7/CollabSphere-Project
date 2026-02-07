import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
# Import all models
from app.models import base_models, project_models, comm_models, eval_models
from app.models.comm_models import Resource

def list_resources_detailed():
    db = SessionLocal()
    try:
        resources = db.query(Resource).all()
        print(f"Tổng cộng có {len(resources)} tài nguyên trong DB:")
        for r in resources:
            print(f"ID: {r.id}")
            print(f"  Name: {r.name}")
            print(f"  URL: {r.file_url}")
            print(f"  Team ID: {r.team_id}")
            print(f"  Owner ID: {r.owner_id}")
            print(f"  Created At: {r.created_at}")
            print("-" * 20)
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_resources_detailed()
