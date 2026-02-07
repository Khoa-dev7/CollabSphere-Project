import { Card, Form, Input, Button } from "antd";
import PageWrapper from "../components/PageWrapper";

export default function Login() {
  return (
    <PageWrapper>
      <Card title="Login" style={{ maxWidth: 400, margin: "0 auto" }} hoverable>
        <Form layout="vertical">
          <Form.Item label="Email">
            <Input />
          </Form.Item>
          <Form.Item label="Password">
            <Input.Password />
          </Form.Item>
          <Button type="primary" block>
            Login
          </Button>
        </Form>
      </Card>
    </PageWrapper>
  );
}
