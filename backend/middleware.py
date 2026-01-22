# backend/middleware.py
from functools import wraps
from flask import request, jsonify
import jwt
from models import User  # Import User model để query
import os

# Trong thực tế, SECRET_KEY nên lấy từ biến môi trường
SECRET_KEY = os.environ.get('SECRET_KEY', 'collabsphere_secret_key_123')

# 1. Decorator kiểm tra Token (xác thực đăng nhập)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Lấy token từ header: "Authorization: Bearer <token>"
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Giải mã token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # Lấy thông tin user từ DB
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        # Truyền user hiện tại vào hàm tiếp theo
        return f(current_user, *args, **kwargs)
    return decorated

# 2. Decorator kiểm tra Role (Phân quyền)
def role_required(required_roles):
    """
    required_roles: Danh sách các Role được phép (VD: [UserRole.ADMIN, UserRole.STAFF])
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            if current_user.role not in required_roles:
                return jsonify({'message': 'Permission denied! You do not have access.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator