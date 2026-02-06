import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function Courses() {
  const [courses, setCourses] = useState([]); // Danh sách các môn học (Subjects)

  useEffect(() => {
    // Lấy thông tin lớp học và toàn bộ danh sách môn học
    Promise.all([
      api.get("/staff/classes/me").catch(err => ({ data: [] })),
      api.get("/staff/subjects").catch(err => ({ data: [] }))
    ]).then(([classRes, subjectRes]) => {
      const allSubjects = subjectRes.data || [];

      // Chuyển đổi dữ liệu Subject sang định dạng hiển thị cho Syllabus
      const mappedSubjects = allSubjects.map(s => ({
        id: s.code,
        name: s.name,
        teacher: "Khoa/Bộ môn",
        credits: 3,
        status: "Đang mở",
        syllabus: {
          overview: s.description || "Chưa có mô tả.",
          outcomes: [], // Dữ liệu giả lập
          weeks: [],
          grading: [],
          materials: []
        }
      }));

      setCourses(mappedSubjects);
    })
      .catch(err => console.error("Failed to fetch data", err));
  }, []);

  const [q, setQ] = useState(""); // Từ khóa tìm kiếm
  const [activeId, setActiveId] = useState(""); // ID môn học đang được xem
  const [tab, setTab] = useState("overview"); // Tab hiện tại: overview | outcomes | weeks | grading | materials

  // Lọc danh sách môn học theo từ khóa tìm kiếm
  const filtered = courses.filter((c) => {
    const s = (c.id + " " + c.name + " " + c.teacher).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  // Môn học đang hiển thị chi tiết (ưu tiên activeId, nếu không lấy môn đầu tiên filtered)
  const active = courses.find((c) => c.id === activeId) || filtered[0];

  return (
    <Layout title="Môn học & Syllabus">
      <div className="grid-2col">
        {/* Cột trái: Danh sách các môn học có thể chọn */}
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
                className={`course-item ${c.id === (active?.id) ? "active" : ""}`}
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

        {/* Cột phải: Hiển thị chi tiết Syllabus cho môn được chọn */}
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

              {/* Các tab chuyển đổi nội dung Syllabus */}
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
                  {active.syllabus.outcomes.length === 0 ? <li>Chưa cập nhật thông tin.</li> : active.syllabus.outcomes.map((x, i) => (
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
                    {active.syllabus.weeks.length === 0 ? <tr><td colSpan="2" style={{ textAlign: 'center' }}>Chưa cập nhật nội dung tuần học.</td></tr> : active.syllabus.weeks.map((w) => (
                      <tr key={w.w}>
                        <td>Tuần {w.w}</td>
                        <td>{w.topic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ... dán nhãn tương tự cho các tab khác ... */}
              {tab === "grading" && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Tỷ lệ (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.syllabus.grading.length === 0 ? <tr><td colSpan="2" style={{ textAlign: 'center' }}>Chưa cập nhật biểu điểm.</td></tr> : active.syllabus.grading.map((g, i) => (
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
                  {active.syllabus.materials.length === 0 ? <li>Chưa có tài liệu đính kèm.</li> : active.syllabus.materials.map((m, i) => (
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
