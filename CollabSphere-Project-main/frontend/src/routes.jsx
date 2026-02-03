import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFound, ServerError } from "error-ui";
import CoreLayout from "cosre-ui/layouts/CoreLayout";
import AdminLayout from "admin-ui/layouts/AdminLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CoreLayout />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
