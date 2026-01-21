import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "white", padding: "16px", textAlign: "center", fontSize: "20px" }}>
          Admin Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["users"]}
          onClick={({ key }) => navigate(`/admin/${key}`)}
          items={[
            { key: "users", label: "User Management" },
            { key: "import", label: "Import Excel" },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ backgroundColor: "#fff", padding: 0 }} />
        <Content style={{ margin: "16px" }}>
          <div className="site-layout">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
