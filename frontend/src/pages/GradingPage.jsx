import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function GradingPage() {
  // --- Khai báo các trạng thái (State) của trang ---
  const [classes, setClasses] = useState([]); // Danh sách các lớp học của giảng viên
  const [selectedClass, setSelectedClass] = useState(null); // Lớp học đang được người dùng chọn
  const [teams, setTeams] = useState([]); // Danh sách các nhóm thuộc lớp học đã chọn
  const [selectedTeam, setSelectedTeam] = useState(null); // Nhóm đang được chọn để chấm điểm
  const [criteria, setCriteria] = useState([]); // Danh sách tiêu chí đánh giá (Rubric) cho dự án của nhóm
  const [students, setStudents] = useState([]); // Danh sách sinh viên và điểm số tương ứng
  const [peerScores, setPeerScores] = useState({}); // Dữ liệu tóm tắt đánh giá đồng đẳng: { studentId: { average_score, review_count } }
  const [loading, setLoading] = useState(false); // Trạng thái đang tải dữ liệu từ API
  const [errorMessage, setErrorMessage] = useState(""); // Lưu thông báo lỗi nếu có trục trặc

  // Phân quyền: Kiểm tra xem người dùng hiện tại có quyền chỉnh sửa điểm hay không
  const role = localStorage.getItem("role") || "";
  const r = role.toLowerCase();
  const canEdit = ["lecturer", "admin", "staff", "head_dept"].includes(r);

  // Hook: Lấy danh sách các lớp học khi trang được tải lần đầu
  useEffect(() => {
    api.get("/staff/classes/me")
      .then((res) => {
        setClasses(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error);
  }, []);

  // Hook: Lấy danh sách các nhóm khi người dùng thay đổi lớp học
  useEffect(() => {
    if (selectedClass) {
      api.get(`/projects/teams?class_id=${selectedClass}`)
        .then((res) => {
          // Lọc danh sách nhóm theo class_id đã chọn
          const filtered = Array.isArray(res.data) ? res.data.filter(t => t.class_id === parseInt(selectedClass)) : [];
          setTeams(filtered);
        })
        .catch(console.error);
    } else {
      // Nếu không chọn lớp, xoá danh sách nhóm
      setTeams([]);
      setSelectedTeam(null);
    }
  }, [selectedClass]);

  // Hook: Lấy thông tin chi tiết để chấm điểm khi người dùng chọn một nhóm cụ thể
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true);

      // Gọi đồng thời 2 API: Lấy tiêu chí chấm điểm và Lấy tóm tắt đánh giá đồng đẳng
      const fetchGradingInfo = api.get(`/grading/teams/${selectedTeam}/evaluations`);
      const fetchPeerSummary = api.get(`/eval/team/${selectedTeam}/summary`);

      Promise.all([fetchGradingInfo, fetchPeerSummary])
        .then(([gradingRes, peerRes]) => {
          setCriteria(gradingRes.data.criteria || []);
          setStudents(gradingRes.data.students || []);

          // Chuyển đổi dữ liệu đánh giá đồng đẳng từ mảng sang Object Map để dễ dàng hiển thị theo ID sinh viên
          const peerMap = {};
          if (Array.isArray(peerRes.data)) {
            peerRes.data.forEach(item => {
              peerMap[item.user_id] = {
                average_score: item.average_score,
                review_count: item.review_count
              };
            });
          }
          setPeerScores(peerMap);
        })
        .finally(() => setLoading(false))
        .catch((err) => {
          console.error(err);
          if (err.response && (err.response.status === 400 || err.response.status === 404)) {
            setErrorMessage(err.response.data.detail || "Nhóm này chưa được gán dự án. Vui lòng cập nhật thông tin nhóm trước khi chấm điểm.");
          } else {
            setErrorMessage("Có lỗi xảy ra khi tải dữ liệu.");
          }
        });
    } else {
      // Xoá các dữ liệu cũ nếu không còn nhóm nào được chọn
      setStudents([]);
      setCriteria([]);
      setPeerScores({});
      setErrorMessage("");
    }
  }, [selectedTeam]);

  // Hàm cập nhật giá trị điểm cho một ô nhất định trong bảng chấm điểm (chỉ ở phía giao diện)
  const setCell = (studentId, criteriaId, value) => {
    if (!canEdit) return;
    const num = value === "" ? "" : Number(value);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, scores: { ...s.scores, [criteriaId]: num } }
          : s
      )
    );
  };

  // Hàm cập nhật nội dung phản hồi/góp ý cho một sinh viên
  const setFeedback = (studentId, value) => {
    if (!canEdit) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, feedback: value } : s))
    );
  };

  // Hàm tính toán tổng điểm trung bình dựa trên trọng số (%) của từng tiêu chí
  const calcFinal = (s) => {
    let total = 0;
    criteria.forEach((c) => {
      const score = s.scores[c.id] || 0;
      total += score * (c.weight / 100);
    });
    return Math.round(total * 10) / 10;
  };

  // Hàm xử lý sự kiện khi nhấn nút "Lưu điểm"
  const onSave = () => {
    if (!canEdit) return;
    const evaluations = [];
    // Gom tất cả điểm số của từng sinh viên vào một mảng duy nhất để gửi lên server
    students.forEach((s) => {
      criteria.forEach((c) => {
        if (s.scores[c.id] !== undefined) {
          evaluations.push({
            student_id: s.id,
            criteria_id: c.id,
            score: Number(s.scores[c.id]),
            feedback: s.feedback || ""
          });
        }
      });
    });

    const payload = {
      team_id: Number(selectedTeam),
      evaluations: evaluations
    };

    // Gửi yêu cầu lưu dữ liệu lên backend
    api.post("/grading/evaluations/bulk", payload)
      .then((res) => {
        alert("Đã lưu điểm thành công!");
      })
      .catch((err) => {
        console.error(err);
        alert("Lỗi khi lưu điểm");
      });
  };

  return (
    <Layout title="Grading">
      <div className="card">
        {/* Phần tiêu đề và nút chức năng */}
        <div className="row-between mb-4">
          <h3>Nhập điểm dự án</h3>
          {canEdit && (
            <button className="btn primary" onClick={onSave} disabled={!selectedTeam}>
              Lưu điểm
            </button>
          )}
        </div>

        {/* Phần lọc dữ liệu: Lớp và Nhóm */}
        <div className="flex-row gap-4 mb-4" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Chọn lớp:</label>
            <select
              style={{ padding: '0.4rem', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedClass || ""}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Chọn nhóm:</label>
            <select
              style={{ padding: '0.4rem', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedTeam || ""}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">-- Chọn nhóm --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hiển thị thông tin hoặc lỗi */}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : errorMessage ? (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            ⚠️ {errorMessage}
          </div>
        ) : selectedTeam ? (
          <table className="table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                {criteria.map((c) => (
                  <th key={c.id}>
                    {c.name} ({c.weight}%)
                  </th>
                ))}
                <th>Điểm đồng đẳng</th>
                <th>Góp ý / Nhận xét</th>
                <th>Tổng kết</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  {criteria.map((c) => (
                    <td key={c.id}>
                      <input
                        className="cell"
                        style={{ width: '60px', padding: '4px' }}
                        value={s.scores[c.id] ?? ""}
                        onChange={(e) => setCell(s.id, c.id, e.target.value)}
                        inputMode="numeric"
                        disabled={!canEdit}
                      />
                    </td>
                  ))}
                  {/* Cột hiển thị kết quả Đánh giá đồng đẳng do sinh viên thực hiện */}
                  <td>
                    {peerScores[s.id] ? (
                      <div title={`${peerScores[s.id].review_count} lượt đánh giá`}>
                        <span style={{
                          fontWeight: 'bold',
                          color: peerScores[s.id].average_score >= 8 ? '#059669' :
                            peerScores[s.id].average_score >= 5 ? '#d97706' : '#dc2626'
                        }}>
                          {peerScores[s.id].average_score.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '4px' }}>
                          ({peerScores[s.id].review_count})
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>N/A</span>
                    )}
                  </td>
                  {/* Nhận xét từ phía giảng viên */}
                  <td>
                    <textarea
                      style={{ width: '100%', minHeight: '40px', padding: '4px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                      value={s.feedback || ""}
                      onChange={(e) => setFeedback(s.id, e.target.value)}
                      placeholder="Nhập góp ý cho SV..."
                      disabled={!canEdit}
                    />
                  </td>
                  {/* Điểm tổng kết cuối cùng */}
                  <td>
                    <b>{calcFinal(s)}</b>
                  </td>
                </tr>
              ))}
              {/* Hiển thị dòng thông báo khi nhóm trống */}
              {students.length === 0 && (
                <tr>
                  <td colSpan={criteria.length + 4} style={{ textAlign: 'center' }}>
                    Chưa có sinh viên trong nhóm này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666' }}>Vui lòng chọn lớp và nhóm để nhập điểm.</p>
        )}
      </div>
    </Layout>
  );
}
