import { Modal, Descriptions, List } from "antd";

export default function ProjectDetailModal({ project, onClose }) {
  return (
    <Modal open onCancel={onClose} footer={null} title="Project Detail">
      <Descriptions column={1}>
        <Descriptions.Item label="Name">{project.name}</Descriptions.Item>
        <Descriptions.Item label="Subject">{project.subject}</Descriptions.Item>
        <Descriptions.Item label="Lecturer">{project.lecturer}</Descriptions.Item>
        <Descriptions.Item label="Objectives">{project.objectives}</Descriptions.Item>
        <Descriptions.Item label="Description">{project.description}</Descriptions.Item>
      </Descriptions>

      <h4>Milestones</h4>
      <List
        dataSource={project.milestones}
        renderItem={item => <List.Item>{item}</List.Item>}
      />
    </Modal>
  );
}
