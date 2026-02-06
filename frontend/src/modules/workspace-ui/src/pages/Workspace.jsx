import { Layout, Row, Col } from "antd";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import TaskBoard from "../components/TaskBoard";
import TeamProgress from "../components/TeamProgress";
import ChatBox from "../components/ChatBox";

const { Content } = Layout;

export default function Workspace() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: 24 }}>
          <Row gutter={16}>
            <Col span={16}>
              <TaskBoard />
            </Col>
            <Col span={8}>
              <TeamProgress />
              <div style={{ marginTop: 16 }}>
                <ChatBox />
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
