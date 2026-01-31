import { useMemo, useState } from "react";

export default function KanbanBoard() {
  // Mock data (sau nối API)
  const initial = useMemo(
    () => ({
      todo: [
        { id: "t1", title: "PHAN-49 UI Courses + Syllabus", desc: "Hoàn thiện page + filter" },
        { id: "t2", title: "PHAN-78 Notification dropdown", desc: "Polling 4s" },
      ],
      doing: [
        { id: "t3", title: "PHAN-39 Dashboard UI", desc: "Stats + timeline + notice" },
      ],
      review: [
        { id: "t4", title: "Fix responsive chart", desc: "Wrap + overflow-x" },
      ],
      done: [{ id: "t5", title: "Sidebar routing", desc: "NavLink active" }],
    }),
    []
  );

  const [cols, setCols] = useState(initial);

  const columns = [
    { key: "todo", title: "To do" },
    { key: "doing", title: "Doing" },
    { key: "review", title: "Review" },
    { key: "done", title: "Done" },
  ];

  return (
    <div className="card">
      <div className="row-between">
        <h3>Kanban</h3>
        <span style={{ opacity: 0.7, fontSize: 13 }}>
          Mobile: kéo ngang để xem cột
        </span>
      </div>

      {/* ✅ wrapper để mobile scroll ngang */}
      <div className="kanban-wrap">
        <div className="kanban">
          {columns.map((c) => (
            <div className="kanban-col" key={c.key}>
              <div className="kanban-col-head">
                <div className="kanban-col-title">{c.title}</div>
                <span className="kanban-count">{cols[c.key].length}</span>
              </div>

              <div className="kanban-col-body">
                {cols[c.key].map((t) => (
                  <div className="kanban-card" key={t.id}>
                    <div className="kanban-card-title">{t.title}</div>
                    <div className="kanban-card-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
