import { useEffect, useMemo, useState } from "react";

/**
 * TODO sau này:
 * - thay mockFetch bằng fetch API thật: GET /api/notifications
 */
const mockFetch = async () => {
  return [
    { id: 1, title: "Bạn có bài tập mới", desc: "SE101 - Tuần 2", time: "Hôm nay 08:10", read: false },
    { id: 2, title: "Điểm đã được cập nhật", desc: "DB201 - Quiz 1", time: "Hôm qua 21:40", read: true },
    { id: 3, title: "Team có thông báo mới", desc: "Leader vừa đăng", time: "Hôm qua 16:05", read: false },
  ];
};

export function useNotificationsPolling(intervalMs = 5000) {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await mockFetch();
    setItems(data);
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
    // TODO: POST /api/notifications/:id/read
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    // TODO: POST /api/notifications/read-all
  };

  return { items, unreadCount, markRead, markAllRead, reload: load };
}
