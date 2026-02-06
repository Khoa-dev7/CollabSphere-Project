import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Sidebar() {
  return (
    <Sider width={220} style={{ background: "#001529" }}>
      <div style={{ color: "#fff", padding: 16, fontWeight: "bold" }}>
        CollabSphere
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["workspace"]}
        items={[
          { key: "workspace", icon: <AppstoreOutlined />, label: "Workspace" },
          { key: "tasks", icon: <CheckSquareOutlined />, label: "Tasks" },
          { key: "team", icon: <TeamOutlined />, label: "Team" },
          { key: "chat", icon: <MessageOutlined />, label: "Chat" },
        ]}
      />
    </Sider>
  );
}
