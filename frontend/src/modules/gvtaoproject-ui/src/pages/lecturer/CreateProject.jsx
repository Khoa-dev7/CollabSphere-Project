import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Divider,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

const { TextArea } = Input;

export default function CreateProject() {
  const [form] = Form.useForm();
  const [milestones, setMilestones] = useState([{ id: Date.now() }]);

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now() }]);
  };

  const removeMilestone = (id) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const onSubmit = (values) => {
    console.log("Project data:", values);
    message.success("Project created successfully!");
    form.resetFields();
    setMilestones([{ id: Date.now() }]);
  };

  return (
    <Card
      title="📘 Create New Project"
      className="page-card"
      extra={<span>Lecturer Panel</span>}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onSubmit}
      >
        {/* Project Name */}
        <Form.Item
          label="Project Title"
          name="title"
          rules={[{ required: true, message: "Please enter project title" }]}
        >
          <Input placeholder="e.g. Smart Campus Management System" />
        </Form.Item>

        {/* Subject */}
        <Form.Item
          label="Subject"
          name="subject"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select subject">
            <Select.Option value="SE">Software Engineering</Select.Option>
            <Select.Option value="CNPM">Software Project Management</Select.Option>
            <Select.Option value="AI">Artificial Intelligence</Select.Option>
          </Select>
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Project Description"
          name="description"
          rules={[{ required: true }]}
        >
          <TextArea rows={4} placeholder="Describe project overview..." />
        </Form.Item>

        {/* Objectives */}
        <Form.Item
          label="Project Objectives"
          name="objectives"
          rules={[{ required: true }]}
        >
          <TextArea rows={3} placeholder="List learning & technical objectives" />
        </Form.Item>

        <Divider>📍 Project Milestones</Divider>

        {milestones.map((m, index) => (
          <Space
            key={m.id}
            direction="vertical"
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Form.Item
              label={`Milestone ${index + 1}`}
              name={["milestones", index]}
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Requirement Analysis & Proposal" />
            </Form.Item>

            {milestones.length > 1 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeMilestone(m.id)}
              >
                Remove Milestone
              </Button>
            )}

            <Divider dashed />
          </Space>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addMilestone}
          style={{ width: "100%", marginBottom: 24 }}
        >
          Add Milestone
        </Button>

        <Divider />

        {/* Submit */}
        <Space>
          <Button type="primary" htmlType="submit">
            Submit for Approval
          </Button>
          <Button htmlType="reset">Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}
