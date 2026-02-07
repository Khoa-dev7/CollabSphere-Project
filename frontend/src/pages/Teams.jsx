import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";
import EmptyState from "../components/EmptyState";

export default function Teams() {
    // State quản lý danh sách dữ liệu
    const [teams, setTeams] = useState([]); // Danh sách nhóm đã tạo
    const [classes, setClasses] = useState([]); // Danh sách lớp học giảng viên phụ trách
    const [projects, setProjects] = useState([]); // Danh sách dự án (nếu có)
    const [students, setStudents] = useState([]); // Danh sách sinh viên
    const [classStudents, setClassStudents] = useState([]); // Sinh viên trong lớp đang chọn (để tạo nhóm)

    // State điều khiển Modal
    const [showModal, setShowModal] = useState(false); // Modal tạo nhóm mới
    const [showManageModal, setShowManageModal] = useState(false); // Modal quản lý thành viên nhóm

    const [selectedTeamForManage, setSelectedTeamForManage] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]); // Thành viên hiện tại của nhóm đang quản lý
    const [availableStudents, setAvailableStudents] = useState([]); // Sinh viên chưa có nhóm trong lớp
    const [loading, setLoading] = useState(true);

    // Dữ liệu form tạo nhóm
    const [formData, setFormData] = useState({
        name: "",
        class_id: "",
        project_title: "",
        leader_id: "",
        member_ids: []
    });

    const role = localStorage.getItem("role") || "";

    useEffect(() => {
        fetchData();
    }, []);

    // Tự động tải danh sách sinh viên khi lớp học được chọn trong form
    useEffect(() => {
        if (formData.class_id) {
            fetchClassStudents(formData.class_id);
        } else {
            setClassStudents([]);
        }
    }, [formData.class_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Lấy danh sách các lớp học của giảng viên hiện tại
            const classRes = await api.get("/staff/classes/me");
            setClasses(classRes.data || []);

            // Lấy danh sách toàn bộ các nhóm
            const teamRes = await api.get("/projects/teams");
            setTeams(teamRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classId) => {
        try {
            // Lấy danh sách sinh viên thuộc một lớp cụ thể
            const res = await api.get(`/staff/lecturer/classes/${classId}/students`);
            const studentList = res.data || [];

            // Gắn thêm thông tin xem sinh viên đã có nhóm chưa
            const studentsWithTeams = studentList.map(student => {
                const assignedTeam = teams.find(team =>
                    team.members?.some(m => m.id === student.id) || team.leader_id === student.id
                );
                return {
                    ...student,
                    team_name: assignedTeam?.name || null,
                    team_id: assignedTeam?.id || null
                };
            });

            setClassStudents(studentsWithTeams);
        } catch (err) {
            console.error("Failed to fetch class students", err);
            setClassStudents([]);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.class_id) {
            alert("Vui lòng nhập tên nhóm và chọn lớp học!");
            return;
        }

        try {
            // Gửi yêu cầu tạo nhóm mới lên server
            await api.post("/projects/teams", {
                name: formData.name,
                class_id: parseInt(formData.class_id),
                project_title: formData.project_title || null,
                leader_id: formData.leader_id ? parseInt(formData.leader_id) : null,
                member_ids: formData.member_ids.map(id => parseInt(id))
            });

            alert("✅ Tạo nhóm thành công!");
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
            alert("❌ Tạo nhóm thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            class_id: "",
            project_title: "",
            leader_id: "",
            member_ids: []
        });
    };

    const toggleMember = (userId) => {
        // Thêm hoặc xóa sinh viên khỏi danh sách được chọn trong form
        setFormData(prev => ({
            ...prev,
            member_ids: prev.member_ids.includes(userId)
                ? prev.member_ids.filter(id => id !== userId)
                : [...prev.member_ids, userId]
        }));
    };

    const handleManageTeam = async (team) => {
        // Mở modal quản lý thành viên cho một nhóm cụ thể
        setSelectedTeamForManage(team);
        setShowManageModal(true);

        try {
            // Lấy danh sách thành viên hiện tại của nhóm
            const membersRes = await api.get(`/workspace/teams/${team.id}/members`);
            setTeamMembers(membersRes.data || []);

            // Lấy danh sách những sinh viên chưa có nhóm trong lớp này để gợi ý thêm vào
            const availableRes = await api.get(`/staff/classes/${team.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
        } catch (err) {
            console.error("Failed to fetch team details", err);
        }
    };

    const handleAddMember = async (userId) => {
        if (!selectedTeamForManage) return;

        try {
            // API thêm thành viên vào nhóm
            await api.post(`/projects/teams/${selectedTeamForManage.id}/members/${userId}`);
            alert("✅ Đã thêm thành viên!");

            // Cập nhật lại danh sách thành viên và sinh viên khả dụng trên UI
            const membersRes = await api.get(`/workspace/teams/${selectedTeamForManage.id}/members`);
            setTeamMembers(membersRes.data || []);
            const availableRes = await api.get(`/staff/classes/${selectedTeamForManage.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
            fetchData(); // Cập nhật lại danh sách nhóm ở trang chính
        } catch (err) {
            console.error(err);
            alert("❌ Thêm thành viên thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!selectedTeamForManage) return;

        if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;

        try {
            // API xóa thành viên khỏi nhóm
            await api.delete(`/projects/teams/${selectedTeamForManage.id}/members/${userId}`);
            alert("✅ Đã xóa thành viên!");

            // Cập nhật lại UI
            const membersRes = await api.get(`/workspace/teams/${selectedTeamForManage.id}/members`);
            setTeamMembers(membersRes.data || []);
            const availableRes = await api.get(`/staff/classes/${selectedTeamForManage.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("❌ Xóa thành viên thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!confirm("⚠️ CẢNH BÁO: Việc xóa nhóm sẽ xóa TẤT CẢ dữ liệu liên quan. Bạn có chắc chắn muốn xóa không?")) return;

        try {
            await api.delete(`/projects/teams/${teamId}`);
            alert("✅ Đã xóa nhóm thành công!");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("❌ Xóa nhóm thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <Layout title={role === "Lecturer" ? "Quản lý nhóm" : "Danh sách nhóm"}>
            <div className="card">
                <div className="row-between" style={{ marginBottom: 24 }}>
                    <div>
                        <h3>Danh sách nhóm</h3>
                        <p style={{ opacity: 0.7, fontSize: 14, margin: "4px 0 0 0" }}>
                            {classes.length > 0
                                ? `Bạn đang quản lý ${classes.length} lớp học`
                                : "Chưa có lớp học nào"}
                        </p>
                    </div>
                    {role === "Lecturer" && (
                        <button className="btn primary" onClick={() => setShowModal(true)}>
                            + Tạo nhóm mới
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
                        Đang tải dữ liệu...
                    </div>
                ) : classes.length === 0 ? (
                    <EmptyState
                        icon="Empty"
                        title="Chưa có lớp học"
                        message="Bạn chưa được phân công lớp học nào. Liên hệ Staff để được trợ giúp."
                    />
                ) : teams.length === 0 ? (
                    <EmptyState
                        icon="Team"
                        title="Chưa có nhóm"
                        message="Chưa có nhóm nào được tạo trong các lớp bạn quản lý."
                        action={role === "Lecturer" ? { label: "Tạo nhóm đầu tiên", onClick: () => setShowModal(true) } : null}
                    />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                        {teams.map(team => (
                            <div key={team.id} className="card" style={{ padding: 20, border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: 20,
                                        fontWeight: "bold"
                                    }}>
                                        {team.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: 16 }}>{team.name}</h4>
                                        <small style={{ color: "#64748b" }}>ID: {team.id}</small>
                                    </div>
                                </div>

                                <div style={{ fontSize: 13, color: "#475569", marginTop: 12 }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Lớp:</strong> {classes.find(c => c.id === team.class_id)?.name || `Class #${team.class_id}`}
                                    </div>
                                    {team.project_id && (
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Dự án:</strong> {projects.find(p => p.id === team.project_id)?.title || `Project #${team.project_id}`}
                                        </div>
                                    )}
                                    <div>
                                        <strong>Ngày tạo:</strong> {new Date(team.created_at).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>

                                {role === "Lecturer" ? (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 12 }}>
                                        <button
                                            className="btn primary"
                                            style={{ flex: 1 }}
                                            onClick={() => window.location.href = `/workspace?teamId=${team.id}`}
                                        >
                                            🚀 Vào Nhóm
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1 }}
                                            onClick={() => handleManageTeam(team)}
                                        >
                                            📋 Quản lý
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
                                            onClick={() => handleDeleteTeam(team.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 12 }}>
                                        <button
                                            className="btn primary"
                                            style={{ flex: 1 }}
                                            onClick={() => window.location.href = `/workspace?teamId=${team.id}`}
                                        >
                                            🚀 Workspace
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1 }}
                                            onClick={() => window.location.href = `/team?teamId=${team.id}`}
                                        >
                                            👥 Thành viên
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1 }}
                                            onClick={() => window.location.href = `/documents?teamId=${team.id}`}
                                        >
                                            📂 Tài liệu
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1 }}
                                            onClick={() => window.location.href = `/peer-review?teamId=${team.id}`}
                                        >
                                            ⭐ Đánh giá
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            {showModal && (
                <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h3 style={{ margin: 0 }}>Tạo nhóm mới</h3>
                            <button
                                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeam}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Tên nhóm <span style={{ color: "#ef4444" }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="Nhóm 01"
                                    style={inputStyle}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Lớp học <span style={{ color: "#ef4444" }}>*</span></label>
                                <select
                                    style={inputStyle}
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value, leader_id: "", member_ids: [] })}
                                    required
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.code || `CLS${c.id.toString().padStart(3, '0')}`})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Dự án (Nhập tên dự án để giao)</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Xây dựng website bán hàng"
                                    style={inputStyle}
                                    value={formData.project_title}
                                    onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                                />
                                <small style={{ color: "#64748b", marginTop: 4, display: "block" }}>
                                    Nhập tên dự án để tự động tạo dự án mới và giao cho nhóm.
                                </small>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Nhóm trưởng (tùy chọn)</label>
                                <select
                                    style={inputStyle}
                                    value={formData.leader_id}
                                    onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
                                    disabled={!formData.class_id}
                                >
                                    <option value="">-- Chưa chọn nhóm trưởng --</option>
                                    {classStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            [{s.id}] {s.full_name} (@{s.username}) {s.team_name ? `[Đã có nhóm: ${s.team_name}]` : ""}
                                        </option>
                                    ))}
                                </select>
                                {!formData.class_id && (
                                    <small style={{ color: "#64748b", fontSize: 12 }}>Vui lòng chọn lớp học trước</small>
                                )}
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Thành viên (tùy chọn)</label>
                                {!formData.class_id ? (
                                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#64748b" }}>
                                        Vui lòng chọn lớp học trước
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                                            {classStudents.length === 0 ? (
                                                <p style={{ textAlign: "center", opacity: 0.5, margin: 0 }}>Lớp chưa có sinh viên</p>
                                            ) : (
                                                classStudents.map(s => (
                                                    <label key={s.id} style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        padding: "6px 0",
                                                        cursor: "pointer",
                                                        opacity: s.team_name ? 0.6 : 1
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.member_ids.includes(s.id)}
                                                            onChange={() => toggleMember(s.id)}
                                                        />
                                                        <span>
                                                            <code style={{ fontSize: 11, marginRight: 6 }}>#{s.id}</code>
                                                            {s.full_name} (@{s.username})
                                                            {s.team_name && <small style={{ color: "#f59e0b", marginLeft: 8 }}>✓ {s.team_name}</small>}
                                                        </span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        <small style={{ color: "#64748b", fontSize: 12, marginTop: 4, display: "block" }}>
                                            Đã chọn: {formData.member_ids.length} sinh viên
                                        </small>
                                    </>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn primary" style={{ flex: 1 }}>
                                    Tạo nhóm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Team Modal */}
            {showManageModal && selectedTeamForManage && (
                <div style={modalOverlayStyle} onClick={() => setShowManageModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h3 style={{ margin: 0 }}>Quản lý nhóm: {selectedTeamForManage.name}</h3>
                            <button
                                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}
                                onClick={() => setShowManageModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ marginBottom: 12 }}>Thành viên hiện tại ({teamMembers.length})</h4>
                            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                                {teamMembers.length === 0 ? (
                                    <p style={{ textAlign: "center", opacity: 0.5, margin: 0 }}>Chưa có thành viên</p>
                                ) : (
                                    teamMembers.map(member => (
                                        <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <div>
                                                <code style={{ fontSize: 11, marginRight: 6 }}>#{member.id}</code>
                                                <strong>{member.full_name}</strong>
                                                <small style={{ color: "#64748b", marginLeft: 8 }}>(@{member.username})</small>
                                                {member.id === selectedTeamForManage.leader_id && (
                                                    <span style={{ marginLeft: 8, color: "#10b981", fontSize: 12 }}>👑 Nhóm trưởng</span>
                                                )}
                                            </div>
                                            <button
                                                className="btn"
                                                style={{ padding: "4px 12px", fontSize: 12 }}
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                ✕ Xóa
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: 12 }}>Thêm thành viên</h4>
                            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                                {availableStudents.length === 0 ? (
                                    <p style={{ textAlign: "center", opacity: 0.5, margin: 0 }}>Không có sinh viên khả dụng</p>
                                ) : (
                                    availableStudents.map(student => (
                                        <div key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <div>
                                                <code style={{ fontSize: 11, marginRight: 6 }}>#{student.id}</code>
                                                <strong>{student.full_name}</strong>
                                                <small style={{ color: "#64748b", marginLeft: 8 }}>(@{student.username})</small>
                                            </div>
                                            <button
                                                className="btn primary"
                                                style={{ padding: "4px 12px", fontSize: 12 }}
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
                </div>
            )}
        </Layout>
    );
}

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalContentStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: 32,
    width: "90%",
    maxWidth: 600,
    maxHeight: "90vh",
    overflowY: "auto",
};

const fieldStyle = {
    marginBottom: 20,
};

const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: 14,
    color: "#334155",
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
};
