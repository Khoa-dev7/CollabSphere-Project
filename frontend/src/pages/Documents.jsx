import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";
import EmptyState from "../components/EmptyState";

export default function Documents() {
    const [searchParams] = useSearchParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                const teamIdFromUrl = searchParams.get("teamId");
                if (teamIdFromUrl) {
                    setTeamId(teamIdFromUrl);
                    fetchResources(teamIdFromUrl);
                } else {
                    // Fallback: Lấy team_id từ stats của user hiện tại
                    const statsRes = await api.get("/dashboard/me/stats");
                    if (statsRes.data.team_id) {
                        setTeamId(statsRes.data.team_id);
                        fetchResources(statsRes.data.team_id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Failed to init documents", err);
                setLoading(false);
            }
        };
        init();
    }, [searchParams]);

    const fetchResources = async (tid) => {
        try {
            const res = await api.get(`/resources/teams/${tid}`);
            setResources(res.data || []);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !teamId) return;

        const formData = new FormData();
        formData.append("file", file);

        // We can show a prompt for name or use filename
        const name = prompt("Nhập tên tài liệu:", file.name) || file.name;
        const fileType = file.type.split('/')[0];

        try {
            setUploading(true);
            await api.post(`/resources/upload?name=${encodeURIComponent(name)}&file_type=${fileType}&team_id=${teamId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchResources(teamId);
        } catch (err) {
            console.error("Upload error", err);
            alert("Lỗi khi tải file lên.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
        try {
            await api.delete(`/resources/${id}`);
            fetchResources(teamId);
        } catch (err) {
            console.error("Delete error", err);
            alert("Lỗi khi xóa tài liệu.");
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return "N/A";
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <Layout title="Tài liệu & Tài nguyên">
            {!teamId && !loading ? (
                <EmptyState
                    icon="Team"
                    title="Chưa có nhóm"
                    message="Bạn chưa tham gia nhóm nào. Hãy tham gia nhóm để chia sẻ tài liệu."
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card row-between">
                        <div>
                            <h3>Tài liệu của nhóm</h3>
                            <p style={{ opacity: 0.7 }}>Quản lý tất cả tài liệu, hình ảnh và tài nguyên của dự án dại đây.</p>
                        </div>
                        <button
                            className="btn primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? "Đang tải lên..." : "📤 Tải tài liệu mới"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleUpload}
                        />
                    </div>

                    <div className="card">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>Đang tải...</div>
                        ) : resources.length === 0 ? (
                            <EmptyState
                                icon="Doc"
                                title="Chưa có tài liệu"
                                message="Nhóm của bạn hiện chưa có tài liệu nào. Hãy tải lên tài liệu đầu tiên!"
                            />
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tên tài liệu</th>
                                        <th>Loại</th>
                                        <th>Ngày tải lên</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resources.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{r.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Link: <a href={r.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Xem tài liệu</a></div>
                                            </td>
                                            <td><span className="pill">{r.file_type}</span></td>
                                            <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="icon-btn" title="Tải xuống" onClick={() => window.open(r.file_url)}>📥</button>
                                                    <button className="icon-btn" title="Xóa" onClick={() => handleDelete(r.id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
