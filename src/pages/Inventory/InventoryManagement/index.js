import React, { useState } from "react";
import {
  Search,
  Table as TableIcon,
  LayoutGrid,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardBody,
} from "reactstrap";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Button Component
const Button = ({ children, variant = "default", size = "md", onClick }) => {
  const base =
    "btn font-weight-bold transition-all duration-300 d-flex align-items-center justify-content-center shadow-sm";
  const variants = {
    default: "btn-primary bg-gradient-primary text-white",
    outline: "btn-outline-primary text-primary",
    danger: "btn-danger text-white",
    success: "btn-success text-white",
    ghost: "btn-outline-secondary text-dark", // Added ghost variant for hamburger
  };
  const sizes = {
    md: "btn-md px-4 py-2",
    sm: "btn-sm px-3 py-1",
    icon: "p-2",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
};

// Select Component
const Select = ({ options, placeholder, value, onChange, className }) => (
  <select
    value={value}
    onChange={onChange}
    className={`form-select border-primary rounded-lg px-3 py-2 shadow-sm ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((opt, i) => (
      <option key={i} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

// Card Components
const Card = ({ children }) => (
  <div className="card border-primary rounded-lg shadow-lg bg-gradient-light hover-shadow">
    {children}
  </div>
);
const CardContent = ({ children }) => (
  <div className="card-body p-4">{children}</div>
);

// Table Components
const Table = ({ children, tableStyle }) => (
  <div
    className="table-responsive rounded-lg border border-primary shadow-lg bg-white"
    style={{ overflowX: "auto" }}
  >
    <table className="table table-hover mb-0" style={{ minWidth: "1200px" }}>
      {children}
    </table>
  </div>
);
// Changed thead styling to a more vivid gradient and ensured text is white
const TableHeader = ({ children }) => (
  <thead
    style={{
      background: "linear-gradient(90deg,#6c5ce7,#00b8d8)",
      color: "#fff",
    }}
  >
    {children}
  </thead>
);
const TableRow = ({ children }) => (
  <tr className="border-bottom">{children}</tr>
);
const TableHead = ({ children, noWrap = false }) => (
  <th
    className="p-3 text-left font-weight-bold"
    style={noWrap ? { whiteSpace: "nowrap" } : {}}
  >
    {children}
  </th>
);
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableCell = ({ children, className, noWrap = false }) => (
  <td
    className={`p-3 ${className || ""}`}
    style={noWrap ? { whiteSpace: "nowrap" } : {}}
  >
    {children}
  </td>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const styles =
    status === "LOW"
      ? "badge bg-danger bg-gradient text-white border border-danger"
      : "badge bg-success bg-gradient text-white border border-success";
  return (
    <span className={`px-3 py-1 font-weight-bold rounded-pill ${styles}`}>
      {status}
    </span>
  );
};

// Analytics View with Chart
const AnalyticsView = ({ medicines }) => {
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

// Main Component
const InventoryManagement = () => {
  const [view, setView] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size

  const toggleDropdown = (id) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const medicines = [
    {
      name: "Paracetamol",
      generic: "Acetaminophen",
      category: "Analgesics",
      form: "Tablet",
      strength: "500mg",
      stock: 2500,
      reorder: 500,
      expiry: "Dec 31, 2025",
      batch: "PCM-2024-001",
      supplier: "MedSupply Co",
      status: "NORMAL",
    },
    {
      name: "Amoxicillin",
      generic: "Amoxicillin",
      category: "Antibiotics",
      form: "Capsule",
      strength: "250mg",
      stock: 150,
      reorder: 200,
      expiry: "Aug 15, 2025",
      batch: "AMX-2024-002",
      supplier: "PharmaDist Inc",
      status: "LOW",
    },
    {
      name: "Insulin",
      generic: "Human Insulin",
      category: "Diabetes Medications",
      form: "Injectable",
      strength: "100IU/ml",
      stock: 75,
      reorder: 100,
      expiry: "Jun 30, 2025",
      batch: "INS-2024-003",
      supplier: "SpecialtyCare Ltd",
      status: "LOW",
    },
    {
      name: "Lisinopril",
      generic: "Lisinopril",
      category: "ACE Inhibitors",
      form: "Tablet",
      strength: "10mg",
      stock: 800,
      reorder: 300,
      expiry: "Mar 20, 2026",
      batch: "LIS-2024-004",
      supplier: "MedSupply Co",
      status: "NORMAL",
    },
  ];
  const demoMedicines = Array.isArray(medicines)
    ? medicines.concat(
        medicines.map((m, idx) => ({ ...m, name: `${m.name} ${idx + 1}` }))
      )
    : medicines;

  const totalItems = demoMedicines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // clamp currentPage if pageSize changes
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedMedicines = demoMedicines.slice(startIdx, endIdx);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // reset to first page when page size changes
  };

  return (
    <CardBody className="p-3 bg-white" style={{ width: "78%" }}>
      <div className="content-wrapper">
        {/* Header */}
        <div className="text-center text-md-left mb-4">
          <h1 className="display-4 font-weight-bold text-primary">
            Medicine Inventory
          </h1>
          <p className="text-muted lead">
            Manage your medicine catalog with ease and efficiency
          </p>
        </div>

        {/* Actions */}
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <div className="w-100 w-md-auto" style={{ maxWidth: "300px" }}>
            <div className="position-relative w-100">
              <Search
                className="position-absolute"
                style={{
                  left: "8px", // left end alignment
                  top: "50%", // vertical center
                  transform: "translateY(-50%)",
                  height: "18px",
                  width: "18px",
                  color: "#6c757d",
                  pointerEvents: "none", // icon won't capture clicks
                }}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search medicines..."
                className={`form-control`}
                style={{
                  paddingLeft: "36px", // leave room for the icon
                  paddingRight: "12px",
                  height: "40px",
                }}
              />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 inventory-actions">
            <Button>+ Add Medicine</Button>
            <Button
              type="button"
              className="btn btn-outline-primary text-primary"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              Bulk Actions
            </Button>
            <Button
              type="button"
              className="btn btn-outline-primary text-primary"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Categories"
              options={[
                { value: "analgesics", label: "Analgesics" },
                { value: "antibiotics", label: "Antibiotics" },
              ]}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Stock Levels"
              options={[
                { value: "low", label: "Low Stock" },
                { value: "normal", label: "Normal" },
              ]}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Suppliers"
              options={[
                { value: "medsupply", label: "MedSupply Co" },
                { value: "pharmadist", label: "PharmaDist Inc" },
              ]}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Centers"
              options={[
                { value: "center1", label: "Center 1" },
                { value: "center2", label: "Center 2" },
              ]}
            />
          </div>
        </div>

        {/* View Switch */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {/* Page size selector */}
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 small text-muted">Show</label>
              <select
                className="form-select form-select-sm"
                style={{ width: "88px" }}
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="small text-muted">entries</span>
            </div>
          </div>

          <div className="d-flex">
            <div className="btn-group bg-white shadow-sm rounded-lg p-1">
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("table")}
              >
                <TableIcon className="h-5 w-5" />
              </Button>
              <Button
                variant={view === "cards" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("cards")}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={view === "analytics" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("analytics")}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table View */}
        {view === "table" && (
          <>
            <div
              className="overflow-auto mb-2"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead noWrap>Medicine Name</TableHead>
                    <TableHead noWrap>Generic Name</TableHead>
                    <TableHead noWrap>Category</TableHead>
                    <TableHead noWrap>Dosage Form</TableHead>
                    <TableHead noWrap>Strength</TableHead>
                    <TableHead noWrap>Stock</TableHead>
                    <TableHead noWrap>Reorder Point</TableHead>
                    <TableHead noWrap>Expiry Date</TableHead>
                    <TableHead noWrap>Batch</TableHead>
                    <TableHead noWrap>Supplier</TableHead>
                    <TableHead noWrap>Status</TableHead>
                    <TableHead noWrap>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedMedicines.map((med, i) => (
                    <TableRow key={i}>
                      <TableCell
                        noWrap
                        className="font-weight-bold text-primary"
                      >
                        {med.name}
                      </TableCell>
                      <TableCell noWrap>{med.generic}</TableCell>
                      <TableCell noWrap>{med.category}</TableCell>
                      <TableCell noWrap>{med.form}</TableCell>
                      <TableCell noWrap>{med.strength}</TableCell>
                      <TableCell noWrap>{med.stock}</TableCell>
                      <TableCell noWrap>{med.reorder}</TableCell>
                      <TableCell noWrap>{med.expiry}</TableCell>
                      <TableCell noWrap>{med.batch}</TableCell>
                      <TableCell noWrap>{med.supplier}</TableCell>
                      <TableCell noWrap>
                        <StatusBadge status={med.status} />
                      </TableCell>
                      <TableCell noWrap>
                        <Dropdown
                          isOpen={dropdownOpen[i] || false}
                          toggle={() => toggleDropdown(i)}
                        >
                          <DropdownToggle
                            tag="button"
                            className="btn btn-ghost p-1"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownToggle>
                          <DropdownMenu end>
                            <DropdownItem>Edit</DropdownItem>
                            <DropdownItem>View</DropdownItem>
                            <DropdownItem>Adjust</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                Showing {Math.min(startIdx + 1, totalItems)} to{" "}
                {Math.min(endIdx, totalItems)} of {totalItems} entries
              </div>

              <nav>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                  </li>

                  {pageNumbers.map((num) => (
                    <li
                      key={num}
                      className={`page-item ${
                        num === currentPage ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(num)}
                      >
                        {num}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}

        {/* Cards View */}
        {view === "cards" && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {demoMedicines.map((med, i) => (
              <div className="col" key={i}>
                <Card>
                  <CardContent>
                    <h2 className="h5 font-weight-bold text-primary">
                      {med.name}
                    </h2>
                    <p className="text-muted small">
                      {med.generic} • {med.category}
                    </p>
                    <p className="small">
                      Form: {med.form}, Strength: {med.strength}
                    </p>
                    <p className="small">
                      Stock: {med.stock} (Reorder: {med.reorder})
                    </p>
                    <p className="small">Expiry: {med.expiry}</p>
                    <p className="small">Batch: {med.batch}</p>
                    <p className="small">Supplier: {med.supplier}</p>
                    <StatusBadge status={med.status} />
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Adjust
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Analytics View */}
        {view === "analytics" && <AnalyticsView medicines={demoMedicines} />}
      </div>
    </CardBody>
  );
};

export default InventoryManagement;
