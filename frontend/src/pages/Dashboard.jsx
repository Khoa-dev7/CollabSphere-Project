import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import KanbanBoard from "../components/KanbanBoard";
import api from "../api"; // Custom axios instance

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    active_courses: 0,
    active_tasks: 0,
    unread_notifications: 0,
    gpa: "N/A"
  });

  const [tasks, setTasks] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    // 1. Fetch Stats
    api.get("/dashboard/me/stats")
      .then(res => setStatsData(res.data))
      .catch(err => console.error("Failed to fetch dashboard stats", err));

    // 2. Fetch Tasks (Timeline)
    api.get("/workspace/tasks/me/list?limit=5")
      .then(res => setTasks(res.data))
      .catch(err => console.error("Failed to fetch tasks", err));

    // 3. Fetch Notifications
    api.get("/notifications/?limit=3")
      .then(res => setNotices(res.data))
      .catch(err => console.error("Failed to fetch notifications", err));

  }, []);

  const stats = useMemo(
    () => [
      { label: "Môn đang học", value: statsData.active_courses },
      { label: "Task tuần này", value: statsData.active_tasks },
      { label: "Thông báo mới", value: statsData.unread_notifications },
      { label: "Điểm trung bình", value: statsData.gpa },
    ],
    [statsData]
  );

  const timeline = useMemo(
    () => tasks.map(t => ({
      id: t.id,
      title: t.title,
      time: t.due_date ? new Date(t.due_date).toLocaleDateString() : "No deadline",
      status: t.status.toLowerCase().replace(" ", "")
    })),
    [tasks]
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
      <KanbanBoard teamId={statsData.team_id} />
    </Layout>
  );
}
