import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getVerificationJobs,
  createVerificationJob,
  updateVerificationJob,
  getAllCenters,
  getUserLookup,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const JOB_TYPES = [
  { value: "physical_verification", label: "Physical Verification" },
  { value: "audit", label: "Audit" },
  // { value: "tagging", label: "Tagging" },
];
const PRIORITIES = ["low", "medium", "high", "critical"];

const STATUS_META = {
  draft: { label: "Draft", cls: "status-draft" },
  active: { label: "Active", cls: "status-active" },
  completed: { label: "Completed", cls: "status-active" },
  cancelled: { label: "Cancelled", cls: "status-blacklisted" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const UserSearchInput = ({ label, required, value, onChange }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = React.useRef(null);

  const handleSearch = (text) => {
    setSearch(text);
    onChange("", "");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      getUserLookup({ search: text })
        .then((res) => {
          setResults(res?.data || []);
          setShowDropdown(true);
        })
        .catch(() => setResults([]));
    }, 400);
  };

  const select = (user) => {
    setSearch(user.name);
    onChange(user._id, user.name);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <Label className="small">
        {label} {required && <span className="text-danger">*</span>}
      </Label>
      <Input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Type 2+ letters..."
      />
      {showDropdown && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            zIndex: 20,
            maxHeight: 180,
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {results.map((u) => (
            <div key={u._id} className="p-2" style={{ cursor: "pointer" }} onMouseDown={() => select(u)}>
              {u.name} <span className="text-muted small">({u.email})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VerificationJob = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "VERIFICATION_JOB", "WRITE");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobType, setJobType] = useState("physical_verification");
  const [priority, setPriority] = useState("medium");
  const [centerId, setCenterId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [primaryReviewerId, setPrimaryReviewerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [geoRestrict, setGeoRestrict] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVerificationJobs({})
      .then((res) => {
        if (!cancelled) setJobs(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  const openModal = () => {
    setJobName("");
    setJobType("physical_verification");
    setPriority("medium");
    setCenterId("");
    setSupervisorId("");
    setAssignedToId("");
    setPrimaryReviewerId("");
    setStartDate("");
    setEndDate("");
    setGeoRestrict(false);
    setRemarks("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!jobName.trim() || !centerId || !supervisorId || !assignedToId || !startDate || !endDate) {
      return toast.error("Fill in Job Name, Site, Supervisor, Assigned To, Start and End Date");
    }
    setSubmitting(true);
    try {
      await createVerificationJob({
        jobName,
        jobType,
        priority,
        centerId,
        supervisorId,
        assignedToId,
        primaryReviewerId: primaryReviewerId || undefined,
        startDate,
        endDate,
        geoRestrict,
        remarks,
      });
      toast.success("Verification job created successfully");
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    try {
      await updateVerificationJob(job._id, { status: newStatus });
      toast.success("Job status updated");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't update.");
      }
    }
  };

  const columns = [
    { name: "Job Code", selector: (row) => row.jobCode, sortable: true, width: "140px" },
    { name: "Job Name", selector: (row) => row.jobName },
    {
      name: "Type",
      width: "150px",
      cell: (row) => (
        <span className="uom-cell-muted text-capitalize">{row.jobType?.replace("_", " ")}</span>
      ),
    },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Assigned To",
      cell: (row) => <span className="uom-cell-muted">{row.assignedToId?.name || "—"}</span>,
    },
    { name: "Status", width: "120px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Dates",
      cell: (row) => (
        <span className="uom-cell-muted small">
          {dateFmt(row.startDate)} - {dateFmt(row.endDate)}
        </span>
      ),
    },
    {
      name: "",
      right: true,
      width: "120px",
      cell: (row) =>
        row.status === "draft" ? (
          <Button size="sm" color="success" onClick={() => handleStatusChange(row, "active")}>
            Activate
          </Button>
        ) : row.status === "active" ? (
          <Button size="sm" color="primary" onClick={() => handleStatusChange(row, "completed")}>
            Complete
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Verification Jobs</h4>
          <p>Manage and track all job activities across your organization</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> Create New Job
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={jobs}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No verification jobs yet</div>}
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-1">Create New Job</h5>
          <p className="text-muted small mb-3">Set up a new job with site location and user assignments</p>

          <h6 className="fw-semibold mb-3">Job Information</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Job Name <span className="text-danger">*</span>
              </Label>
              <Input value={jobName} onChange={(e) => setJobName(e.target.value)} />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Priority <span className="text-danger">*</span>
              </Label>
              <Input type="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Job Type <span className="text-danger">*</span>
              </Label>
              <Input type="select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Site <span className="text-danger">*</span>
              </Label>
              <Input type="select" value={centerId} onChange={(e) => setCenterId(e.target.value)}>
                <option value="">Select site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <h6 className="fw-semibold mb-3">Assignment</h6>
          <Row>
            <Col md={6} className="mb-3">
              <UserSearchInput
                label="Supervisor"
                required
                value={supervisorId}
                onChange={(id) => setSupervisorId(id)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <UserSearchInput
                label="Assigned To"
                required
                value={assignedToId}
                onChange={(id) => setAssignedToId(id)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <UserSearchInput
                label="Primary Reviewer (optional)"
                value={primaryReviewerId}
                onChange={(id) => setPrimaryReviewerId(id)}
              />
            </Col>
          </Row>

          <h6 className="fw-semibold mb-3">Schedule & Constraints</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Start Date <span className="text-danger">*</span>
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                End Date <span className="text-danger">*</span>
              </Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Col>
          </Row>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={geoRestrict}
              onChange={(e) => setGeoRestrict(e.target.checked)}
              id="geoRestrictSwitch"
            />
            <label className="form-check-label" htmlFor="geoRestrictSwitch">
              Geo Restrict
            </label>
          </div>

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-4"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create Job"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VerificationJob;