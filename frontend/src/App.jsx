import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

/* ===== ADMIN ===== */
import Dashboard from "admin-ui/pages/Dashboard";
import Users from "admin-ui/pages/Users";
import Reports from "admin-ui/pages/Reports";

/* ===== COSRE / STUDENT ===== */
import ProjectApproval from "cosre-ui/pages/head/ProjectApproval";

/* ===== RESULT VIEW ===== */
import ResultView from "resultview-ui/pages/student/ResultView";
import RadarChart from "resultview-ui/components/charts/RadarChart";
import "resultview-ui/styles/result-view.css";


/* ===== RESULT ===== */
import ResourceManagement from "resource-ui/pages/resource/ResourceManagement";
import ResourceTable from "resource-ui/pages/resource/ResourceTable";
import ResourceUploadModal from "resource-ui/pages/resource/ResourceUploadModal";
import resourceService from "resource-ui/services/resourceService";


/* ===== VIDEO CALL ===== */
import VideoCallRoom from "./pages/meeting/VideoCallRoom";

/* ===== ERROR ===== */
import NotFound from "error-ui/pages/NotFound";
import ServerError from "error-ui/pages/ServerError";

/* ===== FILE MANAGER ===== */
import FileManager from "filemanager-ui/pages/team/FileManager";


/* ===== TASK MODAL ===== */
import "./task-modal.css";
import TaskComments from "./TaskComments";
import TaskChecklist from "./TaskChecklist";
import TaskAttachments from "./TaskAttachments";  

/* ===== USER MANAGEMENT ===== */
import UserManagement from "manage-ui/pages/admin/UserManagement";
import ImportExcel from "manage-ui/pages/admin/ImportExcel";
import UploadExcel from "manage-ui/components/UploadExcel";
import UserTable from "manage-ui/components/UserTable";



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
      <Route path="/projects" element={<ProjectApproval />} />

      {/* ===== RESULT VIEW ===== */}
      <Route path="/results" element={<ResultView />} />

      {/* ===== VIDEO CALL ===== */}
     <Route path="/call" element={<VideoCallRoom />} />

      {/* ===== ERROR ===== */}
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
      {/* ===== FILE MANAGER ===== */}
      <Route path="/files" element={<FileManager />} />
      {/* ===== TASK MODAL ===== */}
      <Route path="/task/comments" element={<TaskComments />} />
      <Route path="/task/checklist" element={<TaskChecklist />} />
      <Route path="/task/attachments" element={<TaskAttachments />} />
      {/* ===== MANAGEMENT ===== */}
      <Route path="/admin/manage/users" element={<UserManagement />} />
      <Route path="/admin/manage/import" element={<ImportExcel />} />
      <Route path="/admin/manage/upload" element={<UploadExcel />} />
      <Route path="/admin/manage/table" element={<UserTable />} />
      {/* ===== RESULT ===== */}
      <Route path="/admin/resource" element={<ResourceManagement />} />
      <Route path="/admin/resource/table" element={<ResourceTable />} />
      <Route path="/admin/resource/upload" element={<ResourceUploadModal />} />   

    </Routes>
  );
}

export default App;
