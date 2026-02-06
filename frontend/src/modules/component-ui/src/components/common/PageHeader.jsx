import { PageHeader as AntHeader, Button } from "@ant-design/icons";

export default function PageHeader({ title, onAdd }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h2>{title}</h2>
      <Button type="primary" onClick={onAdd}>
        + Add
      </Button>
    </div>
  );
}
