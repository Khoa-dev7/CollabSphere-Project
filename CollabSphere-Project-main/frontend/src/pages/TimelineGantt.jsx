import React, { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function TimelineGantt() {
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  const tasks = [
    {
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 5),
      name: "Phân tích yêu cầu",
      id: "Task 1",
      type: "task",
      progress: 100,
      isDisabled: true,
    },
    {
      start: new Date(2026, 0, 6),
      end: new Date(2026, 0, 12),
      name: "Thiết kế UI/UX",
      id: "Task 2",
      type: "task",
      progress: 100,
    },
    {
      start: new Date(2026, 0, 13),
      end: new Date(2026, 0, 20),
      name: "Code Frontend",
      id: "Task 3",
      type: "task",
      progress: 60,
    },
    {
      start: new Date(2026, 0, 21),
      end: new Date(2026, 0, 28),
      name: "Tích hợp & kiểm thử",
      id: "Task 4",
      type: "task",
      progress: 20,
    },
  ];

  return (
    <main className="main">
      <section className="card">
        <h2>📊 Gantt Chart – Timeline dự án</h2>
        <p className="muted">
          Theo dõi tiến độ các giai đoạn trong học kỳ
        </p>

        {/* Toolbar */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setViewMode(ViewMode.Day)}>Ngày</button>
          <button onClick={() => setViewMode(ViewMode.Week)}>Tuần</button>
          <button onClick={() => setViewMode(ViewMode.Month)}>Tháng</button>
        </div>

        {/* Gantt Chart */}
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          listCellWidth="180px"
          columnWidth={viewMode === ViewMode.Month ? 120 : 60}
        />
      </section>
    </main>
  );
}
