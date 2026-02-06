import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";

/**
 * Component Layout khung (Shell) của ứng dụng.
 * Bao gồm Sidebar bên trái, Header bên trên, Breadcrumbs và phần nội dung con (children).
 */
export default function Layout({ title, children }) {
  return (
    <div className="layout">
      {/* Thanh menu điều hướng bên trái */}
      <Sidebar />
      <main className="main">
        {/* Thanh tiêu đề bên trên */}
        <Header title={title} />
        <div style={{ padding: '0 24px' }}>
          {/* Đường dẫn phân cấp (vị trí hiện tại) */}
          <Breadcrumbs />
          {/* Nội dung chính của trang */}
          {children}
        </div>
      </main>
    </div>
  );
}
