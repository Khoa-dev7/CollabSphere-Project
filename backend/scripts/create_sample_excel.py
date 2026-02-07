import sys
import os
import csv

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.base_models import User
from app.models.project_models import Class

def create_sample():
    db = SessionLocal()
    try:
        # Lấy tất cả sinh viên
        students = db.query(User).filter(User.role == 'Student').all()
        
        # Thử lấy lớp CLS002 làm ví dụ
        target_class = db.query(Class).filter(Class.name == 'CLS002').first()
        
        # Nếu không có lớp nào, lấu đại 1 lớp
        if not target_class:
            target_class = db.query(Class).first()

        f_path = os.path.join(os.path.dirname(__file__), '..', '..', 'file_nhan_vien_nhap_mau.csv')
        
        with open(f_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            # Sử dụng tiêu đề Tiếng Việt
            writer.writerow(['mã lớp', 'tên lớp', 'mã sinh viên', 'username của sinh viên'])
            
            for s in students:
                writer.writerow([
                    target_class.id if target_class else '1',
                    target_class.name if target_class else 'Lớp Mẫu',
                    s.id,
                    s.username
                ])
        
        print(f"SUCCESS: File created at {os.path.abspath(f_path)}")
        print(f"Sample contains {len(students)} students.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_sample()
