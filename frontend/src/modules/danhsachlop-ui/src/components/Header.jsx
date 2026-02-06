import { Layout, Menu } from "antd";

const { Header } = Layout;

function HeaderBar() {
  return (
    <Header style={{ background: "#001529" }}>
      <div style={{ color: "white", fontSize: 20, fontWeight: 600 }}>
        COSRE – CollabSphere
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["classes"]}
        items={[
          { key: "classes", label: "Danh sách lớp" },
          { key: "projects", label: "Dự án" },
          { key: "teams", label: "Nhóm" },
        ]}
      />
    </Header>
  );
}

export default HeaderBar;
