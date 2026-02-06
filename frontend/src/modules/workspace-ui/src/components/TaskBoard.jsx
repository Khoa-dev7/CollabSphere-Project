import { Card, Col, Row, Tag } from "antd";

const data = {
  todo: ["Define requirements", "Create UI mockup"],
  doing: ["Develop Workspace UI"],
  done: ["Project proposal approved"],
};

export default function TaskBoard() {
  return (
    <Row gutter={16}>
      {Object.entries(data).map(([status, tasks]) => (
        <Col span={8} key={status}>
          <Card title={status.toUpperCase()}>
            {tasks.map((t, i) => (
              <Card key={i} size="small" style={{ marginBottom: 8 }}>
                {t}
                <div>
                  <Tag color="blue">Sprint 1</Tag>
                </div>
              </Card>
            ))}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
