import RadarChartComponent from "../../components/charts/RadarChart";
import "../../styles/result-view.css";

export default function ResultView() {
  const studentScore = [8, 7, 9, 6, 8];
  const classAverage = [7, 7.5, 7, 6.5, 7.5];

  return (
    <div className="result-container">
      <h1>📊 Project Evaluation Result</h1>

      {/* Tổng quan */}
      <div className="result-summary">
        <div className="summary-card">
          <h3>Final Score</h3>
          <span className="score">8.2 / 10</span>
        </div>

        <div className="summary-card">
          <h3>Status</h3>
          <span className="status success">Passed</span>
        </div>

        <div className="summary-card">
          <h3>Rank</h3>
          <span>Top 20%</span>
        </div>
      </div>

      {/* Radar chart */}
      <div className="chart-section">
        <h2>Performance Comparison</h2>
        <RadarChartComponent
          student={studentScore}
          average={classAverage}
        />
      </div>

      {/* Feedback */}
      <div className="feedback-section">
        <h2>Lecturer Feedback</h2>
        <p>
          You demonstrated strong technical skills and responsibility.
          Improve communication during team discussions to enhance overall
          collaboration.
        </p>
      </div>
    </div>
  );
}
