import {
  Table,
  Input,
  InputNumber,
  Button,
  Space,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";

const { Text } = Typography;

export default function RubricTable() {
  const [criteria, setCriteria] = useState([
    { key: 1, name: "Contribution", weight: 40 },
    { key: 2, name: "Teamwork", weight: 30 },
  ]);

  const totalWeight = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  }, [criteria]);

  const addRow = () => {
    setCriteria([
      ...criteria,
      { key: Date.now(), name: "", weight: 0 },
    ]);
  };

  const deleteRow = (key) => {
    setCriteria(criteria.filter((c) => c.key !== key));
  };

  const updateRow = (key, field, value) => {
    setCriteria(
      criteria.map((c) =>
        c.key === key ? { ...c, [field]: value } : c
      )
    );
  };

  const columns = [
    {
      title: "Evaluation Criteria",
      dataIndex: "name",
      render: (_, record) => (
        <Input
          placeholder="Enter criteria"
          value={record.name}
          onChange={(e) =>
            updateRow(record.key, "name", e.target.value)
          }
        />
      ),
    },
    {
      title: "Weight (%)",
      width: 160,
      dataIndex: "weight",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.weight}
          onChange={(value) =>
            updateRow(record.key, "weight", value || 0)
          }
        />
      ),
    },
    {
      title: "Action",
      width: 100,
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.key)}
        />
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={criteria}
        pagination={false}
        bordered
      />

      <Space style={{ marginTop: 16 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addRow}
        >
          Add Criteria
        </Button>

        <Text strong>Total Weight:</Text>
        <Tag color={totalWeight === 100 ? "green" : "red"}>
          {totalWeight}%
        </Tag>

        {totalWeight !== 100 && (
          <Text type="danger">
            Total weight must equal 100%
          </Text>
        )}
      </Space>
    </>
  );
}
