import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function TaskAttachments() {
  return (
    <Upload>
      <Button icon={<UploadOutlined />}>Upload file</Button>
    </Upload>
  );
}
