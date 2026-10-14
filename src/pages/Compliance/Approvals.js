import React, { useMemo, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, Button } from "reactstrap";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { Eye } from "lucide-react";
import { renderStatusBadge } from "../../Components/Common/renderStatusBadge";
import ReviewModal from "./ReviewModal";
import { useSubmissions, decideSubmission } from "./submissionsStore";
import { CENTRES } from "./data";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      borderBottom: "2px solid #e9ecef",
    },
  },
  rows: {
    style: { borderBottom: "1px solid #f1f1f1" },
  },
};

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const Approvals = () => {
  const submissions = useSubmissions();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [centreFilter, setCentreFilter] = useState("all");
  const [reviewing, setReviewing] = useState(null);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const rows = useMemo(() => {
    return submissions
      .filter((s) => s.status === statusFilter.toLowerCase())
      .filter((s) => centreFilter === "all" || s.centreId === centreFilter)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [submissions, statusFilter, centreFilter]);

  const columns = [
    {
      name: <div>Submitted</div>,
      selector: (row) => formatDateTime(row.submittedAt),
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Centre</div>,
      selector: (row) => row.centreName,
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Compliance type</div>,
      selector: (row) => row.categoryName,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Submitted by</div>,
      selector: (row) => row.submittedBy,
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Files</div>,
      selector: (row) => row.fileNames.join(", "),
      wrap: true,
      minWidth: "130px",
    },
    {
      name: <div>Status</div>,
      selector: (row) => row.status,
      cell: (row) => renderStatusBadge(row.status.toUpperCase()),
      wrap: true,
      minWidth: "100px",
    },
    {
      name: <div>Actions</div>,
      cell: (row) => (
        <Button color="light" className="border" size="sm" onClick={() => setReviewing(row)}>
          <Eye size={14} className="me-1" /> {statusFilter === "PENDING" ? "Review" : "View"}
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "100px",
    },
  ];

  const approve = (id) => decideSubmission(id, "approved");
  const reject = (id, note) => decideSubmission(id, "rejected", note);

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">Approvals</h5>
          <p className="text-muted mb-0 fs-13">
            Review centre-submitted compliance documents and approve or reject them.{" "}
            {pendingCount} pending.
          </p>
        </div>
      </div>

      {/* Status tabs, matching the Pharmacy Medicine Requisition approval screen */}
      <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
        {STATUS_OPTIONS.map((status) => {
          const isActive = statusFilter === status.value;
          return (
            <NavItem key={status.value}>
              <NavLink
                href="#"
                active={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  setStatusFilter(status.value);
                }}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  color: isActive ? "#212529" : "#1B4D47",
                  background: isActive ? "#fff" : "transparent",
                  border: isActive ? "1px solid #dee2e6" : "none",
                  borderBottom: isActive ? "1px solid #fff" : "none",
                  borderRadius: isActive ? "4px 4px 0 0" : 0,
                  padding: "6px 14px",
                  marginBottom: -1,
                  textDecoration: "none",
                }}
              >
                {status.label}
                {status.value === "PENDING" && pendingCount > 0 && (
                  <span
                    className="ms-2 badge rounded-pill bg-danger"
                    style={{ fontSize: 11 }}
                  >
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>

      {/* Filters */}
      <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
        <CardBody className="py-3">
          <div style={{ maxWidth: 260 }}>
            <Select
              classNamePrefix="react-select"
              options={[{ value: "all", label: "All centres" }, ...CENTRES.map((c) => ({ value: c.id, label: c.name }))]}
              value={
                centreFilter === "all"
                  ? { value: "all", label: "All centres" }
                  : { value: centreFilter, label: CENTRES.find((c) => c.id === centreFilter)?.name }
              }
              onChange={(option) => setCentreFilter(option?.value || "all")}
            />
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            data={rows}
            highlightOnHover
            pagination
            striped
            responsive
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center text-muted py-4">No submissions match these filters.</div>
            }
          />
        </CardBody>
      </Card>

      <ReviewModal
        isOpen={!!reviewing}
        toggle={() => setReviewing(null)}
        submission={reviewing}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
};

export default Approvals;
