from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, get_db
import models
import schemas
import socketio
import os
from livekit import api

# 1. Cấu hình Socket.IO (Server Realtime)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# 2. Tạo bảng DB
models.Base.metadata.create_all(bind=engine)

# 3. Tạo app FastAPI
fastapi_app = FastAPI()

# --- QUAN TRỌNG: Cấu hình CORS để Frontend gọi được API ---
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi nguồn truy cập
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. "Gói" FastAPI vào trong Socket.IO
app = socketio.ASGIApp(sio, fastapi_app)

# --- MODEL DỮ LIỆU ---
class TaskUpdate(BaseModel):
    task_id: int
    status: str
    room_id: str

# --- API CŨ: DATA & GROUPING ---
@fastapi_app.post("/seed-data/")
def seed_data(db: Session = Depends(get_db)):
    return {"message": "Seed data created"}

@fastapi_app.post("/auto-group/")
def auto_group_students(request: schemas.GroupingRequest, db: Session = Depends(get_db)):
    return {"message": "Auto group logic executed"}

# --- API 1: LIVEKIT VIDEO CALL ---
@fastapi_app.get("/get-join-token")
def get_join_token(room: str, username: str):
    API_KEY = "devkey"
    API_SECRET = "secret"
    token = api.AccessToken(API_KEY, API_SECRET) \
        .with_identity(username) \
        .with_name(username) \
        .with_grants(api.VideoGrants(room_join=True, room=room))
    return {"token": token.to_jwt(), "url": "ws://localhost:7880"}

# --- API 2: REALTIME TASK UPDATE (Mới) ---
@fastapi_app.post("/update-task")
async def update_task(task_data: TaskUpdate):
    print(f"Update: Task {task_data.task_id} -> {task_data.status} (Room: {task_data.room_id})")
    
    # Bắn tín hiệu cho tất cả mọi người trong phòng
    await sio.emit(
        event='TASK_UPDATED',
        data=task_data.dict(),
        room=task_data.room_id
    )
    return {"message": "Update sent"}

# --- SOCKET EVENTS ---
@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get('room')
    if room:
        sio.enter_room(sid, room)
        print(f"Socket {sid} joined room {room}")

@sio.event
async def disconnect(sid):
    print(f"User disconnected: {sid}")