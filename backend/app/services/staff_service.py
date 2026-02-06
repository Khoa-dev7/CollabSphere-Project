import pandas as pd
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.base_models import Subject, Syllabus, User
from app.models.project_models import Class, ClassMember
from app.core.security import get_password_hash
from app.schemas.subject_schemas import SubjectUpdate, ClassUpdate
import io

def import_subjects_from_excel(db: Session, file: UploadFile):
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    
    # Các cột mong đợi: code, name, description
    subjects = []
    for _, row in df.iterrows():
        subject = Subject(
            code=str(row['code']),
            name=str(row['name']),
            description=str(row.get('description', ''))
        )
        db.add(subject)
        subjects.append(subject)
    db.commit()
    return subjects

def get_subjects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Subject).offset(skip).limit(limit).all()

def get_subject(db: Session, subject_id: int):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Không tìm thấy môn học")
    return subject

def update_subject(db: Session, subject_id: int, subject_in: SubjectUpdate):
    db_subject = get_subject(db, subject_id)
    update_data = subject_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    db_subject = get_subject(db, subject_id)
    db.delete(db_subject)
    db.commit()
    return True

def import_users_from_excel(db: Session, file: UploadFile, role: str):
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    
    # Các cột mong đợi: username, email, full_name, password
    users = []
    for _, row in df.iterrows():
        user = User(
            username=str(row['username']),
            email=str(row['email']),
            full_name=str(row['full_name']),
            role=role,
            password_hash=get_password_hash(str(row['password'])),
            is_active=True
        )
        db.add(user)
        users.append(user)
    db.commit()
    return users

def import_classes_from_excel(db: Session, file: UploadFile):
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    
    # Các cột mong đợi: class_name, lecturer_username
    classes = []
    for _, row in df.iterrows():
        lecturer = db.query(User).filter(User.username == str(row['lecturer_username'])).first()
        if not lecturer:
            continue
            
        db_class = Class(
            name=str(row['class_name']),
            lecturer_id=lecturer.id
        )
        db.add(db_class)
        classes.append(db_class)
    db.commit()
    return classes

def create_class(db: Session, class_name: str, lecturer_id: int):
    db_class = Class(name=class_name, lecturer_id=lecturer_id)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def add_student_to_class(db: Session, class_id: int, student_id: int):
    member = ClassMember(class_id=class_id, user_id=student_id)
    db.add(member)
    db.commit()
    return member

def get_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Class).offset(skip).limit(limit).all()

def get_class(db: Session, class_id: int):
    db_class = db.query(Class).filter(Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    return db_class

def update_class(db: Session, class_id: int, class_in: ClassUpdate):
    db_class = get_class(db, class_id)
    update_data = class_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int):
    db_class = get_class(db, class_id)
    db.delete(db_class)
    db.commit()
    return True

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def toggle_user_status(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
