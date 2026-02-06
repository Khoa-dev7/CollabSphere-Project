import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("profile");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState("/images/avatar.jpg");

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    studentCode: "",
    faculty: "",
    className: "",
    schoolYear: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const u = res.data;
      setForm({
        fullName: u.full_name,
        dob: "N/A", // Backend chưa có field này
        email: u.email,
        phone: "N/A", // Backend chưa có field này
        address: "N/A", // Backend chưa có field này
        studentCode: `ID: ${u.id}`,
        faculty: "N/A", // Backend chưa có field này
        className: "N/A", // Backend chưa có field này
        schoolYear: "N/A", // Backend chưa có field này
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  const onSave = async () => {
    setLoading(true);
    try {
      await api.put("/auth/me", {
        full_name: form.fullName
        // Backend chỉ cho sửa full_name và password hiện tại
      });
      setEditing(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
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
            <div className="user-sub">{form.studentCode} · {form.email}</div>

            <div className="btn-row">
              {!editing ? (
                <button className="btn primary" onClick={() => setEditing(true)}>
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button className="btn primary" onClick={onSave} disabled={loading}>Lưu</button>
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
                  <input type="text" name="dob" value={form.dob} disabled onChange={handleChange} placeholder="Chưa có dữ liệu" />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input value={form.email} disabled />
                </div>

                <div className="field">
                  <label>SĐT</label>
                  <input name="phone" value={form.phone} disabled onChange={handleChange} placeholder="Chưa có dữ liệu" />
                </div>

                <div className="field full">
                  <label>Địa chỉ</label>
                  <input name="address" value={form.address} disabled onChange={handleChange} placeholder="Chưa có dữ liệu" />
                </div>
              </div>

              <hr className="sep" />

              <h3>Thông tin học tập</h3>
              <p style={{ fontStyle: "italic", color: "#666" }}>
                Tính năng đang được phát triển (Dữ liệu học tập chưa có trong database)
              </p>
              <div className="form grid">
                <div className="field">
                  <label>Mã SV</label>
                  <input value={form.studentCode} disabled />
                </div>
                {/* Ẩn bớt các field chưa có backend để đỡ rối, hoặc hiện disabled */}
                <div className="field">
                  <label>Khoa</label>
                  <input name="faculty" value={form.faculty} disabled />
                </div>
                <div className="field">
                  <label>Lớp</label>
                  <input name="className" value={form.className} disabled />
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
