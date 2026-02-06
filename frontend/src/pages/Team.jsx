import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("user_id"));

  useEffect(() => {
    Promise.all([
      api.get("/workspace/teams/me/members"),
      api.get("/workspace/teams/me")
    ])
      .then(([resMembers, resInfo]) => {
        const teamData = resInfo.data;
        setTeamInfo(teamData);

        setMembers(resMembers.data.map(m => ({
          id: m.id,
          name: m.full_name,
          role: m.id === teamData.leader_id ? "Leader" : "Member",
          email: m.email
        })));

        // Check if current user is the leader
        if (teamData && teamData.leader_id === currentUserId) {
          setIsLeader(true);
        }
      })
      .catch(err => console.error("Failed to fetch team data", err))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const fetchAvailableStudents = async () => {
    if (!teamInfo) return;
    try {
      const res = await api.get(`/staff/classes/${teamInfo.class_id}/available-students`);
      setAvailableStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch available students", err);
    }
  };

  const handleAddMember = async (userId) => {
    if (!teamInfo) return;

    try {
      await api.post(`/projects/teams/${teamInfo.id}/members/${userId}`);
      alert("✅ Đã thêm thành viên!");
      // Refresh members
      const resMembers = await api.get("/workspace/teams/me/members");
      setMembers(resMembers.data.map(m => ({
        id: m.id,
        name: m.full_name,
        role: m.id === teamInfo.leader_id ? "Leader" : "Member",
        email: m.email
      })));
      fetchAvailableStudents();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Thêm thành viên thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!teamInfo) return;

    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;

    try {
      await api.delete(`/projects/teams/${teamInfo.id}/members/${userId}`);
      alert("✅ Đã xóa thành viên!");
      // Refresh members
      const resMembers = await api.get("/workspace/teams/me/members");
      setMembers(resMembers.data.map(m => ({
        id: m.id,
        name: m.full_name,
        role: m.id === teamInfo.leader_id ? "Leader" : "Member",
        email: m.email
      })));
    } catch (err) {
      console.error(err);
      alert("❌ Xóa thành viên thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  const [q, setQ] = useState("");
  const filtered = members.filter((m) => m.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout title="Team">
      <div className="card">
        <div className="row-between mb-4">
          <div>
            <h3>{teamInfo ? teamInfo.name : "Team của tôi"}</h3>
            {teamInfo && (
              <div style={{ color: "#64748b", marginTop: 4 }}>
                {teamInfo.project_title && (
                  <span style={{ marginRight: 16 }}>
                    <strong>Dự án:</strong> {teamInfo.project_title}
                  </span>
                )}
                {teamInfo.leader_name && (
                  <span>
                    <strong>Nhóm trưởng:</strong> {teamInfo.leader_name}
                  </span>
                )}
              </div>
            )}
          </div>
          {isLeader && (
            <button
              className="btn primary"
              onClick={() => {
                fetchAvailableStudents();
                setShowAddModal(true);
              }}
            >
              + Thêm thành viên
            </button>
          )}
          <input className="search" placeholder="Tìm thành viên..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Email</th>
              {isLeader && <th>Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isLeader ? "4" : "3"} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
            ) : filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td><span className={`pill ${m.role === "Leader" ? "ok" : ""}`}>{m.role}</span></td>
                <td>{m.email}</td>
                {isLeader && (
                  <td>
                    {m.id !== currentUserId && (
                      <button
                        className="btn"
                        style={{ padding: "4px 12px", fontSize: 12 }}
                        onClick={() => handleRemoveMember(m.id)}
                      >
                        ✕ Xóa
                      </button>
                    )}
                    {m.id === currentUserId && (
                      <small style={{ color: "#10b981", fontWeight: "bold" }}>Bạn</small>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={isLeader ? "4" : "3"} style={{ textAlign: 'center' }}>Không tìm thấy thành viên.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Thêm thành viên</h3>
              <button
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {availableStudents.length === 0 ? (
                <p style={{ textAlign: "center", opacity: 0.5 }}>Không có sinh viên khả dụng</p>
              ) : (
                availableStudents.map(student => (
                  <div key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <strong>{student.full_name}</strong>
                      <small style={{ color: "#64748b", marginLeft: 8 }}>({student.username})</small>
                    </div>
                    <button
                      className="btn primary"
                      style={{ padding: "6px 16px", fontSize: 13 }}
                      onClick={() => handleAddMember(student.id)}
                    >
                      + Thêm
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
