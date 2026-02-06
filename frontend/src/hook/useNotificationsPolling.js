import { useEffect, useMemo, useState } from "react";

/**
 * TODO sau này:
 * - thay mockFetch bằng fetch API thật: GET /api/notifications
 */
import api from "../api";

export function useNotificationsPolling(intervalMs = 10000) {
  const [items, setItems] = useState([]);

  const load = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get("/notifications/?limit=10");
      // Backend returns list of Notification objects with fields: id, content, type, is_read, created_at, related_link
      // Frontend expects { id, title, desc, time, read }
      const typeToTitle = {
        'success': '✅ Thành công',
        'warning': '⚠️ Cảnh báo',
        'info': 'ℹ️ Thông tin',
        'error': '❌ Lỗi'
      };

      const mapped = res.data.map(n => ({
        id: n.id,
        title: typeToTitle[n.type] || 'Thông báo',
        desc: n.content,
        time: new Date(n.created_at).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        read: n.is_read,
        link: n.related_link
      }));
      setItems(mapped);
    } catch (err) {
      console.error("Poll notifications failed", err);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, intervalMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(() => items.filter((x) => !x.read).length, [items]);

  const markRead = (id) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    api.put(`/notifications/${id}/read`).catch(console.error);
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    api.put(`/notifications/read-all`).catch(console.error);
  };

  return { items, unreadCount, markRead, markAllRead, reload: load };
}
