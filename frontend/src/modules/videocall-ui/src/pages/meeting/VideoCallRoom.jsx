import { Button, Tooltip } from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneFilled,
} from "@ant-design/icons";
import { useState } from "react";
import "./VideoCallRoom.css";

export default function VideoCallRoom() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const participants = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Văn C",
    "Phạm Thị D",
  ];

  return (
    <div className="meeting-container">
      {/* GRID CAMERA */}
      <div className="video-grid">
        {participants.map((name, index) => (
          <div className="video-tile" key={index}>
            <div className="video-placeholder">
              {camOn ? "🎥" : "🚫"}
            </div>
            <span className="username">{name}</span>
          </div>
        ))}
      </div>

      {/* CONTROL BAR */}
      <div className="control-bar">
        <Tooltip title={micOn ? "Mute" : "Unmute"}>
          <Button
            shape="circle"
            icon={micOn ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={() => setMicOn(!micOn)}
          />
        </Tooltip>

        <Tooltip title={camOn ? "Turn off camera" : "Turn on camera"}>
          <Button
            shape="circle"
            icon={camOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            onClick={() => setCamOn(!camOn)}
          />
        </Tooltip>

        <Tooltip title="End call">
          <Button
            shape="circle"
            danger
            icon={<PhoneFilled />}
          />
        </Tooltip>
      </div>
    </div>
  );
}
