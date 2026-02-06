import { Checkbox, Input, Button, List, message, Popconfirm } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../../../../../api";

export default function TaskChecklist({ taskId }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/checklist`);
      setItems(res.data);
    } catch (err) {
      console.error("Fetch checklist failed", err);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchItems();
    }
  }, [taskId]);

  const addItem = async () => {
    if (!text) return;
    setLoading(true);
    try {
      await api.post(`/tasks/${taskId}/checklist`, { content: text });
      setText("");
      fetchItems();
    } catch (err) {
      message.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (item) => {
    // Optimistic update
    const newItems = items.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i);
    setItems(newItems);

    try {
      await api.put(`/checklist/${item.id}`, { is_done: !item.is_done });
    } catch (err) {
      message.error("Update failed");
      fetchItems(); // revert
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/checklist/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      message.error("Delete failed");
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add an item"
            onPressEnter={addItem}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={addItem} loading={loading}>Add</Button>
        </div>
      </div>

      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm title="Delete?" onConfirm={() => deleteItem(item.id)}>
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            ]}
          >
            <Checkbox
              checked={item.is_done}
              onChange={() => toggle(item)}
              style={{ textDecoration: item.is_done ? 'line-through' : 'none' }}
            >
              {item.content}
            </Checkbox>
          </List.Item>
        )}
      />
    </>
  );
}
