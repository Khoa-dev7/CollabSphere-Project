import os
from flask import Flask
from flasgger import Swagger
from extensions import db  # Import db từ extensions.py để tránh lỗi vòng lặp
from middleware import token_required

# --- Import Blueprints (Các file API) ---
# Nếu bạn chưa tạo file nào thì tạm thời comment dòng đó lại để không bị lỗi
try:
    from routes.auth_routes import auth_bp
    from routes.task_routes import task_bp
    from routes.project_routes import project_bp
    from routes.team_routes import team_bp
    from routes.chat_routes import chat_bp
    from routes.rubric_routes import rubric_bp
    from routes.academic_routes import academic_bp
except ImportError as e:
    print(f"Warning: Một số route chưa được tạo. Lỗi: {e}")

def create_app():
    app = Flask(__name__)

    # --- Cấu hình Database ---
    # Nếu chạy Docker, host thường là 'db'. Nếu chạy local, host là 'localhost'
    # Bạn có thể sửa trực tiếp chuỗi kết nối dưới đây:
    # Format: postgresql://<user>:<password>@<host>/<db_name>
    db_user = os.environ.get('POSTGRES_USER', 'user')
    db_pass = os.environ.get('POSTGRES_PASSWORD', 'password')
    db_host = os.environ.get('POSTGRES_HOST', 'localhost') # Đổi thành 'db' nếu chạy docker-compose
    db_name = os.environ.get('POSTGRES_DB', 'collabsphere')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_pass}@{db_host}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'collabsphere_secret_key_123')

    # --- Cấu hình Swagger (Tài liệu API) ---
    app.config['SWAGGER'] = {
        'title': 'CollabSphere API',
        'uiversion': 3,
        'description': 'API Documentation for CollabSphere Project',
        'version': '1.0.0'
    }

    # Khởi tạo Plugins
    db.init_app(app)
    Swagger(app)

    # --- Đăng ký Blueprints ---
    # Chỉ đăng ký nếu import thành công ở trên
    if 'auth_bp' in locals(): app.register_blueprint(auth_bp)
    if 'task_bp' in locals(): app.register_blueprint(task_bp)
    if 'project_bp' in locals(): app.register_blueprint(project_bp)
    if 'team_bp' in locals(): app.register_blueprint(team_bp)
    if 'chat_bp' in locals(): app.register_blueprint(chat_bp)
    if 'rubric_bp' in locals(): app.register_blueprint(rubric_bp)
    if 'academic_bp' in locals(): app.register_blueprint(academic_bp)

    return app

app = create_app()

# --- Chạy Server ---
if __name__ == '__main__':
    # Tạo bảng Database tự động nếu chưa có
    with app.app_context():
        try:
            # Import models để SQLAlchemy nhận diện được các bảng trước khi create_all
            import models 
            db.create_all()
            print(">>> Database tables created successfully!")
        except Exception as e:
            print(f">>> Error creating database tables: {e}")

    # Chạy app ở port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)