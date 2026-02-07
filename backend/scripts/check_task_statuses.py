import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.project_models import Task

def check_task_statuses():
    db = SessionLocal()
    try:
        tasks = db.query(Task).all()
        print(f"Tổng cộng có {len(tasks)} nhiệm vụ:")
        for t in tasks:
            print(f"ID: {t.id} | Title: {t.title} | Status: '{t.status}'")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_task_statuses()
