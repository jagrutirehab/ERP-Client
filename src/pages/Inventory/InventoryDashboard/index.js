import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { RefreshCcw, Bell } from "lucide-react";
import { CardBody } from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

const SelectComponent = ({ placeholder, value, onChange, options }) => {
  const selectStyle = {
    width: "100%",
    padding: "0.75rem 2.5rem 0.75rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    transition: "all 150ms",
    appearance: "none",
    backgroundColor: "white",
    color: "#374151",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    outline: "none",
  };

  const containerStyle = {
    position: "relative",
    width: "100%",
    minWidth: "16rem",
  };

  const iconContainerStyle = {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    paddingRight: "0.5rem",
    pointerEvents: "none",
    color: "#4b5563",
  };

  return (
    <div style={containerStyle}>
      <select value={value} onChange={onChange} style={selectStyle}>
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div style={iconContainerStyle}>
        <svg
          style={{ fill: "currentColor", height: "1rem", width: "1rem" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

// Table components (keep your styling)
const Table = ({ children }) => (
  <div
    style={{
      overflowX: "auto",
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
      border: "1px solid #e5e7eb",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        borderSpacing: 0,
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {children}
    </table>
  </div>
);
const TableHead = ({ children }) => (
  <thead style={{ backgroundColor: "#f3f4f6" }}>{children}</thead>
);
const TableBody = ({ children }) => (
  <tbody style={{ borderTop: "1px solid #e5e7eb" }}>{children}</tbody>
);
const TableRow = ({ children, isHeader = false, ...props }) => {
  const rowStyle = {
    transition: "all 150ms",
    color: isHeader ? "#4b5563" : "inherit",
    backgroundColor: "white",
  };
  return (
    <tr style={rowStyle} {...props}>
      {children}
    </tr>
  );
};
const TableCell = ({ children, style = {}, colSpan }) => (
  <td
    style={{
      padding: "0.75rem 1.5rem",
      whiteSpace: "nowrap",
      fontSize: "0.875rem",
      color: "#1f2937",
      ...style,
    }}
    colSpan={colSpan}
  >
    {children}
  </td>
);

const App = () => {
  const user = useSelector((state) => state.User);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [usageData, setUsageData] = useState([]);
  const [wastageData, setWastageData] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const abortRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchMedicines = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = { search: debouncedSearch || undefined };
      if (selectedCenter) params.center = selectedCenter;
      else if (user?.centerAccess) params.centers = user.centerAccess;

      const response = await axios.get("/pharmacy/", {
        params,
        signal: controller.signal,
      });
      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const cancelled =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";
      if (!cancelled) toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) fetchMedicines();
  }, [debouncedSearch, selectedCenter]);

  const handleSelectMedicine = (med) => {
    if (!selectedMedicines.some((m) => m._id === med._id)) {
      const centerStock =
        med.centers?.find((c) => c.centerId?._id === selectedCenter)?.stock ??
        0;
      setSelectedMedicines((prev) => [
        ...prev,
        { ...med, quantity: 1, availableStock: centerStock },
      ]);
    }
    setSearchQuery("");
    setMedicines([]);
  };

  const removeMedicine = (_id) =>
    setSelectedMedicines((prev) => prev.filter((m) => m._id !== _id));

  const fetchReports = async () => {
    setLoading(true);
    try {
      const medicineIds = selectedMedicines.map((m) => m._id);
      const usageRes = await axios.get("/pharmacy/reports/medicine-usage", {
        params: {
          center: selectedCenter || undefined,
          medicine: medicineIds.length ? medicineIds : undefined,
          from: dateRange.from || undefined,
          to: dateRange.to || undefined,
          groupBy: "month",
        },
      });

      const wastageRes = await axios.get("/pharmacy/reports/wastage", {
        params: {
          center: selectedCenter || undefined,
          medicine: medicineIds.length ? medicineIds : undefined,
          from: dateRange.from || undefined,
          to: dateRange.to || undefined,
          groupBy: "month",
        },
      });

      setUsageData(usageRes.data || []);
      setWastageData(wastageRes.data || []);
      toast.success("Dashboard data refreshed successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCenter, selectedMedicines, dateRange]);

  const { chartLabels, chartDatasets, chartOptions } = useMemo(() => {
    const labels = Array.from(new Set(usageData.map((d) => d.period))).sort();
    const groupedData = usageData.reduce((acc, curr) => {
      if (!acc.has(curr.medicine)) acc.set(curr.medicine, {});
      acc.get(curr.medicine)[curr.period] = curr.totalQuantity;
      return acc;
    }, new Map());

    const datasets = Array.from(groupedData).map(([medicine, dataMap]) => ({
      label: medicine,
      data: labels.map((label) => dataMap[label] || 0),
      backgroundColor:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0"),
      borderRadius: 6,
    }));

    return {
      chartLabels: labels,
      chartDatasets: datasets,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Monthly Medicine Usage by Quantity",
            font: { size: 16 },
          },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Total Quantity" },
          },
          x: { stacked: true },
        },
      },
    };
  }, [usageData]);

  return (
    <CardBody className="p-3 bg-white" style={{ width: "78%" }}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: window.innerWidth > 768 ? "2.5rem" : "1.5rem",
          maxWidth: "80rem",
          margin: "0 auto",
          maxHeight: "95vh",
          overflow: "scroll",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              color: "#0d9488",
              letterSpacing: "-0.025em",
            }}
          >
            Pharmacy Dashboard
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#0d9488",
            }}
          >
            <Bell
              style={{
                width: "1.25rem",
                height: "1.25rem",
                marginRight: "0.25rem",
              }}
            />{" "}
            Live Data View
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            gap: "1rem",
            marginBottom: "2rem",
            padding: "1rem",
            backgroundColor: "#f0fdfa",
            borderRadius: "0.75rem",
            boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Center Filter */}
          <SelectComponent
            placeholder="Filter by Center"
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            options={[
              { value: "all", label: "All Centers" },
              ...(user?.userCenters?.map((center) => ({
                value: center?._id ?? center?.id ?? "",
                label: center?.title ?? center?.name ?? "Unknown",
              })) || []),
            ]}
          />

          {/* Date Filter */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* Medicine multi-select */}
          <div style={{ position: "relative", minWidth: "500px", flexGrow: 1 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
                width: "100%",
                minHeight: "44px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
              onClick={() =>
                document.getElementById("medicineSearchInput").focus()
              }
            >
              {selectedMedicines.map((med) => (
                <div
                  key={med._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#e0f2fe",
                    borderRadius: "9999px",
                    padding: "4px 10px",
                    fontSize: "0.85rem",
                    color: "#0369a1",
                    fontWeight: 500,
                  }}
                >
                  {med.medicineName}
                  <span
                    style={{
                      marginLeft: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "#0284c7",
                    }}
                    onClick={() => removeMedicine(med._id)}
                  >
                    ×
                  </span>
                </div>
              ))}
              <input
                id="medicineSearchInput"
                type="text"
                placeholder={
                  selectedMedicines.length === 0 ? "Search medicines..." : ""
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flexGrow: 1,
                  minWidth: "150px",
                  border: "none",
                  outline: "none",
                  fontSize: "0.9rem",
                  padding: "6px",
                }}
              />
            </div>

            {searchQuery && medicines.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  marginTop: "0.25rem",
                  maxHeight: "220px",
                  overflowY: "auto",
                  listStyle: "none",
                  zIndex: 9999,
                  padding: 0,
                }}
              >
                {medicines.map((med) => (
                  <li
                    key={med._id}
                    onClick={() => handleSelectMedicine(med)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {med.medicineName} ({med.Strength}
                    {med.unitType})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: loading ? "#9ca3af" : "#0d9488",
              color: "white",
              fontWeight: "600",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
            }}
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? (
              "Loading..."
            ) : (
              <RefreshCcw
                style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
              />
            )}
          </button>
        </div>

        {/* Chart */}
        <div
          style={{
            marginBottom: "2.5rem",
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f3f4f6",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "#374151",
            }}
          >
            Medicine Usage Analysis (Monthly)
          </h2>
          <div style={{ height: "24rem" }}>
            {usageData.length > 0 ? (
              <Pie
                data={{ labels: chartLabels, datasets: chartDatasets }}
                options={chartOptions}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#6b7280",
                }}
              >
                {loading ? "Loading usage data..." : "No usage data available."}
              </div>
            )}
          </div>
        </div>

        {/* Wastage Table */}
        <div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "#374151",
            }}
          >
            Wastage Report
          </h2>
          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableCell>Medicine</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Available Stock</TableCell>
                <TableCell>Issued Quantity</TableCell>
                <TableCell style={{ fontWeight: "700", color: "#dc2626" }}>
                  Wastage Units
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wastageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#6b7280",
                    }}
                  >
                    No wastage data
                  </TableCell>
                </TableRow>
              ) : (
                wastageData.map((w, i) => (
                  <TableRow key={i}>
                    <TableCell>{w.medicine}</TableCell>
                    <TableCell>{w.center}</TableCell>
                    <TableCell>{w.availableStock}</TableCell>
                    <TableCell>{w.issued}</TableCell>
                    <TableCell style={{ fontWeight: "600", color: "#dc2626" }}>
                      {w.wastage}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CardBody>
  );
};

export default App;
