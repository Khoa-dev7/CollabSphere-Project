import { useState } from "react";

export default function CourseList() {
  const [open, setOpen] = useState(false);

  return (
    <main className="main">
      <section className="card">
        <h2>Danh sách môn học</h2>

        <div className="card">
          <h3>Công nghệ phần mềm</h3>
          <p>3 tín chỉ</p>

          <button
            className="btn"
            onClick={() => setOpen(!open)}
          >
            {open ? "Ẩn syllabus" : "Xem syllabus"}
          </button>

          {open && (
            <div className="syllabus">
              <ul>
                <li>Tuần 1: Giới thiệu</li>
                <li>Tuần 2: PBL</li>
                <li>Tuần 3: Phân tích yêu cầu</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
