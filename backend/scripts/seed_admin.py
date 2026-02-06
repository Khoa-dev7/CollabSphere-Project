import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models import base_models, project_models, comm_models
from app.models.base_models import User
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Tài khoản admin đã tồn tại.")
            return

        # Create new admin
        admin = User(
            username="admin",
            email="admin@collabsphere.com",
            full_name="System Administrator",
            role="Admin",
            password_hash=get_password_hash("admin123"),
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Tạo tài khoản admin thành công!")
        print("Tên đăng nhập: admin")
        print("Mật khẩu: admin123")
    except Exception as e:
        print(f"Lỗi khi tạo admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    from sqlalchemy import text
    
    # Đảm bảo các bảng được làm mới
    print("Đang xóa và tạo lại tất cả các bảng (CASCADE)...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    
    Base.metadata.create_all(bind=engine)
    seed_admin()
