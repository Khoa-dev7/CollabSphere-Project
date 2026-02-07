import sys
import os
import pandas as pd

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.base_models import User
from app.models.project_models import Class

def create_xlsx_sample():
    db = SessionLocal()
    try:
        # Lấy tất cả sinh viên
        students = db.query(User).filter(User.role == 'Student').all()
        
        # Thử lấy lớp CLS002 làm ví dụ
        target_class = db.query(Class).filter(Class.name == 'CLS002').first()
        if not target_class:
            target_class = db.query(Class).first()

        data = []
        for s in students:
            data.append({
                'mã lớp': target_class.id if target_class else 1,
                'tên lớp': target_class.name if target_class else 'Lớp Mẫu',
                'mã sinh viên': s.id,
                'username của sinh viên': s.username
            })
        
        df = pd.DataFrame(data)
        f_path = os.path.join(os.path.dirname(__file__), '..', '..', 'file_mau_nhap_lieu.xlsx')
        
        # Lưu file XLSX
        df.to_excel(f_path, index=False)
        
        print(f"SUCCESS: File created at {os.path.abspath(f_path)}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_xlsx_sample()
