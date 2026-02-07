import { Card, Typography, Divider, Button, message } from "antd";
import RubricTable from "../components/rubric/RubricTable";

const { Title, Text } = Typography;

export default function RubricBuilder() {
  const handleSave = () => {
    message.success("Rubric saved successfully (demo)");
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>Rubric Builder</Title>
        <Text type="secondary">
          Create evaluation criteria and weight percentages for assessing
          student contributions in Project-Based Learning.
        </Text>

        <Divider />

        <RubricTable />

        <Divider />

        <Button type="primary" onClick={handleSave}>
          Save Rubric
        </Button>
      </Card>
    </div>
  );
}
