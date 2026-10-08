import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Label, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getProcurementDashboard,
  setPODelayReason,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const STATUS_META = {
  not_started: { label: "Not started", bg: "#f2f4f7", color: "#475467" },
  partial: { label: "Partially received", bg: "#fffaeb", color: "#b54708" },
  completed: { label: "Completed", bg: "#ecfdf3", color: "#067647" },
  delayed: { label: "Delayed", bg: "#fef3f2", color: "#b42318" },
  short_closed: { label: "Short closed", bg: "#f2f4f7", color: "#475467" },
  cancelled: { label: "Cancelled", bg: "#fef3f2", color: "#b42318" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "delayed", label: "Delayed" },
  { key: "partial", label: "Partial" },
  { key: "not_started", label: "Not started" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

const StatusBadge = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.not_started;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

const StatCard = ({ label, value, sub }) => (
  <div className="uom-table-card p-3" style={{ flex: 1, minWidth: 170 }}>
    <div className="text-muted small">{label}</div>
    <div className="fs-4 fw-bold">{value}</div>
    {sub && <div className="text-muted small">{sub}</div>}
  </div>
);

const ProcurementDashboard = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canEdit = hasPermission("MASTERDATA", "PO", "WRITE");

  const [rows, setRows] = useState([]);
  const [closedRows, setClosedRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [reasonTarget, setReasonTarget] = useState(null);
  const [reasonText, setReasonText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProcurementDashboard()
      .then((res) => {
        if (cancelled) return;
        setRows(res?.data?.rows || []);
        setClosedRows(res?.data?.closedRows || []);
        setSummary(res?.data?.summary || null);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load dashboard.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const openReason = (row) => {
    setReasonTarget(row);
    setReasonText(row.delayReason || "");
  };

  const saveReason = async () => {
    if (!reasonText.trim()) {
      toast.error("Please write the reason for the delay");
      return;
    }
    setSaving(true);
    try {
      await setPODelayReason(reasonTarget._id, {
        delayReason: reasonText.trim(),
      });
      toast.success("Delay reason saved");
      setReasonTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't save reason",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const isClosedView = filter === "closed";
  const visibleRows = isClosedView
    ? closedRows
    : filter === "all"
      ? rows
      : rows.filter((r) => r.deliveryStatus === filter);

  const countFor = (key) => {
    if (key === "closed") return closedRows.length;
    if (key === "all") return rows.length;
    return rows.filter((r) => r.deliveryStatus === key).length;
  };

  const columns = [
    {
      name: "PO #",
      selector: (row) => row.poNumber,
      sortable: true,
      width: "150px",
    },
    {
      name: "Vendor",
      minWidth: "170px",
      cell: (row) => <span className="uom-cell-primary">{row.vendorName}</span>,
    },
    {
      name: "Expected Delivery",
      width: "150px",
      cell: (row) => (
        <span className="uom-cell-muted">
          {dateFmt(row.expectedDeliveryDate)}
        </span>
      ),
    },
    { name: "Ordered", selector: (row) => row.orderedQty, width: "95px" },
    { name: "Received", selector: (row) => row.receivedQty, width: "100px" },
    {
      name: isClosedView ? "Not received" : "Pending",
      width: "120px",
      cell: (row) => <span>{row.pendingQty}</span>,
    },
    {
      name: "Status",
      width: "190px",
      cell: (row) => (
        <div>
          <StatusBadge status={row.deliveryStatus} />
          {row.deliveryStatus === "delayed" && (
            <div className="small text-danger mt-1">
              {row.daysOverdue} day{row.daysOverdue === 1 ? "" : "s"} late
            </div>
          )}
        </div>
      ),
    },
    {
      name: isClosedView ? "Closed" : "Delay Reason",
      minWidth: "260px",
      cell: (row) => {
        if (isClosedView) {
          return (
            <div className="py-1">
              <div className="small">{row.closeReason || "—"}</div>
              <div className="small text-muted mt-1">
                Closed {dateFmt(row.closedAt)} · {money(row.releasedAmount)}{" "}
                budget released
              </div>
            </div>
          );
        }
        if (row.deliveryStatus !== "delayed")
          return <span className="uom-cell-muted">—</span>;
        return (
          <div className="py-1">
            {row.delayReason ? (
              <div className="small">{row.delayReason}</div>
            ) : (
              <div className="small text-danger">Reason not recorded</div>
            )}
            {canEdit && (
              <Button
                size="sm"
                color="light"
                className="mt-1"
                onClick={() => openReason(row)}
              >
                {row.delayReason ? "Edit reason" : "Add reason"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Procurement Dashboard</h4>
          <p>
            Ordered vs received vs pending for every approved purchase order
          </p>
        </div>
        <Button color="light" onClick={() => setRefreshFlag((f) => f + 1)}>
          <i className="bx bx-refresh me-1"></i> Refresh
        </Button>
      </div>

      {summary && (
        <div className="d-flex gap-3 flex-wrap mb-3">
          <StatCard
            label="Approved POs"
            value={summary.totalPOs}
            sub={money(summary.totalValue)}
          />
          <StatCard label="Ordered Qty" value={summary.orderedQty} />
          <StatCard label="Received Qty" value={summary.receivedQty} />
          <StatCard label="Pending Qty" value={summary.pendingQty} />
          <StatCard
            label="Delayed POs"
            value={summary.delayedCount}
            sub="Past expected date"
          />
          {filter === "closed" && (
            <StatCard
              label="Closed POs"
              value={summary.closedCount}
              sub={`${money(summary.releasedTotal)} budget released`}
            />
          )}
        </div>
      )}

      <div className="d-flex gap-2 flex-wrap mb-3">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            color={filter === f.key ? "dark" : "light"}
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({countFor(f.key)})
          </Button>
        ))}
      </div>

      {isClosedView && (
        <div className="text-muted small mb-2">
          Short-closed and cancelled POs. They are not counted in the totals
          above.
        </div>
      )}

      <div className="uom-table-card" style={{ overflowX: "auto" }}>
        <DataTable
          columns={columns}
          data={visibleRows}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">
                {isClosedView
                  ? "No closed purchase orders"
                  : "No purchase orders found"}
              </p>
              <p className="uom-empty-sub">
                {isClosedView
                  ? "Short-closed and cancelled POs will show up here."
                  : "Approved purchase orders will show up here."}
              </p>
            </div>
          }
        />
      </div>

      <Modal
        isOpen={!!reasonTarget}
        toggle={() => setReasonTarget(null)}
        centered
      >
        <ModalBody className="p-4">
          <h5 className="mb-1">Delay reason — {reasonTarget?.poNumber}</h5>
          <p className="text-muted small mb-3">
            {reasonTarget &&
              `${reasonTarget.daysOverdue} day${reasonTarget.daysOverdue === 1 ? "" : "s"} past the expected delivery date. Why is it delayed?`}
          </p>
          <Label>Reason</Label>
          <Input
            type="textarea"
            rows={3}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="e.g. Vendor stock shortage, transport strike, quality rejection"
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              color="light"
              onClick={() => setReasonTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={saveReason} disabled={saving}>
              {saving ? "Saving..." : "Save reason"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ProcurementDashboard;
