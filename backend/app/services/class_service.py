import pandas as pd
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.project_models import ClassMember
import io

def import_class_members_from_excel(db: Session, file: UploadFile):
    """
    Import sinh viên vào lớp từ tệp Excel.
    Hỗ trợ các cột: class_id (mã lớp), class_name (tên lớp), student_id (mã sinh viên), student_username (username).
    """
    content = file.file.read()
    # Thử đọc Excel, hỗ trợ cả định dạng CSV nếu cần
    try:
        df = pd.read_excel(io.BytesIO(content))
    except:
        # Nếu không phải Excel, thử đọc CSV
        file.file.seek(0)
        df = pd.read_csv(io.BytesIO(content))
    
    # Chuẩn hóa tên cột hỗ trợ cả Tiếng Việt và Tiếng Anh
    column_mapping = {
        'class_id': ['class_id', 'mã lớp', 'ma lop'],
        'class_name': ['class_name', 'tên lớp', 'ten lop'],
        'student_id': ['student_id', 'mã sinh viên', 'ma sinh vien', 'mssv'],
        'student_username': ['student_username', 'username của sinh viên', 'username cua sinh vien', 'username']
    }
    
    found_columns = {}
    for target, variations in column_mapping.items():
        for col in df.columns:
            if str(col).lower().strip() in variations:
                found_columns[target] = col
                break

    if not found_columns.get('class_id') and not found_columns.get('class_name'):
        raise HTTPException(status_code=400, detail="Thiếu cột nhận diện lớp học (mã lớp hoặc tên lớp)")
    
    if not found_columns.get('student_id') and not found_columns.get('student_username'):
        raise HTTPException(status_code=400, detail="Thiếu cột nhận diện sinh viên (mã sinh viên hoặc username)")

    from app.models.base_models import User
    from app.models.project_models import Class
    
    added_count = 0
    skipped_count = 0
    errors = []
    
    for idx, row in df.iterrows():
        try:
            class_obj = None
            student_obj = None
            
            # 1. Tìm Lớp (Ưu tiên ID, sau đó đến Tên)
            if 'class_id' in found_columns:
                c_id = row[found_columns['class_id']]
                if pd.notna(c_id):
                    try:
                        class_obj = db.query(Class).filter(Class.id == int(c_id)).first()
                    except: pass
            
            if not class_obj and 'class_name' in found_columns:
                c_name = str(row[found_columns['class_name']]).strip()
                if c_name and c_name != 'nan':
                    class_obj = db.query(Class).filter(Class.name == c_name).first()
            
            if not class_obj:
                errors.append(f"Dòng {idx + 2}: Không tìm thấy lớp học.")
                skipped_count += 1
                continue

            # 2. Tìm Sinh viên (Ưu tiên ID, sau đó đến Username)
            if 'student_id' in found_columns:
                s_id = row[found_columns['student_id']]
                if pd.notna(s_id):
                    try:
                        student_obj = db.query(User).filter(User.id == int(s_id), User.role == "Student").first()
                    except: pass
            
            if not student_obj and 'student_username' in found_columns:
                s_username = str(row[found_columns['student_username']]).strip()
                if s_username and s_username != 'nan':
                    student_obj = db.query(User).filter(User.username == s_username, User.role == "Student").first()
            
            if not student_obj:
                errors.append(f"Dòng {idx + 2}: Không tìm thấy sinh viên tương ứng.")
                skipped_count += 1
                continue

            # 3. Kiểm tra xem đã có trong lớp chưa
            existing = db.query(ClassMember).filter(
                ClassMember.class_id == class_obj.id,
                ClassMember.user_id == student_obj.id
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            # 4. Thêm vào lớp
            member = ClassMember(class_id=class_obj.id, user_id=student_obj.id)
            db.add(member)
            added_count += 1
            
        except Exception as e:
            errors.append(f"Dòng {idx + 2}: {str(e)}")
            skipped_count += 1
    
    db.commit()
    
    return {
        "added": added_count,
        "skipped": skipped_count,
        "errors": errors[:20]  # Tăng số lượng lỗi hiển thị
    }
