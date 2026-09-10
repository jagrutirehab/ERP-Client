import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label } from "reactstrap";
import { toast } from "react-toastify";
import {
  getBudgets,
  deleteBudget,
  submitBudget,
  approveBudget,
  rejectBudget,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const tableCustomStyles = {
  headRow: {
    style: { backgroundColor: "#fff", borderBottom: "1px solid #edeff3", minHeight: "44px" },
  },
  headCells: { style: { fontSize: "13px", fontWeight: 600, color: "#475569" } },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "14px",
      color: "#101828",
      "&:not(:last-of-type)": { borderBottomColor: "#edeff3" },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#fafbfc",
      borderBottomColor: "#edeff3",
      outline: "none",
    },
  },
  pagination: { style: { borderTopColor: "#edeff3", fontSize: "13px", color: "#667085" } },
};

const StatusPill = ({ status }) => {
  const cls =
    status === "approved"
      ? "status-active"
      : status === "rejected"
        ? "status-blacklisted"
        : status === "submitted"
          ? "status-draft"
          : "status-inactive";
  return (
    <span className={`uom-status-pill ${cls}`}>
      <span className="dot"></span> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const BudgetList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "BUDGET", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "BUDGET", "WRITE");
  const canApprove = hasPermission("MASTERDATA", "BUDGET", "DELETE");
  const canDelete = hasPermission("MASTERDATA", "BUDGET", "DELETE");

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [approveTarget, setApproveTarget] = useState(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState("");
  const [approving, setApproving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const params = { search };
        if (filter !== "all") params.status = filter;
        const res = await getBudgets(params);
        if (cancelled) return;
        setBudgets(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load budgets.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBudgets();
    return () => {
      cancelled = true;
    };
  }, [search, filter, refreshFlag]);

  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.requestedAmount || 0), 0);
  const totalApproved = budgets
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + (b.approvedAmount || 0), 0);

  const handleSubmitForReview = async (id) => {
    try {
      await submitBudget(id);
      toast.success("Budget submitted for review");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't submit budget.");
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBudget(deleteTarget._id);
      toast.success("Budget deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't delete budget.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const openApprove = (row) => {
    setApproveTarget(row);
    setApprovedAmountInput(String(row.requestedAmount || ""));
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      await approveBudget(approveTarget._id, Number(approvedAmountInput) || 0);
      toast.success("Budget approved successfully");
      setApproveTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't approve budget.");
      }
    } finally {
      setApproving(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReasonInput.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setRejecting(true);
    try {
      await rejectBudget(rejectTarget._id, rejectReasonInput.trim());
      toast.success("Budget rejected");
      setRejectTarget(null);
      setRejectReasonInput("");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't reject budget.");
      }
    } finally {
      setRejecting(false);
    }
  };

  const columns = [
    { name: "Fiscal Year", selector: (row) => row.fiscalYear, sortable: true, width: "120px" },
    {
      name: "Scope",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.budgetType === "global" ? "Global" : row.departmentId?.name || "—"}
        </span>
      ),
    },
    {
      name: "Budget Head",
      cell: (row) => <span className="uom-cell-muted">{row.departmentBudgetHeadId?.name || "—"}</span>,
    },
    {
      name: "Requested",
      cell: (row) => <span className="uom-cell-primary">{money(row.requestedAmount)}</span>,
    },
    {
      name: "Approved",
      cell: (row) =>
        row.status === "approved" ? (
          <span className="uom-status-pill status-active">{money(row.approvedAmount)}</span>
        ) : (
          <span className="uom-cell-muted">—</span>
        ),
    },
    {
      name: "Status",
      width: "140px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Actions",
      width: "220px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2 flex-wrap justify-content-end">
          {row.status === "draft" && canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row)}>
              <i className="bx bx-edit-alt"></i>
            </Button>
          )}
          {row.status === "draft" && canEdit && (
            <Button size="sm" color="primary" onClick={() => handleSubmitForReview(row._id)}>
              Submit
            </Button>
          )}
          {row.status === "submitted" && canApprove && (
            <>
              <Button size="sm" color="success" onClick={() => openApprove(row)}>
                Approve
              </Button>
              <Button size="sm" color="danger" outline onClick={() => setRejectTarget(row)}>
                Reject
              </Button>
            </>
          )}
                    {canDelete && (
            <Button size="sm" color="light" onClick={() => setDeleteTarget(row)}>
              <i className="bx bx-trash text-danger"></i>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex gap-3 flex-wrap mb-3">
        <div className="uom-table-card p-3" style={{ flex: 1, minWidth: 220 }}>
          <div className="text-muted small">Total Budgeted</div>
          <div className="fs-4 fw-bold">{money(totalBudgeted)}</div>
          <div className="text-muted small">Requested across listed budgets</div>
        </div>
        <div className="uom-table-card p-3" style={{ flex: 1, minWidth: 220 }}>
          <div className="text-muted small">Total Approved</div>
          <div className="fs-4 fw-bold">{money(totalApproved)}</div>
          <div className="text-muted small">Sanctioned to date</div>
        </div>
      </div>

      <div className="im-filter-pills-row mb-3">
        {[
          { key: "all", label: "All" },
          { key: "draft", label: "Draft" },
          { key: "submitted", label: "Submitted" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            className={`im-filter-pill ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search by fiscal year, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create Budget
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={budgets}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No budgets found</p>
              <p className="uom-empty-sub">Try adjusting your search, or create your first budget.</p>
            </div>
          }
        />
      </div>

      {/* Delete confirmation */}
            <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this budget?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && <strong>{deleteTarget.fiscalYear}</strong>} will be permanently deleted.
            {deleteTarget?.status === "approved" && (
              <span className="d-block text-danger mt-2">
                ⚠️ This budget is already approved and may be linked to active PRs/POs. Deleting it can
                affect procurement records.
              </span>
            )}
          </p>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Approve modal */}
      <Modal isOpen={!!approveTarget} toggle={() => setApproveTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-3">Approve Budget</h5>
          <p className="text-muted mb-2">
            Requested: <strong>{money(approveTarget?.requestedAmount)}</strong>
          </p>
          <Label>Approved Amount</Label>
          <Input
            type="number"
            min={0}
            value={approvedAmountInput}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setApprovedAmountInput(e.target.value)}
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setApproveTarget(null)} disabled={approving}>
              Cancel
            </Button>
            <Button color="success" onClick={confirmApprove} disabled={approving}>
              {approving ? "Approving..." : "Approve"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Reject modal */}
      <Modal isOpen={!!rejectTarget} toggle={() => setRejectTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-3">Reject Budget</h5>
          <Label>Reason for rejection</Label>
          <Input
            type="textarea"
            rows={3}
            value={rejectReasonInput}
            onChange={(e) => setRejectReasonInput(e.target.value)}
            placeholder="Explain why this budget is being rejected"
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setRejectTarget(null)} disabled={rejecting}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmReject} disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default BudgetList;