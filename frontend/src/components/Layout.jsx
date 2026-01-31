import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ title, children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Header title={title} />
        {children}
      </main>
    </div>
  );
}
