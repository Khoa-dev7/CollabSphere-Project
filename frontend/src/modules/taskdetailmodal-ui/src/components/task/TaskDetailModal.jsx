import { Modal, Tabs } from "antd";
import TaskComments from "./TaskComments";
import TaskChecklist from "./TaskChecklist";
import TaskAttachments from "./TaskAttachments";

export default function TaskDetailModal({ isOpen, onClose, task }) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      title={task?.title}
    >
      <p>{task?.description}</p>

      <Tabs
        items={[
          {
            key: "1",
            label: "Comments",
            children: <TaskComments />,
          },
          {
            key: "2",
            label: "Checklist",
            children: <TaskChecklist />,
          },
          {
            key: "3",
            label: "Attachments",
            children: <TaskAttachments />,
          },
        ]}
      />
    </Modal>
  );
}
