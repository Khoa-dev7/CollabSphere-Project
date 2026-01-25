import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">CollabSphere</h2>

      <nav className="menu">
        <NavLink className="menu-item" to="/">🏠 Dashboard</NavLink>
        <NavLink className="menu-item" to="/profile">👤 Hồ sơ</NavLink>
        <NavLink className="menu-item" to="/timeline">🗓 Timeline</NavLink>
        <NavLink className="menu-item" to="/team">👥 Team</NavLink>
        <NavLink className="menu-item danger">🚪 Đăng xuất</NavLink>
      </nav>
    </aside>
  );
}
