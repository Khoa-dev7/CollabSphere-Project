import { Card, Progress } from "antd";

export default function TeamProgress() {
  return (
    <Card title="Team Progress">
      <p>Overall Completion</p>
      <Progress percent={65} status="active" />
      <p>Member Contribution</p>
      <Progress percent={80} success={{ percent: 50 }} />
    </Card>
  );
}
