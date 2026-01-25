import { useState, useRef } from "react";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("profile");
  const [showPwd, setShowPwd] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "Trần Văn C",
    dob: "2006-06-02",
    email: "abc@school.edu.vn",
    phone: "0823456789",
    address: "Quận Gò Vấp, TP.HCM",
    studentCode: "UT20241009",
    faculty: "Công nghệ thông tin",
    className: "CNTT05",
    schoolYear: "2024–2028",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="user-card">
          <div
            className="avatar avatar-edit"
            onClick={() => fileRef.current.click()}
          >
            <img src="/images/avatar.jpg" alt="Avatar" />
            <input type="file" hidden ref={fileRef} />
          </div>
          <p className="avatar-note">Bấm vào ảnh để đổi</p>

          <div className="user-name">{form.fullName}</div>
          <div className="user-sub">UT20241009 · Sinh viên</div>

          <div className="btn-row">
            {!editing ? (
              <button className="btn primary" onClick={() => setEditing(true)}>
                Chỉnh sửa
              </button>
            ) : (
              <button className="btn" onClick={() => setEditing(false)}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <nav className="menu">
          <a className="menu-item" href="/">🏠 Trang chủ</a>
          <button
            className={`menu-item ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            📄 Hồ sơ
          </button>
          <button
            className={`menu-item ${tab === "security" ? "active" : ""}`}
            onClick={() => setTab("security")}
          >
            🔒 Bảo mật
          </button>
          <a className="menu-item danger" href="#">🚪 Đăng xuất</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        {tab === "profile" && (
          <section className="card">
            <h2>Thông tin cá nhân</h2>
            <div className="form grid">
              <input name="fullName" value={form.fullName} disabled={!editing} onChange={handleChange} />
              <input type="date" name="dob" value={form.dob} disabled={!editing} onChange={handleChange} />
              <input value={form.email} disabled />
              <input name="phone" value={form.phone} disabled={!editing} onChange={handleChange} />
              <input name="address" value={form.address} disabled={!editing} onChange={handleChange} />
            </div>
          </section>
        )}

        {tab === "security" && (
          <section className="card">
            <h2>Bảo mật</h2>
            <button className="btn primary" onClick={() => setShowPwd(true)}>
              Đổi mật khẩu
            </button>
          </section>
        )}
      </main>

      {/* Modal */}
      {showPwd && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setShowPwd(false)} />
          <div className="modal-card">
            <h3>Đổi mật khẩu</h3>
            <input type="password" placeholder="Mật khẩu cũ" />
            <input type="password" placeholder="Mật khẩu mới" />
            <input type="password" placeholder="Nhập lại mật khẩu" />
            <button className="btn primary" onClick={() => setShowPwd(false)}>
              Cập nhật
            </button>
          </div>
        </div>
      )}
    </div>
  );
}