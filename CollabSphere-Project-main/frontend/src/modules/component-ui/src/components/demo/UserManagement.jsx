import { useState } from "react";
import { message, Card } from "antd";
import BaseTable from "../common/BaseTable";
import BaseModal from "../common/BaseModal";

export default function UserManagement() {
  const [data, setData] = useState([
    { id: 1, name: "Nguyen Van A", description: "Lecturer" },
    { id: 2, name: "Tran Thi B", description: "Student" },
  ]);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Role", dataIndex: "description" },
  ];

  const onSubmit = (values) => {
    if (selected) {
      setData(
        data.map((item) =>
          item.id === selected.id ? { ...item, ...values } : item
        )
      );
      message.success("Updated successfully");
    } else {
      setData([...data, { id: Date.now(), ...values }]);
      message.success("Created successfully");
    }
    setOpen(false);
    setSelected(null);
  };

  return (
    <Card style={{ margin: 32 }}>
      <h2>User Management</h2>

      <BaseTable
        columns={columns}
        data={data}
        onView={(r) => message.info(JSON.stringify(r))}
        onEdit={(r) => {
          setSelected(r);
          setOpen(true);
        }}
        onDelete={(r) =>
          setData(data.filter((item) => item.id !== r.id))
        }
      />

      <BaseModal
        open={open}
        title={selected ? "Edit User" : "Create User"}
        initialValues={selected}
        onCancel={() => {
          setOpen(false);
          setSelected(null);
        }}
        onSubmit={onSubmit}
      />
    </Card>
  );
}
