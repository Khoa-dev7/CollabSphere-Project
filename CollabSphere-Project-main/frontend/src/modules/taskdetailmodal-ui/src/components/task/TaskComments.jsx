import { List, Input, Button } from "antd";
import { useState } from "react";

export default function TaskComments() {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const addComment = () => {
    if (!text) return;
    setComments([...comments, text]);
    setText("");
  };

  return (
    <>
      <List
        size="small"
        dataSource={comments}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />

      <Input
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginTop: 8 }}
      />

      <Button type="primary" onClick={addComment} style={{ marginTop: 8 }}>
        Add Comment
      </Button>
    </>
  );
}
