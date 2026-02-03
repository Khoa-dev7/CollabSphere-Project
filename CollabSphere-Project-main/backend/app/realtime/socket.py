# app/realtime/socket.py
import socketio

# Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

# user_id -> socket session id
connected_users: dict[int, str] = {}


@sio.event
async def connect(sid, environ):
    print(f"🔌 Socket connected: {sid}")


@sio.event
async def disconnect(sid):
    for user_id, socket_id in list(connected_users.items()):
        if socket_id == sid:
            connected_users.pop(user_id)
            print(f"❌ User {user_id} disconnected")
            break


@sio.event
async def register(sid, data):
    """
    Client:
    socket.emit("register", { user_id: 1 })
    """
    user_id = data.get("user_id")
    if user_id is not None:
        connected_users[int(user_id)] = sid
        print(f"✅ User {user_id} registered with socket {sid}")
