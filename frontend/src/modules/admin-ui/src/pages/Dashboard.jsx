import { Card, Col, Row, Table, Tag } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  ReadOutlined,
  MailOutlined,
} from "@ant-design/icons";

const stats = [
  { title: "Head Department", value: 5, icon: <TeamOutlined /> },
  { title: "Staff", value: 12, icon: <UserOutlined /> },
  { title: "Lecturers", value: 48, icon: <ReadOutlined /> },
  { title: "Students", value: 620, icon: <UserOutlined /> },
];

const reports = [
  {
    key: "1",
    sender: "student01@uth.edu.vn",
    subject: "Cannot access workspace",
    date: "2026-01-02",
    status: "Unread",
  },
  {
    key: "2",
    sender: "lecturer02@uth.edu.vn",
    subject: "Project approval issue",
    date: "2026-01-01",
    status: "Read",
  },
];

const columns = [
  { title: "Sender", dataIndex: "sender" },
  { title: "Subject", dataIndex: "subject" },
  { title: "Date", dataIndex: "date" },
  {
    title: "Status",
    dataIndex: "status",
    render: (status) =>
      status === "Unread" ? (
        <Tag color="red">Unread</Tag>
      ) : (
        <Tag color="green">Read</Tag>
      ),
  },
];

export default function Dashboard() {
  return (
    <>
      <h2 style={{ marginBottom: 20 }}>System Overview</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((item) => (
          <Col span={6} key={item.title}>
            <Card>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 30, marginRight: 16 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ color: "#888" }}>{item.title}</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <>
            <MailOutlined /> Recent System Reports
          </>
        }
      >
        <Table columns={columns} dataSource={reports} pagination={false} />
      </Card>
    </>
  );
}
