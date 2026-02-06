import socketio
from typing import Dict

# Tạo instance AsyncServer
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Lưu trữ mapping user_id -> sid (optional, for direct messages)
user_sessions: Dict[int, str] = {}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Remove user from sessions if needed
    # for uid, session_id in user_sessions.items():
    #     if session_id == sid:
    #         del user_sessions[uid]
    #         break

@sio.event
async def join_room(sid, data):
    """
    Data expects: {'room': 'team_1'} or {'room': 'chat_room_2'}
    """
    room_name = data.get('room')
    if room_name:
        sio.enter_room(sid, room_name)
        print(f"Client {sid} joined room: {room_name}")
        await sio.emit('response', {'message': f'Joined room {room_name}'}, room=sid)

@sio.event
async def leave_room(sid, data):
    room_name = data.get('room')
    if room_name:
        sio.leave_room(sid, room_name)
        print(f"Client {sid} left room: {room_name}")

@sio.event
async def send_message(sid, data):
    """
    Data expects: 
    {
        'room': 'team_1', 
        'message': {
            'id': 1,
            'content': 'Hello',
            'sender_id': 123,
            'sender_name': 'John Doe',
            'created_at': '...'
        }
    }
    """
    room_name = data.get('room')
    message_data = data.get('message')
    
    if room_name and message_data:
        print(f"Broadcasting message to {room_name}: {message_data}")
        # Broadcast to everyone in the room EXCEPT the sender
        await sio.emit('receive_message', message_data, room=room_name, skip_sid=sid)

# --- WHITEBOARD EVENTS ---

@sio.event
async def draw(sid, data):
    """
    Data expects: {'room': 'team_1', 'x0': 1, 'y0': 2, 'x1': 3, 'y1': 4, 'color': '#000', 'width': 2}
    """
    room_name = data.get('room')
    if room_name:
        # Broadcast the drawing coordinates to everyone else in the room
        await sio.emit('draw', data, room=room_name, skip_sid=sid)

@sio.event
async def clear_canvas(sid, data):
    """
    Data expects: {'room': 'team_1'}
    """
    room_name = data.get('room')
    if room_name:
        await sio.emit('clear_canvas', {}, room=room_name, skip_sid=sid)

# --- WebRTC SIGNALING EVENTS ---

@sio.event
async def signal(sid, data):
    """
    Generic signaling event for WebRTC (offer, answer, ice-candidate)
    Data expects: {'room': 'team_1', 'signal': {...}, 'to': 'sid_of_target_optional'}
    """
    room_name = data.get('room')
    if room_name:
        # For now, broadcast signaling to the whole room (simplest for 1-to-1 or mesh)
        # In a more advanced setup, we'd target a specific user using data['to']
        print(f"Signaling in room {room_name} from {sid}")
        await sio.emit('signal', {
            'from': sid,
            'signal': data.get('signal')
        }, room=room_name, skip_sid=sid)

