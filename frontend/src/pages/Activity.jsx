import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Activity() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role] = useState(localStorage.getItem("role"));

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const r = role ? role.toLowerCase() : "";

            // If student or lecturer, fetch logs from all their teams
            if (r === "student" || r === "lecturer") {
                const teamsRes = await api.get("/projects/teams");
                const teams = teamsRes.data;

                if (teams.length === 0) {
                    setLogs([]);
                    setLoading(false);
                    return;
                }

                const promises = teams.map(team =>
                    api.get(`/activity/teams/${team.id}?limit=20`)
                        .then(res => res.data)
                        .catch(err => {
                            console.error(`Error fetching logs for team ${team.id}`, err);
                            return [];
                        })
                );

                const results = await Promise.all(promises);
                const allLogs = results.flat().sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );

                setLogs(allLogs);
            } else {
                // Admin/Staff view system logs
                const res = await api.get("/activity/system?limit=50");
                setLogs(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch activity logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
                <div className="row-between" style={{ marginBottom: 20 }}>
                    <div>
                        <h3>{["student", "lecturer"].includes(role?.toLowerCase()) ? "Hoạt động của các nhóm" : "Lịch sử hệ thống"}</h3>
                        <p style={{ opacity: 0.7 }}>Xem lại các thay đổi và hoạt động gần đây.</p>
                    </div>
                    <button className="btn outline btn-sm" onClick={fetchLogs} disabled={loading}>
                        {loading ? "Đang tải..." : "🔄 Cập nhật"}
                    </button>
                </div>

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
                                        {log.team_name && (
                                            <span style={{
                                                display: "inline-block",
                                                backgroundColor: "#e0f2fe",
                                                color: "#0369a1",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                marginRight: "6px"
                                            }}>
                                                {log.team_name}
                                            </span>
                                        )}
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
