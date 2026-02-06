import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [classStudents, setClassStudents] = useState([]); // Students in selected class
    const [showModal, setShowModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedTeamForManage, setSelectedTeamForManage] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Fetch students when class is selected
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
            // Fetch classes
            const classRes = await api.get("/staff/classes/me");
            console.log("Classes:", classRes.data);
            setClasses(classRes.data || []);

            // Projects are optional - can be added later if needed
            // For now, teams can be created without projects
            setProjects([]);

            // Fetch existing teams
            const teamRes = await api.get("/projects/teams");
            console.log("Teams response:", teamRes.data);
            console.log("Teams count:", teamRes.data?.length || 0);
            setTeams(teamRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
            console.error("Error details:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classId) => {
        console.log("Fetching students for class:", classId);
        try {
            const res = await api.get(`/staff/lecturer/classes/${classId}/students`);
            const studentList = res.data || [];
            console.log("Fetched students:", studentList);

            // Get team assignments for these students
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

            console.log("Students with team info:", studentsWithTeams);
            setClassStudents(studentsWithTeams);
        } catch (err) {
            console.error("Failed to fetch class students", err);
            console.error("Error details:", err.response?.data);
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
        setFormData(prev => ({
            ...prev,
            member_ids: prev.member_ids.includes(userId)
                ? prev.member_ids.filter(id => id !== userId)
                : [...prev.member_ids, userId]
        }));
    };

    const handleManageTeam = async (team) => {
        setSelectedTeamForManage(team);
        setShowManageModal(true);

        try {
            // Fetch current team members
            const membersRes = await api.get(`/workspace/teams/${team.id}/members`);
            setTeamMembers(membersRes.data || []);

            // Fetch available students from the class
            const availableRes = await api.get(`/staff/classes/${team.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
        } catch (err) {
            console.error("Failed to fetch team details", err);
        }
    };

    const handleAddMember = async (userId) => {
        if (!selectedTeamForManage) return;

        try {
            await api.post(`/projects/teams/${selectedTeamForManage.id}/members/${userId}`);
            alert("✅ Đã thêm thành viên!");
            // Refresh team members
            const membersRes = await api.get(`/workspace/teams/${selectedTeamForManage.id}/members`);
            setTeamMembers(membersRes.data || []);
            // Refresh available students
            const availableRes = await api.get(`/staff/classes/${selectedTeamForManage.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
            fetchData(); // Refresh teams list
        } catch (err) {
            console.error(err);
            alert("❌ Thêm thành viên thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!selectedTeamForManage) return;

        if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;

        try {
            await api.delete(`/projects/teams/${selectedTeamForManage.id}/members/${userId}`);
            alert("✅ Đã xóa thành viên!");
            // Refresh team members
            const membersRes = await api.get(`/workspace/teams/${selectedTeamForManage.id}/members`);
            setTeamMembers(membersRes.data || []);
            // Refresh available students
            const availableRes = await api.get(`/staff/classes/${selectedTeamForManage.class_id}/available-students`);
            setAvailableStudents(availableRes.data || []);
            fetchData(); // Refresh teams list
        } catch (err) {
            console.error(err);
            alert("❌ Xóa thành viên thất bại: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <Layout title="Quản lý nhóm">
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
                    <div style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                        <p>Bạn chưa được phân công lớp học nào</p>
                        <small style={{ color: "#64748b" }}>Liên hệ Staff để được thêm vào lớp học</small>
                    </div>
                ) : teams.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                        <p>Chưa có nhóm nào được tạo</p>
                        {role === "Lecturer" && (
                            <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                                Tạo nhóm đầu tiên
                            </button>
                        )}
                    </div>
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

                                {role === "Lecturer" && (
                                    <button
                                        className="btn"
                                        style={{ marginTop: 12, width: "100%" }}
                                        onClick={() => handleManageTeam(team)}
                                    >
                                        📋 Quản lý nhóm
                                    </button>
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
                                            {s.full_name} ({s.username}) {s.team_name ? `[Đã có nhóm: ${s.team_name}]` : ""}
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
                                                            {s.full_name} ({s.username})
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
                                                <strong>{member.full_name}</strong>
                                                <small style={{ color: "#64748b", marginLeft: 8 }}>({member.username})</small>
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
                                                <strong>{student.full_name}</strong>
                                                <small style={{ color: "#64748b", marginLeft: 8 }}>({student.username})</small>
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
