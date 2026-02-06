import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import AuthLayout from "../layouts/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Form Data req for OAuth2 standard in FastAPI
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { access_token } = res.data;

      // 1. Save Token
      if (remember) {
        localStorage.setItem("token", access_token);
      } else {
        sessionStorage.setItem("token", access_token);
        localStorage.removeItem("token");
      }

      // Hack for api.js to pick up token immediately if we don't reload
      // (Better way is Context, but for now specific to current architecture)
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // 2. Fetch User Profile to get Role
      const profileRes = await api.get("/auth/me");
      const user = profileRes.data;

      localStorage.setItem("role", user.role); // "admin", "student", etc.
      localStorage.setItem("user", JSON.stringify(user));

      alert(`Đăng nhập thành công! Xin chào ${user.full_name}`);

      // Hack for api.js to pick up token immediately if we don't reload
      // (Better way is Context, but for now specific to current architecture)
      // api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      alert("Đăng nhập thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <AuthLayout>
      <h2 style={{ textAlign: "center" }}>CollabSphere - System</h2>
      <p style={{ textAlign: "center", color: "#777" }}>
        Hãy đăng nhập để sử dụng dịch vụ
      </p>

      <input
        placeholder="Email"
        style={inputStyle}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        style={inputStyle}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <div style={rowStyle}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Ghi nhớ
        </label>
        <span style={{ color: "#42a5f5", cursor: "pointer" }} onClick={() => navigate("/register")}>
          Chưa có tài khoản? Đăng ký
        </span>
      </div>

      <button style={buttonStyle} onClick={handleLogin}>
        Đăng nhập
      </button>
    </AuthLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  fontSize: 14,
};

const buttonStyle = {
  width: "100%",
  marginTop: 20,
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#ef5350",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};
