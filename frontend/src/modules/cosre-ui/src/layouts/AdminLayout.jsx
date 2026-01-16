import { Layout, Menu } from "antd";
import { ProjectOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", padding: 16, fontWeight: "bold" }}>
          HEAD DEPARTMENT
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<ProjectOutlined />}>
            <Link to="/head/projects">Project Approval</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff" }}>
          Project Approval Dashboard
        </Header>
        <Content style={{ margin: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
