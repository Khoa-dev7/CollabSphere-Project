import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

connected_users: dict[int, str] = {}


@sio.event
async def connect(sid, environ):
    print("Socket connected:", sid)


@sio.event
async def disconnect(sid):
    for user_id, socket_id in list(connected_users.items()):
        if socket_id == sid:
            del connected_users[user_id]
            break
    print("Socket disconnected:", sid)


@sio.event
async def register(sid, data):
    """
    data = { "user_id": 1 }
    """
    user_id = data.get("user_id")
    if user_id:
        connected_users[user_id] = sid
        print(f"User {user_id} registered socket {sid}")
