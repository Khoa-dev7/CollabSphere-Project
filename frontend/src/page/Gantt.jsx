const tasks = [
  { name: "📊 Phân tích", time: "01–05/01", progress: 30 },
  { name: "💻 Code UI", time: "06–12/01", progress: 60 },
];

export default function GanttChart() {
  return (
    <main className="main">
      <section className="card">
        <h2>Gantt Chart</h2>

        {tasks.map((t, i) => (
          <div className="card" key={i}>
            <p>
              {t.name} ({t.time})
            </p>
            <div
              style={{
                height: "10px",
                background: "#0b3c6f",
                width: `${t.progress}%`,
              }}
            />
          </div>
        ))}
      </section>
    </main>
  );
}
