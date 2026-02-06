import React, { useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles'; // Import giao diện mặc định đẹp lung linh

export default function VideoRoom() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("SinhVien_A");
  const [room, setRoom] = useState("LopHoc_1");
  const [isJoined, setIsJoined] = useState(false);

  // Hàm gọi lên Backend xin vé (Token)
  const joinRoom = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/get-join-token?room=${room}&username=${username}`
      );
      const data = await response.json();
      setToken(data.token);
      setIsJoined(true);
    } catch (error) {
      console.error("Lỗi lấy token:", error);
      alert("Không kết nối được Backend!");
    }
  };

  // Nếu chưa vào phòng thì hiện form nhập tên
  if (!isJoined) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Tham gia lớp học trực tuyến</h2>
        <input 
          type="text" placeholder="Tên của bạn" 
          value={username} onChange={(e) => setUsername(e.target.value)} 
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <input 
          type="text" placeholder="Tên phòng (VD: Team1)" 
          value={room} onChange={(e) => setRoom(e.target.value)} 
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button onClick={joinRoom} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Vào học ngay
        </button>
      </div>
    );
  }

  // Nếu đã có Token thì hiện màn hình Video Call
  return (
    <div style={{ height: '100vh' }}>
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl="ws://localhost:7880" // URL của LiveKit Server
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={() => setIsJoined(false)} // Khi tắt máy thì quay lại form
      >
        {/* Component này tự động hiển thị lưới video, nút mic/cam/share màn hình */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}