import { Routes, Route, Navigate } from "react-router-dom";

/* ===== ADMIN ===== */
import Dashboard from "admin-ui/pages/Dashboard";
import Users from "admin-ui/pages/Users";
import Reports from "admin-ui/pages/Reports";

/* ===== COSRE / STUDENT ===== */
import Projects from "cosre-ui/pages/Projects";

/* ===== RESULT VIEW ===== */
import ResultView from "resultview-ui/pages/ResultView";

/* ===== VIDEO CALL ===== */
import VideoCall from "videocall-ui/pages/VideoCall";

/* ===== ERROR ===== */
import NotFound from "error-ui/pages/NotFound";
import ServerError from "error-ui/pages/ServerError";

import "./App.css";

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />

      {/* ===== ADMIN ===== */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/reports" element={<Reports />} />

      {/* ===== STUDENT / CORE ===== */}
      <Route path="/projects" element={<Projects />} />

      {/* ===== RESULT VIEW ===== */}
      <Route path="/results" element={<ResultView />} />

      {/* ===== VIDEO CALL ===== */}
      <Route path="/call" element={<VideoCall />} />

      {/* ===== ERROR ===== */}
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;
