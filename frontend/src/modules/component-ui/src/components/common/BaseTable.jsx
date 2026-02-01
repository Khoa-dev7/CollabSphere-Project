import { Table, Button, Space } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function BaseTable({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
}) {
  const actionColumn = {
    title: "Actions",
    width: 160,
    render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} onClick={() => onView(record)} />
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record)}
        />
      </Space>
    ),
  };

  return (
    <Table
      rowKey="id"
      columns={[...columns, actionColumn]}
      dataSource={data}
      pagination={{ pageSize: 5 }}
    />
  );
}
