import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import {
  Row,
  Col,
  Button,
  Input,
  Label,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { endOfDay, format, startOfDay } from "date-fns";
import { getTallyLogs, exportTallyLogsCsv } from "../../helpers/backend_helper";

const DATE_MODES = [
  { value: "createdAt", label: "Sync Date" },
  { value: "sourceUpdatedAt", label: "Record Updated Date" },
];

const TallyLogRecords = ({ centerOptions, initialCenters }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const defaultSevenDaysAgo = new Date(
    new Date().setDate(new Date().getDate() - 7),
  );

  const [filters, setFilters] = useState({
    // Created date range (used when dateMode === "createdAt")
    startDate: defaultSevenDaysAgo,
    endDate: new Date(),
    // Source-updated date range (used when dateMode === "sourceUpdatedAt")
    sourceStartDate: defaultSevenDaysAgo,
    sourceEndDate: new Date(),
    // Which date field drives the query
    dateMode: "createdAt",
    centerId:
      initialCenters && initialCenters.length > 0 ? initialCenters[0] : "all",
    search: "",
    status: "all",
    voucherType: "all",
  });

  const [dateModeDropdownOpen, setDateModeDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedXml, setSelectedXml] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Active date range (derived from dateMode) ─────────────────────────────
  const activeDateRange =
    filters.dateMode === "sourceUpdatedAt"
      ? { start: filters.sourceStartDate, end: filters.sourceEndDate }
      : { start: filters.startDate, end: filters.endDate };

  // ── Build shared query params ─────────────────────────────────────────────
  const buildParams = useCallback(
    (extra = {}) => ({
      centerId: filters.centerId,
      status: filters.status,
      search: filters.search,
      voucherType: filters.voucherType,
      dateMode: filters.dateMode,
      // Always send both ranges; backend uses only the one matching dateMode
      startDate: startOfDay(filters.startDate),
      endDate: endOfDay(filters.endDate),
      sourceStartDate: startOfDay(filters.sourceStartDate),
      sourceEndDate: endOfDay(filters.sourceEndDate),
      ...extra,
    }),
    [filters],
  );

  // ── Fetch logs ────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(
    async (page, size) => {
      setLoading(true);
      try {
        const params = buildParams({ page, limit: size });
        const response = await getTallyLogs(params);
        if (response.success) {
          setLogs(response.data);
          setTotalRows(response.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch tally logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    fetchLogs(currentPage, perPage);
  }, [fetchLogs, currentPage, perPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // ── Date range change (writes into the correct date fields for active mode) ──
  const handleDateRangeChange = ([start, end]) => {
    if (!start || !end) return;
    if (filters.dateMode === "sourceUpdatedAt") {
      setFilters((prev) => ({
        ...prev,
        sourceStartDate: start,
        sourceEndDate: end,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: start,
        endDate: end,
      }));
    }
    setCurrentPage(1);
  };

  // ── Date mode change ──────────────────────────────────────────────────────
  const handleDateModeChange = (mode) => {
    setFilters((prev) => ({ ...prev, dateMode: mode }));
    setCurrentPage(1);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) setSelectedXml(null);
  };

  const viewXml = (xml) => {
    setSelectedXml(xml);
    setIsModalOpen(true);
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = buildParams();
      const response = await exportTallyLogsCsv(params);
      const blob = new Blob([response.data || response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tally-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  function parseYYYYMMDD(dateStr) {
    const y = +dateStr.slice(0, 4);
    const m = +dateStr.slice(4, 6) - 1;
    const d = +dateStr.slice(6, 8);
    return new Date(Date.UTC(y, m, d));
  }

  const columns = [
    {
      name: "Date & Time",
      selector: (row) => row.createdAt,
      sortable: false,
      width: "180px",
      cell: (row) => (
        <div className="py-2">
          <div className="font-size-13">
            {format(new Date(row.createdAt), "dd MMM yyyy")}
          </div>
          <small className="text-muted">
            {format(new Date(row.createdAt), "hh:mm a")}
          </small>
        </div>
      ),
    },
    {
      name: "Source Updated At",
      selector: (row) => row.sourceUpdatedAt,
      sortable: false,
      width: "180px",
      cell: (row) => (
        <div className="py-2">
          {row.sourceUpdatedAt ? (
            <>
              <div className="font-size-13">
                {format(new Date(row.sourceUpdatedAt), "dd MMM yyyy")}
              </div>
              <small className="text-muted">
                {format(new Date(row.sourceUpdatedAt), "hh:mm a")}
              </small>
            </>
          ) : (
            <span className="text-muted">-</span>
          )}
        </div>
      ),
    },
    {
      name: "Voucher Date",
      selector: (row) =>
        row.syncData?.date
          ? format(parseYYYYMMDD(row.syncData?.date), "dd MMM yyyy")
          : "N/A",
      sortable: false,
      wrap: true,
    },
    {
      name: "Center",
      selector: (row) => row.center?.title || "N/A",
      sortable: false,
      wrap: true,
    },
    {
      name: "Invoice ID",
      selector: (row) => row.invoiceNo,
      sortable: false,
      style: { fontWeight: "500" },
      cell: (row) => (
        <div>
          <div>{row.invoiceNo}</div>
          {row.opdInvoiceNo && (
            <div className="font-size-11 text-muted">
              OPD: {row.opdInvoiceNo}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Party / Identifier",
      selector: (row) => row.partyIdentifier || "N/A",
      sortable: false,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: false,
      cell: (row) => `₹${row.amount?.toLocaleString()}`,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: false,
      width: "120px",
      cell: (row) => (
        <Badge
          color={
            row.status === "created"
              ? "success"
              : row.status === "updated"
                ? "info"
                : "danger"
          }
          className="font-size-11"
        >
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      name: "Error Message",
      selector: (row) => row.errorMessage || "-",
      sortable: false,
      wrap: true,
      minWidth: "180px",
      cell: (row) =>
        row.errorMessage ? (
          <div
            className="text-danger font-size-11"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {row.errorMessage}
          </div>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      name: "Actions",
      button: true,
      width: "140px",
      cell: (row) => (
        <Button
          color="soft-primary"
          size="sm"
          onClick={() => viewXml(row.generatedXml)}
        >
          <i className="bx bx-code-alt me-1"></i>
          View XML
        </Button>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "600",
        backgroundColor: "#f8f9fa",
        color: "#495057",
      },
    },
    cells: {
      style: { fontSize: "13px" },
    },
  };

  return (
    <div className="mt-4">
      <Row className="mb-3 align-items-end g-2">
        {/* ── Date filter: Flatpickr + dropdown mode button (split input-group) ─ */}
        <Col md={4}>
          <Label className="form-label fw-semibold">Date Range</Label>

          {/*
            Bootstrap input-group split-button pattern:
            [ 📅  date range picker input  |  Created Date ▾ ]
            The Flatpickr fills the left slot; a Dropdown caret button
            occupies the right slot letting the user pick the filter mode.
          */}
          <div className="input-group">
            {/* Flatpickr fills the left portion of the group */}
            <Flatpickr
              key={filters.dateMode}
              className="form-control"
              options={{
                mode: "range",
                dateFormat: "d M, Y",
                defaultDate: [activeDateRange.start, activeDateRange.end],
              }}
              onChange={handleDateRangeChange}
            />

            {/* Dropdown split-button on the right */}
            <Dropdown
              isOpen={dateModeDropdownOpen}
              toggle={() => setDateModeDropdownOpen((o) => !o)}
            >
              <DropdownToggle
                caret
                color={
                  filters.dateMode === "sourceUpdatedAt" ? "info" : "secondary"
                }
                className="input-group-text border-start-0"
                style={{ borderRadius: "0 4px 4px 0", whiteSpace: "nowrap" }}
              >
                <i className="bx bx-calendar-event me-1"></i>
                {DATE_MODES.find((m) => m.value === filters.dateMode)?.label}
              </DropdownToggle>
              <DropdownMenu end>
                {DATE_MODES.map((mode) => (
                  <DropdownItem
                    key={mode.value}
                    active={filters.dateMode === mode.value}
                    onClick={() => handleDateModeChange(mode.value)}
                  >
                    <i
                      className={`bx ${
                        mode.value === "sourceUpdatedAt"
                          ? "bx-history"
                          : "bx-calendar-plus"
                      } me-2`}
                    ></i>
                    {mode.label}
                    {filters.dateMode === mode.value && (
                      <i className="bx bx-check ms-2 text-success"></i>
                    )}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </Col>

        {/* ── Center ───────────────────────────────────────────────────── */}
        <Col md={2}>
          <Label className="form-label fw-semibold">Center</Label>
          <Input
            type="select"
            value={filters.centerId}
            onChange={(e) => handleFilterChange("centerId", e.target.value)}
          >
            <option value="all">All Centers</option>
            {centerOptions?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Input>
        </Col>

        {/* ── Status ───────────────────────────────────────────────────── */}
        <Col md={2}>
          <Label className="form-label fw-semibold">Status</Label>
          <Input
            type="select"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="failed">Failed</option>
          </Input>
        </Col>

        {/* ── Voucher Type ─────────────────────────────────────────────── */}
        <Col md={2}>
          <Label className="form-label fw-semibold">Voucher Type</Label>
          <Input
            type="select"
            value={filters.voucherType}
            onChange={(e) => handleFilterChange("voucherType", e.target.value)}
          >
            <option value="all">All</option>
            <option value="INVOICE">Invoice</option>
            <option value="ADVANCE_PAYMENT">Advance Payment</option>
            <option value="CENTRAL_PAYMENT">Central Payment</option>
            <option value="CASH">Cash</option>
          </Input>
        </Col>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <Col md={1} className="text-end">
          <Button
            color="light"
            onClick={() => fetchLogs(currentPage, perPage)}
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <i className="bx bx-refresh me-1"></i>
            )}
            Refresh
          </Button>
        </Col>
        <Col md={1} className="text-end">
          <Button
            color="success"
            outline
            onClick={handleExportCsv}
            disabled={exporting}
            className="w-100"
          >
            {exporting ? (
              <Spinner size="sm" />
            ) : (
              <i className="bx bx-download me-1"></i>
            )}
            CSV
          </Button>
        </Col>
      </Row>

      <div className="border">
        <DataTable
          columns={columns}
          data={logs}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 15, 20, 30, 50]}
          progressPending={loading}
          progressComponent={
            <div className="py-4">
              <Spinner color="primary" />
            </div>
          }
          noDataComponent={
            <div className="py-4 text-muted">No records found</div>
          }
          highlightOnHover
          customStyles={customStyles}
        />
      </div>

      {/* XML Modal */}
      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" scrollable>
        <ModalHeader toggle={toggleModal}>Generated Tally XML</ModalHeader>
        <ModalBody className="bg-dark text-light p-0">
          <pre
            className="m-0 p-3 font-size-12"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {selectedXml}
          </pre>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TallyLogRecords;
