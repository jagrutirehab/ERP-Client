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
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { medicines } from "../dummydata";
import AddinventoryMedicine from "../AddinventoryMedicine";
import { Button } from "../Components/Button";
import { Select } from "../Components/Select";
import { Card, CardContent } from "../Components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/Table";
import { AnalyticsView } from "../views/AnalyticView";
import { StatusBadge } from "../Components/StatusBadge";
import BulkImportModal from "../Components/BulkImportModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Main Component
const InventoryManagement = () => {
  const [view, setView] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [bulkOpen, setBulkOpen] = useState(false);

  const toggleDropdown = (id) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const demoMedicines = Array.isArray(medicines)
    ? medicines.concat(
        medicines.map((m, idx) => ({ ...m, name: `${m.name} ${idx + 1}` }))
      )
    : medicines;

  const totalItems = demoMedicines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedMedicines = demoMedicines.slice(startIdx, endIdx);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingMedicine(null);
    setModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingMedicine) {
      console.log("Updating medicine:", data);
    } else {
      console.log("Adding new medicine:", data);
    }
    setModalOpen(false);
  };

  const handleBulkImport = (data) => {
    console.log("Mapped Data ready for MongoDB:", data);
    // TODO: send `data` to backend API for MongoDB insert
  };

  return (
    <CardBody className="p-3 bg-white" style={{ width: "78%" }}>
      <div className="content-wrapper">
        <div className="text-center text-md-left mb-4">
          <h1 className="display-4 font-weight-bold text-primary">
            PHARMACY
          </h1>
          {/* <p className="text-muted lead">
            Manage your medicine catalog with ease and efficiency
          </p> */}
        </div>
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <div className="w-100 w-md-auto" style={{ maxWidth: "300px" }}>
            <div className="position-relative w-100">
              <Search
                className="position-absolute"
                style={{
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: "18px",
                  width: "18px",
                  color: "#6c757d",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search medicines..."
                className={`form-control`}
                style={{
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  height: "40px",
                }}
              />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 inventory-actions">
            <Button onClick={handleAdd}>+ Add Medicine</Button>
            <Button
              type="button"
              className="btn btn-outline-primary text-primary"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              onClick={() => setBulkOpen(true)}
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
                            <DropdownItem onClick={() => handleEdit(med)}>
                              Edit
                            </DropdownItem>
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

        <Modal
          isOpen={modalOpen}
          toggle={() => setModalOpen(!modalOpen)}
          size="xl"
          scrollable
          backdrop="static"
        >
          <ModalHeader toggle={() => setModalOpen(false)}>
            {editingMedicine ? "Edit Medicine" : "Add Medicine"}
          </ModalHeader>
          <ModalBody>
            <AddinventoryMedicine
              defaultValues={editingMedicine || {}}
              onSubmit={handleFormSubmit}
            />
          </ModalBody>
        </Modal>
        <BulkImportModal
          isOpen={bulkOpen}
          toggle={() => setBulkOpen(!bulkOpen)}
          onImport={handleBulkImport}
        />
      </div>
    </CardBody>
  );
};

export default InventoryManagement;
