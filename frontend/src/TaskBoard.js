import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Kết nối tới Socket Server (Backend)
const socket = io('http://localhost:8000', {
    transports: ['websocket'],
});

export default function TaskBoard() {
    const [roomId, setRoomId] = useState("Team1");
    // Giả lập danh sách Task ban đầu
    const [tasks, setTasks] = useState([
        { id: 1, name: "Thiết kế Database", status: "Todo" },
        { id: 2, name: "Code Frontend", status: "Doing" },
        { id: 3, name: "Viết báo cáo", status: "Todo" },
    ]);

    useEffect(() => {
        // 1. Gia nhập phòng ngay khi vào trang
        socket.emit('join_room', { room: roomId });

        // 2. Lắng nghe sự kiện từ Server: "Có ai đó vừa sửa Task!"
        socket.on('TASK_UPDATED', (data) => {
            console.log("Nhận được update:", data);
            
            // Cập nhật lại giao diện ngay lập tức
            setTasks(prevTasks => prevTasks.map(task => 
                task.id === data.task_id ? { ...task, status: data.status } : task
            ));
        });

        // Dọn dẹp khi thoát trang
        return () => {
            socket.off('TASK_UPDATED');
        };
    }, [roomId]);

    // Hàm gọi API báo cho Server biết mình vừa sửa Task
    const moveTask = async (id, newStatus) => {
        // Gọi API Backend
        await fetch('http://localhost:8000/update-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task_id: id, 
                status: newStatus, 
                room_id: roomId 
            })
        });
    };

    const cardStyle = {
        border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const colStyle = {
        flex: 1, padding: '10px', background: '#f4f5f7', borderRadius: '10px', minHeight: '300px'
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Bảng Công Việc Realtime (Phòng: {roomId})</h2>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                
                {/* Cột TODO */}
                <div style={colStyle}>
                    <h3 style={{ color: '#e74c3c' }}>TODO 📌</h3>
                    {tasks.filter(t => t.status === 'Todo').map(t => (
                        <div key={t.id} style={cardStyle}>
                            <b>{t.name}</b>
                            <br/><br/>
                            <button onClick={() => moveTask(t.id, 'Doing')} style={{cursor:'pointer'}}>➡️ Doing</button>
                        </div>
                    ))}
                </div>

                {/* Cột DOING */}
                <div style={colStyle}>
                    <h3 style={{ color: '#f39c12' }}>DOING 🔨</h3>
                    {tasks.filter(t => t.status === 'Doing').map(t => (
                        <div key={t.id} style={cardStyle}>
                            <b>{t.name}</b>
                            <br/><br/>
                            <button onClick={() => moveTask(t.id, 'Done')} style={{cursor:'pointer'}}>➡️ Done</button>
                        </div>
                    ))}
                </div>

                {/* Cột DONE */}
                <div style={colStyle}>
                    <h3 style={{ color: '#27ae60' }}>DONE ✅</h3>
                    {tasks.filter(t => t.status === 'Done').map(t => (
                        <div key={t.id} style={cardStyle}>
                            <b>{t.name}</b>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}