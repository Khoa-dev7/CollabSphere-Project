export default function ErrorLayout({ title, message, code }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        color: "#1f2937",
      }}
    >
      <h1 style={{ fontSize: 72, marginBottom: 8 }}>{code}</h1>
      <h2>{title}</h2>
      <p style={{ maxWidth: 420, textAlign: "center" }}>{message}</p>

      <a
        href="/"
        style={{
          marginTop: 24,
          padding: "10px 18px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Quay về trang chủ
      </a>
    </div>
  );
}
