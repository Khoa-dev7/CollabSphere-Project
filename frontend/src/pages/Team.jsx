import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";
import EmptyState from "../components/EmptyState";

export default function Team() {
  // State lưu trữ dữ liệu
  const [members, setMembers] = useState([]); // Danh sách thành viên trong nhóm
  const [teamInfo, setTeamInfo] = useState(null); // Thông tin tổng quan của nhóm (tên, đề tài...)
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false); // Trạng thái người dùng hiện tại có phải nhóm trưởng không
  const [availableStudents, setAvailableStudents] = useState([]); // Danh sách sinh viên khả dụng để thêm vào nhóm
  const [showAddModal, setShowAddModal] = useState(false); // Điều khiển modal thêm thành viên
  const currentUserId = parseInt(localStorage.getItem("user_id"));

  useEffect(() => {
    // Tải thông tin nhóm và danh sách thành viên song song
    Promise.all([
      api.get("/workspace/teams/me/members"),
      api.get("/workspace/teams/me")
    ])
      .then(([resMembers, resInfo]) => {
        const teamData = resInfo.data;
        if (!teamData) {
          setTeamInfo(null);
          setMembers([]);
          return;
        }
        setTeamInfo(teamData);

        // Định dạng lại danh sách thành viên để hiển thị
        setMembers(resMembers.data.map(m => ({
          id: m.id,
          name: m.full_name,
          role: m.id === teamData.leader_id ? "Leader" : "Member",
          email: m.email
        })));

        // Kiểm tra xem user hiện tại có phải là nhóm trưởng (Leader) không
        if (teamData && teamData.leader_id === currentUserId) {
          setIsLeader(true);
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setTeamInfo(null);
          setMembers([]);
        } else {
          console.error("Failed to fetch team data", err);
        }
      })
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const fetchAvailableStudents = async () => {
    // Lấy danh sách các sinh viên trong cùng một lớp mà chưa có nhóm
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
      // Gọi API thêm học viên vào nhóm (chỉ nhóm trưởng mới có quyền này)
      await api.post(`/projects/teams/${teamInfo.id}/members/${userId}`);
      alert("✅ Đã thêm thành viên!");

      // Tải lại danh sách thành viên mới
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

    if (!confirm("Bạn có chắc muốn xóa thành viên này khỏi nhóm không?")) return;

    try {
      // API xóa thành viên khỏi nhóm
      await api.delete(`/projects/teams/${teamInfo.id}/members/${userId}`);
      alert("✅ Đã xóa thành viên!");

      // Cập nhật lại danh sách hiển thị
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

  const [q, setQ] = useState(""); // Tìm kiếm thành viên trong bảng
  const filtered = members.filter((m) => m.name?.toLowerCase().includes(q.toLowerCase()));

  // Giao diện khi đang tải dữ liệu
  if (loading) {
    return (
      <Layout title="Nhóm của tôi">
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <p>Đang tải dữ liệu nhóm...</p>
        </div>
      </Layout>
    );
  }

  // Giao diện khi người dùng chưa thuộc về nhóm nào
  if (!teamInfo) {
    return (
      <Layout title="Nhóm của tôi">
        <div className="card">
          <EmptyState
            icon="Team"
            title="Bạn chưa có nhóm"
            message="Hiện tại tài khoản của bạn chưa được phân vào nhóm nào. Vui lòng liên hệ Giảng viên hoặc Staff để được hỗ trợ."
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Nhóm của tôi">
      <div className="card">
        <div className="row-between mb-4">
          {/* Thông tin nhóm và dự án */}
          <div>
            <h3>{teamInfo ? teamInfo.name : "Team của tôi"}</h3>
            {teamInfo && (
              <div style={{ color: "#64748b", marginTop: 8 }}>
                {teamInfo.project_title && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Dự án:</strong> {teamInfo.project_title}
                  </div>
                )}
                {teamInfo.leader_name && (
                  <div>
                    <strong>Nhóm trưởng:</strong> {teamInfo.leader_name}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {/* Chỉ hiển thị nút thêm thành viên nếu là nhóm trưởng */}
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
            <input
              className="search"
              placeholder="Tìm thành viên..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng danh sách thành viên */}
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
                <td>
                  <span className={`pill ${m.role === "Leader" ? "ok" : ""}`}>
                    {m.role === "Leader" ? "Trưởng nhóm" : "Thành viên"}
                  </span>
                </td>
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

      {/* Modal thêm thành viên dành cho Nhóm trưởng */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Thêm thành viên vào nhóm</h3>
              <button
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {availableStudents.length === 0 ? (
                <p style={{ textAlign: "center", padding: 20, opacity: 0.5 }}>Không có sinh viên khả dụng để thêm.</p>
              ) : (
                availableStudents.map(student => (
                  <div key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <strong>{student.full_name}</strong>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{student.username} · {student.email}</div>
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

// Kiểu dáng cho Modal (Inline Style)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
