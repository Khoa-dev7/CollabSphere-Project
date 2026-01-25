import React, { useState } from "react";
import "./GradingPage.css";

export default function GradingPage() {
  const [scores, setScores] = useState({
    sv1: "",
    sv2: ""
  });

  const handleChange = (id, value) => {
    setScores({ ...scores, [id]: value });
  };

  const saveScore = (name, score) => {
    alert(`✅ Đã lưu điểm cho ${name}: ${score}`);
    // Sau này thay bằng API:
    // fetch("/api/grade", { method: "POST", body: JSON.stringify(...) })
  };

  return (
    <main className="main">
      <section className="card">
        <h2>📝 Bảng nhập điểm</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>Điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Trần Văn C</td>
              <td>
                <input
                  type="number"
                  value={scores.sv1}
                  onChange={(e) => handleChange("sv1", e.target.value)}
                  min="0"
                  max="10"
                />
              </td>
              <td>
                <button
                  className="btn"
                  onClick={() => saveScore("Trần Văn C", scores.sv1)}
                >
                  Lưu
                </button>
              </td>
            </tr>

            <tr>
              <td>Nguyễn Thị D</td>
              <td>
                <input
                  type="number"
                  value={scores.sv2}
                  onChange={(e) => handleChange("sv2", e.target.value)}
                  min="0"
                  max="10"
                />
              </td>
              <td>
                <button
                  className="btn"
                  onClick={() => saveScore("Nguyễn Thị D", scores.sv2)}
                >
                  Lưu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
