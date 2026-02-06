import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function GradingPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const role = localStorage.getItem("role") || "";
  const r = role.toLowerCase();
  const canEdit = ["lecturer", "admin", "staff", "head_dept"].includes(r);

  // Fetch classes the user has access to
  useEffect(() => {
    api.get("/staff/classes/me")
      .then((res) => {
        setClasses(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error);
  }, []);

  // Fetch teams when class changes
  useEffect(() => {
    if (selectedClass) {
      api.get(`/projects/teams?class_id=${selectedClass}`)
        .then((res) => {
          const filtered = Array.isArray(res.data) ? res.data.filter(t => t.class_id === parseInt(selectedClass)) : [];
          setTeams(filtered);
        })
        .catch(console.error);
    } else {
      setTeams([]);
      setSelectedTeam(null);
    }
  }, [selectedClass]);

  // Fetch evaluations when team changes
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true);
      api.get(`/grading/teams/${selectedTeam}/evaluations`)
        .then((res) => {
          setCriteria(res.data.criteria || []);
          setStudents(res.data.students || []);
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
      setStudents([]);
      setCriteria([]);
      setErrorMessage("");
    }
  }, [selectedTeam]);

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

  const calcFinal = (s) => {
    let total = 0;
    criteria.forEach((c) => {
      const score = s.scores[c.id] || 0;
      total += score * (c.weight / 100);
    });
    return Math.round(total * 10) / 10;
  };

  const onSave = () => {
    if (!canEdit) return;
    const evaluations = [];
    students.forEach((s) => {
      criteria.forEach((c) => {
        if (s.scores[c.id] !== undefined) {
          evaluations.push({
            student_id: s.id,
            criteria_id: c.id,
            score: Number(s.scores[c.id])
          });
        }
      });
    });

    const payload = {
      team_id: Number(selectedTeam),
      evaluations: evaluations
    };

    api.post("/grading/evaluations/bulk", payload)
      .then((res) => {
        alert("Đã lưu thành công!");
      })
      .catch((err) => {
        console.error(err);
        alert("Lỗi khi lưu điểm");
      });
  };

  return (
    <Layout title="Grading">
      <div className="card">
        <div className="row-between mb-4">
          <h3>Nhập điểm dự án</h3>
          {canEdit && (
            <button className="btn primary" onClick={onSave} disabled={!selectedTeam}>
              Lưu điểm
            </button>
          )}
        </div>

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
                  <td>
                    <b>{calcFinal(s)}</b>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={criteria.length + 2} style={{ textAlign: 'center' }}>
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
