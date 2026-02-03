import { Card, Row, Col } from "antd";
import PageWrapper from "../components/PageWrapper";

export default function Dashboard() {
  return (
    <PageWrapper>
      <Row gutter={16}>
        <Col span={8}>
          <Card hoverable title="Teams Progress">
            Monitor team progress and contribution
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable title="Upcoming Meetings">
            Scheduled video meetings
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable title="Notifications">
            Real-time system notifications
          </Card>
        </Col>
      </Row>
    </PageWrapper>
  );
}
