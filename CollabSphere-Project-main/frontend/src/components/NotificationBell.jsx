import { useEffect, useRef, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useNotificationsPolling } from "../hooks/useNotificationsPolling";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const { items, unreadCount, markAllRead, markRead } = useNotificationsPolling(4000);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="noti-wrap" ref={wrapRef}>
      <button className="noti-btn" onClick={() => setOpen((v) => !v)} title="Thông báo">
        🔔
        {unreadCount > 0 && <span className="noti-badge">{unreadCount}</span>}
      </button>

      {open && (
        <NotificationDropdown
          items={items}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
