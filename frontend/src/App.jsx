import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
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

// Import Login từ module (hoặc copy ra folder pages nếu muốn structure gọn hơn)
import Login from "./modules/login-ui/src/pages/Login";
import Register from "./modules/login-ui/src/pages/Register";

// nếu bạn có trang Notifications riêng:
// import NotificationsPage from "./pages/Notifications";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Team */}
        <Route path="/team" element={<Team />} />

        {/* Chat */}
        <Route path="/chat" element={<Chat />} />

        {/* Peer Review */}
        <Route path="/peer-review" element={<PeerReview />} />

        {/* Documents */}
        <Route path="/documents" element={<Documents />} />

        {/* Rubrics */}
        <Route path="/rubrics" element={<Rubrics />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* Activity Logs */}
        <Route path="/activity" element={<Activity />} />

        {/* Workspace */}
        <Route path="/workspace" element={<Workspace />} />

        {/* Teams */}
        <Route path="/teams" element={<Teams />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/ai-chat" element={<AIChat />} />

        {/* Timeline */}
        <Route path="/timeline" element={<Timeline />} />

        {/* Gantt */}
        <Route path="/gantt" element={<Gantt />} />

        {/* Grading */}
        <Route path="/grading" element={<GradingPage />} />
        <Route path="/my-grades" element={<StudentGrades />} />

        {/* Courses + Syllabus (PHAN-49) */}
        <Route path="/courses" element={<Courses />} />

        {/* Notifications page (nếu dùng) */}
        {/* <Route path="/notifications" element={<NotificationsPage />} /> */}

        {/* Fallback 404 (optional nhưng rất nên có) */}
        <Route
          path="*"
          element={
            <div style={{ padding: 40 }}>
              <h2>404</h2>
              <p>Trang không tồn tại.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
