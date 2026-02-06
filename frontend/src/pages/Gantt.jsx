import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";
import EmptyState from "../components/EmptyState";

export default function Gantt() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all user tasks
    api.get("/workspace/tasks/me/list?limit=50")
      .then(res => {
        // Filter tasks that have due dates
        const tasksWithDates = res.data.filter(t => t.due_date);
        setTasks(tasksWithDates);
      })
      .catch(err => console.error("Failed to fetch Gantt tasks", err))
      .finally(() => setLoading(false));
  }, []);

  const daysBetween = (a, b) => {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    return Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);
  };

  const ganttData = useMemo(() => {
    if (tasks.length === 0) return { items: [], totalDays: 1, startRef: new Date() };

    // Find min and max dates
    const dates = tasks.map(t => new Date(t.due_date).getTime());
    // Since task only has due_date, we estimate a 3-day duration for the bar 
    // ending at the due_date for visualization purposes.
    const startRef = new Date(Math.min(...dates) - (5 * 24 * 60 * 60 * 1000)); // 5 days before first due date
    const endRef = new Date(Math.max(...dates) + (2 * 24 * 60 * 60 * 1000));   // 2 days after last due date
    const totalDays = daysBetween(startRef, endRef);

    const items = tasks.map(t => {
      const dueDate = new Date(t.due_date);
      const startDate = new Date(dueDate.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days duration

      const offset = daysBetween(startRef, startDate) - 1;
      const span = 3; // Fixed span of 3 days

      return {
        id: t.id,
        name: t.title,
        status: t.status,
        start: startDate.toLocaleDateString(),
        end: dueDate.toLocaleDateString(),
        leftPct: (offset / totalDays) * 100,
        widthPct: (span / totalDays) * 100,
        progress: t.status === "Done" ? 100 : (t.status === "Doing" ? 50 : 10)
      };
    });

    return { items, totalDays, startRef };
  }, [tasks]);

  return (
    <Layout title="Biểu đồ Gantt">
      <div className="card">
        <div className="row-between" style={{ marginBottom: 20 }}>
          <h3>Tiến độ công việc</h3>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            * Biểu đồ dựa trên ngày hạn (due date) của các task
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.6 }}>Đang tải dữ liệu...</div>
        ) : ganttData.items.length === 0 ? (
          <EmptyState
            icon="Task"
            title="Chưa có dữ liệu Gantt"
            message="Hãy gán ngày hạn (Due Date) cho các task trong Workspace để xem biểu đồ tiến độ."
          />
        ) : (
          <div className="gantt-container" style={{ overflowX: 'auto' }}>
            <div className="gantt" style={{ minWidth: 600 }}>
              {ganttData.items.map((t) => (
                <div key={t.id} className="gantt-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div className="gantt-name" style={{ width: 140, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 10 }}>
                    {t.name}
                  </div>
                  <div className="gantt-track" style={{ flex: 1, background: '#f1f5f9', height: 24, borderRadius: 12, position: 'relative' }}>
                    <div
                      className="gantt-bar"
                      style={{
                        position: 'absolute',
                        left: `${t.leftPct}%`,
                        width: `${t.widthPct}%`,
                        height: '100%',
                        background: '#3b82f6',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s'
                      }}
                      title={`${t.start} → ${t.end}`}
                    >
                      <span
                        className="gantt-progress"
                        style={{
                          display: 'block',
                          height: '100%',
                          width: `${t.progress}%`,
                          background: '#1d4ed8'
                        }}
                      />
                    </div>
                  </div>
                  <div className="gantt-meta" style={{ width: 60, textAlign: 'right', fontSize: 12, color: '#64748b', marginLeft: 10 }}>
                    {t.progress}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gantt-bar:hover {
          filter: brightness(1.1);
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
      `}</style>
    </Layout>
  );
}
