from flask import request
from src.extensions import socketio  # <--- Import cái "ổ cắm" ta vừa tạo ở trên

def register_socket_events(socketio):
    """
    Hàm này chứa toàn bộ logic xử lý WebSocket.
    Sau này muốn thêm tính năng Chat nhóm, Thông báo... thì viết tiếp vào đây.
    """

    # --- Sự kiện 1: CONNECT (Khi có người truy cập) ---
    @socketio.on('connect')
    def handle_connect():
        # request.sid là Session ID (Chứng minh thư) duy nhất của người dùng đó
        print(f"✅ Client đã kết nối: {request.sid}")
        
        # Gửi lời chào riêng cho người vừa kết nối
        socketio.emit('server_message', {'data': 'Chào mừng! Bạn đã kết nối Server thành công.'}, to=request.sid)

    # --- Sự kiện 2: DISCONNECT (Khi người dùng tắt tab/mất mạng) ---
    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"❌ Client đã thoát: {request.sid}")

    # --- Sự kiện 3: TEST CHAT (Demo tính năng chat) ---
    # Khi Client gửi sự kiện tên là 'chat_message'
    @socketio.on('chat_message')
    def handle_chat(data):
        print(f"📩 Nhận được tin nhắn từ {request.sid}: {data}")
        
        # Gửi tin nhắn này lại cho TẤT CẢ mọi người (Broadcast)
        # broadcast=True giúp tạo tính năng chat nhóm (A nhắn, B và C đều thấy)
        socketio.emit('receive_message', data, broadcast=True)