import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Xóa token
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // 2. Chuyển hướng về login
        navigate("/login");
    }, [navigate]);

    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <h2>Đang đăng xuất...</h2>
        </div>
    );
}
