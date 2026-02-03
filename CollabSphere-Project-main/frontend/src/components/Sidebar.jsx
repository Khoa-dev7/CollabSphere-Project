import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `menu-item${isActive ? " active" : ""}`;

  return (
    <aside className="sidebar">
      <h2 className="logo">CollabSphere</h2>

      <nav className="menu">
        <NavLink to="/" end className={linkClass}>
          🏠 Dashboard
        </NavLink>

        {/* PHAN-49 */}
        <NavLink to="/courses" className={linkClass}>
          📚 Môn học
        </NavLink>

        <NavLink to="/timeline" className={linkClass}>
          🗓️ Timeline
        </NavLink>

        {/* Nếu có Gantt */}
        <NavLink to="/gantt" className={linkClass}>
          📊 Gantt
        </NavLink>

        <NavLink to="/grading" className={linkClass}>
          🧮 Grading
        </NavLink>

        <NavLink to="/team" className={linkClass}>
          👥 Team
        </NavLink>

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
