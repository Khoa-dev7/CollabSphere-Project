import { useMemo } from "react";
import Layout from "../components/Layout";

export default function Timeline() {
  const items = useMemo(
    () => [
      { id: 1, date: "2026-01-01", title: "Thiết kế UI", note: "Wireframe + layout" },
      { id: 2, date: "2026-01-05", title: "Code frontend", note: "Pages + components" },
      { id: 3, date: "2026-01-10", title: "Test hệ thống", note: "Bugfix + polish" },
    ],
    []
  );

  return (
    <Layout title="Timeline">
      <div className="card">
        <h3>Lịch công việc</h3>
        <div className="timeline">
          {items.map((t) => (
            <div key={t.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-date">{t.date}</div>
                <div className="timeline-title">{t.title}</div>
                <div className="timeline-note">{t.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
