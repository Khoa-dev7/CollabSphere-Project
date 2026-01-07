from flask import Flask
# Import 2 file bạn vừa tạo ở bước trước
from src.extensions import socketio
from src.socket_events import register_socket_events

app = Flask(__name__)

# --- CẤU HÌNH QUAN TRỌNG ---
# Secret Key là bắt buộc để SocketIO chạy (nó dùng để mã hóa session)
app.config['SECRET_KEY'] = 'Khoa_Dev_Muon_Nam_2026' 

# ... (Nếu có đoạn kết nối Database cũ thì giữ nguyên ở đây) ...

# --- KÍCH HOẠT WEBSOCKET ---
# 1. Gắn SocketIO vào Flask App
socketio.init_app(app)

# 2. Kích hoạt các sự kiện (Connect, Chat...)
register_socket_events(socketio)

# --- CHẠY SERVER ---
if __name__ == '__main__':
    print("🚀 Server CollabSphere đang khởi động với WebSocket...")
    
    # LƯU Ý SỐ 1: Phải dùng socketio.run() thay vì app.run()
    # allow_unsafe_werkzeug=True là cần thiết khi chạy môi trường Dev trên một số máy
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)