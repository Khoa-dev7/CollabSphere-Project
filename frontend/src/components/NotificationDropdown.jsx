export default function NotificationDropdown({ items, onMarkAllRead, onMarkRead, onClose }) {
  return (
    <div className="noti-dropdown">
      <div className="noti-head">
        <b>Thông báo</b>
        <div className="noti-actions">
          <button className="link-btn" onClick={onMarkAllRead}>
            Đánh dấu đã đọc
          </button>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="noti-empty">Không có thông báo</div>
      ) : (
        <ul className="noti-list">
          {items.map((n) => (
            <li
              key={n.id}
              className={`noti-item ${n.read ? "read" : "unread"}`}
              onClick={() => onMarkRead(n.id)}
            >
              <div className="noti-title">{n.title}</div>
              {n.desc && <div className="noti-desc">{n.desc}</div>}
              <div className="noti-time">{n.time}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
