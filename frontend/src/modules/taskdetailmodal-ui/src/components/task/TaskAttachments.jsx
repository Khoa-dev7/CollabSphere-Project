import { useEffect, useState } from "react";
import { Upload, Button, List, message, Popconfirm } from "antd";
import { UploadOutlined, DeleteOutlined, PaperClipOutlined, DownloadOutlined } from "@ant-design/icons";
import api from "../../../../../api";

export default function TaskAttachments({ taskId }) {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/attachments`);
      // Backend now returns { id, filename, file_path, url }
      // We map to Antd file object structure where possible, or custom
      const mapped = res.data.map((item) => ({
        uid: item.id,
        name: item.filename,
        status: 'done',
        url: api.defaults.baseURL + item.url, // Full URL for download
        // We can also just use item.url if we want relative, but for external link full is better?
        // Actually, if we use <a href="..."> it should be fine.
        // Let's rely on relative if it starts with /static
        // But api.defaults.baseURL might be http://localhost:8000
        downloadUrl: item.url
      }));
      setFileList(mapped);
    } catch (err) {
      console.error("Fetch attachments failed", err);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Upload thành công");
      onSuccess("Ok");
      fetchAttachments(); // Refresh list
    } catch (err) {
      console.error("Upload failed", err);
      message.error("Upload thất bại");
      onError({ err });
    }
  };

  const handleDelete = async (file) => {
    try {
      await api.delete(`/tasks/${taskId}/attachments/${file.uid}`);
      message.success("Xóa file thành công");
      fetchAttachments();
    } catch (err) {
      console.error("Delete failed", err);
      message.error("Không thể xóa file");
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h4><PaperClipOutlined /> Đính kèm</h4>
      <List
        size="small"
        dataSource={fileList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a href={api.defaults.baseURL + item.downloadUrl} target="_blank" rel="noreferrer" key="download">
                <DownloadOutlined />
              </a>,
              <Popconfirm title="Xóa file?" onConfirm={() => handleDelete(item)}>
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<PaperClipOutlined />}
              title={<a href={api.defaults.baseURL + item.downloadUrl} target="_blank" rel="noreferrer">{item.name}</a>}
            />
          </List.Item>
        )}
      />
      <div style={{ marginTop: 8 }}>
        <Upload
          customRequest={handleUpload}
          showUploadList={false} // We implement our own list
        >
          <Button icon={<UploadOutlined />}>Thêm file</Button>
        </Upload>
      </div>
    </div>
  );
}
