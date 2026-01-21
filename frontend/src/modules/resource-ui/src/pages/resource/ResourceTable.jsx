import { Table, Tag, Button } from "antd";

export default function ResourceTable() {
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    {
      title: "Scope",
      dataIndex: "scope",
      render: (scope) => <Tag color="blue">{scope}</Tag>,
    },
    { title: "Uploaded By", dataIndex: "owner" },
    { title: "Uploaded At", dataIndex: "date" },
    {
      title: "Action",
      render: () => <Button type="link">Download</Button>,
    },
  ];

  const data = [
    {
      key: 1,
      name: "Project Requirements.pdf",
      type: "PDF",
      scope: "Class",
      owner: "Lecturer A",
      date: "2026-01-08",
    },
  ];

  return <Table columns={columns} dataSource={data} />;
}
