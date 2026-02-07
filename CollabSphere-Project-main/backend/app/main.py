# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import os

from app.database import Base, engine
from app.models import models

# ROUTES
from app.routes import auth
from app.routes import core
from app.routes import projects
from app.routes import tasks
from app.routes import files
from app.routes import profile
from app.routes import password
from app.routes import video_call as video
from app.routes import import_users, import_classes
from app.routes import teams
from app.routes import ai
from app.routes import activity_logs
from app.routes import chat
from app.routes import peer_review
from app.routes import notifications
from app.routes import task_comments, task_attachments
from app.routes import task_move
from app.routes import grading
from app.routes import dashboard

from app.middleware.idor import IDORAuditMiddleware

# SOCKET.IO
from app.realtime.socket import sio


# =====================
# DB INIT
# =====================
Base.metadata.create_all(bind=engine)

# =====================
# FASTAPI APP
# =====================
fastapi_app = FastAPI(
    title="CollabSphere API System"
)

# =====================
# CORS
# =====================
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# MIDDLEWARE
# =====================
fastapi_app.add_middleware(IDORAuditMiddleware)

# =====================
# STATIC FILES
# =====================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

fastapi_app.mount(
    "/static",
    StaticFiles(directory=UPLOAD_DIR),
    name="static"
)

# =====================
# ROUTERS
# =====================
fastapi_app.include_router(auth.router)
fastapi_app.include_router(password.router)
fastapi_app.include_router(profile.router)
fastapi_app.include_router(core.router)
fastapi_app.include_router(projects.router)
fastapi_app.include_router(tasks.router)
fastapi_app.include_router(files.router)
fastapi_app.include_router(video.router)
fastapi_app.include_router(import_users.router)
fastapi_app.include_router(import_classes.router)
fastapi_app.include_router(teams.router)
fastapi_app.include_router(ai.router)
fastapi_app.include_router(activity_logs.router)
fastapi_app.include_router(chat.router)
fastapi_app.include_router(peer_review.router)
fastapi_app.include_router(notifications.router)
fastapi_app.include_router(task_comments.router)
fastapi_app.include_router(task_attachments.router)
fastapi_app.include_router(task_move.router)
fastapi_app.include_router(grading.router)
fastapi_app.include_router(dashboard.router)

# =====================
# SOCKET.IO + FASTAPI
# =====================
app = socketio.ASGIApp(
    sio,
    fastapi_app
)
