import "../style.css";

export default function Team() {
  const team = {
    name: "Team Alpha",
    subject: "Công nghệ phần mềm",
    leader: "Trần Văn C",
    status: "Đang hoạt động",
    members: [
      { name: "Trần Văn C", role: "Trưởng nhóm" },
      { name: "Nguyễn Văn A", role: "Frontend" },
      { name: "Lê Thị B", role: "Backend" },
      { name: "Phạm Văn D", role: "Tester" },
    ],
  };

  return (
    <main className="main">
      <div className="page-head">
        <h1>👥 Team của tôi</h1>
        <p className="muted">Thông tin nhóm học tập / dự án</p>
      </div>

      <section className="card">
        <h2>{team.name}</h2>

        <div className="grid-2">
          <div>
            <p><strong>Môn học:</strong> {team.subject}</p>
            <p><strong>Trưởng nhóm:</strong> {team.leader}</p>
          </div>

          <div>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className="badge success">{team.status}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Danh sách thành viên</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((m, i) => (
              <tr key={i}>
                <td>{m.name}</td>
                <td>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
