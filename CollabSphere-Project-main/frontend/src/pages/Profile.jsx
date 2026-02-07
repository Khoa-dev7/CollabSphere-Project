import { useState, useRef } from "react";
import Layout from "../components/Layout";


export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("profile");
  const [showPwd, setShowPwd] = useState(false);

  const fileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState("/images/avatar.jpg");

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  const onSave = () => {
    // TODO: gọi API update profile ở đây
    setEditing(false);
  };

  return (
    <Layout title="Profile">
      <div className="profile-shell">
        <aside className="profile-left card">
          <div className="user-card">
            <div className="avatar avatar-edit" onClick={() => fileRef.current?.click()}>
              <img src={avatarUrl} alt="Avatar" />
              <input type="file" hidden ref={fileRef} accept="image/*" onChange={onPickAvatar} />
            </div>
            <p className="avatar-note">Bấm vào ảnh để đổi</p>

            <div className="user-name">{form.fullName}</div>
            <div className="user-sub">{form.studentCode} · Sinh viên</div>

            <div className="btn-row">
              {!editing ? (
                <button className="btn primary" onClick={() => setEditing(true)}>
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button className="btn primary" onClick={onSave}>Lưu</button>
                  <button className="btn" onClick={() => setEditing(false)}>Hủy</button>
                </>
              )}
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
              📄 Hồ sơ
            </button>
            <button className={`tab ${tab === "security" ? "active" : ""}`} onClick={() => setTab("security")}>
              🔒 Bảo mật
            </button>
          </div>
        </aside>

        <section className="profile-right">
          {tab === "profile" && (
            <div className="card">
              <h3>Thông tin cá nhân</h3>

              <div className="form grid">
                <div className="field">
                  <label>Họ tên</label>
                  <input name="fullName" value={form.fullName} disabled={!editing} onChange={handleChange} />
                </div>

                <div className="field">
                  <label>Ngày sinh</label>
                  <input type="date" name="dob" value={form.dob} disabled={!editing} onChange={handleChange} />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input value={form.email} disabled />
                </div>

                <div className="field">
                  <label>SĐT</label>
                  <input name="phone" value={form.phone} disabled={!editing} onChange={handleChange} />
                </div>

                <div className="field full">
                  <label>Địa chỉ</label>
                  <input name="address" value={form.address} disabled={!editing} onChange={handleChange} />
                </div>
              </div>

              <hr className="sep" />

              <h3>Thông tin học tập</h3>
              <div className="form grid">
                <div className="field">
                  <label>Mã SV</label>
                  <input value={form.studentCode} disabled />
                </div>
                <div className="field">
                  <label>Khoa</label>
                  <input name="faculty" value={form.faculty} disabled={!editing} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Lớp</label>
                  <input name="className" value={form.className} disabled={!editing} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Niên khóa</label>
                  <input name="schoolYear" value={form.schoolYear} disabled={!editing} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="card">
              <h3>Bảo mật</h3>
              <button className="btn primary" onClick={() => setShowPwd(true)}>
                Đổi mật khẩu
              </button>
            </div>
          )}
        </section>

        {showPwd && (
          <div className="modal">
            <div className="modal-backdrop" onClick={() => setShowPwd(false)} />
            <div className="modal-card">
              <h3>Đổi mật khẩu</h3>
              <input type="password" placeholder="Mật khẩu cũ" />
              <input type="password" placeholder="Mật khẩu mới" />
              <input type="password" placeholder="Nhập lại mật khẩu" />
              <div className="btn-row">
                <button className="btn" onClick={() => setShowPwd(false)}>Hủy</button>
                <button className="btn primary" onClick={() => setShowPwd(false)}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
