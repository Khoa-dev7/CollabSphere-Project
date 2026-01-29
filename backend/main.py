from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import schemas
import random
import socketio  # <--- Thêm thư viện này

# 1. Cấu hình Socket.IO
# cors_allowed_origins='*' để chấp nhận kết nối từ mọi nơi (Frontend React)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Tạo bảng DB
models.Base.metadata.create_all(bind=engine)

# Tạo app FastAPI
fastapi_app = FastAPI()

# "Gói" FastAPI vào trong Socket.IO
# Khi chạy, Uvicorn sẽ chạy cái 'app' này, nó vừa xử lý web vừa xử lý socket
app = socketio.ASGIApp(sio, fastapi_app)

# --- PHẦN API REST (GIỮ NGUYÊN NHƯ CŨ) ---
@fastapi_app.post("/seed-data/")
def seed_data(db: Session = Depends(get_db)):
    # (Giữ nguyên code cũ của bạn ở đây...)
    # Để ngắn gọn mình không paste lại, bạn giữ nguyên logic tạo data giả nhé
    return {"message": "Seed data logic here"}

@fastapi_app.post("/auto-group/")
def auto_group_students(request: schemas.GroupingRequest, db: Session = Depends(get_db)):
    # (Giữ nguyên code chia nhóm cũ của bạn ở đây...)
    return {"message": "Auto group logic here"}

# --- PHẦN MỚI: SỰ KIỆN SOCKET.IO (CHAT & ROOMS) ---

# 1. Khi người dùng kết nối
@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

# 2. Khi người dùng ngắt kết nối
@sio.event
async def disconnect(sid):
    print(f"User disconnected: {sid}")

# 3. Sự kiện: Tham gia phòng (Ví dụ: Vào nhóm chat của Nhóm 1)
@sio.event
async def join_room(sid, data):
    # data mong đợi: {'room': 'team_1', 'username': 'Nguyen Van A'}
    room_name = data.get('room')
    username = data.get('username')
    
    if room_name:
        sio.enter_room(sid, room_name)
        print(f"{username} đã vào phòng {room_name}")
        # Gửi thông báo cho mọi người trong phòng (trừ người vừa vào)
        await sio.emit('receive_message', {'user': 'Hệ thống', 'message': f'{username} đã tham gia!'}, room=room_name, skip_sid=sid)

# 4. Sự kiện: Gửi tin nhắn
@sio.event
async def send_message(sid, data):
    # data mong đợi: {'room': 'team_1', 'message': 'Hello mọi người', 'user': 'Nguyen Van A'}
    room_name = data.get('room')
    message = data.get('message')
    user = data.get('user')
    
    print(f"Tin nhắn từ {user} tới {room_name}: {message}")
    
    # Gửi lại tin nhắn cho TẤT CẢ mọi người trong phòng đó
    await sio.emit('receive_message', {'user': user, 'message': message}, room=room_name)