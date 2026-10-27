import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getMaintenanceJobs,
  createMaintenanceJob,
  updateMaintenanceJob,
  getWorkOrders,
  getUserLookup,
  getVendors,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import { errText } from "../shared/assetUi";
import "../../UnitOfMeasurement/uom.scss";

// Dates are saved as UTC midnight, so show them in UTC to keep the day the user picked
const dateFmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { timeZone: "UTC" }) : "—";

const NEXT_STATUS = {
  assigned: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const vendorLabel = (v) => v?.tradeName || v?.legalName || "—";

const STATUS_META = {
  assigned: { label: "Assigned", cls: "status-draft" },
  in_progress: { label: "In Progress", cls: "status-active" },
  completed: { label: "Completed", cls: "status-active" },
  cancelled: { label: "Cancelled", cls: "status-blacklisted" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.assigned;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const MaintenanceJob = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "MAINTENANCE_JOB", "WRITE");
  const canUpdate = canCreate;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [, setTechnicianName] = useState("");
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = React.useRef(null);
  const searchSeq = React.useRef(0);
  // Any active, approved vendor can repair an asset (not only purchase-order vendors)
  const [vendors, setVendors] = useState([]);
  useEffect(() => {
    getVendors({ status: "active", limit: 1000 })
      .then((res) =>
        setVendors(
          (res?.data || []).filter(
            (v) => v.approvalStatus === "approved" && v.status === "active",
          ),
        ),
      )
      .catch(() => setVendors([]));
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [workOrderId, setWorkOrderId] = useState("");
  const [assigneeType, setAssigneeType] = useState("technician");
  const [technicianId, setTechnicianId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [selectedWOCenter, setSelectedWOCenter] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadWorkOrders = () =>
    getWorkOrders({})
      .then((res) =>
        setWorkOrders(
          (res?.data || []).filter((w) => w.status !== "completed"),
        ),
      )
      .catch(() => setWorkOrders([]));

  const handleTechnicianSearch = (text) => {
    setTechnicianSearch(text);
    setTechnicianName("");
    setTechnicianId("");

    // Clear any pending call — reset the debounce timer on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      searchSeq.current++;
      setTechnicians([]);
      setShowTechDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const seq = ++searchSeq.current;
    // Only fire the API call after the user pauses typing for 400ms
    debounceRef.current = setTimeout(() => {
      getUserLookup({ search: text })
        .then((res) => {
          if (seq !== searchSeq.current) return;
          setTechnicians(res?.data || []);
          setShowTechDropdown(true);
        })
        .catch(() => {
          if (seq === searchSeq.current) setTechnicians([]);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearchLoading(false);
        });
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const selectTechnician = (user) => {
    setTechnicianId(user._id);
    setTechnicianName(user.name);
    setTechnicianSearch(user.name);
    setShowTechDropdown(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMaintenanceJobs({})
      .then((res) => {
        if (!cancelled) setJobs(res?.data || []);
      })
      .catch((error) => {
        if (!cancelled && !handleAuthError(error)) toast.error(errText(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const openModal = () => {
    setWorkOrderId("");
    setAssigneeType("technician");
    setTechnicianId("");
    setTechnicianName("");
    setTechnicianSearch("");
    setTechnicians([]);
    setVendorId("");
    setCenterId("");
    setSelectedWOCenter(null);
    setScheduledDate("");
    setScheduledTime("");
    setRemarks("");
    loadWorkOrders();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const assigneeMissing =
      assigneeType === "technician" ? !technicianId : !vendorId;

    if (workOrderId && !centerId) {
      return toast.error("This work order has no site. Set its site first");
    }

    if (
      !workOrderId ||
      assigneeMissing ||
      !centerId ||
      !scheduledDate ||
      !scheduledTime
    ) {
      return toast.error(
        `Fill in Work Order, ${assigneeType === "vendor" ? "Vendor" : "Technician"}, Site, Date and Time`,
      );
    }
    setSubmitting(true);
    try {
      await createMaintenanceJob({
        workOrderId,
        assigneeType,
        ...(assigneeType === "technician" ? { technicianId } : { vendorId }),
        centerId,
        scheduledDate,
        scheduledTime,
        remarks,
      });
      toast.success(
        assigneeType === "vendor"
          ? "Maintenance job created — vendor assigned"
          : "Maintenance job created — technician assigned",
      );
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(errText(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    setUpdating(true);
    try {
      await updateMaintenanceJob(job._id, { status: newStatus });
      toast.success("Job status updated");
      setDetailModal(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(errText(error, "Couldn't update."));
      }
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      name: "Job #",
      selector: (row) => row.jobNumber,
      sortable: true,
      width: "150px",
    },
    {
      name: "Work Order",
      wrap: true,
      cell: (row) => (
        <div className="py-1">
          <span className="uom-cell-primary">
            {row.workOrderId?.workOrderNumber || "—"}
          </span>
          <div className="small text-muted">
            {row.workOrderId?.title || "—"}
            {row.workOrderId?.assetId?.assetName
              ? ` · ${row.workOrderId.assetId.assetName}`
              : ""}
          </div>
        </div>
      ),
    },
    {
      name: "Assigned To",
      cell: (row) =>
        row.assigneeType === "vendor" ? (
          <div className="py-1">
            <span className="uom-cell-muted">{vendorLabel(row.vendorId)}</span>
            <div className="small text-muted">Vendor</div>
          </div>
        ) : (
          <div className="py-1">
            <span className="uom-cell-muted">
              {row.technicianId?.name || "—"}
            </span>
            <div className="small text-muted">Technician</div>
          </div>
        ),
    },
    {
      name: "Site",
      cell: (row) => (
        <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>
      ),
    },
    {
      name: "Scheduled",
      cell: (row) => (
        <span className="uom-cell-muted">
          {dateFmt(row.scheduledDate)} at {row.scheduledTime || "—"}
        </span>
      ),
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "",
      right: true,
      width: "100px",
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => setDetailModal(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Maintenance Jobs</h4>
          <p>Assign a work order to a field technician or an outside vendor</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Maintenance Job
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
          noDataComponent={
            <div className="uom-empty-state">No maintenance jobs yet</div>
          }
        />
      </div>

      <Modal
        isOpen={modalOpen}
        toggle={() => !submitting && setModalOpen(false)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          <h5 className="mb-1">New Maintenance Job</h5>
          <p className="text-muted small mb-3">
            Assign a work order to a field technician or an outside vendor
          </p>

          <h6 className="fw-semibold mb-3">Assignment</h6>
          <Label>
            Work Order <span className="text-danger">*</span>
          </Label>
          <Input
            type="select"
            className="mb-3"
            value={workOrderId}
            onChange={(e) => {
              const wo = workOrders.find((w) => w._id === e.target.value);
              setWorkOrderId(e.target.value);
              setCenterId(wo?.centerId?._id || wo?.centerId || "");
              setSelectedWOCenter(wo?.centerId?.title || null);
            }}
          >
            <option value="">
              {workOrders.length === 0
                ? "No open work orders"
                : "Select Work Order"}
            </option>
            {workOrders.map((w) => (
              <option key={w._id} value={w._id}>
                {w.workOrderNumber} — {w.title}
                {w.assetId?.assetName
                  ? ` — ${w.assetId.assetName} (${w.assetId.assetTag || "no tag"})`
                  : ""}
              </option>
            ))}
          </Input>

          <Label>
            Assign to <span className="text-danger">*</span>
          </Label>
          <div className="d-flex gap-2 mb-3">
            <Button
              type="button"
              color={assigneeType === "technician" ? "primary" : "light"}
              onClick={() => setAssigneeType("technician")}
            >
              <i className="bx bx-user me-1"></i> Technician
            </Button>
            <Button
              type="button"
              color={assigneeType === "vendor" ? "primary" : "light"}
              onClick={() => setAssigneeType("vendor")}
            >
              <i className="bx bx-store me-1"></i> Vendor
            </Button>
          </div>

          {assigneeType === "technician" ? (
            <>
              <Label>
                Technician <span className="text-danger">*</span>
              </Label>
              <div style={{ position: "relative" }} className="mb-3">
                <Input
                  value={technicianSearch}
                  onChange={(e) => handleTechnicianSearch(e.target.value)}
                  onBlur={() => setShowTechDropdown(false)}
                  placeholder="Type at least 2 letters to search..."
                />
                {searchLoading && (
                  <div className="text-muted small mt-1">Searching...</div>
                )}
                {showTechDropdown &&
                  !searchLoading &&
                  technicians.length === 0 &&
                  technicianSearch.trim().length >= 2 && (
                    <div className="text-muted small mt-1">No matches</div>
                  )}
                {showTechDropdown && technicians.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: 6,
                      zIndex: 10,
                      maxHeight: 200,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {technicians.map((u) => (
                      <div
                        key={u._id}
                        className="p-2"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => selectTechnician(u)}
                      >
                        {u.name}{" "}
                        <span className="text-muted small">({u.email})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Label>
                Vendor <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                className="mb-1"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {vendorLabel(v)}
                  </option>
                ))}
              </Input>
              <div className="text-muted small mb-3">
                Only active, approved vendors are listed.
              </div>
            </>
          )}

          <Label>Site (auto-filled from Work Order)</Label>
          <Input
            value={
              selectedWOCenter ||
              (workOrderId ? "This work order has no site" : "Select a Work Order first")
            }
            disabled
            className="mb-3"
          />

          <h6 className="fw-semibold mb-3">Schedule</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Time <span className="text-danger">*</span>
              </Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </Col>
          </Row>

          <Label>Remarks / Notes</Label>
          <Input
            type="textarea"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
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
              {submitting ? "Saving..." : "Create Job"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={!!detailModal}
        toggle={() => !updating && setDetailModal(null)}
        centered
      >
        <ModalBody className="p-4">
          {detailModal && (
            <>
              <h5 className="mb-1">{detailModal.jobNumber}</h5>
              <p className="text-muted small mb-3">
                {detailModal.workOrderId?.workOrderNumber}{" "}
                {detailModal.workOrderId?.title}
                {detailModal.workOrderId?.assetId?.assetName
                  ? ` · ${detailModal.workOrderId.assetId.assetName}`
                  : ""}
              </p>

              <div className="mb-2">
                <span className="text-muted small">
                  {detailModal.assigneeType === "vendor"
                    ? "Vendor: "
                    : "Technician: "}
                </span>
                {detailModal.assigneeType === "vendor"
                  ? vendorLabel(detailModal.vendorId)
                  : detailModal.technicianId?.name}
              </div>
              <div className="mb-2">
                <span className="text-muted small">Site: </span>
                {detailModal.centerId?.title || "—"}
              </div>
              <div className="mb-2">
                <span className="text-muted small">Scheduled: </span>
                {dateFmt(detailModal.scheduledDate)} at{" "}
                {detailModal.scheduledTime || "—"}
              </div>
              <div className="mb-3">
                <span className="text-muted small">Remarks: </span>
                {detailModal.remarks || "—"}
              </div>

              {canUpdate && (NEXT_STATUS[detailModal.status] || []).length > 0 && (
                <>
                  <div className="text-muted small mb-2">Update Status</div>
                  <div className="d-flex gap-2 flex-wrap">
                    {NEXT_STATUS[detailModal.status].map((key) => (
                      <Button
                        key={key}
                        size="sm"
                        color="light"
                        disabled={updating}
                        onClick={() => handleStatusChange(detailModal, key)}
                      >
                        {STATUS_META[key].label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              {(NEXT_STATUS[detailModal.status] || []).length === 0 && (
                <div className="text-muted small">
                  This job is closed and its status cannot be changed.
                </div>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button color="light" onClick={() => setDetailModal(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MaintenanceJob;
