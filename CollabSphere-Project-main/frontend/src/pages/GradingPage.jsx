import { useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function GradingPage() {
  const initial = useMemo(
    () => [
      { id: 1, name: "An", mid: 8, final: 9 },
      { id: 2, name: "Bình", mid: 7, final: 8 },
      { id: 3, name: "Chi", mid: 9, final: 9 },
    ],
    []
  );

  const [rows, setRows] = useState(initial);

  const setCell = (id, key, value) => {
    const num = value === "" ? "" : Number(value);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: num } : r)));
  };

  const calc = (r) => {
    const mid = Number(r.mid ?? 0);
    const fin = Number(r.final ?? 0);
    return Math.round((mid * 0.4 + fin * 0.6) * 10) / 10;
  };

  const onSave = () => {
    // TODO: gọi API lưu điểm
    alert("Đã lưu (mock)!");
  };

  return (
    <Layout title="Grading">
      <div className="card">
        <div className="row-between">
          <h3>Bảng nhập điểm</h3>
          <button className="btn primary" onClick={onSave}>Lưu điểm</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>Giữa kỳ</th>
              <th>Cuối kỳ</th>
              <th>Tổng kết</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  <input
                    className="cell"
                    value={r.mid}
                    onChange={(e) => setCell(r.id, "mid", e.target.value)}
                    inputMode="numeric"
                  />
                </td>
                <td>
                  <input
                    className="cell"
                    value={r.final}
                    onChange={(e) => setCell(r.id, "final", e.target.value)}
                    inputMode="numeric"
                  />
                </td>
                <td><b>{calc(r)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
