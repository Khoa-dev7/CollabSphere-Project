export default function AuthLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>{children}</div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
  },
  card: {
    width: 400,
    padding: 30,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
};
