import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
          ADMIN PANEL
        </div>

        <Menu
          theme="dark"
          mode="inline"
          onClick={({ key }) => navigate(key)}
          items={[
            { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/users", icon: <UserOutlined />, label: "Quản lý tài khoản" },
            { key: "/reports", icon: <MailOutlined />, label: "Báo cáo hệ thống" },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", fontWeight: "bold" }}>
          Xin chào, Admin
        </Header>

        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
