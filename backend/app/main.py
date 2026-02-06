from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.models import base_models, project_models, comm_models, eval_models

# Khởi tạo các bảng cơ sở dữ liệu dựa trên các models đã định nghĩa
Base.metadata.create_all(bind=engine)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Backend cho CollabSphere - Hệ thống học tập theo dự án (PBL)"
)

# Cấu hình CORS (Cross-Origin Resource Sharing) để cho phép Frontend (Vite) truy cập API
# Hiện tại cho phép tất cả các nguồn ("*") để thuận tiện cho phát triển
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint gốc để kiểm tra trạng thái hoạt động của server
@app.get("/")
async def root():
    return {"message": "Chào mừng bạn đến với CollabSphere API", "status": "đang chạy"}

# Đăng ký các bộ định tuyến (Routers) cho từng module chức năng
from app.routes import (
    auth_routes, staff_routes, project_routes, workspace_routes, 
    chat_routes, resource_routes, eval_routes, user_routes, 
    activity_routes, notification_routes, rubric_routes, export_routes,
    dashboard_routes, ai_routes
)

# API xác thực (Đăng nhập, Đăng ký)
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
# API cho cán bộ/giảng viên (Quản lý lớp học, sinh viên)
app.include_router(staff_routes.router, prefix="/api/staff", tags=["staff"])
# API quản lý dự án chung
app.include_router(project_routes.router, prefix="/api/projects", tags=["projects"])
# API không gian làm việc của nhóm (Quản lý thành viên nhóm)
app.include_router(workspace_routes.router, prefix="/api/workspace", tags=["workspace"])
# API trò chuyện (Chat)
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
# API quản lý tài nguyên, tài liệu
app.include_router(resource_routes.router, prefix="/api/resources", tags=["resources"])
# API đánh giá đồng đẳng và chấm điểm
app.include_router(eval_routes.router, prefix="/api/eval", tags=["eval"])
app.include_router(eval_routes.router, prefix="/api/grading", tags=["grading"])
# API quản lý thông tin người dùng
app.include_router(user_routes.router, prefix="/api/users", tags=["users"])
# API lịch sử hoạt động
app.include_router(activity_routes.router, prefix="/api/activity", tags=["activity"])
# API thông báo hệ thống
app.include_router(notification_routes.router, prefix="/api/notifications", tags=["notifications"])
# API quản lý tiêu chí đánh giá (Rubric)
app.include_router(rubric_routes.router, prefix="/api/rubrics", tags=["rubrics"])
# API xuất dữ liệu (Excel, PDF)
app.include_router(export_routes.router, prefix="/api/export", tags=["export"])
# API bảng điều khiển (Dashboard)
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["dashboard"])
# API tích hợp Trí tuệ nhân tạo (AI)
app.include_router(ai_routes.router, prefix="/api/ai", tags=["ai"])

# Cấu hình để phục vụ các tệp tin tĩnh (như ảnh, tài liệu upload)
from fastapi.staticfiles import StaticFiles
import os
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
# Ánh xạ đường dẫn /api/static/uploads tới thư mục vật lý trên server
app.mount("/api/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Tích hợp Socket.IO để hỗ trợ các tính năng thời gian thực (như Chat, Thông báo)
from app.socket_events import sio
import socketio

# Bọc ứng dụng FastAPI bằng SocketIO ASGI application
# Điều này cho phép xử lý cả yêu cầu HTTP thông số và kết nối WebSocket trên cùng một server
app = socketio.ASGIApp(sio, app)
