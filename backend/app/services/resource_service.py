from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.comm_models import Resource
from app.schemas.resource_schemas import ResourceCreate
from app.core.config import settings
import cloudinary
import cloudinary.uploader
from app.services.activity_log_service import log_activity

cloudinary.config(
  cloud_name = settings.CLOUDINARY_CLOUD_NAME,
  api_key = settings.CLOUDINARY_API_KEY,
  api_secret = settings.CLOUDINARY_API_SECRET
)

import os
import shutil
import uuid

def upload_file(file: UploadFile):
    try:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            # Đưa con trỏ file về đầu để đảm bảo đọc đúng dữ liệu
            file.file.seek(0)
            result = cloudinary.uploader.upload(file.file, resource_type="auto")
            return result.get('secure_url')
        else:
            # Giải pháp dự phòng: Lưu file cục bộ
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            # Tạo tên file duy nhất để tránh trùng lặp
            file_ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Lưu file
            with open(file_path, "wb") as buffer:
                file.file.seek(0)
                shutil.copyfileobj(file.file, buffer)
            
            # Trả về URL đường dẫn tĩnh của backend
            # Lưu ý: Port 5000 là mặc định của backend trong project này
            # Sử dụng URL tuyệt đối để đảm bảo Frontend có thể truy cập qua link <a>
            return f"http://localhost:5000/api/static/uploads/{unique_filename}"
            
    except Exception as e:
        print(f"Lỗi tải lên: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def create_resource(db: Session, resource_in: ResourceCreate):
    db_resource = Resource(**resource_in.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    # Log resource creation
    log_activity(
        db=db,
        user_id=db_resource.owner_id,
        team_id=db_resource.team_id,
        action=f"đã tải lên tài liệu '{db_resource.name}'",
        target_type="resource",
        target_id=db_resource.id
    )
    
    return db_resource

def get_team_resources(db: Session, team_id: int, milestone_id: int = None, checkpoint_id: int = None):
    query = db.query(Resource).filter(Resource.team_id == team_id)
    if milestone_id:
        query = query.filter(Resource.milestone_id == milestone_id)
    if checkpoint_id:
        query = query.filter(Resource.checkpoint_id == checkpoint_id)
    return query.all()

def get_class_resources(db: Session, class_id: int):
    return db.query(Resource).filter(Resource.class_id == class_id).all()

def get_task_resources(db: Session, task_id: int):
    return db.query(Resource).filter(Resource.task_id == task_id).all()

def delete_resource(db: Session, resource_id: int):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài nguyên")
    
    # Lý tưởng nhất, chúng ta cũng nên xóa khỏi Cloudinary ở đây
    # file_id = resource.file_url.split('/')[-1].split('.')[0]
    # cloudinary.uploader.destroy(file_id)
    
    db.delete(resource)
    db.commit()
    return True
