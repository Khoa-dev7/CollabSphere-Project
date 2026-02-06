import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function StudentGrades() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/grading/student/my-grades")
            .then((res) => setGrades(res.data))
            .catch((err) => console.error("Error fetching grades:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout title="Kết quả học tập">
            <div className="card">
                <h2 className="mb-4">Điểm số dự án</h2>
                {loading ? (
                    <p>Đang tải kết quả...</p>
                ) : grades.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>Bạn chưa có kết quả đánh giá nào.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {grades.map((g, idx) => (
                            <div key={idx} className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">{g.project_name}</h3>
                                        <p className="text-sm text-gray-500">Ngày đánh giá: {g.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-secondary">{g.total_score}</span>
                                        <span className="text-sm text-gray-500 block">Tổng điểm</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 border-b pb-1">Chi tiết tiêu chí</h4>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500">
                                                    <th className="py-2">Tiêu chí</th>
                                                    <th className="py-2">Trọng số</th>
                                                    <th className="py-2 text-right">Điểm</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {g.details.map((d, dIdx) => (
                                                    <tr key={dIdx} className="border-t">
                                                        <td className="py-2">{d.criteria}</td>
                                                        <td className="py-2">{d.weight}%</td>
                                                        <td className="py-2 text-right font-medium">{d.score}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 border-b pb-1">Nhận xét từ giảng viên</h4>
                                        <div className="p-3 bg-white rounded border italic text-gray-700 min-h-[60px]">
                                            {g.feedback || "Không có nhận xét."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
