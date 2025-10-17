import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "../Components/Table";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [wastageData, setWastageData] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch centers and medicines for filter dropdowns
  // useEffect(() => {
  //   const fetchFilters = async () => {
  //     try {
  //       const [centersRes, medicinesRes] = await Promise.all([
  //         axios.get("/api/centers"),
  //         axios.get("/pharmacy/"),
  //       ]);
  //       setCenters(centersRes.data || []);
  //       setMedicines(medicinesRes.data || []);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchFilters();
  // }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const usageRes = await axios.get("/pharmacy/reports/medicine-usage", {
        params: {
          center: selectedCenter || undefined,
          medicine: selectedMedicine || undefined,
          groupBy: "month",
        },
      });

      const wastageRes = await axios.get("/pharmacy/reports/wastage", {
        params: {
          center: selectedCenter || undefined,
        },
      });

      setUsageData(usageRes.data || []);
      setWastageData(wastageRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCenter, selectedMedicine]);

  // Prepare chart data for usage
  const chartLabels = Array.from(new Set(usageData.map((d) => d.period)));
  const chartDatasets = Array.from(
    usageData.reduce((acc, curr) => {
      if (!acc.has(curr.medicine)) acc.set(curr.medicine, []);
      acc.get(curr.medicine).push(curr.totalQuantity);
      return acc;
    }, new Map())
  ).map(([medicine, data]) => ({
    label: medicine,
    data,
    backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }));

  return (
    <div className="p-4">
      {/* <h1 className="mb-4 text-primary font-bold text-2xl">
        Inventory Dashboard
      </h1> */}

      {/* Filters */}
      {/* <div className="flex gap-3 mb-4">
        <Select
          placeholder="Select Center"
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          options={centers.map((c) => ({ value: c._id, label: c.title }))}
        />
        <Select
          placeholder="Select Medicine"
          value={selectedMedicine}
          onChange={(e) => setSelectedMedicine(e.target.value)}
          options={medicines.map((m) => ({
            value: m._id,
            label: m.medicineName,
          }))}
        />
        <button
          className="btn btn-primary"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div> */}

      {/* Medicine Usage Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Medicine Usage (Monthly)</h2>
        <Bar
          data={{ labels: chartLabels, datasets: chartDatasets }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Medicine Usage Report" },
            },
          }}
        />
      </div>

      {/* Wastage Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Wastage Report</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Center</TableCell>
              <TableCell>Available Stock</TableCell>
              <TableCell>Issued Quantity</TableCell>
              <TableCell>Wastage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wastageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              wastageData.map((w, idx) => (
                <TableRow key={idx}>
                  <TableCell>{w.medicine}</TableCell>
                  <TableCell>{w.center}</TableCell>
                  <TableCell>{w.availableStock}</TableCell>
                  <TableCell>{w.issued}</TableCell>
                  <TableCell>{w.wastage}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryDashboard;
