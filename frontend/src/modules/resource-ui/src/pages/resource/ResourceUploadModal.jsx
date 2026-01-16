import { Modal, Upload, Select, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function ResourceUploadModal({ open, onClose }) {
  return (
    <Modal
      title="Upload Resource"
      open={open}
      onCancel={onClose}
      onOk={onClose}
    >
      <Select
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Select Resource Scope"
        options={[
          { value: "class", label: "Class" },
          { value: "team", label: "Team" },
          { value: "milestone", label: "Milestone" },
          { value: "checkpoint", label: "Checkpoint" },
        ]}
      />

      <Input placeholder="Resource description" style={{ marginBottom: 12 }} />

      <Upload>
        <UploadOutlined /> Select File
      </Upload>
    </Modal>
  );
}
