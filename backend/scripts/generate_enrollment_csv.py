import sys
import os
import csv

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models import base_models, project_models, comm_models, eval_models
from app.models.base_models import User
from app.models.project_models import Class

def generate_csv():
    db = SessionLocal()
    try:
        # 1. Tìm ID của lớp có tên CLS002
        target_class = db.query(Class).filter(Class.name == "CLS002").first()
        
        if not target_class:
            print("CLS002 không tồn tại. Đang tạo mới...")
            # Lấy đại 1 giảng viên để gán vào lớp
            lecturer = db.query(User).filter(User.role == "Lecturer").first()
            if not lecturer:
                print("ERROR: Không có giảng viên nào trong hệ thống để gán vào lớp.")
                return
            
            target_class = Class(name="CLS002", lecturer_id=lecturer.id)
            db.add(target_class)
            db.commit()
            db.refresh(target_class)
            print(f"Đã tạo lớp CLS002 với ID: {target_class.id}")

        print(f"Sử dụng lớp: {target_class.name} (ID: {target_class.id})")

        # 2. Lấy danh sách toàn bộ sinh viên
        students = db.query(User).filter(User.role == "Student").all()
        
        # 3. Tạo file CSV
        csv_file = os.path.join(os.path.dirname(__file__), '..', 'import_students_CLS002.csv')
        with open(csv_file, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['class_id', 'student_username'])
            for s in students:
                writer.writerow([target_class.id, s.username])
        
        print(f"SUCCESS: Đã tạo file tại {os.path.abspath(csv_file)}")
        print(f"Tổng số sinh viên: {len(students)}")

    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_csv()
