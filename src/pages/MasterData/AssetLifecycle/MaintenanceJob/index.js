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
  getAllCenters,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

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

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = React.useRef(null);
  const [centers, setCenters] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [workOrderId, setWorkOrderId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [selectedWOCenter, setSelectedWOCenter] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getWorkOrders({ status: "pending" })
      .then((res) => setWorkOrders(res?.data || []))
      .catch(() => {});
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  const handleTechnicianSearch = (text) => {
    setTechnicianSearch(text);
    setTechnicianName("");
    setTechnicianId("");

    // Clear any pending call — reset the debounce timer on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setTechnicians([]);
      setShowTechDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    // Only fire the API call after the user pauses typing for 400ms
    debounceRef.current = setTimeout(() => {
      getUserLookup({ search: text })
        .then((res) => {
          setTechnicians(res?.data || []);
          setShowTechDropdown(true);
        })
        .catch(() => setTechnicians([]))
        .finally(() => setSearchLoading(false));
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
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  const openModal = () => {
    setWorkOrderId("");
    setTechnicianId("");
    setCenterId("");
    setScheduledDate("");
    setScheduledTime("");
    setRemarks("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !workOrderId ||
      !technicianId ||
      !centerId ||
      !scheduledDate ||
      !scheduledTime
    ) {
      return toast.error("Fill in Work Order, Technician, Site, Date and Time");
    }
    setSubmitting(true);
    try {
      await createMaintenanceJob({
        workOrderId,
        technicianId,
        centerId,
        scheduledDate,
        scheduledTime,
        remarks,
      });
      toast.success("Maintenance job created — technician assigned");
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        );
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
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't update.",
        );
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
      cell: (row) => (
        <span className="uom-cell-primary">
          {row.workOrderId?.title || "—"}
        </span>
      ),
    },
    {
      name: "Technician",
      cell: (row) => (
        <span className="uom-cell-muted">{row.technicianId?.name || "—"}</span>
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
          {dateFmt(row.scheduledDate)} at {row.scheduledTime}
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
          <p>Assign a work order to a field technician</p>
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
        toggle={() => setModalOpen(false)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          <h5 className="mb-1">New Maintenance Job</h5>
          <p className="text-muted small mb-3">
            Assign a work order to a field technician
          </p>

          <h6 className="fw-semibold mb-3">Assignment</h6>
          <Label>Work Order</Label>
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
            <option value="">Select Work Order</option>
            {workOrders.map((w) => (
              <option key={w._id} value={w._id}>
                {w.workOrderNumber} — {w.title}
              </option>
            ))}
          </Input>
          <Label>Technician</Label>
          <div style={{ position: "relative" }} className="mb-3">
            <Input
              value={technicianSearch}
              onChange={(e) => handleTechnicianSearch(e.target.value)}
              placeholder="Type at least 2 letters to search..."
            />
            {searchLoading && (
              <div className="text-muted small mt-1">Searching...</div>
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

          <Label>Site (auto-filled from Work Order)</Label>
          <Input
            value={selectedWOCenter || "Select a Work Order first"}
            disabled
            className="mb-3"
          />

          <h6 className="fw-semibold mb-3">Schedule</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Time</Label>
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
        toggle={() => setDetailModal(null)}
        centered
      >
        <ModalBody className="p-4">
          {detailModal && (
            <>
              <h5 className="mb-1">{detailModal.jobNumber}</h5>
              <p className="text-muted small mb-3">
                {detailModal.workOrderId?.title}
              </p>

              <div className="mb-2">
                <span className="text-muted small">Technician: </span>
                {detailModal.technicianId?.name}
              </div>
              <div className="mb-2">
                <span className="text-muted small">Site: </span>
                {detailModal.centerId?.title}
              </div>
              <div className="mb-2">
                <span className="text-muted small">Scheduled: </span>
                {dateFmt(detailModal.scheduledDate)} at{" "}
                {detailModal.scheduledTime}
              </div>
              <div className="mb-3">
                <span className="text-muted small">Remarks: </span>
                {detailModal.remarks || "—"}
              </div>

              <div className="text-muted small mb-2">Update Status</div>
              <div className="d-flex gap-2 flex-wrap">
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <Button
                    key={key}
                    size="sm"
                    color={detailModal.status === key ? "primary" : "light"}
                    disabled={updating || detailModal.status === key}
                    onClick={() => handleStatusChange(detailModal, key)}
                  >
                    {meta.label}
                  </Button>
                ))}
              </div>

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
