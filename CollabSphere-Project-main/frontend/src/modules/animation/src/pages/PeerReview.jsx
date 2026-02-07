import {
  Card,
  Form,
  Select,
  Rate,
  Slider,
  Input,
  Button,
} from "antd";
import PageWrapper from "../components/PageWrapper";

export default function PeerReview() {
  return (
    <PageWrapper>
      <Card title="Peer Review Evaluation" hoverable>
        <Form layout="vertical">
          <Form.Item label="Team Member">
            <Select placeholder="Select member">
              <Select.Option value="1">Nguyen Van A</Select.Option>
              <Select.Option value="2">Tran Thi B</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Rating">
            <Rate />
          </Form.Item>

          <Form.Item label="Contribution Score">
            <Slider />
          </Form.Item>

          <Form.Item label="Feedback">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button type="primary" block>
            Submit Evaluation
          </Button>
        </Form>
      </Card>
    </PageWrapper>
  );
}
