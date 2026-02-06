import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings

UPLOAD_DIR = "uploads"

def cleanup_uploads():
    if not os.path.exists(UPLOAD_DIR):
        print(f"Thư mục {UPLOAD_DIR} không tồn tại.")
        return

    print(f"Đang dọn dẹp các tệp trong {UPLOAD_DIR}...")
    count = 0
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            try:
                # Logic để kiểm tra xem tệp có được sử dụng trong DB thành công có thể được thêm vào đây
                # Hiện tại, chỉ in ra những gì chúng ta tìm thấy
                print(f"Tìm thấy tệp: {filename}")
                # os.remove(file_path) # Uncomment to actually delete
                # count += 1
            except Exception as e:
                print(f"Lỗi khi kiểm tra {filename}: {e}")
    
    print(f"Hoàn tất dọn dẹp. Tìm thấy {count} tệp.")

if __name__ == "__main__":
    cleanup_uploads()
