import { Button, Table, Tag, Modal } from "antd";
import { useEffect, useState } from "react";
import {
  getUsers,
  disableUser,
  enableUser,
  disableAllUsers,
} from "../api/adminApi";

export default function Users() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    getUsers().then(res => setUsers(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = async (u) => {
    u.active ? await disableUser(u.id) : await enableUser(u.id);
    loadUsers();
  };

  const disableAll = () => {
    Modal.confirm({
      title: "Vô hiệu hóa tất cả tài khoản?",
      onOk: async () => {
        await disableAllUsers();
        loadUsers();
      },
    });
  };

  const columns = [
    { title: "Tên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Vai trò", dataIndex: "role" },
    {
      title: "Trạng thái",
      render: (_, u) =>
        u.active ? <Tag color="green">Active</Tag> : <Tag color="red">Disabled</Tag>,
    },
    {
      title: "Hành động",
      render: (_, u) => (
        <Button onClick={() => toggleUser(u)}>
          {u.active ? "Disable" : "Enable"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <h2>Quản lý tài khoản</h2>
      <Button danger onClick={disableAll} style={{ marginBottom: 16 }}>
        Vô hiệu hóa tất cả
      </Button>
      <Table rowKey="id" columns={columns} dataSource={users} />
    </>
  );
}
