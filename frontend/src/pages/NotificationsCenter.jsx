import React, { useState } from "react";
import  "./NotificationsCenter.css";
;

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "assignment",
      title: "Bài tập mới môn CNPM",
      time: "Vừa xong",
      icon: "📚",
      unread: true,
      desc: "Giảng viên đã giao bài tập \"Phân tích yêu cầu Sprint 1\". Hạn nộp: 25/01/2024."
    },
    {
      id: 2,
      type: "grade",
      title: "Điểm số: Lập trình Web",
      time: "2 giờ trước",
      icon: "✨",
      unread: true,
      desc: "Đã có điểm quá trình môn Lập trình Web. Điểm của bạn: 9.0."
    },
    {
      id: 3,
      type: "team",
      title: "Team CollabSphere cập nhật",
      time: "Hôm qua",
      icon: "👥",
      unread: false,
      desc: "Nguyễn Văn A đã tải lên file thiết kế mới."
    },
    {
      id: 4,
      type: "system",
      title: "Thông báo nghỉ học bù",
      time: "20/01",
      icon: "📢",
      unread: false,
      desc: "Lớp CNPM chiều thứ 6 sẽ nghỉ học."
    },
    {
      id: 5,
      type: "system",
      title: "Bảo trì hệ thống",
      time: "18/01",
      icon: "⚠️",
      unread: false,
      desc: "Hệ thống bảo trì từ 23:00 - 02:00 ngày 22/01."
    }
  ];

  const filteredList =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter(n => n.unread)
      : notifications.filter(n => n.type === filter);

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <h1>Trung tâm thông báo</h1>
          <p className="muted">Cập nhật tin tức môn học và hệ thống</p>
        </div>
        <button className="btn-secondary">
          ✓ Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="filters">
            <button onClick={() => setFilter("all")} className={filter === "all" ? "filter-btn active" : "filter-btn"}>Tất cả</button>
            <button onClick={() => setFilter("unread")} className={filter === "unread" ? "filter-btn active" : "filter-btn"}>Chưa đọc</button>
            <button onClick={() => setFilter("assignment")} className={filter === "assignment" ? "filter-btn active" : "filter-btn"}>Bài tập</button>
            <button onClick={() => setFilter("grade")} className={filter === "grade" ? "filter-btn active" : "filter-btn"}>Điểm số</button>
            <button onClick={() => setFilter("system")} className={filter === "system" ? "filter-btn active" : "filter-btn"}>Hệ thống</button>
          </div>
        </div>

        <div className="notice-list-wrapper">
          {filteredList.map(item => (
            <div key={item.id} className={`notice-item ${item.unread ? "unread" : ""}`}>
              <div className="notice-icon">{item.icon}</div>
              <div className="notice-content">
                <div className="notice-top">
                  <span className="notice-title">{item.title}</span>
                  <span className="notice-time">{item.time}</span>
                </div>
                <p className="notice-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button className="page-btn">←</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">→</button>
        </div>
      </div>
    </main>
  );
}
