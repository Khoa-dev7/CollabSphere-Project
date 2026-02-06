import { Table, Tag, Button, Space, message } from "antd";
import { useState, useEffect } from "react";
import api from "../../../../api";
import ProjectDetailModal from "./ProjectDetailModal";

export default function ProjectApproval() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      // Optionally filter for 'pending' if the backend doesn't, 
      // but usually the Head Dept wants to see history too.
      setProjects(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/projects/${id}/status`, { status });
      message.success(`Project ${status} successfully`);
      fetchProjects(); // Refresh list
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const columns = [
    { title: "Project Name", dataIndex: "title" },
    { title: "Subject ID", dataIndex: "subject_id" },
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
        loading={loading}
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
