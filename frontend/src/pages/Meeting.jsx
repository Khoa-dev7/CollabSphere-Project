import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { useSocket } from "../context/SocketContext";
import api from "../api";

export default function Meeting() {
    const [team, setTeam] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const socket = useSocket();

    const servers = {
        iceServers: [
            {
                urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
            },
        ],
    };

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.get("/workspace/teams/me");
                setTeam(res.data);
                if (socket) {
                    socket.emit("join_room", { room: `team_${res.data.id}` });
                }
            } catch (err) {
                console.error("Error fetching team", err);
            }
        };
        fetchTeam();

        return () => {
        };
    }, [socket]);

    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Error getting user media", err);
            return null;
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("signal", async (data) => {
            const { from, signal } = data;

            if (signal.type === "offer") {
                await handleOffer(signal, from);
            } else if (signal.type === "answer") {
                await handleAnswer(signal);
            } else if (signal.type === "candidate") {
                await handleCandidate(signal);
            }
        });

        return () => socket.off("signal");
    }, [socket, localStream]);

    const initPeerConnection = (stream) => {
        const pc = new RTCPeerConnection(servers);
        const currentStream = stream || localStream;

        if (currentStream) {
            currentStream.getTracks().forEach(track => pc.addTrack(track, currentStream));
        }

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && team) {
                socket.emit("signal", {
                    room: `team_${team.id}`,
                    signal: { type: "candidate", candidate: event.candidate }
                });
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    const startCall = async () => {
        let stream = localStream;
        if (!stream) {
            stream = await startMedia();
        }
        if (!stream) return;

        setIsCalling(true);
        const pc = initPeerConnection(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("signal", {
            room: `team_${team.id}`,
            signal: offer
        });
    };

    const handleOffer = async (offer, from) => {
        let stream = localStream;
        if (!stream) {
            stream = await startMedia();
        }
        if (!stream) return;

        const pc = initPeerConnection(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("signal", {
            room: `team_${team.id}`,
            signal: answer
        });
        setIsCalling(true);
    };

    const handleAnswer = async (answer) => {
        if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleCandidate = async (candidate) => {
        if (peerConnection.current) {
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate.candidate));
            } catch (e) {
                console.error("Error adding ice candidate", e);
            }
        }
    };

    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setIsCalling(false);
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !videoOn;
            setVideoOn(!videoOn);
        }
    };

    const toggleScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];

            if (peerConnection.current) {
                const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            videoTrack.onended = () => {
                // Return to camera
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }
                if (peerConnection.current) {
                    const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(localStream.getVideoTracks()[0]);
                    }
                }
            };
        } catch (err) {
            console.error("Error sharing screen", err);
        }
    };

    return (
        <Layout title="Họp trực tuyến">
            <div className="meeting-container" style={{ display: 'grid', gridTemplateRows: '1fr auto', height: 'calc(100vh - 120px)', background: '#0f172a', borderRadius: 16, overflow: 'hidden' }}>

                {/* Video Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: remoteStream ? '1fr 1fr' : '1fr', gap: 20, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', background: '#1e293b', borderRadius: 12, overflow: 'hidden', aspectRation: '16/9', display: 'flex', justifyContent: 'center' }}>
                        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                            Bạn {!micOn && ' (Muted)'}
                        </div>
                    </div>

                    {remoteStream && (
                        <div style={{ position: 'relative', background: '#1e293b', borderRadius: 12, overflow: 'hidden', aspectRation: '16/9', display: 'flex', justifyContent: 'center' }}>
                            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                                Thành viên khác
                            </div>
                        </div>
                    )}

                    {!remoteStream && !isCalling && (
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                            <p>Sẵn sàng bắt đầu cuộc họp?</p>
                            <button onClick={startCall} className="btn primary" style={{ marginTop: 10 }}>Bắt đầu ngay</button>
                        </div>
                    )}

                    {!remoteStream && isCalling && (
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                            <p>Đang đợi thành viên khác tham gia...</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{ background: '#1e293b', padding: '20px 0', display: 'flex', justifyContent: 'center', gap: 20 }}>
                    <button onClick={toggleMic} style={{
                        width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: micOn ? '#334155' : '#ef4444', color: '#fff', fontSize: 20
                    }}>
                        {micOn ? '🎤' : '🔇'}
                    </button>
                    <button onClick={toggleVideo} style={{
                        width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: videoOn ? '#334155' : '#ef4444', color: '#fff', fontSize: 20
                    }}>
                        {videoOn ? '📷' : '🚫'}
                    </button>

                    <button onClick={toggleScreenShare} style={{
                        width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: '#334155', color: '#fff', fontSize: 20
                    }} title="Chia sẻ màn hình">
                        📺
                    </button>

                    {isCalling && (
                        <button onClick={endCall} style={{
                            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                            background: '#ef4444', color: '#fff', fontSize: 20
                        }}>
                            📞
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}
