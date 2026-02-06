import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Import các trang (Pages) của ứng dụng */
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Timeline from "./pages/Timeline";
import Gantt from "./pages/Gantt";
import GradingPage from "./pages/GradingPage";
import Courses from "./pages/courses";
import Logout from "./pages/Logout";
import Chat from "./pages/Chat";
import PeerReview from "./pages/PeerReview";
import Documents from "./pages/Documents";
import Rubrics from "./pages/Rubrics";
import Admin from "./pages/Admin";
import Activity from "./pages/Activity";
import Workspace from "./pages/Workspace";
import Teams from "./pages/Teams";
import Whiteboard from "./pages/Whiteboard";
import Meeting from "./pages/Meeting";
import AIChat from "./pages/AIChat";
import StudentGrades from "./pages/StudentGrades";

// Import các trang từ module đăng nhập/đăng ký
import Login from "./modules/login-ui/src/pages/Login";
import Register from "./modules/login-ui/src/pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các tuyến đường liên quan đến Xác thực (Auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        {/* Trang chủ - Bảng điều khiển */}
        <Route path="/" element={<Dashboard />} />

        {/* Trang cá nhân */}
        <Route path="/profile" element={<Profile />} />

        {/* Nhóm của tôi (dành cho Sinh viên/Trưởng nhóm) */}
        <Route path="/team" element={<Team />} />

        {/* Chat nội bộ nhóm */}
        <Route path="/chat" element={<Chat />} />

        {/* Đánh giá đồng đẳng (Peer Review) */}
        <Route path="/peer-review" element={<PeerReview />} />

        {/* Quản lý tài liệu dự án */}
        <Route path="/documents" element={<Documents />} />

        {/* Quản lý Rubric điểm */}
        <Route path="/rubrics" element={<Rubrics />} />

        {/* Quản trị hệ thống (Admin/Staff) */}
        <Route path="/admin" element={<Admin />} />

        {/* Nhật ký hoạt động */}
        <Route path="/activity" element={<Activity />} />

        {/* Không gian làm việc - Kanban Board */}
        <Route path="/workspace" element={<Workspace />} />

        {/* Quản lý danh sách các nhóm (dành cho Giảng viên) */}
        <Route path="/teams" element={<Teams />} />

        {/* Bảng trắng vẽ nhóm */}
        <Route path="/whiteboard" element={<Whiteboard />} />

        {/* Họp trực tuyến */}
        <Route path="/meeting" element={<Meeting />} />

        {/* Trợ lý AI CollabSphere */}
        <Route path="/ai-chat" element={<AIChat />} />

        {/* Timeline dự án (Biểu đồ Gantt rút gọn) */}
        <Route path="/timeline" element={<Timeline />} />

        {/* Biểu đồ Gantt chi tiết */}
        <Route path="/gantt" element={<Gantt />} />

        {/* Quản lý bảng điểm & chấm điểm */}
        <Route path="/grading" element={<GradingPage />} />
        <Route path="/my-grades" element={<StudentGrades />} />

        {/* Danh sách môn học & Syllabus */}
        <Route path="/courses" element={<Courses />} />

        {/* Xử lý các đường dẫn không tồn tại (404 Not Found) */}
        <Route
          path="*"
          element={
            <div style={{ padding: 40 }}>
              <h2>404</h2>
              <p>Trang không tồn tại hoặc bạn không có quyền truy cập.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
