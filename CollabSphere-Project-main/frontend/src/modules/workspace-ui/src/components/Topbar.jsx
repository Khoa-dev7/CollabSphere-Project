import { Layout, Avatar } from "antd";

const { Header } = Layout;

export default function Topbar() {
  return (
    <Header
      style={{
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <h3>Project Workspace</h3>
      <Avatar style={{ backgroundColor: "#1677ff" }}>GV</Avatar>
    </Header>
  );
}
