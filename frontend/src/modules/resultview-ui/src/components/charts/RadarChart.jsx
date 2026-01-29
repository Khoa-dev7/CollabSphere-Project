import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarChartComponent({ student, average }) {
  const data = {
    labels: [
      "Contribution",
      "Teamwork",
      "Technical Skill",
      "Communication",
      "Responsibility",
    ],
    datasets: [
      {
        label: "You",
        data: student,
        backgroundColor: "rgba(37,99,235,0.2)",
        borderColor: "#2563eb",
        borderWidth: 2,
      },
      {
        label: "Class Average",
        data: average,
        backgroundColor: "rgba(16,185,129,0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return <Radar data={data} options={options} />;
}
