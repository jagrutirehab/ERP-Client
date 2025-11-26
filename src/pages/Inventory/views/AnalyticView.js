import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsView = ({ medicines }) => {
  const data = {
    labels: medicines.map((med) => med.medicineName),
    datasets: [
      {
        label: "Stock Levels",
        data: medicines.map((med) => med.stock),
        backgroundColor: "rgba(111, 66, 193, 0.6)", // Purple
        borderColor: "rgba(111, 66, 193, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Reorder Point",
        data: medicines.map((med) => med.costprice),
        backgroundColor: "rgba(13, 202, 240, 0.6)", // Cyan
        borderColor: "rgba(13, 202, 240, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ensures full responsiveness
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Inventory Stock Overview",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "16px",
        "@media (min-width: 640px)": {
          padding: "24px",
        },
        "@media (min-width: 1024px)": {
          padding: "32px",
        },
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb",
          padding: "16px",
          "@media (min-width: 640px)": {
            padding: "24px",
          },
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#6b46c1",
            marginBottom: "16px",
            "@media (min-width: 640px)": {
              fontSize: "20px",
            },
          }}
        >
          Inventory Analytics
        </h2>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "380px",
            "@media (min-width: 640px)": {
              height: "460px",
            },
            "@media (min-width: 768px)": {
              height: "520px",
            },
            "@media (min-width: 1024px)": {
              height: "580px",
            },
          }}
        >
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};
