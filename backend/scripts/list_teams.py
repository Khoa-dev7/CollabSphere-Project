import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
# Import all models
from app.models import base_models, project_models, comm_models, eval_models
from app.models.project_models import Team

def list_teams():
    db = SessionLocal()
    try:
        teams = db.query(Team).all()
        print(f"Tổng cộng có {len(teams)} nhóm trong DB:")
        for t in teams:
            print(f"ID: {t.id} | Name: {t.name}")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_teams()
