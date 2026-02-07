import React, { useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";

export default function UserManagement() {
  const [users, setUsers] = useState([
    { key: 1, name: "Nguyen Van A", role: "Lecturer", status: "Active" },
    { key: 2, name: "Tran Thi B", role: "Student", status: "Active" },
  ]);

  const deactivateUser = (key) => {
    setUsers((prev) =>
      prev.map((u) => (u.key === key ? { ...u, status: "Inactive" } : u))
    );
    message.success("User deactivated");
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to deactivate?"
          onConfirm={() => deactivateUser(record.key)}
        >
          <Button type="primary" danger disabled={record.status === "Inactive"}>
            Deactivate
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2>User Management</h2>
      <Table columns={columns} dataSource={users} />
    </div>
  );
}
