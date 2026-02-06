import { List, Input, Button, message, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../../../../../api";
import moment from "moment";

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const addComment = async () => {
    if (!text) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/comments?content=${encodeURIComponent(text)}`);
      // Note: Backend expects 'content' as query param? 
      // Let's check backend signature: create_comment(task_id: int, content: str, ...)
      // FastAPI defaults scalar types to query params if not Body/Form.
      // Ideally should be Body.
      setText("");
      fetchComments();
    } catch (err) {
      message.error("Gửi bình luận thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <List
        size="small"
        dataSource={comments}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{item.user?.full_name || "Unknown"}</span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {item.created_at ? moment(item.created_at).fromNow() : ""}
                  </span>
                </div>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />

      <div style={{ display: "flex", marginTop: 8, gap: 8 }}>
        <Input
          placeholder="Viết bình luận..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={addComment}
        />
        <Button type="primary" loading={submitting} onClick={addComment}>
          Gửi
        </Button>
      </div>
    </>
  );
}
