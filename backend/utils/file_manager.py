import os
import uuid
from werkzeug.utils import secure_filename

# Cấu hình thư mục upload (đường dẫn tương đối)
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'zip', 'rar'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file_obj):
    """Lưu file vào thư mục static/uploads và trả về tên file duy nhất"""
    if file_obj and allowed_file(file_obj.filename):
        # Tạo tên file an toàn & duy nhất
        original_name = secure_filename(file_obj.filename)
        unique_name = f"{uuid.uuid4().hex}_{original_name}"
        
        # Đảm bảo thư mục tồn tại
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        save_path = os.path.join(UPLOAD_FOLDER, unique_name)
        file_obj.save(save_path)
        
        # Trả về tên file và đường dẫn
        return unique_name, save_path
    return None, None