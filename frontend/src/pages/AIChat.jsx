import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function AIChat() {
    const [messages, setMessages] = useState([
        { role: "ai", content: "Xin chào! Tôi là trợ lý AI của CollabSphere. Tôi có thể giúp bạn lên ý tưởng (Brainstorming), cung cấp hướng dẫn (Guidance) hoặc giải đáp các thắc mắc chung. Hôm nay bạn cần giúp gì?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("chat"); // chat, brainstorm, guidance
    const [teamId, setTeamId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchTeamId = async () => {
            try {
                const res = await api.get("/dashboard/me/stats");
                if (res.data.team_id) {
                    setTeamId(res.data.team_id);
                }
            } catch (err) {
                console.error("Failed to fetch team ID for AI", err);
            }
        };
        fetchTeamId();
    }, []);

    const handleSend = async (e, customInput) => {
        if (e) e.preventDefault();
        const textToSend = customInput || input;
        if (!textToSend.trim() || loading) return;

        const userMsg = { role: "user", content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            let endpoint = "/ai/chat";
            if (mode === "brainstorm") endpoint = "/ai/brainstorm";
            if (mode === "guidance") endpoint = "/ai/guidance";

            const res = await api.post(endpoint, {
                context: textToSend,
                team_id: teamId
            });

            setMessages(prev => [...prev, { role: "ai", content: res.data.response }]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages(prev => [...prev, { role: "ai", content: "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau." }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: "💡 Lên ý tưởng dự án", text: "Gợi ý cho tôi một số ý tưởng dự án PBL sáng tạo", mode: "brainstorm" },
        { label: "🚩 Mốc thời gian", text: "Các mốc thời gian (milestones) quan trọng của dự án là gì?", mode: "guidance" },
        { label: "📝 Tạo nhiệm vụ", text: "Làm thế nào để tạo nhiệm vụ (task) mới cho nhóm?", mode: "chat" },
        { label: "👥 Quản lý nhóm", text: "Hướng dẫn tôi cách quản lý thành viên trong nhóm", mode: "chat" }
    ];

    return (
        <Layout title="Trợ lý AI">
            <div className="ai-chat-container" style={{
                height: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Header/Mode Selector */}
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    background: '#f8fafc'
                }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Chế độ:</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => setMode("chat")}
                            className={`btn btn-sm ${mode === "chat" ? "primary" : "outline"}`}
                            style={{ borderRadius: 20 }}
                        >
                            💬 Trò chuyện
                        </button>
                        <button
                            onClick={() => setMode("brainstorm")}
                            className={`btn btn-sm ${mode === "brainstorm" ? "primary" : "outline"}`}
                            style={{ borderRadius: 20 }}
                        >
                            💡 Lên ý tưởng
                        </button>
                        <button
                            onClick={() => setMode("guidance")}
                            className={`btn btn-sm ${mode === "guidance" ? "primary" : "outline"}`}
                            style={{ borderRadius: 20 }}
                        >
                            🏗️ Hướng dẫn dự án
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{
                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: m.role === 'user' ? '#3b82f6' : '#f1f5f9',
                                color: m.role === 'user' ? '#fff' : '#1e293b',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.5
                            }}>
                                {m.content}
                            </div>
                            <small style={{ marginTop: 4, color: '#94a3b8', fontSize: 10 }}>
                                {m.role === 'user' ? 'Bạn' : 'AI Assistant'}
                            </small>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#64748b' }}>
                            <div className="spinner-small" style={{ width: 16, height: 16, border: '2px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <small>AI đang suy nghĩ...</small>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div style={{
                    padding: '10px 20px',
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    borderTop: '1px solid #f1f5f9',
                    background: '#fcfcfc'
                }}>
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setMode(action.mode);
                                handleSend(null, action.text);
                            }}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 20,
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                whiteSpace: 'nowrap',
                                fontSize: 13,
                                color: '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={(e) => handleSend(e)} style={{
                    padding: 20,
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: 10
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            mode === "brainstorm" ? "Gợi ý các ý tưởng cho đề tài..." :
                                mode === "guidance" ? "Tôi cần hướng dẫn về..." :
                                    "Hỏi AI bất cứ điều gì..."
                        }
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: 24,
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: 14
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="btn primary"
                        style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        🚀
                    </button>
                </form>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </Layout>
    );
}
