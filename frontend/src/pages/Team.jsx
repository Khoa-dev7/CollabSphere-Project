import { useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function Team() {
  const members = useMemo(
    () => [
      { id: 1, name: "An", role: "Leader", email: "an@school.edu.vn" },
      { id: 2, name: "Bình", role: "Member", email: "binh@school.edu.vn" },
      { id: 3, name: "Chi", role: "Member", email: "chi@school.edu.vn" },
    ],
    []
  );

  const [q, setQ] = useState("");
  const filtered = members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout title="Team">
      <div className="card">
        <div className="row-between">
          <h3>Team của tôi</h3>
          <input className="search" placeholder="Tìm thành viên..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td><span className={`pill ${m.role === "Leader" ? "ok" : ""}`}>{m.role}</span></td>
                <td>{m.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
