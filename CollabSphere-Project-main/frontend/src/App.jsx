import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Timeline from "./pages/Timeline";
import Gantt from "./pages/Gantt";
import GradingPage from "./pages/GradingPage";
import Courses from "./pages/courses";
// nếu bạn có trang Notifications riêng:
// import NotificationsPage from "./pages/Notifications";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Team */}
        <Route path="/team" element={<Team />} />

        {/* Timeline */}
        <Route path="/timeline" element={<Timeline />} />

        {/* Gantt */}
        <Route path="/gantt" element={<Gantt />} />

        {/* Grading */}
        <Route path="/grading" element={<GradingPage />} />

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
