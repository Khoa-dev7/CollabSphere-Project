import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal, engine
from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE resources ADD COLUMN task_id INTEGER REFERENCES tasks(id)"))
            conn.commit()
            print("Đã thêm cột task_id vào bảng resources thành công.")
        except Exception as e:
            print(f"Lỗi khi thêm cột: {e}")

if __name__ == "__main__":
    add_column()
