from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.models import base_models, project_models, comm_models, eval_models

# Khởi tạo các bảng cơ sở dữ liệu
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Backend cho CollabSphere - Hệ thống học tập theo dự án (PBL)"
)

# Cấu hình CORS để cho phép Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Chào mừng bạn đến với CollabSphere API", "status": "đang chạy"}

# Include routers
# Include routers
from app.routes import (
    auth_routes, staff_routes, project_routes, workspace_routes, 
    chat_routes, resource_routes, eval_routes, user_routes, 
    activity_routes, notification_routes, rubric_routes, export_routes,
    dashboard_routes, ai_routes
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(staff_routes.router, prefix="/api/staff", tags=["staff"])
app.include_router(project_routes.router, prefix="/api/projects", tags=["projects"])
app.include_router(workspace_routes.router, prefix="/api/workspace", tags=["workspace"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(resource_routes.router, prefix="/api/resources", tags=["resources"])
app.include_router(eval_routes.router, prefix="/api/eval", tags=["eval"])
app.include_router(eval_routes.router, prefix="/api/grading", tags=["grading"]) # 
app.include_router(user_routes.router, prefix="/api/users", tags=["users"])
app.include_router(activity_routes.router, prefix="/api/activity", tags=["activity"])
app.include_router(notification_routes.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(rubric_routes.router, prefix="/api/rubrics", tags=["rubrics"])
app.include_router(export_routes.router, prefix="/api/export", tags=["export"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["ai"])

# Serve static files for uploaded documents
from fastapi.staticfiles import StaticFiles
import os
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
app.mount("/api/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Socket.IO Integration
from app.socket_events import sio
import socketio

# Wrap FastAPI app with SocketIO ASGI application
# This allows handling both HTTP requests (via FastAPI) and WebSocket connections (via Socket.IO)
app = socketio.ASGIApp(sio, app)
