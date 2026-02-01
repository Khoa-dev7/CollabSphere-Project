import { List, Avatar, Badge, Typography, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const users = [
  { id: 1, name: "Nguyen Van A", role: "Leader", online: true },
  { id: 2, name: "Tran Thi B", role: "Member", online: true },
  { id: 3, name: "Le Van C", role: "Member", online: false },
  { id: 4, name: "Pham Thi D", role: "Lecturer", online: false },
];

export default function SidebarChat() {
  return (
    <div
      style={{
        width: 300,
        borderLeft: "1px solid #f0f0f0",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
        <Text strong>Team Chat</Text>
        <Input.Search
          placeholder="Search member..."
          style={{ marginTop: 8 }}
        />
      </div>

      {/* User list */}
      <List
        itemLayout="horizontal"
        dataSource={users}
        style={{ flex: 1, overflowY: "auto" }}
        renderItem={(user) => (
          <List.Item style={{ cursor: "pointer", paddingLeft: 16 }}>
            <List.Item.Meta
              avatar={
                <Badge
                  dot
                  color={user.online ? "green" : "gray"}
                  offset={[-2, 32]}
                >
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <div style={{ display: "flex", gap: 8 }}>
                  <span>{user.name}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({user.role})
                  </Text>
                </div>
              }
              description={
                user.online ? (
                  <Text type="success">Online</Text>
                ) : (
                  <Text type="secondary">Offline</Text>
                )
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
