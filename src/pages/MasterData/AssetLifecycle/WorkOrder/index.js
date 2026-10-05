import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getWorkOrders, updateWorkOrder } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const dateTimeFmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const STATUS_META = {
  pending: { label: "Pending", cls: "status-draft", icon: "bx-time-five", color: "#f79009" },
  in_progress: { label: "In Progress", cls: "status-active", icon: "bx-loader-circle", color: "#2e90fa" },
  completed: { label: "Completed", cls: "status-active", icon: "bx-check-circle", color: "#12b76a" },
  overdue: { label: "Overdue", cls: "status-blacklisted", icon: "bx-error-circle", color: "#f04438" },
};

const PRIORITY_META = {
  low: { label: "Low", color: "#667085" },
  medium: { label: "Medium", color: "#2e90fa" },
  high: { label: "High", color: "#f79009" },
  critical: { label: "Critical", color: "#f04438" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const SummaryCard = ({ label, value, sub, icon }) => (
  <div className="uom-table-card p-3 flex-fill">
    <div className="d-flex align-items-center gap-2 mb-1">
      <i className={`bx ${icon} text-primary fs-5`}></i>
      <span className="text-muted small">{label}</span>
    </div>
    <div className="fs-3 fw-bold">{value}</div>
    {sub && <div className="text-muted small">{sub}</div>}
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: "1px solid #f1f3f5" }}>
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: 34, height: 34, borderRadius: 8, background: "#f5f6fa", flexShrink: 0 }}
    >
      <i className={`bx ${icon} text-primary`}></i>
    </div>
    <div>
      <div className="text-muted" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div className="fw-semibold" style={{ fontSize: 14 }}>
        {value}
      </div>
    </div>
  </div>
);

const WorkOrder = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canUpdate = hasPermission("MASTERDATA", "WORK_ORDER", "WRITE");

  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, highPriority: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [detailModal, setDetailModal] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWorkOrders({})
      .then((res) => {
        if (cancelled) return;
        setWorkOrders(res?.data || []);
        setStats(res?.stats || { total: 0, pending: 0, highPriority: 0, overdue: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  const filtered = workOrders.filter(
    (w) =>
      w.workOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.assetId?.assetName?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStatusChange = async (workOrder, newStatus) => {
    setUpdating(true);
    try {
      const res = await updateWorkOrder(workOrder._id, { status: newStatus });
      toast.success("Work order updated");
      setDetailModal(res?.data || { ...workOrder, status: newStatus });
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't update.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { name: "Work Order #", selector: (row) => row.workOrderNumber, sortable: true, width: "160px" },
    {
      name: "Asset",
      cell: (row) => <span className="uom-cell-primary">{row.assetId?.assetName || "—"}</span>,
    },
    {
      name: "Type",
      width: "110px",
      cell: (row) => <span className="uom-cell-muted text-capitalize">{row.maintenanceType}</span>,
    },
    {
      name: "Priority",
      width: "100px",
      cell: (row) => (
        <span
          className={`uom-status-pill ${row.priority === "critical" || row.priority === "high" ? "status-blacklisted" : "status-active"}`}
        >
          <span className="dot"></span> {row.priority}
        </span>
      ),
    },
    {
      name: "Assigned To",
      cell: (row) => <span className="uom-cell-muted">{row.assignedTo?.name || "Unassigned"}</span>,
    },
    { name: "Status", width: "130px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Scheduled",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.scheduledDate)}</span>,
    },
    {
      name: "",
      width: "100px",
      right: true,
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
          <h4>Work Orders</h4>
          <p>Track and manage maintenance work order execution</p>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap">
        <SummaryCard icon="bx-list-ul" label="Total Work Orders" value={stats.total} sub="All work orders" />
        <SummaryCard icon="bx-time-five" label="Pending Orders" value={stats.pending} sub="Awaiting action" />
        <SummaryCard icon="bx-error" label="High Priority" value={stats.highPriority} sub="Critical attention" />
        <SummaryCard icon="bx-calendar-x" label="Overdue" value={stats.overdue} sub="Behind schedule" />
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search work orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={filtered}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No work orders found</p>
              <p className="uom-empty-sub">
                Work orders appear here after maintenance requests are approved.
              </p>
            </div>
          }
        />
      </div>

      {/* Detail Modal — polished */}
      <Modal isOpen={!!detailModal} toggle={() => setDetailModal(null)} centered size="md">
        <ModalBody className="p-0">
          {detailModal && (
            <>
              {/* Header strip */}
              <div className="p-4 pb-3" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{detailModal.title}</h5>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className="text-muted"
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          background: "#f5f6fa",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {detailModal.workOrderNumber}
                      </span>
                      <StatusPill status={detailModal.status} />
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Priority
                    </div>
                    <div
                      className="fw-bold text-capitalize"
                      style={{ color: PRIORITY_META[detailModal.priority]?.color, fontSize: 18 }}
                    >
                      {PRIORITY_META[detailModal.priority]?.label || detailModal.priority}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-4">
                <DetailRow
                  icon="bx-cog"
                  label="Asset"
                  value={`${detailModal.assetId?.assetName || "—"} (${detailModal.assetId?.assetTag || "—"})`}
                />
                <DetailRow
                  icon="bx-wrench"
                  label="Maintenance Type"
                  value={
                    <span className="text-capitalize">{detailModal.maintenanceType}</span>
                  }
                />
                <DetailRow icon="bx-map-pin" label="Site" value={detailModal.centerId?.title || "—"} />
                <DetailRow
                  icon="bx-user"
                  label="Assigned To"
                  value={detailModal.assignedTo?.name || "Unassigned"}
                />
                <DetailRow
                  icon="bx-calendar"
                  label="Scheduled Date"
                  value={dateFmt(detailModal.scheduledDate)}
                />
                {detailModal.completedAt && (
                  <DetailRow
                    icon="bx-check-double"
                    label="Completed At"
                    value={dateTimeFmt(detailModal.completedAt)}
                  />
                )}
                <DetailRow icon="bx-note" label="Remarks" value={detailModal.remarks || "—"} />
              </div>

              {/* Status changer */}
              {canUpdate && (
                <div className="px-4 py-3 mt-2" style={{ background: "#fafbfc", borderTop: "1px solid #f1f3f5" }}>
                  <div className="text-muted mb-2" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
                    UPDATE STATUS
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                      <Button
                        key={key}
                        size="sm"
                        outline={detailModal.status !== key}
                        style={
                          detailModal.status === key
                            ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                            : { borderColor: meta.color, color: meta.color }
                        }
                        disabled={updating || detailModal.status === key}
                        onClick={() => handleStatusChange(detailModal, key)}
                      >
                        <i className={`bx ${meta.icon} me-1`}></i>
                        {meta.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end p-3">
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

export default WorkOrder;