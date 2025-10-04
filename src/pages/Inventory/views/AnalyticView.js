import { Bar } from "react-chartjs-2";

export const AnalyticsView = ({ medicines }) => {
  const data = {
    labels: medicines.map((med) => med.name),
    datasets: [
      {
        label: "Stock Levels",
        data: medicines.map((med) => med.stock),
        backgroundColor: "rgba(111, 66, 193, 0.6)", // Purple
        borderColor: "rgba(111, 66, 193, 1)",
        borderWidth: 1,
      },
      {
        label: "Reorder Point",
        data: medicines.map((med) => med.reorder),
        backgroundColor: "rgba(13, 202, 240, 0.6)", // Cyan
        borderColor: "rgba(13, 202, 240, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Inventory Stock Overview",
        font: { size: 18 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="card border-primary rounded-lg shadow-lg bg-white p-4">
      <h2 className="h4 font-weight-bold text-primary mb-4">
        Inventory Analytics
      </h2>
      <div style={{ height: "320px" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
