import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Activity() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [teamId, setTeamId] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                let endpoint = "/activity/system?limit=50";

                // If student, check for team logs instead
                if (role === "Student") {
                    const statsRes = await api.get("/dashboard/me/stats");
                    const tid = statsRes.data.team_id;
                    if (tid) {
                        setTeamId(tid);
                        endpoint = `/activity/teams/${tid}?limit=50`;
                    } else {
                        setLoading(false);
                        return;
                    }
                }

                const res = await api.get(endpoint);
                setLogs(res.data || []);
            } catch (err) {
                console.error("Failed to fetch activity logs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [role]);

    const getActionIcon = (action) => {
        if (action.includes("create") || action.includes("add")) return "➕";
        if (action.includes("update") || action.includes("edit") || action.includes("move")) return "✏️";
        if (action.includes("delete") || action.includes("remove")) return "🗑️";
        if (action.includes("upload")) return "📤";
        if (action.includes("login")) return "🔑";
        return "📝";
    };

    return (
        <Layout title="Nhật ký hoạt động">
            <div className="card">
                <h3>{role === "Student" ? "Hoạt động của nhóm" : "Lịch sử hệ thống"}</h3>
                <p style={{ opacity: 0.7, marginBottom: 20 }}>Xem lại các thay đổi và hoạt động gần đây.</p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>Đang tải nhật ký...</div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Chưa có hoạt động nào được ghi lại.</div>
                ) : (
                    <div className="activity-timeline">
                        {logs.map(log => (
                            <div key={log.id} className="activity-item" style={{
                                display: 'flex',
                                gap: 16,
                                padding: '16px 0',
                                borderBottom: '1px solid #f1f5f9',
                                alignItems: 'flex-start'
                            }}>
                                <div className="activity-icon" style={{
                                    width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                }}>
                                    {getActionIcon(log.action)}
                                </div>
                                <div className="activity-details" style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>
                                        {log.actor_name || "Hệ thống"} <span style={{ fontWeight: 400, color: '#64748b' }}>đã {log.action}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                        Thực thể: <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}</span>
                                    </div>
                                </div>
                                <div className="activity-time" style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
