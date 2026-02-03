import { useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function Courses() {
  const courses = useMemo(
    () => [
      {
        id: "SE101",
        name: "Nhập môn Công nghệ phần mềm",
        teacher: "GV. Nguyễn Văn A",
        credits: 3,
        status: "Đang học",
        syllabus: {
          overview:
            "Môn học giới thiệu quy trình phát triển phần mềm, mô hình phát triển, yêu cầu, thiết kế và kiểm thử.",
          outcomes: [
            "Hiểu vòng đời phát triển phần mềm (SDLC)",
            "Viết và phân tích yêu cầu cơ bản",
            "Thiết kế module/kiến trúc mức đơn giản",
            "Nắm kiểm thử cơ bản (unit/integration)",
          ],
          weeks: [
            { w: 1, topic: "Giới thiệu môn & SDLC" },
            { w: 2, topic: "Thu thập & phân tích yêu cầu" },
            { w: 3, topic: "Use case / User story" },
            { w: 4, topic: "Thiết kế hệ thống cơ bản" },
            { w: 5, topic: "UI/UX căn bản" },
            { w: 6, topic: "Kiểm thử phần mềm" },
          ],
          grading: [
            { name: "Chuyên cần", weight: 10 },
            { name: "Bài tập", weight: 20 },
            { name: "Giữa kỳ", weight: 30 },
            { name: "Cuối kỳ", weight: 40 },
          ],
          materials: [
            { label: "Slide bài giảng", href: "#" },
            { label: "Tài liệu tham khảo", href: "#" },
          ],
        },
      },
      {
        id: "DB201",
        name: "Cơ sở dữ liệu",
        teacher: "GV. Trần Thị B",
        credits: 3,
        status: "Đang học",
        syllabus: {
          overview:
            "Thiết kế CSDL quan hệ, mô hình ERD, chuẩn hoá, SQL và tối ưu truy vấn cơ bản.",
          outcomes: [
            "Thiết kế ERD",
            "Chuẩn hoá dữ liệu 1NF–3NF",
            "Viết truy vấn SQL",
            "Hiểu index và tối ưu cơ bản",
          ],
          weeks: [
            { w: 1, topic: "Giới thiệu CSDL & mô hình quan hệ" },
            { w: 2, topic: "ERD + mapping" },
            { w: 3, topic: "Chuẩn hoá" },
            { w: 4, topic: "SQL SELECT/JOIN" },
            { w: 5, topic: "SQL GROUP BY/HAVING" },
            { w: 6, topic: "Index & tối ưu cơ bản" },
          ],
          grading: [
            { name: "Bài tập", weight: 25 },
            { name: "Giữa kỳ", weight: 25 },
            { name: "Project", weight: 20 },
            { name: "Cuối kỳ", weight: 30 },
          ],
          materials: [
            { label: "SQL Cheat Sheet", href: "#" },
            { label: "Slide", href: "#" },
          ],
        },
      },
      {
        id: "FE301",
        name: "Lập trình Frontend",
        teacher: "GV. Lê Văn C",
        credits: 2,
        status: "Hoàn thành",
        syllabus: {
          overview:
            "React căn bản, quản lý state, component hóa UI, routing và gọi API.",
          outcomes: [
            "Xây layout + component",
            "Routing + bảo vệ route",
            "Call API + xử lý loading/error",
            "Tối ưu UX cơ bản",
          ],
          weeks: [
            { w: 1, topic: "JSX + Component" },
            { w: 2, topic: "State + Props" },
            { w: 3, topic: "Effect + Fetch API" },
            { w: 4, topic: "React Router" },
            { w: 5, topic: "Form + Validation" },
            { w: 6, topic: "Build & Deploy" },
          ],
          grading: [
            { name: "Lab", weight: 30 },
            { name: "Mini project", weight: 30 },
            { name: "Final project", weight: 40 },
          ],
          materials: [{ label: "React Docs", href: "#" }],
        },
      },
    ],
    []
  );

  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(courses[0]?.id || "");
  const [tab, setTab] = useState("overview"); // overview | outcomes | weeks | grading | materials

  const filtered = courses.filter((c) => {
    const s = (c.id + " " + c.name + " " + c.teacher).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const active = courses.find((c) => c.id === activeId) || filtered[0];

  return (
    <Layout title="Môn học & Syllabus">
      <div className="grid-2col">
        {/* Left: list */}
        <section className="card">
          <div className="row-between">
            <h3>Danh sách môn</h3>
            <input
              className="search"
              placeholder="Tìm môn..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="course-list">
            {filtered.map((c) => (
              <button
                key={c.id}
                className={`course-item ${c.id === activeId ? "active" : ""}`}
                onClick={() => {
                  setActiveId(c.id);
                  setTab("overview");
                }}
              >
                <div className="course-top">
                  <b>{c.id}</b>
                  <span className={`pill ${c.status === "Hoàn thành" ? "ok" : ""}`}>
                    {c.status}
                  </span>
                </div>
                <div className="course-name">{c.name}</div>
                <div className="course-sub">
                  {c.teacher} · {c.credits} tín chỉ
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div style={{ opacity: 0.7, marginTop: 12 }}>Không tìm thấy môn.</div>
            )}
          </div>
        </section>

        {/* Right: syllabus */}
        <section className="card">
          {!active ? (
            <div style={{ opacity: 0.7 }}>Chọn 1 môn để xem syllabus.</div>
          ) : (
            <>
              <div className="row-between">
                <div>
                  <h3 style={{ marginBottom: 6 }}>
                    {active.id} — {active.name}
                  </h3>
                  <div style={{ color: "var(--muted)" }}>
                    {active.teacher} · {active.credits} tín chỉ
                  </div>
                </div>
              </div>

              <div className="syllabus-tabs">
                <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
                  Tổng quan
                </button>
                <button className={`tab ${tab === "outcomes" ? "active" : ""}`} onClick={() => setTab("outcomes")}>
                  Chuẩn đầu ra
                </button>
                <button className={`tab ${tab === "weeks" ? "active" : ""}`} onClick={() => setTab("weeks")}>
                  Tuần học
                </button>
                <button className={`tab ${tab === "grading" ? "active" : ""}`} onClick={() => setTab("grading")}>
                  Đánh giá
                </button>
                <button className={`tab ${tab === "materials" ? "active" : ""}`} onClick={() => setTab("materials")}>
                  Tài liệu
                </button>
              </div>

              {tab === "overview" && (
                <div className="syllabus-box">
                  <p style={{ lineHeight: 1.7 }}>{active.syllabus.overview}</p>
                </div>
              )}

              {tab === "outcomes" && (
                <ul className="syllabus-list">
                  {active.syllabus.outcomes.map((x, i) => (
                    <li key={i}>✅ {x}</li>
                  ))}
                </ul>
              )}

              {tab === "weeks" && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tuần</th>
                      <th>Nội dung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.syllabus.weeks.map((w) => (
                      <tr key={w.w}>
                        <td>Tuần {w.w}</td>
                        <td>{w.topic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "grading" && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Tỷ lệ (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.syllabus.grading.map((g, i) => (
                      <tr key={i}>
                        <td>{g.name}</td>
                        <td>{g.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "materials" && (
                <ul className="syllabus-list">
                  {active.syllabus.materials.map((m, i) => (
                    <li key={i}>
                      📎 <a href={m.href}>{m.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
