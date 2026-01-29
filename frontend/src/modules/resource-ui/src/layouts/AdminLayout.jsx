import { Layout, Menu } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  return (
    <Layout>
      <Sider>
        <div style={{ color: "#fff", padding: 16, fontWeight: "bold" }}>
          CollabSphere
        </div>
        <Menu
          theme="dark"
          mode="inline"
          onClick={(e) => navigate(e.key)}
          items={[
            {
              key: "/resources",
              icon: <FolderOutlined />,
              label: "Resource Management",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", paddingLeft: 16 }}>
          Resource Management
        </Header>
        <Content style={{ margin: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
