import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getPMSchedules,
  createPMSchedule,
  updatePMSchedule,
  generateDueWorkOrders,
  getAllCenters,
  getFixedAssets,
  getTaskTemplates,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const FREQUENCY_UNITS = ["days", "weeks", "months", "years"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const StatusPill = ({ status }) => (
  <span
    className={`uom-status-pill ${status === "active" ? "status-active" : "status-draft"}`}
  >
    <span className="dot"></span> {status === "active" ? "Active" : "Paused"}
  </span>
);

const PMSchedule = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "PM_SCHEDULE", "WRITE");

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);
  const [assets, setAssets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [centerId, setCenterId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [frequencyValue, setFrequencyValue] = useState(3);
  const [frequencyUnit, setFrequencyUnit] = useState("months");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState("");
  const [taskTemplateId, setTaskTemplateId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(60);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [autoGenerateWorkOrders, setAutoGenerateWorkOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
    getTaskTemplates({})
      .then((res) => setTemplates(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPMSchedules({})
      .then((res) => {
        if (!cancelled) setSchedules(res?.data || []);
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
    setScheduleName("");
    setCenterId("");
    setAssetId("");
    setFrequencyValue(3);
    setFrequencyUnit("months");
    setPriority("medium");
    setStartDate("");
    setTaskTemplateId("");
    setTaskDescription("");
    setEstimatedDurationMinutes(60);
    setEstimatedCost(0);
    setLeadTimeDays(3);
    setNotifyDaysBefore(3);
    setAutoGenerateWorkOrders(true);
    setAssets([]);
    setModalOpen(true);
  };

  const handleCenterChange = (id) => {
    setCenterId(id);
    setAssetId("");
    if (!id) {
      setAssets([]);
      return;
    }
    getFixedAssets({ centerId: id, status: "active" })
      .then((res) => setAssets(res?.data || []))
      .catch(() => setAssets([]));
  };

  const handleTemplateChange = (id) => {
    setTaskTemplateId(id);
    const t = templates.find((tpl) => tpl._id === id);
    if (t) {
      setTaskDescription(t.description || t.templateName);
      setEstimatedDurationMinutes(t.estimatedDurationMinutes || 60);
      setEstimatedCost(t.estimatedCost || 0);
    }
  };

  const handleSubmit = async () => {
    if (!scheduleName.trim() || !centerId || !assetId || !startDate) {
      return toast.error("Fill in Schedule Name, Site, Asset, and Start Date");
    }
    setSubmitting(true);
    try {
      await createPMSchedule({
        scheduleName,
        centerId,
        assetId,
        frequencyValue: Number(frequencyValue),
        frequencyUnit,
        priority,
        startDate,
        taskTemplateId: taskTemplateId || undefined,
        taskDescription,
        estimatedDurationMinutes: Number(estimatedDurationMinutes),
        estimatedCost: Number(estimatedCost),
        leadTimeDays: Number(leadTimeDays),
        notifyDaysBefore: Number(notifyDaysBefore),
        autoGenerateWorkOrders,
      });
      toast.success("PM schedule created successfully");
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

  const handleToggleStatus = async (schedule) => {
    try {
      await updatePMSchedule(schedule._id, {
        status: schedule.status === "active" ? "paused" : "active",
      });
      toast.success("Schedule updated");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't update.",
        );
      }
    }
  };

  const handleGenerateDue = async () => {
    setGenerating(true);
    try {
      const res = await generateDueWorkOrders();
      toast.success(res?.message || "Due work orders generated");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't generate.",
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  const columns = [
    {
      name: "Schedule #",
      selector: (row) => row.scheduleNumber,
      sortable: true,
      width: "140px",
    },
    { name: "Name", selector: (row) => row.scheduleName },
    {
      name: "Asset",
      cell: (row) => (
        <span className="uom-cell-primary">
          {row.assetId?.assetName || "—"}
        </span>
      ),
    },
    {
      name: "Frequency",
      cell: (row) => (
        <span className="uom-cell-muted">
          Every {row.frequencyValue} {row.frequencyUnit}
        </span>
      ),
    },
    {
      name: "Next Due",
      cell: (row) => (
        <span className="uom-cell-muted">{dateFmt(row.nextDueDate)}</span>
      ),
    },
    {
      name: "Priority",
      width: "100px",
      cell: (row) => (
        <span className="text-capitalize small">{row.priority}</span>
      ),
    },
    {
      name: "Status",
      width: "110px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => handleToggleStatus(row)}>
          {row.status === "active" ? "Pause" : "Resume"}
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>PM Schedules</h4>
          <p>Set up recurring preventive maintenance</p>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button color="light" onClick={handleGenerateDue} disabled={generating}>
          <i className="bx bx-refresh me-1"></i>
          {generating ? "Generating..." : "Generate Due Work Orders"}
        </Button>
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> Create PM Schedule
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={schedules}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">No PM schedules yet</div>
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
          <h5 className="mb-1">Create PM Schedule</h5>
          <p className="text-muted small mb-3">
            Set up recurring preventive maintenance
          </p>

          <h6 className="fw-semibold mb-3">Asset Selection</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Site</Label>
              <Input
                type="select"
                value={centerId}
                onChange={(e) => handleCenterChange(e.target.value)}
              >
                <option value="">Select site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6} className="mb-3">
              <Label>Asset</Label>
              <Input
                type="select"
                value={assetId}
                disabled={!centerId}
                onChange={(e) => setAssetId(e.target.value)}
              >
                <option value="">
                  {!centerId ? "Select site first" : "Select asset"}
                </option>
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetName} ({a.assetTag})
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <h6 className="fw-semibold mb-3">Schedule Configuration</h6>
          <Label>Schedule Name</Label>
          <Input
            className="mb-3"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />

          <Row>
            <Col md={3} className="mb-3">
              <Label>Frequency Value</Label>
              <Input
                type="number"
                min={1}
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
              />
            </Col>
            <Col md={3} className="mb-3">
              <Label>Frequency Unit</Label>
              <Input
                type="select"
                value={frequencyUnit}
                onChange={(e) => setFrequencyUnit(e.target.value)}
              >
                {FREQUENCY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u[0].toUpperCase() + u.slice(1)}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={3} className="mb-3">
              <Label>Priority</Label>
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
            <Col md={3} className="mb-3">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
          </Row>

          <h6 className="fw-semibold mb-3">Task Details</h6>
          <Label>
            Task Template (Optional — auto-fills description & estimates)
          </Label>
          <Input
            type="select"
            className="mb-3"
            value={taskTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">None</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.templateName}
              </option>
            ))}
          </Input>

          <Label>Task Description</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-3"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <h6 className="fw-semibold mb-3">Assignment & Estimates</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Estimated Duration (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={estimatedDurationMinutes}
                onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Estimated Cost (₹)</Label>
              <Input
                type="number"
                min={0}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </Col>
          </Row>

          <h6 className="fw-semibold mb-3">Automation Settings</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Lead Time (days) — days before due date to prepare</Label>
              <Input
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Notification (days before)</Label>
              <Input
                type="number"
                min={0}
                value={notifyDaysBefore}
                onChange={(e) => setNotifyDaysBefore(e.target.value)}
              />
            </Col>
          </Row>

          <div className="form-check form-switch mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              checked={autoGenerateWorkOrders}
              onChange={(e) => setAutoGenerateWorkOrders(e.target.checked)}
              id="autoGenSwitch"
            />
            <label className="form-check-label" htmlFor="autoGenSwitch">
              Auto-generate work orders (recommended for PM automation)
            </label>
          </div>

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
              {submitting ? "Saving..." : "Create Schedule"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PMSchedule;
