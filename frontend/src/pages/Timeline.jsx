import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Timeline() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workspace/tasks/me/list?limit=20")
      .then(res => setTasks(res.data))
      .catch(err => console.error("Failed to fetch timeline tasks", err))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(
    () => tasks.map(t => ({
      id: t.id,
      date: t.due_date ? new Date(t.due_date).toLocaleDateString() : "No deadline",
      title: t.title,
      note: t.description || "No description"
    })),
    [tasks]
  );

  return (
    <Layout title="Timeline">
      <div className="card">
        <h3>Lịch công việc</h3>
        <div className="timeline">
          {loading ? (
            <p>Đang tải...</p>
          ) : items.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Chưa có công việc nào trong timeline.</p>
          ) : items.map((t) => (
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
