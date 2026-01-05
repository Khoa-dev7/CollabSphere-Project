import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
CORS(app)

# 1. CẤU HÌNH
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://admin:admin@db:5432/collabsphere_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'khoa_dep_trai_bi_mat_khong_bat_mi' # Key để tạo Token

db = SQLAlchemy(app)

# 2. MODEL USER (CÓ MÃ HÓA PASSWORD)
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False) # Lưu hash, không lưu pass thường
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='student')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "role": self.role
        }

# 3. KHỞI TẠO DATABASE
with app.app_context():
    db.create_all()
    # Tạo Admin nếu chưa có
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', full_name='System Admin', role='admin')
        admin.set_password('123') # Mật khẩu gốc là 123
        db.session.add(admin)
        db.session.commit()
        print(">>> Đã tạo tài khoản Admin (Pass: 123)")

# 4. API ROUTES

@app.route('/')
def home():
    return jsonify({"message": "CollabSphere API Ready!"})

# API Đăng nhập (Quan trọng nhất)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Tìm user trong DB
    user = User.query.filter_by(username=username).first()

    # Kiểm tra mật khẩu
    if user and user.check_password(password):
        # Tạo Token (Thẻ bài) có hạn 1 ngày
        token = jwt.encode({
            'user_id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            "message": "Đăng nhập thành công!",
            "token": token,
            "user": user.to_json()
        }), 200
    
    return jsonify({"message": "Sai tài khoản hoặc mật khẩu!"}), 401

# API Lấy danh sách (Để test)
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_json() for u in users])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)