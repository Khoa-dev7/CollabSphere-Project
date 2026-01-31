import { useMemo } from "react";
import Layout from "../components/Layout";

export default function Gantt() {
  const tasks = useMemo(
    () => [
      { id: 1, name: "UI", start: "2026-01-01", end: "2026-01-04", progress: 80 },
      { id: 2, name: "Frontend", start: "2026-01-05", end: "2026-01-12", progress: 50 },
      { id: 3, name: "Backend", start: "2026-01-06", end: "2026-01-15", progress: 30 },
    ],
    []
  );

  const daysBetween = (a, b) => {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    return Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalDays = daysBetween("2026-01-01", "2026-01-15");

  return (
    <Layout title="Gantt">
      <div className="card">
        <h3>Gantt Chart (UI)</h3>

        <div className="gantt">
          {tasks.map((t) => {
            const offset = daysBetween("2026-01-01", t.start) - 1;
            const span = daysBetween(t.start, t.end);
            const leftPct = (offset / totalDays) * 100;
            const widthPct = (span / totalDays) * 100;

            return (
              <div key={t.id} className="gantt-row">
                <div className="gantt-name">{t.name}</div>
                <div className="gantt-track">
                  <div
                    className="gantt-bar"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${t.start} → ${t.end}`}
                  >
                    <span className="gantt-progress" style={{ width: `${t.progress}%` }} />
                  </div>
                </div>
                <div className="gantt-meta">{t.progress}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
