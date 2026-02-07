import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.base_models import User
from app.models.project_models import Class

def get_import_info():
    db = SessionLocal()
    try:
        # 1. Tìm ID của lớp CLS002
        # Giả sử "CLS002" là code hoặc một phần của tên
        target_class = db.query(Class).filter((Class.code == "CLS002") | (Class.name.contains("CLS002"))).first()
        
        if not target_class:
            print("ERROR: Không tìm thấy lớp CLS002.")
            # List all classes to help debugging
            classes = db.query(Class).all()
            print("Các lớp hiện có:")
            for c in classes:
                print(f"ID: {c.id} | Code: {c.code} | Name: {c.name}")
            return

        print(f"CLASS_ID: {target_class.id}")

        # 2. Lấy danh sách toàn bộ sinh viên
        students = db.query(User).filter(User.role == "Student").all()
        print(f"STUDENT_COUNT: {len(students)}")
        for s in students:
            print(f"STUDENT: {s.username}")

    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    get_import_info()
