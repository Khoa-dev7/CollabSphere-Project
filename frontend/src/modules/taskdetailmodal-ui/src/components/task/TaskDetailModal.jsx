import { useState, useEffect } from "react";
import { Modal, Tabs, Input, Button, message } from "antd";
import TaskComments from "./TaskComments";
import TaskChecklist from "./TaskChecklist";
import TaskAttachments from "./TaskAttachments";

const { TextArea } = Input;

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const [description, setDescription] = useState(task?.description || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDescription(task?.description || "");
  }, [task]);

  const onSuggest = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/ai/predict-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: description }),
      });
      const data = await response.json();
      if (data.suggestion) {
        setDescription(data.suggestion);
        message.success("AI đã gợi ý xong! ✨");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi AI Suggestion");
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ description }),
      });
      if (response.ok) {
        message.success("Đã cập nhật mô tả!");
      } else {
        message.error("Lỗi khi cập nhật");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi kết nối");
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="suggest" icon="✨" onClick={onSuggest} loading={loading}>
          Gợi ý AI
        </Button>,
        <Button key="save" type="primary" onClick={onSave}>
          Lưu mô tả
        </Button>
      ]}
      width={700}
      title={task?.title}
    >
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Mô tả công việc:</p>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả task..."
        />
      </div>

      <Tabs
        items={[
          {
            key: "1",
            label: "Comments",
            children: <TaskComments taskId={task?.id} />,
          },
          {
            key: "2",
            label: "Checklist",
            children: <TaskChecklist taskId={task?.id} />,
          },
          {
            key: "3",
            label: "Attachments",
            children: <TaskAttachments taskId={task?.id} />,
          },
        ]}
      />
    </Modal>
  );
}
