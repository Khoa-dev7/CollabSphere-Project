import { List, Card } from "antd";
import { useEffect, useState } from "react";
import { getReports } from "../api/adminApi";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getReports().then(res => setReports(res.data));
  }, []);

  return (
    <>
      <h2>Báo cáo hệ thống</h2>
      <List
        dataSource={reports}
        renderItem={r => (
          <Card style={{ marginBottom: 10 }}>
            <b>{r.sender}</b> – {r.content}
          </Card>
        )}
      />
    </>
  );
}
