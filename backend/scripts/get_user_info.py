import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
# Import all models
from app.models import base_models, project_models, comm_models, eval_models
from app.models.base_models import User

def get_user_info(user_id):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            print(f"User ID: {user.id} | Username: {user.username} | Role: {user.role} | Full Name: {user.full_name}")
        else:
            print("Không tìm thấy người dùng.")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    get_user_info(5)
