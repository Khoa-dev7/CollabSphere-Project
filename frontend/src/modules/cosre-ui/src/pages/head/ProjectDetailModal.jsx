import { Modal, Descriptions, List } from "antd";

export default function ProjectDetailModal({ project, onClose }) {
  return (
    <Modal open onCancel={onClose} footer={null} title="Project Detail">
      <Descriptions column={1}>
        <Descriptions.Item label="Name">{project.title}</Descriptions.Item>
        <Descriptions.Item label="Subject ID">{project.subject_id}</Descriptions.Item>
        <Descriptions.Item label="Objectives">{project.objectives}</Descriptions.Item>
        <Descriptions.Item label="Description">{project.description}</Descriptions.Item>
        <Descriptions.Item label="Milestones">{project.milestones_info}</Descriptions.Item>
      </Descriptions>

    </Modal>
  );
}
