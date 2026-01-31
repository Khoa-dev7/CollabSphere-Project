import { useMemo } from "react";
import Layout from "../components/Layout";
import KanbanBoard from "../components/KanbanBoard";

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Môn đang học", value: 3 },
      { label: "Task tuần này", value: 9 },
      { label: "Thông báo mới", value: 2 },
      { label: "Điểm trung bình", value: "8.4" },
    ],
    []
  );

  const timeline = useMemo(
    () => [
      { id: 1, title: "PHAN-49 UI Courses + Syllabus", time: "Jan 05", status: "done" },
      { id: 2, title: "PHAN-39 Cắt Dashboard", time: "Jan 07", status: "due" },
      { id: 3, title: "PHAN-84 Grading Table", time: "Jan 11", status: "due" },
    ],
    []
  );

  const notices = useMemo(
    () => [
      { id: 1, title: "Bạn có bài tập mới", time: "Hôm nay 08:10" },
      { id: 2, title: "Điểm đã được cập nhật", time: "Hôm qua 21:40" },
      { id: 3, title: "Team có thông báo mới", time: "Hôm qua 16:05" },
    ],
    []
  );

  return (
    <Layout title="Dashboard">
      <div className="stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card">
          <h3 style={{ marginBottom: 12 }}>Timeline</h3>
          <div className="mini-timeline">
            {timeline.map((t) => (
              <div key={t.id} className="mini-item">
                <div className={`dot ${t.status}`} />
                <div className="mini-body">
                  <div className="mini-title">{t.title}</div>
                  <div className="mini-time">{t.time}</div>
                </div>
                <span className={`tag ${t.status}`}>
                  {t.status === "done" ? "Hoàn thành" : "Sắp tới"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 style={{ marginBottom: 12 }}>Thông báo</h3>
          <div className="notice-list">
            {notices.map((n) => (
              <div key={n.id} className="notice-item">
                <div className="notice-title">{n.title}</div>
                <div className="notice-time">{n.time}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ✅ Kanban */}
      <KanbanBoard />
    </Layout>
  );
}
