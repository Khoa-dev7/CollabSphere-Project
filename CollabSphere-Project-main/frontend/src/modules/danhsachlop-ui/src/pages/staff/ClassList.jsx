import { Card, Table } from "antd";

const dataSource = [
  {
    key: "1",
    classCode: "SE123",
    subject: "Software Engineering",
    lecturer: "Nguyễn Văn A",
  },
  {
    key: "2",
    classCode: "AI202",
    subject: "Artificial Intelligence",
    lecturer: "Trần Thị B",
  },
];

const columns = [
  {
    title: "Mã lớp",
    dataIndex: "classCode",
    key: "classCode",
  },
  {
    title: "Môn học",
    dataIndex: "subject",
    key: "subject",
  },
  {
    title: "Giảng viên",
    dataIndex: "lecturer",
    key: "lecturer",
  },
];

function ClassList() {
  return (
    <Card title="Danh sách lớp">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </Card>
  );
}

export default ClassList;
