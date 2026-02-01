import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  return (
    <AuthLayout>
      <h2 style={{ textAlign: "center" }}>Đăng ký</h2>

      <input placeholder="Tên đăng nhập" style={inputStyle} />
      <input type="email" placeholder="Email" style={inputStyle} />
      <input type="password" placeholder="Mật khẩu" style={inputStyle} />

      <button style={buttonStyle}>Tạo tài khoản</button>
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

const buttonStyle = {
  width: "100%",
  marginTop: 20,
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#42a5f5",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};
