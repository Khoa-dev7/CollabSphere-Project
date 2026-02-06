import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import KanbanBoard from "../components/KanbanBoard";
import api from "../api"; // Instance axios đã được cấu hình (base URL, auth header)
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  // State lưu trữ các con số thống kê tổng quan
  const [statsData, setStatsData] = useState({
    active_courses: 0,
    active_tasks: 0,
    unread_notifications: 0,
    gpa: "N/A"
  });

  const [tasks, setTasks] = useState([]); // Danh sách nhiệm vụ thực tế
  const [notices, setNotices] = useState([]); // Danh sách thông báo mới nhất

  useEffect(() => {
    // 1. Lấy thống kê cá nhân (số môn, số task, thông báo)
    api.get("/dashboard/me/stats")
      .then(res => setStatsData(res.data))
      .catch(err => console.error("Failed to fetch dashboard stats", err));

    // 2. Lấy danh sách nhiệm vụ của tôi (cho phần Timeline)
    api.get("/workspace/tasks/me/list?limit=5")
      .then(res => setTasks(res.data))
      .catch(err => console.error("Failed to fetch tasks", err));

    // 3. Lấy các thông báo mới nhất (giới hạn 3)
    api.get("/notifications/?limit=3")
      .then(res => setNotices(res.data))
      .catch(err => console.error("Failed to fetch notifications", err));

  }, []);

  // Định dạng dữ liệu thống kê để hiển thị lên UI card
  const stats = useMemo(
    () => [
      { label: "Môn đang học", value: statsData.active_courses },
      { label: "Task tuần này", value: statsData.active_tasks },
      { label: "Thông báo mới", value: statsData.unread_notifications },
      { label: "Điểm trung bình", value: statsData.gpa },
    ],
    [statsData]
  );

  // Định dạng dữ liệu nhiệm vụ cho phần Timeline mini
  const timeline = useMemo(
    () => tasks.map(t => ({
      id: t.id,
      title: t.title,
      time: t.due_date ? new Date(t.due_date).toLocaleDateString() : "Không có hạn",
      status: (t.status || "todo").toLowerCase().replace(/\s/g, "")
    })),
    [tasks]
  );


  return (
    <Layout title="Bảng điều khiển">
      {/* Phần hiển thị các thẻ thống kê nhanh */}
      <div className="stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Cột trái: Timeline các nhiệm vụ sắp tới */}
        <section className="card">
          <h3 style={{ marginBottom: 12 }}>Tiến độ nhiệm vụ</h3>
          <div className="mini-timeline">
            {timeline.length === 0 ? (
              <EmptyState icon="Task" title="Chưa có timeline" message="Các nhiệm vụ sắp tới của bạn sẽ xuất hiện tại đây." />
            ) : (
              timeline.map((t) => (
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
              ))
            )}
          </div>
        </section>

        {/* Cột phải: Danh sách thông báo mới nhất */}
        <section className="card">
          <h3 style={{ marginBottom: 12 }}>Thông báo mới</h3>
          <div className="notice-list">
            {notices.length === 0 ? (
              <EmptyState icon="Notice" title="Không có thông báo" message="Bạn hiện không có thông báo mới nào." />
            ) : (
              notices.map((n) => (
                <div key={n.id} className="notice-item">
                  <div className="notice-title">{n.content}</div>
                  <div className="notice-time">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Tích hợp bảng Kanban của nhóm người dùng đang tham gia */}
      <KanbanBoard teamId={statsData.team_id} />
    </Layout>
  );
}
