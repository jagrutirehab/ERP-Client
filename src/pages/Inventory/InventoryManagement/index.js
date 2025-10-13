import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Table as TableIcon,
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
import AddinventoryMedicine from "../AddinventoryMedicine";
import { Button } from "../Components/Button";
import { Select } from "../Components/Select";
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
import { toast } from "react-toastify";
import axios from "axios";
import Barcode from "react-barcode";
import { useDispatch, useSelector } from "react-redux";
import { fetchCenters } from "../../../store/actions";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";
import { saveAs } from "file-saver";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  // console.log(user);

  const [view, setView] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [qfilter, setQfilter] = useState("");

  // Center filter state (single select)
  const [selectedCenter, setSelectedCenter] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [printloading, setPrintLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const abortRef = useRef(null);

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = () => {
    setEditingMedicine(null);
    setModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingMedicine && editingMedicine._id) {
        const res = await axios.patch(
          `/pharmacy/${editingMedicine._id}`,
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success(res?.message || "Medicine updated successfully");
      } else {
        const res = await axios.post("/pharmacy/", data, {
          headers: { "Content-Type": "application/json" },
        });
        toast.success(res?.message || "Medicine added successfully");
      }

      // Close modal and refresh list (keep current filters)
      setModalOpen(false);
      fetchMedicines({
        page: currentPage,
        limit: pageSize,
        q: debouncedSearch,
        fillter: qfilter,
        center: selectedCenter || undefined,
        centers: user?.centerAccess,
      });
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save medicine. Please try again.");
      }
    }
  };

  const handleBulkImport = async (mappedData) => {
    fetchMedicines({
      page: 1,
      limit: pageSize,
      q: debouncedSearch,
      fillter: qfilter,
      center: selectedCenter || undefined,
      centers: user?.centerAccess,
    });
    setCurrentPage(1);
    setBulkOpen(false);
    toast.success(`Imported rows successfully.`);
  };

  const getPageRange = (total, current, maxButtons = 7) => {
    if (total <= maxButtons)
      return Array.from({ length: total }, (_, i) => i + 1);

    const sideButtons = Math.floor((maxButtons - 3) / 2);
    let start = Math.max(2, current - sideButtons);
    let end = Math.min(total - 1, current + sideButtons);
    if (current - 1 <= sideButtons) {
      start = 2;
      end = Math.min(total - 1, maxButtons - 2);
    }
    if (total - current <= sideButtons) {
      end = total - 1;
      start = Math.max(2, total - (maxButtons - 3));
    }

    const range = [1];
    if (start > 2) range.push("...");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < total - 1) range.push("...");
    range.push(total);
    return range;
  };

  // Fetch medicines — now includes center param when provided and correctly reads response.data
  async function fetchMedicines({
    page = 1,
    limit = 5,
    q = "",
    fillter = "",
    center,
    centers,
  } = {}) {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: q || undefined,
        fillter: fillter || undefined,
      };

      // Only send `center` if it has a value
      if (center) {
        params.center = center;
      } else if (user?.centerAccess) {
        // Only send `centers` if `center` is not provided
        params.centers = user.centerAccess;
      }
      const response = await axios.get("/pharmacy/", {
        params,
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });

      // axios puts the server body in response.data
      const body = response || {};

      // backend returns { success, total, page, pages, data }
      setMedicines(Array.isArray(body.data) ? body.data : []);
      setTotalItems(Number(body.total ?? 0));
      setTotalPages(Number(body.pages ?? 1));
      setCurrentPage(Number(body.page ?? page));
    } catch (err) {
      // axios cancellation error name/code varies across versions/environments
      const cancelled =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";
      if (!cancelled) {
        console.error(err);
        toast.error("Failed to fetch medicines");
      }
    } finally {
      setLoading(false);
    }
  }

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // fetch when page, size, search, filter or selectedCenter change
  useEffect(() => {
    fetchMedicines({
      page: currentPage,
      limit: pageSize,
      q: debouncedSearch,
      fillter: qfilter,
      center: selectedCenter || undefined,
      centers: user?.centerAccess,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    qfilter,
    selectedCenter,
    user?.centerAccess,
  ]);

  const goToPage = (page) => {
    if (page === "..." || page === currentPage) return;
    const target = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(target);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const display = (v) => (v === undefined || v === null || v === "" ? "-" : v);

  useEffect(() => {
    dispatch(fetchCenters({ centerIds: user?.centerAccess }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user?.centerAccess]);

  return (
    <CardBody className="p-3 bg-white" style={{ width: "78%" }}>
      <div className="content-wrapper">
        <div className="text-center text-md-left mb-4">
          <h1 className="display-4 font-weight-bold text-primary">PHARMACY</h1>
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset page on new search
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
              disabled={printloading}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              onClick={async () => {
                try {
                  setPrintLoading(true);

                  const params = {
                    search: debouncedSearch || undefined,
                    fillter: qfilter || undefined,
                  };

                  // Conditionally add only one of them
                  if (selectedCenter) {
                    params.center = selectedCenter;
                  } else {
                    params.centers = user?.centerAccess;
                  }

                  // 1️⃣ Fetch all medicine data
                  const response = await axios.get("/pharmacy/print", {
                    params,
                    headers: { "Content-Type": "application/json" },
                  });

                  const data = Array.isArray(response?.data)
                    ? response.data
                    : [];

                  if (data.length === 0) {
                    toast.info("No data to export");
                    return;
                  }

                  // 2️⃣ Create Excel workbook
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet("Pharmacy Inventory");

                  // 3️⃣ Define header row (same as your table)
                  const headers = [
                    "Barcode",
                    "Code",
                    "Medicine Name",
                    "Strength",
                    "Centre",
                    "Unit",
                    "Stock",
                    "Cost Price",
                    "Value",
                    "MRP",
                    "Purchase Price",
                    "Sales Price",
                    "Expiry Date",
                    "Batch",
                    "Company",
                    "Manufacturer",
                    "Rack",
                    "Status",
                  ];
                  sheet.addRow(headers);

                  // Style header
                  sheet.getRow(1).font = {
                    bold: true,
                    color: { argb: "FFFFFFFF" },
                  };
                  sheet.getRow(1).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF007ACC" },
                  };

                  // 4️⃣ Add each medicine row
                  for (let i = 0; i < data.length; i++) {
                    const med = data[i];

                    // generate barcode image for each code
                    let barcodeDataURL = null;
                    if (med?.code) {
                      const canvas = document.createElement("canvas");
                      JsBarcode(canvas, med.code, {
                        format: "CODE128",
                        height: 40,
                        displayValue: true,
                        fontSize: 12,
                      });
                      barcodeDataURL = canvas.toDataURL("image/png");
                    }

                    const rowValues = [
                      "", // placeholder for barcode image
                      med?.code || "-",
                      med?.medicineName || "-",
                      med?.Strength || "-",
                      med?.centers
                        ? med.centers.map((c) => c?.centerId?.title).join(", ")
                        : "-",
                      med?.unitType || med?.unit || "-",
                      med?.stock ?? "-",
                      med?.costprice ?? "-",
                      med?.value ?? "-",
                      med?.mrp ?? "-",
                      med?.purchasePrice ?? "-",
                      med?.SalesPrice ?? "-",
                      med?.Expiry ?? "-",
                      med?.Batch ?? "-",
                      med?.company ?? "-",
                      med?.manufacturer ?? "-",
                      med?.RackNum ?? "-",
                      med?.Status ?? "-",
                    ];

                    sheet.addRow(rowValues);

                    // add barcode image
                    if (barcodeDataURL) {
                      const img = workbook.addImage({
                        base64: barcodeDataURL,
                        extension: "png",
                      });

                      // position: barcode in first column of this row
                      sheet.addImage(img, {
                        tl: { col: 0, row: i + 1 },
                        ext: { width: 150, height: 40 },
                      });
                    }
                  }

                  // 5️⃣ Auto-size columns
                  sheet.columns.forEach((col) => {
                    let maxLength = 15;
                    col.eachCell({ includeEmpty: true }, (cell) => {
                      const len = cell.value ? cell.value.toString().length : 0;
                      if (len > maxLength) maxLength = len;
                    });
                    col.width = maxLength + 2;
                  });

                  // 6️⃣ Download Excel
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  });
                  saveAs(
                    blob,
                    `Pharmacy_Export_${new Date()
                      .toISOString()
                      .slice(0, 10)}.xlsx`
                  );

                  toast.success(
                    `Exported ${data.length} medicines with barcodes ✅`
                  );
                } catch (err) {
                  console.error("Excel export error:", err);
                  toast.error("Failed to export Excel file");
                } finally {
                  setPrintLoading(false);
                }
              }}
            >
              Export (Excel)
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Stock Levels"
              onChange={(e) => {
                setQfilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "LOW", label: "Low Stock" },
                { value: "NORMAL", label: "Normal" },
                { value: "MODRATE", label: "Moderate" },
                { value: "OUTOFSTOCK", label: "Out Of Stock" },
              ]}
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <Select
              placeholder="All Centers"
              value={selectedCenter}
              onChange={(e) => {
                setSelectedCenter(e.target.value);
                setCurrentPage(1);
              }}
              options={
                user?.userCenters?.map((center) => ({
                  // ensure we use the DB _id (not .id)
                  value: center?._id ?? center?.id ?? "",
                  label: center?.title ?? center?.name ?? "Unknown",
                })) || []
              }
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
              style={{ WebkitOverflowScrolling: "touch", maxHeight: "55vh" }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead noWrap>Bar Code</TableHead>
                    <TableHead noWrap>Code</TableHead>
                    <TableHead noWrap>Medicine Name</TableHead>
                    <TableHead noWrap>Strength</TableHead>
                    <TableHead noWrap>Centre</TableHead>
                    <TableHead noWrap>Unit</TableHead>
                    <TableHead noWrap>Current Stock</TableHead>
                    <TableHead noWrap>Cost Price</TableHead>
                    <TableHead noWrap>Value</TableHead>
                    <TableHead noWrap>M.R.P</TableHead>
                    <TableHead noWrap>Purchase Price</TableHead>
                    <TableHead noWrap>Sales Price</TableHead>
                    <TableHead noWrap>Expiry Date</TableHead>
                    <TableHead noWrap>Batch</TableHead>
                    <TableHead noWrap>Company</TableHead>
                    <TableHead noWrap>Manufacturer</TableHead>
                    <TableHead noWrap>Rack Number</TableHead>
                    <TableHead noWrap>Status</TableHead>
                    <TableHead noWrap>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      minHeight: "200px",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: "#666",
                    }}
                  >
                    Loading...
                  </div>
                ) : medicines.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      No records found
                    </div>
                  </div>
                ) : (
                  <TableBody>
                    {medicines.map((med) => (
                      <TableRow key={med._id}>
                        <TableCell noWrap>
                          <div
                            style={{
                              transform: "scale(0.9)",
                              transformOrigin: "left center",
                            }}
                          >
                            {med?.code ? (
                              <Barcode
                                value={med?.code}
                                height={30}
                                fontSize={10}
                                displayValue={true}
                              />
                            ) : (
                              "-"
                            )}
                          </div>
                        </TableCell>
                        <TableCell noWrap>{display(med?.code)}</TableCell>
                        <TableCell
                          noWrap
                          className="font-weight-bold text-primary"
                        >
                          {display(med?.medicineName)}
                        </TableCell>
                        <TableCell noWrap>
                          {display(med?.Strength || med?.Strength)}
                        </TableCell>
                        <TableCell noWrap>
                          {display(
                            med?.centers
                              ? med?.centers
                                  .map((item) => item?.centerId?.title)
                                  .join(", ")
                              : "-"
                          )}
                        </TableCell>
                        <TableCell noWrap>
                          {display(med?.unitType || med?.unit)}
                        </TableCell>
                        <TableCell noWrap>{display(med?.stock)}</TableCell>
                        <TableCell noWrap>{display(med?.costprice)}</TableCell>
                        <TableCell noWrap>{display(med?.value)}</TableCell>
                        <TableCell noWrap>{display(med?.mrp)}</TableCell>
                        <TableCell noWrap>
                          {display(med?.purchasePrice)}
                        </TableCell>
                        <TableCell noWrap>{display(med?.SalesPrice)}</TableCell>
                        <TableCell noWrap>
                          {med?.Expiry
                            ? new Date(med.Expiry).toLocaleDateString("en-US")
                            : "-"}
                        </TableCell>
                        <TableCell noWrap>{display(med?.Batch)}</TableCell>
                        <TableCell noWrap>{display(med?.company)}</TableCell>
                        <TableCell noWrap>
                          {display(med?.manufacturer)}
                        </TableCell>
                        <TableCell noWrap>{display(med?.RackNum)}</TableCell>
                        <TableCell noWrap>
                          <StatusBadge status={med.Status} />
                        </TableCell>
                        <TableCell noWrap>
                          <Dropdown
                            isOpen={!!dropdownOpen[med._id]}
                            toggle={() => toggleDropdown(med._id)}
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
                            </DropdownMenu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </div>

            {/* Pagination controls */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                Showing{" "}
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
                entries
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
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {getPageRange(totalPages, currentPage, 7).map((p, idx) => (
                    <li
                      key={`${p}-${idx}`}
                      className={`page-item ${
                        p === currentPage ? "active" : ""
                      } ${p === "..." ? "disabled" : ""}`}
                    >
                      {p === "..." ? (
                        <span className="page-link">...</span>
                      ) : (
                        <button
                          className="page-link"
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      )}
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
                        goToPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}

        {/* Analytics View */}
        {view === "analytics" && <AnalyticsView medicines={medicines} />}

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
              user={user}
              defaultValues={editingMedicine || {}}
              onSubmit={handleFormSubmit}
            />
          </ModalBody>
        </Modal>

        <BulkImportModal
          isOpen={bulkOpen}
          user={user}
          toggle={() => setBulkOpen(!bulkOpen)}
          onImport={handleBulkImport}
        />
      </div>
    </CardBody>
  );
};

export default InventoryManagement;
