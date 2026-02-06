import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `menu-item${isActive ? " active" : ""}`;

  const role = localStorage.getItem("role") || "";
  const r = role.toLowerCase();

  return (
    <aside className="sidebar">
      <h2 className="logo">CollabSphere</h2>

      <nav className="menu">
        <NavLink to="/" end className={linkClass}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/ai-chat" className={linkClass}>
          🤖 Trợ lý AI
        </NavLink>

        {/* --- SYSTEM ADMIN (Admin) --- */}
        {(r === "admin") && (
          <>
            <NavLink to="/activity" className={linkClass}>
              📜 Nhật ký hệ thống
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              👥 Quản lý người dùng
            </NavLink>
          </>
        )}

        {/* --- ACADEMIC STAFF (Staff) --- */}
        {(r === "staff") && (
          <>
            <NavLink to="/admin" className={linkClass}>
              ⚙️ Nhập liệu & Quản trị
            </NavLink>
            <NavLink to="/courses" className={linkClass}>
              📚 Môn học & Syllabus
            </NavLink>
            <NavLink to="/rubrics" className={linkClass}>
              📋 Quản lý Rubrics
            </NavLink>
          </>
        )}

        {/* --- HEAD OF DEPARTMENT (Head) --- */}
        {(r === "head" || r === "head_dept") && (
          <>
            <NavLink to="/courses" className={linkClass}>
              📚 Xem Môn học
            </NavLink>
            <NavLink to="/admin?tab=approval" className={linkClass}>
              ✅ Duyệt dự án
            </NavLink>
            <NavLink to="/grading" className={linkClass}>
              📊 Báo cáo điểm
            </NavLink>
          </>
        )}

        {/* --- LECTURER --- */}
        {(r === "lecturer") && (
          <>
            <NavLink to="/courses" className={linkClass}>
              📚 Môn học
            </NavLink>
            <NavLink to="/teams" className={linkClass}>
              👥 Quản lý nhóm
            </NavLink>
            <NavLink to="/workspace" className={linkClass}>
              🛠️ Workspace Dự án
            </NavLink>
            <NavLink to="/rubrics" className={linkClass}>
              📋 Rubrics
            </NavLink>
            <NavLink to="/grading" className={linkClass}>
              🧮 Chấm điểm
            </NavLink>
            <NavLink to="/chat" className={linkClass}>
              💬 Chat & Meeting
            </NavLink>
            <NavLink to="/whiteboard" className={linkClass}>
              ✏️ Bảng trắng
            </NavLink>
            <NavLink to="/meeting" className={linkClass}>
              🎥 Họp trực tuyến
            </NavLink>
            <NavLink to="/documents" className={linkClass}>
              📂 Tài liệu
            </NavLink>
          </>
        )}

        {/* --- STUDENT --- */}
        {(r === "student") && (
          <>
            <NavLink to="/courses" className={linkClass}>
              📚 Môn học
            </NavLink>
            <NavLink to="/workspace" className={linkClass}>
              🛠️ Team Workspace
            </NavLink>
            <NavLink to="/team" className={linkClass}>
              👥 Thành viên nhóm
            </NavLink>
            <NavLink to="/chat" className={linkClass}>
              💬 Chat nhóm
            </NavLink>
            <NavLink to="/whiteboard" className={linkClass}>
              ✏️ Bảng trắng
            </NavLink>
            <NavLink to="/meeting" className={linkClass}>
              🎥 Họp trực tuyến
            </NavLink>
            <NavLink to="/documents" className={linkClass}>
              📂 Tài liệu nhóm
            </NavLink>
            <NavLink to="/peer-review" className={linkClass}>
              ⭐ Đánh giá đồng đẳng
            </NavLink>
            <NavLink to="/my-grades" className={linkClass}>
              🎓 Kết quả học tập
            </NavLink>
            <NavLink to="/activity" className={linkClass}>
              📜 Lịch sử nhóm
            </NavLink>
          </>
        )}

        {/* --- SHARED --- */}
        <div style={{ height: "1px", background: "#eee", margin: "10px 0" }}></div>

        <NavLink to="/profile" className={linkClass}>
          👤 Hồ sơ
        </NavLink>

        <NavLink to="/logout" className="menu-item danger">
          🚪 Đăng xuất
        </NavLink>
      </nav>
    </aside>
  );
}
