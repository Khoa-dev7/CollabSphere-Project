import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function MeetingLayout() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#000" }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
