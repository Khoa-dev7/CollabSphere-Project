from flask_socketio import SocketIO

# Khởi tạo object SocketIO
# cors_allowed_origins="*" nghĩa là cho phép mọi nguồn (Frontend React, Mobile...) kết nối vào.
# Nếu không có dòng này, React (port 3000) sẽ không gọi được Flask (port 5000).
socketio = SocketIO(cors_allowed_origins="*")