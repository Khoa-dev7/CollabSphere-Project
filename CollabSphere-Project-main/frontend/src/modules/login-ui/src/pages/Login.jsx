import AuthLayout from "../layouts/AuthLayout";

export default function Login() {
  return (
    <AuthLayout>
      <h2 style={{ textAlign: "center" }}>CollabSphere - System</h2>
      <p style={{ textAlign: "center", color: "#777" }}>
        Hãy đăng nhập để sử dụng dịch vụ
      </p>

      <input placeholder="Tên đăng nhập" style={inputStyle} />
      <input type="password" placeholder="Mật khẩu" style={inputStyle} />

      <div style={rowStyle}>
        <label>
          <input type="checkbox" /> Ghi nhớ
        </label>
        <span style={{ color: "#e57373", cursor: "pointer" }}>
          Quên mật khẩu?
        </span>
      </div>

      <button style={buttonStyle}>Đăng nhập</button>
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
