import { useState } from "react";
import "../style.css";

export default function Timeline() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const tasks = [
    {
      week: "Tuần 1",
      title: "Phân tích yêu cầu",
      desc: "Thu thập yêu cầu, xác định chức năng chính.",
      status: "done",
    },
    {
      week: "Tuần 2",
      title: "Thiết kế UI/UX",
      desc: "Vẽ wireframe, thiết kế giao diện.",
      status: "done",
    },
    {
      week: "Tuần 3",
      title: "Code giao diện Frontend",
      desc: "HTML, CSS, JavaScript cho hệ thống.",
      status: "due",
    },
    {
      week: "Tuần 4",
      title: "Tích hợp & kiểm thử",
      desc: "Fix lỗi, hoàn thiện sản phẩm.",
      status: "due",
    },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <h2 className="logo">CollabSphere</h2>
        <nav className="menu">
          <a className="menu-item" href="/dashboard">🏠 Dashboard</a>
          <a className="menu-item" href="/profile">👤 Hồ sơ</a>
          <a className="menu-item active" href="/timeline">🗓 Timeline</a>
          <a className="menu-item" href="/team">👥 Team</a>
          <a className="menu-item danger" href="#">🚪 Đăng xuất</a>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main">
        {/* Header */}
        <div className="page-head">
          <h1>Timeline dự án</h1>
          <p className="muted">
            Theo dõi tiến độ học tập và các mốc quan trọng của môn học
          </p>
        </div>

        {/* Filter */}
        <div className="toolbar">
          <div className="chips">
            <button
              className={`chip ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              className={`chip ${filter === "due" ? "active" : ""}`}
              onClick={() => setFilter("due")}
            >
              Chưa hoàn thành
            </button>
            <button
              className={`chip ${filter === "done" ? "active" : ""}`}
              onClick={() => setFilter("done")}
            >
              Hoàn thành
            </button>
          </div>

          <input
            className="search"
            placeholder="🔍 Tìm task theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Timeline */}
        <section className="card">
          <ul className="timeline">
            {filteredTasks.map((t, i) => (
              <li key={i} className={`task ${t.status}`}>
                <div className="time">{t.week}</div>
                <div className="content">
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  {t.status === "done" ? (
                    <span className="status done">✔ Đã hoàn thành</span>
                  ) : (
                    <span className="status due">⏳ Chưa hoàn thành</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
