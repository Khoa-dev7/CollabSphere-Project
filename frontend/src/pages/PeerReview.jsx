import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function PeerReview() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [scores, setScores] = useState({}); // {userid: {score, comment}}

    useEffect(() => {
        const initReview = async () => {
            try {
                // 1. Get Team ID
                const statsRes = await api.get("/dashboard/me/stats");
                const tid = statsRes.data.team_id;

                if (!tid) {
                    setLoading(false);
                    return;
                }
                setTeamId(tid);

                // 2. Get Members
                const membersRes = await api.get("/workspace/teams/me/members");
                const currentUserId = parseInt(localStorage.getItem("userId") || "0");

                // Filter out current user
                const others = membersRes.data.filter(m => m.id !== currentUserId);
                setMembers(others);

                // Init scores state
                const initialScores = {};
                others.forEach(m => {
                    initialScores[m.id] = { score: 10, comment: "" };
                });
                setScores(initialScores);
            } catch (err) {
                console.error("Failed to load peer review data", err);
            } finally {
                setLoading(false);
            }
        };

        initReview();
    }, []);

    const handleScoreChange = (userId, field, value) => {
        setScores(prev => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value }
        }));
    };

    const handleSubmit = async (userId) => {
        if (!scores[userId].comment.trim()) {
            alert("Vui lòng nhập nhận xét cho thành viên này.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/eval/peer-review", {
                reviewee_id: userId,
                team_id: teamId,
                score: parseFloat(scores[userId].score),
                comment: scores[userId].comment,
                is_anonymous: true
            });
            alert("Đã gửi đánh giá thành công!");
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Lỗi khi gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Layout title="Đánh giá nhóm"><div>Đang tải dữ liệu...</div></Layout>;

    if (!teamId) return (
        <Layout title="Đánh giá nhóm">
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <h3>Bạn chưa tham gia nhóm nào.</h3>
                <p>Tính năng đánh giá đồng đẳng chỉ dành cho thành viên trong nhóm.</p>
            </div>
        </Layout>
    );

    return (
        <Layout title="Đánh giá nhóm">
            <div className="card">
                <h3>Đánh giá thành viên trong nhóm</h3>
                <p style={{ opacity: 0.7, marginBottom: 20 }}>
                    Hãy đánh giá khách quan đóng góp của các thành viên trong dự án. Đánh giá của bạn là hoàn toàn ẩn danh.
                </p>

                <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {members.length === 0 ? (
                        <p>Không tìm thấy thành viên khác trong nhóm.</p>
                    ) : members.map(m => (
                        <div key={m.id} className="review-item" style={{ padding: 16, border: '1px solid #eef2f7', borderRadius: 12 }}>
                            <div className="row-between" style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{m.full_name}</div>
                                <div className="pill">{m.email}</div>
                            </div>

                            <div className="form grid" style={{ marginTop: 0 }}>
                                <div className="field">
                                    <label>Điểm đóng góp (1 - 10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={scores[m.id]?.score || 10}
                                        onChange={(e) => handleScoreChange(m.id, 'score', e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Nhận xét</label>
                                    <input
                                        placeholder="Nhập nhận xét về sự đóng góp..."
                                        value={scores[m.id]?.comment || ""}
                                        onChange={(e) => handleScoreChange(m.id, 'comment', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn primary"
                                    onClick={() => handleSubmit(m.id)}
                                    disabled={submitting}
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
