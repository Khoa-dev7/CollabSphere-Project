import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function PeerReview() {
    // --- Khai báo các trạng thái (State) ---
    const [members, setMembers] = useState([]); // Danh sách các thành viên khác trong nhóm (không bao gồm bản thân)
    const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu ban đầu
    const [teamId, setTeamId] = useState(null); // ID của nhóm mà người dùng đang tham gia
    const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi đánh giá lên server
    const [scores, setScores] = useState({}); // Lưu trữ điểm và nhận xét cho từng thành viên: {userid: {score, comment}}

    // Hook: Khởi tạo dữ liệu đánh giá khi trang được tải
    useEffect(() => {
        const initReview = async () => {
            try {
                // 1. Lấy ID nhóm của người dùng hiện tại từ thông tin thống kê cá nhân
                const statsRes = await api.get("/dashboard/me/stats");
                const tid = statsRes.data.team_id;

                if (!tid) {
                    setLoading(false);
                    return;
                }
                setTeamId(tid);

                // 2. Lấy danh sách thành viên trong nhóm
                const membersRes = await api.get("/workspace/teams/me/members");
                const currentUserId = parseInt(localStorage.getItem("userId") || "0");

                // Lọc bỏ chính người dùng hiện tại khỏi danh sách được đánh giá
                const others = membersRes.data.filter(m => m.id !== currentUserId);
                setMembers(others);

                // Khởi tạo trạng thái điểm mặc định (10 điểm, không nhận xét) cho mỗi thành viên
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

    // Hàm xử lý khi người dùng thay đổi điểm hoặc nhận xét cho một thành viên
    const handleScoreChange = (userId, field, value) => {
        setScores(prev => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value }
        }));
    };

    // Hàm gửi đánh giá của một thành viên cụ thể lên server
    const handleSubmit = async (userId) => {
        // Kiểm tra điều kiện: Phải có nhận xét mới được gửi
        if (!scores[userId].comment.trim()) {
            alert("Vui lòng nhập nhận xét cho thành viên này.");
            return;
        }

        setSubmitting(true);
        try {
            // Gửi dữ liệu đánh giá đồng đẳng (Peer Review)
            await api.post("/eval/peer-review", {
                reviewee_id: userId,
                team_id: teamId,
                score: parseFloat(scores[userId].score),
                comment: scores[userId].comment,
                is_anonymous: true // Đánh giá ẩn danh (mặc định)
            });
            alert("Đã gửi đánh giá thành công!");
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Lỗi khi gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    // Hiển thị trạng thái đang tải
    if (loading) return <Layout title="Đánh giá nhóm"><div>Đang tải dữ liệu...</div></Layout>;

    // Trường hợp sinh viên chưa có nhóm
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

                {/* Danh sách thành viên để đánh giá */}
                <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {members.length === 0 ? (
                        <p>Không tìm thấy thành viên khác trong nhóm.</p>
                    ) : members.map(m => (
                        <div key={m.id} className="review-item" style={{ padding: 16, border: '1px solid #eef2f7', borderRadius: 12 }}>
                            {/* Thông tin thành viên */}
                            <div className="row-between" style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{m.full_name}</div>
                                <div className="pill">{m.email}</div>
                            </div>

                            {/* Form nhập điểm và nhận xét */}
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

                            {/* Nút gửi đánh giá cho từng người */}
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
