import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import Layout from "../components/Layout";
import api from "../api";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState(null);
    const scrollRef = useRef(null);
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser ? currentUser.id : 0;

    // Get user's teamId and then fetch history
    useEffect(() => {
        setLoading(true);
        api.get("/dashboard/me/stats")
            .then(res => {
                if (res.data.team_id) {
                    setTeamId(res.data.team_id);
                } else {
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch dashboard stats for chat", err);
                setLoading(false);
            });
    }, []);

    const fetchMessages = async () => {
        if (!teamId) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get(`/chat/teams/${teamId}?limit=50`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Failed to fetch chat history", err);
        } finally {
            setLoading(false);
        }
    };

    const socket = useSocket();

    useEffect(() => {
        if (teamId) {
            fetchMessages();
            // Removed polling
        }
    }, [teamId]);

    // Socket listeners
    useEffect(() => {
        if (teamId && socket) {
            const roomName = `team_${teamId}`;
            socket.emit('join_room', { room: roomName });
            console.log(`Joined room: ${roomName}`);

            socket.on('receive_message', (newMsg) => {
                console.log("Received new message:", newMsg);
                setMessages((prev) => [newMsg, ...prev]);
            });

            return () => {
                socket.off('receive_message');
                socket.emit('leave_room', { room: roomName });
            };
        }
    }, [teamId, socket]);

    const fileInputRef = useRef(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !teamId) return;

        const tmpText = inputText;
        setInputText(""); // Optimistic clear

        try {
            await api.post(`/chat/teams/${teamId}/messages`, { content: tmpText });
            fetchMessages(); // Fallback/Ensure immediate update for sender
        } catch (err) {
            console.error("Failed to send message", err);
            setInputText(tmpText); // Restore on failure
            alert("Lỗi khi gửi tin nhắn");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !teamId) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            // No loading spinner for file-only upload to keep UX smooth
            await api.post(`/chat/teams/${teamId}/upload`, formData);
            fetchMessages(); // Fallback / immediate update
        } catch (err) {
            console.error("Failed to upload file to chat", err);
            alert("Lỗi khi tải file lên");
        }
    };

    return (
        <Layout title="Trò chuyện nhóm">
            {!teamId && !loading ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                    <h3>Bạn chưa tham gia nhóm nào.</h3>
                    <p>Hãy tham gia một nhóm để bắt đầu thảo luận.</p>
                </div>
            ) : (
                <div className="chat-page">
                    <aside className="chat-sidebar">
                        <div className="chat-sidebar-head">
                            <span>Kênh luận</span>
                        </div>
                        <div className="chat-channels">
                            <div className="channel-item active">
                                <span className="channel-icon">#</span>
                                <span className="channel-name">Nhóm dự án</span>
                            </div>
                            <div className="channel-item" style={{ opacity: 0.5, cursor: 'default' }}>
                                <span className="channel-icon">#</span>
                                <span className="channel-name">Thông báo chung</span>
                            </div>
                        </div>
                    </aside>

                    <main className="chat-main">
                        <div className="chat-history" ref={scrollRef}>
                            {loading && messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>Đang tải tin nhắn...</div>
                            ) : messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
                            ) : messages.map((m) => (
                                <div key={m.id} className={`msg-item ${m.sender_id === currentUserId ? 'me' : ''}`}>
                                    <div className="msg-avatar">
                                        {m.sender_name ? m.sender_name[0].toUpperCase() : "?"}
                                    </div>
                                    <div className="msg-content-wrap">
                                        <div className="msg-info">
                                            <span className="msg-sender">{m.sender_name || "Unknown"}</span>
                                            <span className="msg-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`msg-bubble ${m.is_file ? 'file' : ''}`}>
                                            {m.is_file ? (
                                                <div className="msg-file-box">
                                                    {m.file_type?.includes('image') ? (
                                                        <img src={m.file_url} alt="Uploaded" className="msg-img-preview" onClick={() => window.open(m.file_url)} />
                                                    ) : (
                                                        <a href={m.file_url} target="_blank" rel="noreferrer" className="msg-file-link">
                                                            📁 {m.content || "Tập tin đính kèm"}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                className="btn"
                                onClick={() => fileInputRef.current.click()}
                                title="Đính kèm file"
                            >
                                📎
                            </button>
                            <textarea
                                className="chat-input"
                                placeholder="Nhập nội dung tin nhắn..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                rows={1}
                            />
                            <button className="btn primary" type="submit">Gửi</button>
                        </form>
                    </main>
                </div>
            )}
        </Layout>
    );
}
