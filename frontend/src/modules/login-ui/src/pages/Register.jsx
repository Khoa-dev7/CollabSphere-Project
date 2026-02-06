import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student"
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ (ví dụ: user@example.com)";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: formData.role
      });

      alert("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail;

      if (typeof errorMsg === 'string') {
        alert("❌ " + errorMsg);
      } else if (Array.isArray(errorMsg)) {
        const messages = errorMsg.map(e => e.msg || e.message).join("\n");
        alert("❌ Đăng ký thất bại:\n" + messages);
      } else {
        alert("❌ Đăng ký thất bại. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Tạo tài khoản mới</h1>
          <p style={subtitleStyle}>Điền thông tin để bắt đầu sử dụng CollabSphere</p>
        </div>

        <form onSubmit={handleRegister} style={formStyle}>
          {/* Full Name */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Họ và tên <span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              style={errors.fullName ? { ...inputStyle, ...errorInputStyle } : inputStyle}
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {errors.fullName && <span style={errorTextStyle}>{errors.fullName}</span>}
          </div>

          {/* Username & Email Row */}
          <div style={rowStyle}>
            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>
                Tên đăng nhập <span style={requiredStyle}>*</span>
              </label>
              <input
                type="text"
                placeholder="username123"
                style={errors.username ? { ...inputStyle, ...errorInputStyle } : inputStyle}
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
              {errors.username && <span style={errorTextStyle}>{errors.username}</span>}
              <small style={hintStyle}>Chỉ chữ, số và dấu gạch dưới (_)</small>
            </div>

            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>
                Email <span style={requiredStyle}>*</span>
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                style={errors.email ? { ...inputStyle, ...errorInputStyle } : inputStyle}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
            </div>
          </div>

          {/* Password Row */}
          <div style={rowStyle}>
            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>
                Mật khẩu <span style={requiredStyle}>*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={errors.password ? { ...inputStyle, ...errorInputStyle } : inputStyle}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
              <small style={hintStyle}>Tối thiểu 6 ký tự</small>
            </div>

            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>
                Xác nhận mật khẩu <span style={requiredStyle}>*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={errors.confirmPassword ? { ...inputStyle, ...errorInputStyle } : inputStyle}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
              />
              {errors.confirmPassword && <span style={errorTextStyle}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Role */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Vai trò <span style={requiredStyle}>*</span>
            </label>
            <select
              style={selectStyle}
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              <option value="Student">👨‍🎓 Sinh viên</option>
              <option value="Lecturer">👨‍🏫 Giảng viên</option>
              <option value="Staff">👔 Nhân viên</option>
              <option value="Head">🎯 Trưởng khoa</option>
            </select>
          </div>

          <button
            type="submit"
            style={isLoading ? { ...buttonStyle, ...buttonDisabledStyle } : buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>

          <div style={footerStyle}>
            <span style={footerTextStyle}>Đã có tài khoản?</span>
            <button
              type="button"
              style={linkButtonStyle}
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  width: "100%",
  maxWidth: "700px",
  padding: "40px",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1e293b",
  margin: "0 0 8px 0",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#64748b",
  margin: 0,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const rowStyle = {
  display: "flex",
  gap: "16px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
};

const requiredStyle = {
  color: "#ef4444",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
  transition: "all 0.2s",
  fontFamily: "inherit",
};

const errorInputStyle = {
  borderColor: "#ef4444",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  backgroundColor: "#fff",
};

const errorTextStyle = {
  fontSize: "12px",
  color: "#ef4444",
  marginTop: "4px",
};

const hintStyle = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "4px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#fff",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  marginTop: "8px",
};

const buttonDisabledStyle = {
  opacity: 0.6,
  cursor: "not-allowed",
};

const footerStyle = {
  textAlign: "center",
  marginTop: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const footerTextStyle = {
  fontSize: "14px",
  color: "#64748b",
};

const linkButtonStyle = {
  background: "none",
  border: "none",
  color: "#667eea",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  textDecoration: "underline",
};
