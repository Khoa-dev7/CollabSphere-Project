import "../style.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <main className="main">
      {/* Page Header */}
      <div className="page-head">
        <h1>Xin chào, Trần Văn C 👋</h1>
        <p className="muted">Tổng quan học tập học kỳ hiện tại</p>
      </div>

      {/* ===== STATS ===== */}
      <section className="stats">
        <div className="stat-card">
          <h3>📘 Môn học</h3>
          <div className="stat-number">6</div>
          <span className="muted">Đang theo học</span>
        </div>

        <div className="stat-card">
          <h3>⏰ Deadline</h3>
          <div className="stat-number">3</div>
          <span className="muted">Tuần này</span>
        </div>

        <div className="stat-card">
          <h3>📊 GPA</h3>
          <div className="stat-number">3.45</div>
          <span className="muted">Hệ 4.0</span>
        </div>

        <div className="stat-card highlight">
          <h3>📈 Tiến độ</h3>
          <div className="stat-number">72%</div>
          <span className="muted">Dự án hiện tại</span>
        </div>
      </section>

      {/* ===== CONTENT GRID ===== */}
      <section className="grid-2">
        {/* Timeline */}
        <div className="card">
          <h2>🗓 Công việc sắp tới</h2>

          <ul className="mini-timeline">
            <li>
              <span className="dot done"></span>
              <div>
                <strong>Thiết kế UI</strong>
                <div className="muted">Đã hoàn thành</div>
              </div>
            </li>

            <li>
              <span className="dot due"></span>
              <div>
                <strong>Code Frontend</strong>
                <div className="muted">Deadline: 20/01</div>
              </div>
            </li>

            <li>
              <span className="dot due"></span>
              <div>
                <strong>Kiểm thử hệ thống</strong>
                <div className="muted">Deadline: 25/01</div>
              </div>
            </li>
          </ul>

          <Link className="link" to="/timeline">
            → Xem toàn bộ timeline
          </Link>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2>🔔 Thông báo mới</h2>

          <ul className="notice-list">
            <li>
              <strong>[Môn CNPM]</strong> Nộp báo cáo Sprint 1
              <span className="time">2 giờ trước</span>
            </li>
            <li>
              <strong>[GVHD]</strong> Cập nhật yêu cầu đồ án
              <span className="time">Hôm qua</span>
            </li>
            <li>
              <strong>[Hệ thống]</strong> Deadline mới được thêm
              <span className="time">2 ngày trước</span>
            </li>
          </ul>

          <Link className="link" to="/notifications">
            → Xem tất cả thông báo
          </Link>
        </div>
      </section>
    </main>
  );
}
