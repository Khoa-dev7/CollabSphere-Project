import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { useSocket } from "../context/SocketContext";
import api from "../api";

export default function Whiteboard() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#3b82f6");
    const [lineWidth, setLineWidth] = useState(5);
    const [team, setTeam] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        // Fetch user team to join room
        const fetchTeam = async () => {
            try {
                const res = await api.get("/workspace/teams/me");
                setTeam(res.data);
                if (socket) {
                    socket.emit("join_room", { room: `team_${res.data.id}` });
                }
            } catch (err) {
                console.error("Error fetching team for whiteboard", err);
            }
        };
        fetchTeam();
    }, [socket]);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        contextRef.current = context;

        // Set initial background
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        if (!contextRef.current) return;
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;
    }, [color, lineWidth]);

    useEffect(() => {
        if (!socket) return;

        socket.on("draw", (data) => {
            const { x0, y0, x1, y1, color, width } = data;
            drawOnCanvas(x0, y0, x1, y1, color, width, false);
        });

        socket.on("clear_canvas", () => {
            const canvas = canvasRef.current;
            const context = contextRef.current;
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
        });

        return () => {
            socket.off("draw");
            socket.off("clear_canvas");
        };
    }, [socket]);

    const drawOnCanvas = (x0, y0, x1, y1, color, width, emit = true) => {
        const context = contextRef.current;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = width;
        context.stroke();
        context.closePath();

        if (emit && socket && team) {
            socket.emit("draw", {
                room: `team_${team.id}`,
                x0, y0, x1, y1, color, width
            });
        }
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;

        // We need to keep track of previous position to draw smooth lines
        // A simpler way for this demo is drawing from last point
        // But for better results we should store prevX and prevY
    };

    // Improved draw with previous state
    const prevPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        prevPos.current = { x: offsetX, y: offsetY };
        setIsDrawing(true);
    };

    const handleMouseMove = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        drawOnCanvas(prevPos.current.x, prevPos.current.y, offsetX, offsetY, color, lineWidth, true);
        prevPos.current = { x: offsetX, y: offsetY };
    };

    const clearCanvas = () => {
        if (!window.confirm("Bạn có chắc muốn xóa bảng không?")) return;
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (socket && team) {
            socket.emit("clear_canvas", { room: `team_${team.id}` });
        }
    };

    return (
        <Layout title="Bảng trắng trực tuyến">
            <div className="whiteboard-container" style={{ position: 'relative', height: 'calc(100vh - 120px)', overflow: 'hidden', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>

                {/* Toolbar */}
                <div className="whiteboard-toolbar" style={{
                    position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
                    padding: '10px 20px', borderRadius: 40, display: 'flex', gap: 20, alignItems: 'center',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10
                }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#000000"].map(c => (
                            <div
                                key={c}
                                onClick={() => setColor(c)}
                                style={{
                                    width: 24, height: 24, borderRadius: '50%', background: c,
                                    cursor: 'pointer', border: color === c ? '2px solid #fff' : 'none',
                                    outline: color === c ? '2px solid #3b82f6' : 'none'
                                }}
                            />
                        ))}
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 24, height: 24, border: 'none', padding: 0, cursor: 'pointer' }} />
                    </div>

                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <small>Cỡ bút:</small>
                        <input
                            type="range"
                            min="1" max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(e.target.value)}
                            style={{ width: 80 }}
                        />
                    </div>

                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

                    <button onClick={clearCanvas} className="btn outline btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                        🗑️ Xóa bảng
                    </button>
                </div>

                {/* Canvas */}
                <canvas
                    onMouseDown={handleMouseDown}
                    onMouseUp={finishDrawing}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={finishDrawing}
                    ref={canvasRef}
                    style={{ cursor: 'crosshair', display: 'block' }}
                />

                <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.7)', padding: '5px 10px', borderRadius: 8, fontSize: 12 }}>
                    {team ? `Đang kết nối: ${team.name}` : 'Đang kết nối...'}
                </div>
            </div>
        </Layout>
    );
}
