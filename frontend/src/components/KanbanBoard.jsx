import { useMemo, useState, useEffect } from "react";
import api from "../api";

export default function KanbanBoard({ teamId }) {
  const [cols, setCols] = useState({
    todo: [],
    doing: [],
    review: [],
    done: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    api.get(`/workspace/teams/${teamId}/tasks`)
      .then(res => {
        const tasks = res.data;
        const newCols = { todo: [], doing: [], review: [], done: [] };
        tasks.forEach(t => {
          const status = (t.status || "todo").toLowerCase().replace(/\s/g, "");
          if (newCols[status]) {
            newCols[status].push({
              id: t.id,
              title: t.title,
              desc: t.description || ""
            });
          } else {
            // Fallback for unknown status
            newCols.todo.push({
              id: t.id,
              title: t.title,
              desc: t.description || ""
            });
          }
        });
        setCols(newCols);
      })
      .catch(err => console.error("Failed to fetch Kanban tasks", err))
      .finally(() => setLoading(false));
  }, [teamId]);

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
                {loading ? (
                  <div style={{ padding: 10, opacity: 0.5 }}>Tải...</div>
                ) : cols[c.key].map((t) => (
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
