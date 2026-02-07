import { Card, Input, List } from "antd";

const messages = [
  { user: "Lecturer", text: "Finish milestone 1 this week" },
  { user: "Student A", text: "We are working on UI" },
];

export default function ChatBox() {
  return (
    <Card title="Team Chat">
      <List
        size="small"
        dataSource={messages}
        renderItem={(m) => (
          <List.Item>
            <b>{m.user}:</b> {m.text}
          </List.Item>
        )}
      />
      <Input placeholder="Type message..." />
    </Card>
  );
}
