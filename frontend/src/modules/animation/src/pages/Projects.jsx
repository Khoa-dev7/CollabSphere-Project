import { Card, Button } from "antd";
import PageWrapper from "../components/PageWrapper";

export default function Projects() {
  return (
    <PageWrapper>
      <Card
        title="Project Management"
        extra={<Button type="primary">Create Project</Button>}
        hoverable
      >
        Manage project objectives, milestones and approvals
      </Card>
    </PageWrapper>
  );
}
