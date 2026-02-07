import { Table, Tag, Button, Space, message } from "antd";
import { useState } from "react";
import { mockProjects } from "../../data/mockProjects";
import ProjectDetailModal from "./ProjectDetailModal";

export default function ProjectApproval() {
  const [projects, setProjects] = useState(mockProjects);
  const [selected, setSelected] = useState(null);

  const updateStatus = (id, status) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, status } : p
    ));
    message.success(`Project ${status}`);
  };

  const columns = [
    { title: "Project Name", dataIndex: "name" },
    { title: "Subject", dataIndex: "subject" },
    { title: "Lecturer", dataIndex: "lecturer" },
    {
      title: "Status",
      dataIndex: "status",
      render: status => (
        <Tag color={
          status === "pending" ? "orange" :
          status === "approved" ? "green" : "red"
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button onClick={() => setSelected(record)}>View</Button>
          {record.status === "pending" && (
            <>
              <Button type="primary" onClick={() => updateStatus(record.id, "approved")}>
                Approve
              </Button>
              <Button danger onClick={() => updateStatus(record.id, "denied")}>
                Deny
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={projects}
        scroll={{ x: 600 }}
      />

      {selected && (
        <ProjectDetailModal
          project={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
