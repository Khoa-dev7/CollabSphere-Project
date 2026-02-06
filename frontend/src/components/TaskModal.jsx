import { useState } from "react";
import api from "../api";

export default function TaskModal({ isOpen, onClose, onTaskCreated, teamId, teamMembers = [] }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        assigned_to: null,
        due_date: "",
        status: "Todo"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.title.trim()) {
            setError("Vui lòng nhập tiêu đề nhiệm vụ");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                team_id: teamId,
                title: formData.title,
                description: formData.description || null,
                priority: formData.priority,
                status: formData.status,
                assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
                due_date: formData.due_date || null,
                order: 0 // Will be set by backend
            };

            const response = await api.post("/workspace/tasks", payload);
            onTaskCreated(response.data);

            // Reset form
            setFormData({
                title: "",
                description: "",
                priority: "Medium",
                assigned_to: null,
                due_date: "",
                status: "Todo"
            });
            onClose();
        } catch (err) {
            console.error("Error creating task:", err);
            setError(err.response?.data?.detail || "Không thể tạo nhiệm vụ");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo nhiệm vụ mới</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tiêu đề <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Nhập tiêu đề nhiệm vụ"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Mô tả chi tiết nhiệm vụ"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Độ ưu tiên</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Thấp</option>
                                <option value="Medium">Trung bình</option>
                                <option value="High">Cao</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Todo">Todo</option>
                                <option value="Doing">Doing</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phân công cho</label>
                            <select
                                value={formData.assigned_to || ""}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                            >
                                <option value="">Chưa phân công</option>
                                {teamMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.full_name || member.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Hạn hoàn thành</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className="btn primary" disabled={loading}>
                            {loading ? "Đang tạo..." : "Tạo nhiệm vụ"}
                        </button>
                    </div>
                </form>

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        backdrop-filter: blur(4px);
                    }
                    .modal-content {
                        background: white;
                        border-radius: 16px;
                        padding: 24px;
                        width: 90%;
                        max-width: 600px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .modal-header h3 {
                        margin: 0;
                        font-size: 20px;
                    }
                    .close-btn {
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #64748b;
                        line-height: 1;
                        padding: 0;
                        width: 32px;
                        height: 32px;
                    }
                    .close-btn:hover {
                        color: #334155;
                    }
                    .form-group {
                        margin-bottom: 16px;
                        flex: 1;
                    }
                    .form-group label {
                        display: block;
                        margin-bottom: 6px;
                        font-weight: 500;
                        font-size: 14px;
                        color: #334155;
                    }
                    .form-group input,
                    .form-group textarea,
                    .form-group select {
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: inherit;
                        transition: border-color 0.2s;
                    }
                    .form-group input:focus,
                    .form-group textarea:focus,
                    .form-group select:focus {
                        outline: none;
                        border-color: var(--primary);
                    }
                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                    .modal-footer {
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                        margin-top: 24px;
                    }
                `}</style>
            </div>
        </div>
    );
}
