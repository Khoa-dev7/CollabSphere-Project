import pandas as pd
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.project_models import ClassMember
import io

def import_class_members_from_excel(db: Session, file: UploadFile):
    """
    Import students into classes from Excel file.
    Expected columns: class_id, student_username
    """
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    
    # Validate columns
    required_cols = ['class_id', 'student_username']
    if not all(col in df.columns for col in required_cols):
        raise HTTPException(
            status_code=400, 
            detail=f"File Excel phải có các cột: {', '.join(required_cols)}"
        )
    
    from app.models.base_models import User
    from app.models.project_models import Class
    
    added_count = 0
    skipped_count = 0
    errors = []
    
    for idx, row in df.iterrows():
        try:
            class_id = int(row['class_id'])
            student_username = str(row['student_username']).strip()
            
            # Check if class exists
            class_obj = db.query(Class).filter(Class.id == class_id).first()
            if not class_obj:
                errors.append(f"Dòng {idx + 2}: Không tìm thấy lớp ID {class_id}")
                skipped_count += 1
                continue
            
            # Check if user exists and is a student
            user = db.query(User).filter(User.username == student_username).first()
            if not user:
                errors.append(f"Dòng {idx + 2}: Không tìm thấy user '{student_username}'")
                skipped_count += 1
                continue
            
            if user.role != "Student":
                errors.append(f"Dòng {idx + 2}: User '{student_username}' không phải là sinh viên")
                skipped_count += 1
                continue
            
            # Check if already enrolled
            existing = db.query(ClassMember).filter(
                ClassMember.class_id == class_id,
                ClassMember.user_id == user.id
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            # Add to class
            member = ClassMember(class_id=class_id, user_id=user.id)
            db.add(member)
            added_count += 1
            
        except Exception as e:
            errors.append(f"Dòng {idx + 2}: {str(e)}")
            skipped_count += 1
    
    db.commit()
    
    return {
        "added": added_count,
        "skipped": skipped_count,
        "errors": errors[:10]  # Limit to first 10 errors
    }
