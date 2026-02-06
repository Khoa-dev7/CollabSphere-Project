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
import { useState, useEffect } from "react";
import api from "../../../../../api"; // centralized api

const { TextArea } = Input;

export default function CreateProject() {
  const [form] = Form.useForm();
  const [milestones, setMilestones] = useState([{ id: Date.now() }]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch subjects for dropdown
    api.get("/subjects/")
      .then(res => setSubjects(res.data))
      .catch(err => console.error("Failed to load subjects", err));
  }, []);

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now() }]);
  };

  const removeMilestone = (id) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare Payload
      // milestones is an array of strings in values.milestones (from Form)
      // We need to combine it with our milestones state if needed, or just rely on Form values.
      // The Form.List or dynamic fields usage above was manual.
      // Let's assume values.milestones is an array of strings.

      const payload = {
        title: values.title,
        description: values.description,
        objectives: values.objectives,
        subject_id: values.subject, // Select value should be ID
        milestones_info: JSON.stringify(values.milestones || [])
      };

      const res = await api.post("/projects/", payload);
      message.success(`Project "${res.data.title}" created successfully!`);

      form.resetFields();
      setMilestones([{ id: Date.now() }]);
    } catch (err) {
      console.error(err);
      message.error("Failed to create project. " + (err.response?.data?.detail || ""));
    } finally {
      setLoading(false);
    }
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
          rules={[{ required: true, message: "Please select a subject" }]}
        >
          <Select placeholder="Select subject" loading={subjects.length === 0}>
            {subjects.map(sub => (
              <Select.Option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </Select.Option>
            ))}
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
              rules={[{ required: true, message: "Required" }]}
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit for Approval
          </Button>
          <Button htmlType="reset">Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}

