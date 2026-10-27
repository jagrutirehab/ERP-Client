import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getVerificationJobs,
  createVerificationJob,
  updateVerificationJob,
  getUserLookup,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useReferenceList } from "../../../../Components/Hooks/useReferenceData";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import { useDebounce } from "../../../../Components/Hooks/useDebounce";
import { errText, useBusy } from "../shared/assetUi";
import useConfirm from "../shared/useConfirm";
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

const UserSearchInput = ({ label, required, value, onChange, initialName = "" }) => {
  const [search, setSearch] = useState(initialName);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = React.useRef(null);
  const reqId = React.useRef(0);

  const handleSearch = (text) => {
    setSearch(text);
    onChange("", "");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    reqId.current += 1;
    const mine = reqId.current;
    if (text.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      getUserLookup({ search: text })
        .then((res) => {
          if (mine !== reqId.current) return;
          setResults(res?.data || []);
          setShowDropdown(true);
        })
        .catch(() => {
          if (mine === reqId.current) setResults([]);
        });
    }, 400);
  };

  const select = (user) => {
    reqId.current += 1;
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
            <div
              key={u._id}
              className="p-2"
              style={{ cursor: "pointer" }}
              onMouseDown={() => select(u)}
            >
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
  const [confirm, confirmDialog] = useConfirm();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "VERIFICATION_JOB", "WRITE");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { items: centers } = useReferenceList("centers");

  // filters (the server does the filtering)
  const [filters, setFilters] = useState({ jobType: "", status: "", priority: "", centerId: "" });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [changing, runChange] = useBusy(); // Activate / Complete: one click = one request

  // create or edit
  const [editingJob, setEditingJob] = useState(null);
  const [supervisorName, setSupervisorName] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [reviewerName, setReviewerName] = useState("");

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
  const submitLock = React.useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getVerificationJobs({
      jobType: filters.jobType || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      centerId: filters.centerId || undefined,
      search: debouncedSearch.trim() || undefined,
    })
      .then((res) => {
        if (!cancelled) setJobs(res?.data || []);
      })
      .catch((error) => {
        if (!cancelled && !handleAuthError(error)) setLoadError(errText(error, "The jobs could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag, filters, debouncedSearch]);

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const filtersOn = search || Object.values(filters).some(Boolean);

  const openModal = () => {
    setEditingJob(null);
    setSupervisorName("");
    setAssigneeName("");
    setReviewerName("");
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

  const openEdit = (job) => {
    setEditingJob(job);
    setJobName(job.jobName || "");
    setJobType(job.jobType || "physical_verification");
    setPriority(job.priority || "medium");
    setCenterId(job.centerId?._id || "");
    setSupervisorId(job.supervisorId?._id || "");
    setAssignedToId(job.assignedToId?._id || "");
    setPrimaryReviewerId(job.primaryReviewerId?._id || "");
    setSupervisorName(job.supervisorId?.name || "");
    setAssigneeName(job.assignedToId?.name || "");
    setReviewerName(job.primaryReviewerId?.name || "");
    setStartDate(job.startDate ? new Date(job.startDate).toISOString().slice(0, 10) : "");
    setEndDate(job.endDate ? new Date(job.endDate).toISOString().slice(0, 10) : "");
    setGeoRestrict(!!job.geoRestrict);
    setRemarks(job.remarks || "");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (submitting || submitLock.current) return;
    if (
      !jobName.trim() ||
      !centerId ||
      !supervisorId ||
      !assignedToId ||
      !startDate ||
      !endDate
    ) {
      return toast.error(
        "Fill in Job Name, Site, Supervisor, Assigned To, Start and End Date",
      );
    }
    if (endDate < startDate) return toast.error("End date cannot be before the start date");
    submitLock.current = true; // checked at once, so a very fast double click cannot send two requests
    setSubmitting(true);
    try {
      if (editingJob) {
        const res = await updateVerificationJob(editingJob._id, {
          jobName,
          jobType,
          priority,
          centerId,
          supervisorId,
          assignedToId,
          primaryReviewerId: primaryReviewerId || "",
          startDate,
          endDate,
          remarks,
        });
        toast.success(res?.message || "Verification job updated successfully");
      } else {
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
      }
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) toast.error(errText(error));
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    const name = job.jobCode || job.jobName;
    if (newStatus === "completed") {
      const ok = await confirm({
        title: "Complete job",
        message: `Complete job ${name}? A completed job cannot be changed again.`,
        confirmText: "Complete",
      });
      if (!ok) return undefined;
    }
    if (newStatus === "cancelled") {
      const ok = await confirm({
        title: "Cancel job",
        message: `Cancel job ${name}? A cancelled job cannot be changed again.`,
        confirmText: "Cancel job",
        cancelText: "Keep it",
        danger: true,
      });
      if (!ok) return undefined;
    }
    return runChange(async () => {
      try {
        await updateVerificationJob(job._id, { status: newStatus });
        toast.success("Job status updated");
        setRefreshFlag((f) => f + 1);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error, "Couldn't update."));
      }
    });
  };

  const columns = [
    {
      name: "Job",
      sortable: true,
      selector: (row) => row.jobName || "",
      minWidth: "240px",
      grow: 2,
      wrap: true,
      cell: (row) => (
        <div className="py-2" style={{ minWidth: 0 }}>
          <div className="fw-semibold" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {row.jobName}
          </div>
          <div className="text-muted" style={{ fontSize: 12, fontFamily: "monospace" }}>
            {row.jobCode}
          </div>
        </div>
      ),
    },
    {
      name: "Site",
      sortable: true,
      selector: (row) => row.centerId?.title || "",
      minWidth: "140px",
      grow: 1,
      wrap: true,
      cell: (row) => (
        <span className="uom-cell-muted" style={{ whiteSpace: "normal" }}>{row.centerId?.title || "—"}</span>
      ),
    },
    {
      name: "Assigned To",
      minWidth: "140px",
      grow: 1,
      wrap: true,
      cell: (row) => (
        <span className="uom-cell-muted" style={{ whiteSpace: "normal" }}>{row.assignedToId?.name || "—"}</span>
      ),
    },
    {
      name: "Type",
      minWidth: "130px",
      wrap: true,
      cell: (row) => (
        <div style={{ lineHeight: 1.3 }}>
          <div className="text-capitalize" style={{ whiteSpace: "normal" }}>{String(row.jobType || "").replace(/_/g, " ")}</div>
          <div className="text-muted text-capitalize" style={{ fontSize: 12 }}>{row.priority || "—"} priority</div>
        </div>
      ),
    },
    {
      name: "Dates",
      minWidth: "130px",
      cell: (row) => (
        <div className="uom-cell-muted" style={{ fontSize: 13, lineHeight: 1.3 }}>
          <div>{dateFmt(row.startDate)}</div>
          <div>to {dateFmt(row.endDate)}</div>
        </div>
      ),
    },
    {
      name: "Scans",
      minWidth: "170px",
      cell: (row) => {
        const c = row.counts || {};
        const parts = [
          [c.new, "new", "#b54708"],
          [c.verified, "verified", "#027a48"],
          [c.rejected, "rejected", "#b42318"],
          [c.halted, "halted", "#667085"],
        ].filter(([n]) => n > 0);
        return (
          <div style={{ lineHeight: 1.3 }}>
            <div className="fw-semibold">{c.total || 0} total</div>
            <div style={{ fontSize: 12, whiteSpace: "normal" }}>
              {parts.length === 0 ? (
                <span className="text-muted">No scans yet</span>
              ) : (
                parts.map(([n, label, color], i) => (
                  <span key={label} style={{ color }}>
                    {i > 0 && <span className="text-muted"> · </span>}
                    {n} {label}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      },
    },
    {
      name: "Status",
      width: "130px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "",
      right: true,
      minWidth: "170px",
      cell: (row) => (
        <div className="d-flex gap-1 flex-wrap justify-content-end">
          {canCreate && (row.status === "draft" || row.status === "active") && (
            <Button size="sm" color="light" disabled={changing} onClick={() => openEdit(row)}>
              Edit
            </Button>
          )}
          {canCreate && row.status === "draft" && (
            <Button size="sm" color="success" disabled={changing} onClick={() => handleStatusChange(row, "active")}>
              Activate
            </Button>
          )}
          {canCreate && row.status === "active" && (
            <Button size="sm" color="primary" disabled={changing} onClick={() => handleStatusChange(row, "completed")}>
              Complete
            </Button>
          )}
          {canCreate && (row.status === "draft" || row.status === "active") && (
            <Button size="sm" color="danger" outline disabled={changing} onClick={() => handleStatusChange(row, "cancelled")}>
              Cancel
            </Button>
          )}
        </div>
      ),
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

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="uom-search-wrap" style={{ maxWidth: 240 }}>
          <i className="bx bx-search"></i>
          <Input placeholder="Search job name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input type="select" style={{ width: 170 }} value={filters.jobType} onChange={setFilter("jobType")}>
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
          <option value="tagging">Tagging</option>
        </Input>
        <Input type="select" style={{ width: 140 }} value={filters.status} onChange={setFilter("status")}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 140 }} value={filters.priority} onChange={setFilter("priority")}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 180 }} value={filters.centerId} onChange={setFilter("centerId")}>
          <option value="">All sites</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </Input>
        {filtersOn && (
          <Button
            color="light"
            onClick={() => {
              setFilters({ jobType: "", status: "", priority: "", centerId: "" });
              setSearch("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {loadError && (
        <div className="p-3 mb-3 d-flex align-items-center justify-content-between" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
          <span className="text-danger">{loadError}</span>
          <Button size="sm" color="light" onClick={() => setRefreshFlag((f) => f + 1)}>Try again</Button>
        </div>
      )}

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={jobs}
          progressPending={loading}
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f8f9fa",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.3,
                color: "#6c757d",
              },
            },
            rows: { style: { minHeight: 64 } },
            cells: { style: { paddingTop: 6, paddingBottom: 6 } },
          }}
          noDataComponent={
            <div className="uom-empty-state">
              {filtersOn ? "No verification jobs match these filters" : "No verification jobs yet"}
            </div>
          }
        />
      </div>

      {confirmDialog}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          <h5 className="mb-1">{editingJob ? `Edit Job ${editingJob.jobCode || ""}` : "Create New Job"}</h5>
          <p className="text-muted small mb-3">
            {editingJob
              ? "Change the job details. A finished job cannot be edited."
              : "Set up a new job with site location and user assignments"}
          </p>

          <h6 className="fw-semibold mb-3">Job Information</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Job Name <span className="text-danger">*</span>
              </Label>
              <Input
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Priority <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
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
              <Input
                type="select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
                {editingJob && !JOB_TYPES.some((t) => t.value === editingJob.jobType) && (
                  <option value={editingJob.jobType} className="text-capitalize">
                    {editingJob.jobType}
                  </option>
                )}
              </Input>
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Site <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
              >
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
                initialName={supervisorName}
                value={supervisorId}
                onChange={(id) => setSupervisorId(id)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <UserSearchInput
                label="Assigned To"
                required
                initialName={assigneeName}
                value={assignedToId}
                onChange={(id) => setAssignedToId(id)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <UserSearchInput
                label="Primary Reviewer (optional)"
                initialName={reviewerName}
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
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                End Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
          </Row>

          {/* <div className="form-check form-switch mb-3">
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
          </div> */}

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-4"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="d-flex justify-content-end gap-2">
            <Button
              color="light"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingJob ? "Save Changes" : "Create Job"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VerificationJob;
