import { Button, Card, Select } from "antd";
import ResourceTable from "./ResourceTable";
import ResourceUploadModal from "./ResourceUploadModal";
import { useState } from "react";

export default function ResourceManagement() {
  const [open, setOpen] = useState(false);

  return (
    <Card
      title="📁 Resource Management"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          Upload Resource
        </Button>
      }
    >
      <Select
        style={{ width: 300, marginBottom: 16 }}
        placeholder="Select Resource Scope"
        options={[
          { value: "class", label: "Class Resource" },
          { value: "team", label: "Team Resource" },
          { value: "milestone", label: "Milestone Resource" },
          { value: "checkpoint", label: "Checkpoint Resource" },
        ]}
      />

      <ResourceTable />
      <ResourceUploadModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
