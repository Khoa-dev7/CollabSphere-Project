import { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Upload,
  List,
  Select,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  UploadOutlined,
  UserAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const roles = ["Leader", "Member"];

export default function ProjectSettings() {
  const [cover, setCover] = useState(null);
  const [members, setMembers] = useState([
    { id: 1, name: "Nguyễn Văn A", role: "Leader" },
    { id: 2, name: "Trần Thị B", role: "Member" },
  ]);
  const [newMember, setNewMember] = useState("");

  const uploadProps = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = () => setCover(reader.result);
      reader.readAsDataURL(file);
      return false;
    },
  };

  const addMember = () => {
    if (!newMember) return;
    setMembers([
      ...members,
      { id: Date.now(), name: newMember, role: "Member" },
    ]);
    setNewMember("");
    message.success("Đã thêm thành viên");
  };

  const removeMember = (id) => {
    setMembers(members.filter((m) => m.id !== id));
    message.success("Đã xóa thành viên");
  };

  const changeRole = (id, role) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, role } : m
      )
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* COVER */}
      <Card title="Project Cover">
        {cover ? (
          <img
            src={cover}
            alt="cover"
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          <div
            style={{
              height: 200,
              background: "#f0f2f5",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Chưa có ảnh bìa
          </div>
        )}

        <Upload {...uploadProps} showUploadList={false}>
          <Button
            icon={<UploadOutlined />}
            style={{ marginTop: 12 }}
          >
            Đổi ảnh bìa
          </Button>
        </Upload>
      </Card>

      {/* MEMBERS */}
      <Card title="Project Members">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tên thành viên"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={addMember}
          >
            Thêm
          </Button>
        </Space>

        <List
          itemLayout="horizontal"
          dataSource={members}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Select
                  value={item.role}
                  onChange={(role) =>
                    changeRole(item.id, role)
                  }
                  options={roles.map((r) => ({
                    value: r,
                    label: r,
                  }))}
                />,
                <Popconfirm
                  title="Xóa thành viên?"
                  onConfirm={() => removeMember(item.id)}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar>{item.name[0]}</Avatar>}
                title={item.name}
                description={`Role: ${item.role}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
