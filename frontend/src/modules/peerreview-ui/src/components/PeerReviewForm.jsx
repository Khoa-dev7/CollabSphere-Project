import {
  Card,
  Form,
  Select,
  Rate,
  Slider,
  Input,
  Button,
  message,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;

const teamMembers = [
  { id: 1, name: "Nguyen Van A" },
  { id: 2, name: "Tran Thi B" },
  { id: 3, name: "Le Van C" },
  { id: 4, name: "Pham Thi D" },
];

export default function PeerReviewForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Peer Review Data:", values);

    // 👉 Sau này nối API ở đây
    // POST /api/peer-review
    // body: values

    message.success("Peer review submitted successfully!");
    form.resetFields();
  };

  return (
    <Card
      title="Peer Review – Team Contribution Evaluation"
      style={{ maxWidth: 700, margin: "0 auto" }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          rating: 3,
          score: 50,
        }}
      >
        {/* Select member */}
        <Form.Item
          label="Select Team Member"
          name="memberId"
          rules={[{ required: true, message: "Please select a member" }]}
        >
          <Select placeholder="Choose a team member">
            {teamMembers.map((m) => (
              <Option key={m.id} value={m.id}>
                {m.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Star rating */}
        <Form.Item
          label="Contribution Rating (Stars)"
          name="rating"
          rules={[{ required: true }]}
        >
          <Rate />
        </Form.Item>

        {/* Slider score */}
        <Form.Item
          label="Contribution Score (%)"
          name="score"
          rules={[{ required: true }]}
        >
          <Slider
            min={0}
            max={100}
            marks={{
              0: "0%",
              50: "50%",
              100: "100%",
            }}
          />
        </Form.Item>

        {/* Comment */}
        <Form.Item
          label="Comments / Feedback"
          name="comment"
          rules={[
            { required: true, message: "Please enter your feedback" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Write your evaluation about this member’s contribution..."
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Peer Review
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
