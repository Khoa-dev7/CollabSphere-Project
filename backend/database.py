from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Lấy đường dẫn kết nối từ biến môi trường (đã set trong docker-compose)
# Nếu không tìm thấy (chạy local ko qua docker) thì dùng chuỗi mặc định
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cosre_user:cosre_password@localhost:5432/cosre_db")

# Tạo engine kết nối
engine = create_engine(DATABASE_URL)

# Tạo Session để thao tác dữ liệu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho các models (bảng) sau này
Base = declarative_base()

# Hàm phụ trợ để lấy session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()