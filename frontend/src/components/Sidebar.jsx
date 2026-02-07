import { NavLink } from "react-router-dom";

/**
 * Component Sidebar - Thanh điều hướng chính của hệ thống.
 * Hiển thị các liên kết chức năng dựa trên vai trò (Role) của người dùng đã đăng nhập.
 */
export default function Sidebar() {
  // Hàm xác định class CSS cho link dựa trên trạng thái đang được chọn (Active)
  const linkClass = ({ isActive }) =>
    `menu-item${isActive ? " active" : ""}`;

  // Lấy vai trò người dùng từ localStorage để phân quyền hiển thị menu
  const role = localStorage.getItem("role") || "";
  const r = role.toLowerCase();

  return (
    <aside className="sidebar">
      <h2 className="logo">CollabSphere</h2>

      <nav className="menu">
        {/* Dashboard chung cho mọi người dùng */}
        <NavLink to="/" end className={linkClass}>
          🏠 Dashboard
        </NavLink>

        {/* Trợ lý ảo AI sử dụng chung */}
        <NavLink to="/ai-chat" className={linkClass}>
          🤖 Trợ lý AI
        </NavLink>

        {/* --- MENU DÀNH CHO QUẢN TRỊ VIÊN HỆ THỐNG (Admin) --- */}
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

        {/* --- MENU DÀNH CHO NHÂN VIÊN HỌC VỤ (Staff) --- */}
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

        {/* --- MENU DÀNH CHO TRƯỞNG BỘ MÔN (Head) --- */}
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

        {/* --- MENU DÀNH CHO GIẢNG VIÊN (Lecturer) --- */}
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

        {/* --- MENU DÀNH CHO SINH VIÊN (Student) --- */}
        {(r === "student") && (
          <>
            <NavLink to="/courses" className={linkClass}>
              📚 Môn học
            </NavLink>
            <NavLink to="/teams" className={linkClass}>
              👥 Danh sách nhóm
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
            {/* <NavLink to="/documents" className={linkClass}>
              📂 Tài liệu nhóm
            </NavLink> */}
            <NavLink to="/my-grades" className={linkClass}>
              🎓 Kết quả học tập
            </NavLink>
            <NavLink to="/activity" className={linkClass}>
              📜 Lịch sử nhóm
            </NavLink>
          </>
        )}

        {/* Phân tách giữa các mục chức năng và mục tài khoản */}
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
