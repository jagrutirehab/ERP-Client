import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import {
  getMaterialReturns,
  getIssuesForReturn,
  createMaterialReturn,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const MaterialReturn = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "MATERIAL_RETURN", "WRITE");

  const [view, setView] = useState("list");
  const [returns, setReturns] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [returnReason, setReturnReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [returnQtys, setReturnQtys] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (view !== "list") return;
    let cancelled = false;
    setLoading(true);
    getMaterialReturns()
      .then((res) => {
        if (!cancelled) setReturns(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, refreshFlag]);

  const openSelectIssue = () => {
    setLoading(true);
    getIssuesForReturn()
      .then((res) => setIssues(res?.data || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
    setView("select-issue");
  };

  const selectIssue = (issue) => {
    setSelectedIssue(issue);
    const initial = {};
    issue.returnableLines.forEach((li) => {
      initial[li.itemName] = li.remaining;
    });
    setReturnQtys(initial);
    setReturnReason("");
    setRemarks("");
    setView("form");
  };

  const handleSubmit = async () => {
    const lineItems = Object.entries(returnQtys)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([itemName, qty]) => ({ itemName, returnQty: Number(qty) }));

    if (lineItems.length === 0) return toast.error("Enter a return quantity for at least one item");

    setSubmitting(true);
    try {
      await createMaterialReturn({
        materialIssueId: selectedIssue._id,
        returnReason,
        remarks,
        lineItems,
      });
      toast.success("Material return created successfully");
      setView("list");
      setSelectedIssue(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const listColumns = [
    { name: "Return #", selector: (row) => row.returnNumber, sortable: true, width: "150px" },
    {
      name: "From Issue",
      cell: (row) => <span className="uom-cell-muted">{row.materialIssueId?.issueNumber || "—"}</span>,
    },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Location",
      cell: (row) => <span className="uom-cell-muted">{row.storageLocationId?.name || "—"}</span>,
    },
    {
      name: "Items",
      width: "80px",
      cell: (row) => <span className="uom-cell-muted">{row.lineItems?.length || 0}</span>,
    },
    { name: "Reason", cell: (row) => <span className="small text-muted">{row.returnReason || "—"}</span> },
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
  ];

  if (view === "select-issue") {
    return (
      <div className="uom-page">
        <div className="uom-list-header">
          <div>
            <h4>Select Material Issue</h4>
            <p>Choose the issue you're returning material from</p>
          </div>
          <Button color="light" onClick={() => setView("list")}>
            <i className="bx bx-arrow-back me-1"></i> Back
          </Button>
        </div>

        {loading && <div className="text-muted p-3">Loading...</div>}

        {!loading && issues.length === 0 && (
          <div className="uom-empty-state">
            <p className="uom-empty-title">Nothing to return</p>
            <p className="uom-empty-sub">All issued material has already been fully returned.</p>
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="uom-table-card p-3"
              style={{ cursor: "pointer" }}
              onClick={() => selectIssue(issue)}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{issue.issueNumber}</div>
                  <div className="text-muted small">
                    {issue.centerId?.title} · {issue.departmentId?.name || "No department"}
                  </div>
                </div>
                <div className="text-muted small">{issue.returnableLines.length} item(s) returnable</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "form" && selectedIssue) {
    return (
      <div className="uom-form-page">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h4 className="uom-form-title mb-0">Create Material Return</h4>
          <Button color="success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Create Return"}
          </Button>
        </div>
        <p className="text-muted mb-4">
          From Issue: <strong>{selectedIssue.issueNumber}</strong>
        </p>

        <div className="uom-form-panel">
          <h6 className="fw-semibold mb-3">Items to Return</h6>
          {selectedIssue.returnableLines.map((li) => (
            <div key={li.itemName} className="uom-table-card p-3 mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{li.itemName}</div>
                  <div className="text-muted small">
                    Issued: {li.issuedQty} · Already Returned: {li.alreadyReturned} · Returnable:{" "}
                    {li.remaining}
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={li.remaining}
                  style={{ width: 120 }}
                  value={returnQtys[li.itemName] ?? 0}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setReturnQtys((prev) => ({ ...prev, [li.itemName]: e.target.value }))
                  }
                />
              </div>
            </div>
          ))}

          <Label className="mt-3">Return Reason</Label>
          <Input
            className="mb-3"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="e.g. Unused, project cancelled"
          />

          <Label>Remarks</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="uom-form-footer d-flex justify-content-end gap-2 mt-3">
            <Button color="light" onClick={() => setView("list")} disabled={submitting}>
              Cancel
            </Button>
            <Button color="success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create Return"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Material Returns</h4>
          <p>Return materials from an existing issue</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openSelectIssue}>
            <i className="bx bx-plus me-1"></i> Create
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={listColumns}
          data={returns}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No material returns yet</div>}
        />
      </div>
    </div>
  );
};

export default MaterialReturn;