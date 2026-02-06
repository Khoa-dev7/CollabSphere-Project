import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Rubrics() {
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRubric, setEditingRubric] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject_id: "",
        project_id: "",
        is_template: false,
        criteria: []
    });

    const fetchRubrics = async () => {
        try {
            const res = await api.get("/rubrics/");
            setRubrics(res.data || []);
        } catch (err) {
            console.error("Failed to fetch rubrics", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRubrics();
    }, []);

    const handleAddCriteria = () => {
        setFormData(prev => ({
            ...prev,
            criteria: [...prev.criteria, { title: "", description: "", max_score: 10, weight: 1.0, order: prev.criteria.length }]
        }));
    };

    const handleRemoveCriteria = (index) => {
        setFormData(prev => ({
            ...prev,
            criteria: prev.criteria.filter((_, i) => i !== index)
        }));
    };

    const handleCriteriaChange = (index, field, value) => {
        const newCriteria = [...formData.criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setFormData({ ...formData, criteria: newCriteria });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                criteria: formData.criteria.map(c => ({
                    ...c,
                    max_score: parseFloat(c.max_score),
                    weight: parseFloat(c.weight)
                }))
            };

            if (editingRubric) {
                await api.put(`/rubrics/${editingRubric.id}`, payload);
            } else {
                await api.post("/rubrics/", payload);
            }

            setShowModal(false);
            fetchRubrics();
            setEditingRubric(null);
            setFormData({ title: "", description: "", subject_id: "", project_id: "", is_template: false, criteria: [] });
        } catch (err) {
            console.error("Failed to save rubric", err);
            alert("Lỗi khi lưu Rubric. Vui lòng kiểm tra quyền hạn.");
        }
    };

    const handleEdit = (r) => {
        setEditingRubric(r);
        setFormData({
            title: r.title,
            description: r.description || "",
            subject_id: r.subject_id || "",
            project_id: r.project_id || "",
            is_template: r.is_template,
            criteria: r.criteria || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa tiêu chí này?")) return;
        try {
            await api.delete(`/rubrics/${id}`);
            fetchRubrics();
        } catch (err) {
            console.error("Failed to delete rubric", err);
        }
    };

    const handleClone = async (id) => {
        const targetSubject = prompt("Nhập Subject ID mới:");
        if (!targetSubject) return;
        try {
            await api.post(`/rubrics/${id}/clone?target_subject_id=${targetSubject}`);
            fetchRubrics();
        } catch (err) {
            console.error("Clone error", err);
            alert("Lỗi khi nhân bản.");
        }
    };

    return (
        <Layout title="Quản lý Tiêu chí (Rubrics)">
            <div className="card row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h3>Danh sách Rubrics</h3>
                    <p style={{ opacity: 0.7 }}>Thiết lập các bộ tiêu chí để đánh giá dự án và sinh viên.</p>
                </div>
                <button className="btn primary" onClick={() => {
                    setEditingRubric(null);
                    setFormData({ title: "", description: "", subject_id: "", project_id: "", is_template: false, criteria: [] });
                    setShowModal(true);
                }}>
                    ➕ Tạo Rubric mới
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>Đang tải...</div>
                ) : rubrics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Chưa có tiêu chí nào.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {rubrics.map(r => (
                            <div key={r.id} className="card" style={{ border: '1px solid #eef2f7' }}>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{r.title}</div>
                                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>{r.description || "Không có mô tả"}</div>
                                <div style={{ marginBottom: 12 }}>
                                    <span className="pill">{r.criteria?.length || 0} Tiêu chí</span>
                                    {r.is_template && <span className="pill ok" style={{ marginLeft: 8 }}>Template</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button className="icon-btn" title="Nhân bản" onClick={() => handleClone(r.id)}>📋</button>
                                    <button className="icon-btn" title="Chỉnh sửa" onClick={() => handleEdit(r)}>✏️</button>
                                    <button className="icon-btn" title="Xóa" onClick={() => handleDelete(r.id)}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="modal-card" style={{ width: 'min(700px, 95vw)', maxHeight: '90vh', overflow: 'auto' }}>
                        <h3>{editingRubric ? "Chỉnh sửa Rubric" : "Tạo Rubric mới"}</h3>
                        <form onSubmit={handleSubmit} className="form grid">
                            <div className="field full">
                                <label>Tiêu đề</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="field full">
                                <label>Mô tả kỹ thuật</label>
                                <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="field">
                                <label>Subject ID (Môn học)</label>
                                <input type="number" value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} />
                            </div>
                            <div className="field">
                                <label>Project ID (Dự án)</label>
                                <input type="number" value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} />
                            </div>

                            <div className="field full" style={{ marginTop: 10 }}>
                                <div className="row-between">
                                    <h4>Cấu trúc Tiêu chí</h4>
                                    <button type="button" className="btn" onClick={handleAddCriteria}>+ Thêm tiêu chí con</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                                    {formData.criteria.map((c, i) => (
                                        <div key={i} style={{ padding: 10, border: '1px solid #eee', borderRadius: 8, position: 'relative' }}>
                                            <button type="button" onClick={() => handleRemoveCriteria(i)} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: 'none', cursor: 'pointer' }}>❌</button>
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                                                <input placeholder="Tên tiêu chí" value={c.title} onChange={e => handleCriteriaChange(i, 'title', e.target.value)} />
                                                <input type="number" placeholder="Điểm max" value={c.max_score} onChange={e => handleCriteriaChange(i, 'max_score', e.target.value)} />
                                                <input type="number" step="0.1" placeholder="Trọng số" value={c.weight} onChange={e => handleCriteriaChange(i, 'weight', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="field full" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <input type="checkbox" checked={formData.is_template} onChange={e => setFormData({ ...formData, is_template: e.target.checked })} />
                                <label>Đặt làm mẫu (Template)</label>
                            </div>

                            <div className="field full" style={{ marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
