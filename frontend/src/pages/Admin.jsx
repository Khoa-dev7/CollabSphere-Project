import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import api from "../api";

/**
 * Component hiển thị một dòng thông tin lớp học trong bảng quản lý.
 * Cho phép mở rộng để xem danh sách sinh viên, thêm/xóa sinh viên và đổi giảng viên.
 */
function ClassRow({ classData, onRefresh }) {
    const [expanded, setExpanded] = useState(false); // Trạng thái đóng/mở rộng dòng
    const [students, setStudents] = useState([]); // Danh sách sinh viên thuộc lớp
    const [loadingStudents, setLoadingStudents] = useState(false); // Trạng thái tải SV
    const [showAddModal, setShowAddModal] = useState(false); // Hiển thị modal thêm SV
    const [availableStudents, setAvailableStudents] = useState([]); // Danh sách SV có thể thêm
    const [selectedStudentId, setSelectedStudentId] = useState(""); // SV được chọn để thêm
    const [adding, setAdding] = useState(false); // Trạng thái đang thực hiện thêm SV

    // Trạng thái quản lý giảng viên phụ trách lớp
    const [showChangeLecturerModal, setShowChangeLecturerModal] = useState(false);
    const [lecturers, setLecturers] = useState([]);
    const [selectedLecturerId, setSelectedLecturerId] = useState("");
    const [changingLecturer, setChangingLecturer] = useState(false);

    // Lấy danh sách sinh viên đã đăng ký vào lớp này
    const fetchStudents = async () => {
        if (students.length > 0 && !expanded) return;

        setLoadingStudents(true);
        try {
            const res = await api.get(`/staff/classes/${classData.id}/students`);
            setStudents(res.data || []);
        } catch (err) {
            console.error("Failed to fetch students", err);
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Lấy danh sách SV "rảnh" (chưa thuộc lớp này) để thêm vào lớp
    const fetchAvailableStudents = async () => {
        try {
            const res = await api.get(`/staff/classes/${classData.id}/available-students`);
            setAvailableStudents(res.data || []);
        } catch (err) {
            console.error("Failed to fetch available students", err);
        }
    };

    // Lấy danh sách toàn bộ Giảng viên để đổi người phụ trách
    const fetchLecturers = async () => {
        try {
            const res = await api.get('/staff/users');
            const lecturerList = res.data.filter(u => u.role === "Lecturer");
            setLecturers(lecturerList);
            setSelectedLecturerId(classData.lecturer_id || "");
        } catch (err) {
            console.error("Failed to fetch lecturers", err);
        }
    };

    // Gửi yêu cầu cập nhật giảng viên phụ trách lớp
    const handleChangeLecturer = async () => {
        if (!selectedLecturerId) {
            alert("Vui lòng chọn giảng viên");
            return;
        }

        setChangingLecturer(true);
        try {
            await api.put(`/staff/classes/${classData.id}`, {
                lecturer_id: parseInt(selectedLecturerId)
            });
            alert("Đã đổi giảng viên thành công!");
            setShowChangeLecturerModal(false);
            if (onRefresh) onRefresh();
        } catch (err) {
            alert("Lỗi khi đổi giảng viên: " + (err.response?.data?.detail || err.message));
        } finally {
            setChangingLecturer(false);
        }
    };

    // Xử lý sự kiện nhấn vào dòng để đóng/mở chi tiết
    const handleToggle = () => {
        if (!expanded) {
            fetchStudents();
        }
        setExpanded(!expanded);
    };

    // Mở modal thêm sinh viên và lấy dữ liệu SV khả dụng
    const handleOpenAddModal = () => {
        fetchAvailableStudents();
        setShowAddModal(true);
    };

    // Gửi yêu cầu thêm sinh viên được chọn vào lớp
    const handleAddStudent = async () => {
        if (!selectedStudentId) {
            alert("Vui lòng chọn sinh viên");
            return;
        }

        setAdding(true);
        try {
            await api.post(`/staff/classes/${classData.id}/add-student/${selectedStudentId}`);
            alert("Đã thêm sinh viên vào lớp!");
            setShowAddModal(false);
            setSelectedStudentId("");
            // Làm mới danh sách sinh viên hiển thị tại chỗ
            const res = await api.get(`/staff/classes/${classData.id}/students`);
            setStudents(res.data || []);
            if (onRefresh) onRefresh();
        } catch (err) {
            alert("Lỗi khi thêm sinh viên: " + (err.response?.data?.detail || err.message));
        } finally {
            setAdding(false);
        }
    };

    // Xử lý xóa (hủy đăng ký) sinh viên khỏi lớp
    const handleRemoveStudent = async (studentId) => {
        if (!confirm("Bạn có chắc muốn xóa sinh viên này khỏi lớp?")) return;

        try {
            await api.delete(`/staff/classes/${classData.id}/remove-student/${studentId}`);
            alert("Đã xóa sinh viên khỏi lớp!");
            // Làm mới danh sách sinh viên
            const res = await api.get(`/staff/classes/${classData.id}/students`);
            setStudents(res.data || []);
            if (onRefresh) onRefresh();
        } catch (err) {
            alert("Lỗi khi xóa sinh viên: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <>
            <tr style={{ cursor: 'pointer' }} onClick={handleToggle}>
                <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 18, transition: 'transform 0.2s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                    </span>
                </td>
                <td><code style={{ color: 'var(--primary)', fontWeight: 600 }}>{classData.code || `CLS${String(classData.id).padStart(3, '0')}`}</code></td>
                <td><strong>{classData.name}</strong></td>
                <td>{classData.lecturer_name || `ID: ${classData.lecturer_id}`}</td>
                <td style={{ textAlign: 'center' }}>
                    <span className="badge info">{classData.student_count || 0} SV</span>
                </td>
                <td style={{ fontSize: 13, opacity: 0.7 }}>
                    {new Date(classData.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td>
                    <span className="badge success">Đang học</span>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan="7" style={{ background: '#f8fafc', padding: 20 }}>
                        {/* Phần thông tin Giảng viên phụ trách */}
                        <div style={{ marginBottom: 20, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div className="row-between">
                                <div>
                                    <h5 style={{ margin: '0 0 8px 0', color: '#334155' }}>👨‍🏫 Giảng viên phụ trách</h5>
                                    <p style={{ margin: 0, fontSize: 14 }}>
                                        <strong>{classData.lecturer_name || 'Chưa có giảng viên'}</strong>
                                        {classData.lecturer_id && <span style={{ color: '#64748b', marginLeft: 8 }}>ID: {classData.lecturer_id}</span>}
                                    </p>
                                </div>
                                <button
                                    className="btn btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowChangeLecturerModal(true);
                                        fetchLecturers();
                                    }}
                                >
                                    Đổi giảng viên
                                </button>
                            </div>
                        </div>

                        {/* Phần danh sách Sinh viên trong lớp */}
                        <div className="row-between" style={{ marginBottom: 12 }}>
                            <h5 style={{ margin: 0, color: '#334155' }}>📋 Danh sách sinh viên</h5>
                            <button className="btn btn-sm primary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }}>
                                + Thêm sinh viên
                            </button>
                        </div>
                        {loadingStudents ? (
                            <p style={{ opacity: 0.6 }}>Đang tải danh sách sinh viên...</p>
                        ) : students.length === 0 ? (
                            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Chưa có sinh viên nào đăng ký lớp này</p>
                        ) : (
                            <table className="table" style={{ background: '#fff', marginTop: 12 }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Họ tên</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, idx) => (
                                        <tr key={student.id}>
                                            <td><code style={{ fontSize: 12 }}>{student.id}</code></td>
                                            <td><strong>{student.full_name}</strong></td>
                                            <td><code>@{student.username}</code></td>
                                            <td>{student.email}</td>
                                            <td>
                                                <span style={{ color: student.is_active ? '#22c55e' : '#ef4444' }}>
                                                    {student.is_active ? "● Hoạt động" : "○ Khóa"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm danger"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveStudent(student.id); }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Modal: Thêm sinh viên từ hệ thống vào lớp */}
                        {showAddModal && (
                            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                                    <h4 style={{ marginTop: 0 }}>Thêm sinh viên vào lớp</h4>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Chọn sinh viên:</label>
                                        <select
                                            className="input"
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">-- Chọn sinh viên --</option>
                                            {availableStudents.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    [{s.id}] {s.full_name} (@{s.username})
                                                </option>
                                            ))}
                                        </select>
                                        {availableStudents.length === 0 && (
                                            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                                                Tất cả sinh viên đã được thêm vào lớp này
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button className="btn" onClick={() => setShowAddModal(false)}>Hủy</button>
                                        <button
                                            className="btn primary"
                                            onClick={handleAddStudent}
                                            disabled={adding || !selectedStudentId}
                                        >
                                            {adding ? "Đang thêm..." : "Thêm"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal: Đổi giảng viên quản lý lớp học */}
                        {showChangeLecturerModal && (
                            <div className="modal-overlay" onClick={() => setShowChangeLecturerModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                                    <h4 style={{ marginTop: 0 }}>Đổi giảng viên phụ trách</h4>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Chọn giảng viên:</label>
                                        <select
                                            className="input"
                                            value={selectedLecturerId}
                                            onChange={(e) => setSelectedLecturerId(e.target.value)}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">-- Chọn giảng viên --</option>
                                            {lecturers.map(l => (
                                                <option key={l.id} value={l.id}>
                                                    {l.full_name} (@{l.username})
                                                </option>
                                            ))}
                                        </select>
                                        {lecturers.length === 0 && (
                                            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                                                Không có giảng viên nào trong hệ thống
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button className="btn" onClick={() => setShowChangeLecturerModal(false)}>Hủy</button>
                                        <button
                                            className="btn primary"
                                            onClick={handleChangeLecturer}
                                            disabled={changingLecturer || !selectedLecturerId}
                                        >
                                            {changingLecturer ? "Đang cập nhật..." : "Cập nhật"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

/**
 * Component chính cho trang Quản trị (Admin/Staff/Head).
 * Phân quyền hiển thị các Tab chức năng tương ứng với người dùng.
 */
export default function Admin() {
    const role = localStorage.getItem("role") || "";
    const r = role.toLowerCase();

    // Xác định Tab mặc định dựa trên vai trò người dùng
    const getDefaultTab = () => {
        if (r === "admin") return "users";
        if (r === "staff") return "academic";
        if (r === "head" || r === "head_dept") return "approval";
        return "users";
    };

    const [activeTab, setActiveTab] = useState(getDefaultTab()); // Tab đang hoạt động
    const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu tab
    const [entities, setEntities] = useState([]); // Dữ liệu của tab hiện tại (SV, Lớp, Môn học...)
    const [uploading, setUploading] = useState(false); // Trạng thái tải lên file Excel
    const fileInputRef = useRef(null); // Ref để trigger chọn file
    const [importRole, setImportRole] = useState("Student"); // Vai trò khi nhập user hàng loạt
    const [showCreateClassModal, setShowCreateClassModal] = useState(false); // Trạng thái hiển thị modal tạo lớp
    const [lecturers, setLecturers] = useState([]); // Danh sách giảng viên để chọn khi tạo lớp
    const [newClassData, setNewClassData] = useState({ name: "", lecturer_id: "" }); // Dữ liệu lớp mới
    const [creatingClass, setCreatingClass] = useState(false); // Trạng thái đang gửi yêu cầu tạo lớp

    // Hàm lấy dữ liệu tương ứng với Tab được chọn từ API
    const fetchEntities = async () => {
        setLoading(true);
        try {
            let endpoint = "";
            if (activeTab === "subjects") endpoint = "/staff/subjects";
            else if (activeTab === "classes") endpoint = "/staff/classes";
            else if (activeTab === "users") endpoint = "/staff/users";
            else if (activeTab === "approval") endpoint = "/projects?status=Pending";

            if (endpoint) {
                const res = await api.get(endpoint);
                setEntities(res.data || []);
            } else {
                setEntities([]);
            }
        } catch (err) {
            console.error("Failed to fetch entities", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, [activeTab]);

    // Xử lý đọc và gửi tệp Excel để nhập dữ liệu hàng loạt
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            let endpoint = "";
            if (activeTab === "users_import") endpoint = `/staff/import-users/${importRole}`;
            else if (activeTab === "subjects") endpoint = "/staff/import-subjects";
            else if (activeTab === "classes") endpoint = "/staff/import-classes";
            else if (activeTab === "class_members_import") endpoint = "/staff/import-class-members";

            const res = await api.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Hiển thị thông báo chi tiết khi nhập danh sách sinh viên vào lớp
            if (activeTab === "class_members_import" && res.data) {
                const { added, skipped, errors } = res.data;
                let message = `✅ Đã thêm ${added} sinh viên vào lớp`;
                if (skipped > 0) message += `\n⚠️ Bỏ qua ${skipped} dòng`;
                if (errors && errors.length > 0) {
                    message += `\n\n❌ Lỗi:\n${errors.join('\n')}`;
                }
                alert(message);
            } else {
                alert("Nhập dữ liệu thành công!");
            }

            fetchEntities();
        } catch (err) {
            console.error("Import error", err);
            const errorMsg = err.response?.data?.detail || "Lỗi khi nhập dữ liệu. Vui lòng kiểm tra định dạng file Excel.";
            alert(errorMsg);
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input để có thể chọn lại cùng 1 file
        }
    };

    // Khóa hoặc mở khóa tài khoản người dùng (Chỉ Admin)
    const handleToggleUser = async (user) => {
        try {
            await api.post(`/staff/users/${user.id}/toggle-status`);
            fetchEntities();
        } catch (err) {
            alert("Không thể thay đổi trạng thái người dùng.");
        }
    };

    // Duyệt hoặc từ chối đề xuất dự án (Chỉ Trưởng bộ môn/Head)
    const handleApproveProject = async (projectId, status) => {
        try {
            await api.put(`/projects/${projectId}/approve?status=${status}`);
            alert(status === "Approved" ? "Đã duyệt dự án!" : "Đã từ chối dự án.");
            fetchEntities();
        } catch (err) {
            alert("Lỗi khi thực hiện thao tác.");
        }
    };

    // Lấy danh sách giảng viên khi cần tạo lớp mới
    const fetchLecturers = async () => {
        try {
            const res = await api.get("/staff/users?role=Lecturer");
            setLecturers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch lecturers", err);
        }
    };

    // Xử lý tạo lớp học mới
    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClassData.name || !newClassData.lecturer_id) {
            alert("Vui lòng nhập đầy đủ tên lớp và chọn giảng viên.");
            return;
        }

        setCreatingClass(true);
        try {
            await api.post("/staff/classes", {
                name: newClassData.name,
                lecturer_id: parseInt(newClassData.lecturer_id)
            });
            alert("Tạo lớp học thành công!");
            setShowCreateClassModal(false);
            setNewClassData({ name: "", lecturer_id: "" });
            fetchEntities(); // Tải lại danh sách lớp
        } catch (err) {
            console.error("Create class error", err);
            alert("Lỗi khi tạo lớp học.");
        } finally {
            setCreatingClass(false);
        }
    };

    /**
     * Hàm render nội dung tương ứng với mỗi chức năng quản trị
     */
    const renderTabContent = () => {
        switch (activeTab) {
            case "users":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Danh sách Người dùng</h4>
                            {r === "staff" && (
                                <button className="btn primary" onClick={() => setActiveTab("users_import")}>
                                    📤 Nhập Excel
                                </button>
                            )}
                        </div>
                        {loading ? <p>Đang tải...</p> : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên / Username</th>
                                        <th>Email</th>
                                        <th>Quyền</th>
                                        <th>Trạng thái</th>
                                        {r === "admin" && <th>Thao tác</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {entities.map(u => (
                                        <tr key={u.id}>
                                            <td><code style={{ fontSize: 13, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{u.id}</code></td>
                                            <td>
                                                <strong>{u.full_name}</strong><br />
                                                <small style={{ color: '#666' }}>@{u.username}</small>
                                            </td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge ${u.role === 'Admin' ? 'danger' : 'info'}`}>{u.role}</span></td>
                                            <td>
                                                <span style={{ color: u.is_active ? '#22c55e' : '#ef4444' }}>
                                                    {u.is_active ? "● Hoạt động" : "○ Khóa"}
                                                </span>
                                            </td>
                                            {r === "admin" && (
                                                <td>
                                                    <button
                                                        className={`btn btn-sm ${u.is_active ? 'warning' : 'success'}`}
                                                        onClick={() => handleToggleUser(u)}
                                                        disabled={u.username === "admin"}
                                                    >
                                                        {u.is_active ? "Khóa" : "Mở khóa"}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case "users_import":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Nhập danh sách Người dùng từ Excel</h4>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <select className="input" value={importRole} onChange={e => setImportRole(e.target.value)} style={{ width: 150 }}>
                                    <option value="Student">Sinh viên</option>
                                    <option value="Lecturer">Giảng viên</option>
                                </select>
                                <button className="btn primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                    {uploading ? "Đang xử lý..." : "📤 Tải Excel"}
                                </button>
                            </div>
                        </div>
                        <div className="card info-box">
                            <strong>Hướng dẫn:</strong> File Excel cần có các cột: <code>username, email, full_name, password</code>.
                        </div>
                    </div>
                );
            case "class_members_import":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Nhập sinh viên vào lớp từ Excel</h4>
                            <button className="btn primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                {uploading ? "Đang xử lý..." : "📤 Tải Excel"}
                            </button>
                        </div>
                        <div className="card info-box">
                            <strong>Hướng dẫn:</strong> Hệ thống hỗ trợ linh hoạt các cột sau (Tiếng Việt hoặc Tiếng Anh):
                            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                <li><strong>Lớp học:</strong> <code>mã lớp</code> (ID) và/hoặc <code>tên lớp</code></li>
                                <li><strong>Sinh viên:</strong> <code>mã sinh viên</code> (ID) và/hoặc <code>username</code></li>
                            </ul>
                            <strong>Ví dụ:</strong>
                            <table style={{ fontSize: 12, marginTop: 8, borderCollapse: 'collapse', width: '100%', border: '1px solid #bae6fd' }}>
                                <thead>
                                    <tr style={{ background: '#e0f2fe' }}>
                                        <th style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>mã lớp</th>
                                        <th style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>tên lớp</th>
                                        <th style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>username</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>3</td>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>CLS002</td>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>student1</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}></td>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>SE Class 1</td>
                                        <td style={{ padding: '4px 8px', border: '1px solid #bae6fd' }}>student2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case "subjects":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Quản lý Môn học</h4>
                            <button className="btn primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                {uploading ? "Đang xử lý..." : "📤 Nhập Excel"}
                            </button>
                        </div>
                        {loading ? <p>Đang tải...</p> : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã môn</th>
                                        <th>Tên môn học</th>
                                        <th>Mô tả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entities.map(s => (
                                        <tr key={s.id}>
                                            <td><code style={{ color: 'var(--primary)' }}>{s.code}</code></td>
                                            <td>{s.name}</td>
                                            <td style={{ fontSize: 13, opacity: 0.7 }}>{s.description || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case "classes":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Quản lý Lớp học</h4>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn primary" onClick={() => {
                                    fetchLecturers();
                                    setShowCreateClassModal(true);
                                }}>
                                    + Tạo lớp mới
                                </button>
                                <button className="btn outline" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                    {uploading ? "Đang xử lý..." : "📤 Nhập Excel"}
                                </button>
                            </div>
                        </div>
                        {loading ? <p>Đang tải...</p> : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}></th>
                                        <th>Mã lớp</th>
                                        <th>Tên lớp</th>
                                        <th>Giảng viên</th>
                                        <th>Số SV</th>
                                        <th>Ngày tạo</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entities.map(c => (
                                        <ClassRow key={c.id} classData={c} />
                                    ))}
                                    {entities.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', opacity: 0.5 }}>Chưa có lớp học nào</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case "approval":
                return (
                    <div className="tab-pane">
                        <div className="row-between" style={{ marginBottom: 20 }}>
                            <h4>Duyệt dự án mới</h4>
                        </div>
                        {loading ? <p>Đang tải...</p> : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tên dự án</th>
                                        <th>Giảng viên</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entities.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <strong>{p.title}</strong><br />
                                                <small>{p.description}</small>
                                            </td>
                                            <td>Lecturer ID: {p.lecturer_id}</td>
                                            <td><span className="badge warning">{p.status}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 5 }}>
                                                    <button className="btn btn-sm success" onClick={() => handleApproveProject(p.id, "Approved")}>Duyệt</button>
                                                    <button className="btn btn-sm danger" onClick={() => handleApproveProject(p.id, "Denied")}>Từ chối</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {entities.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Không có dự án chờ duyệt</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            default:
                return <p>Hãy chọn một chức năng quản trị bên trên.</p>;
        }
    };

    return (
        <Layout title="Quản trị hệ thống">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="tab-header" style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafbfc' }}>
                    {r === "admin" && (
                        <div className={`tab-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Người dùng</div>
                    )}
                    {r === "staff" && (
                        <>
                            <div className={`tab-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Quản lý TK</div>
                            <div className={`tab-item ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Môn học</div>
                            <div className={`tab-item ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>Lớp học</div>
                            <div className={`tab-item ${activeTab === 'class_members_import' ? 'active' : ''}`} onClick={() => setActiveTab('class_members_import')}>Thêm SV vào lớp</div>
                        </>
                    )}
                    {(r === "head" || r === "head_dept") && (
                        <div className={`tab-item ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>Duyệt dự án</div>
                    )}
                </div>

                <div style={{ padding: 24 }}>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} accept=".xlsx, .xls" />
                    {renderTabContent()}
                </div>
            </div>

            <style>{`
        .tab-item {
          padding: 16px 24px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
        }
        .tab-item:hover { color: var(--primary); background: #fff; }
        .tab-item.active {
          color: var(--primary);
          background: #fff;
          border-bottom: 2px solid var(--primary);
        }
        .btn-sm { padding: 4px 8px; font-size: 12px; }
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge.info { background: #e0f2fe; color: #0369a1; }
        .badge.danger { background: #fee2e2; color: #b91c1c; }
        .badge.warning { background: #fef3c7; color: #92400e; }
        .info-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px 16px; font-size: 14px; border-radius: 8px; color: #0369a1; }
      `}</style>
            {/* Modal tạo lớp học mới */}
            {showCreateClassModal && (
                <div className="modal-overlay" onClick={() => setShowCreateClassModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo lớp học mới</h3>
                            <button className="close-btn" onClick={() => setShowCreateClassModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateClass}>
                            <div className="form-group">
                                <label>Tên lớp học</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newClassData.name}
                                    onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                                    placeholder="Ví dụ: Công nghệ phần mềm - K24"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Giảng viên phụ trách</label>
                                <select
                                    className="input"
                                    value={newClassData.lecturer_id}
                                    onChange={e => setNewClassData({ ...newClassData, lecturer_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn giảng viên --</option>
                                    {lecturers.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.full_name} (@{l.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn outline" onClick={() => setShowCreateClassModal(false)}>Hủy</button>
                                <button type="submit" className="btn primary" disabled={creatingClass}>
                                    {creatingClass ? "Đang tạo..." : "Tạo lớp"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; border-radius: 12px; padding: 24px;
                    width: 100%; max-width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .modal-header {
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
                }
                .close-btn {
                    background: none; border: none; font-size: 24px; cursor: pointer; color: #666;
                }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
                .input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
            `}</style>
        </Layout>
    );
}
