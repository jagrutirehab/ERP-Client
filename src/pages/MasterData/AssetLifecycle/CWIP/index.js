import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import {
  getCWIPs,
  getApprovedRequestsForCWIP,
  createCWIP,
  markCWIPReady,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const StatusPill = ({ status }) => {
  const map = {
    in_progress: { label: "In Progress", cls: "status-draft" },
    ready_to_capitalize: { label: "Ready to Capitalize", cls: "status-active" },
    capitalized: { label: "Capitalized", cls: "status-active" },
  };
  const s = map[status] || map.in_progress;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const CWIP = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "CWIP", "WRITE");

  const [view, setView] = useState("list");
  const [cwips, setCwips] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (view !== "list") return;
    let cancelled = false;
    setLoading(true);
    getCWIPs({})
      .then((res) => {
        if (!cancelled) setCwips(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, refreshFlag]);

  const openSelectRequest = () => {
    setLoading(true);
    getApprovedRequestsForCWIP()
      .then((res) => setPendingRequests(res?.data || []))
      .catch(() => setPendingRequests([]))
      .finally(() => setLoading(false));
    setView("select-request");
  };

  const selectRequest = (request) => {
    setSelectedRequest(request);
    setExpectedCompletionDate("");
    setRemarks("");
    setView("form");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createCWIP({
        capitalizationRequestId: selectedRequest._id,
        expectedCompletionDate: expectedCompletionDate || undefined,
        remarks,
      });
      toast.success("CWIP record created successfully");
      setView("list");
      setSelectedRequest(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReady = async (id) => {
    try {
      await markCWIPReady(id, {});
      toast.success("Marked ready for Asset Capitalization");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't update.");
      }
    }
  };

  const columns = [
    { name: "CWIP #", selector: (row) => row.cwipNumber, sortable: true, width: "150px" },
    { name: "Item", selector: (row) => row.itemName },
    {
      name: "Total Cost",
      cell: (row) => <span className="uom-cell-primary">{money(row.totalCost)}</span>,
    },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    { name: "Status", width: "170px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Started",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.installationStartDate)}</span>,
    },
    {
      name: "Actions",
      right: true,
      cell: (row) =>
        row.status === "in_progress" && (
          <Button size="sm" color="success" onClick={() => handleMarkReady(row._id)}>
            Mark Installation Complete
          </Button>
        ),
    },
  ];

  if (view === "select-request") {
    return (
      <div className="uom-page">
        <div className="uom-list-header">
          <div>
            <h4>Select Capitalization Request</h4>
            <p>Choose an approved request to move into CWIP</p>
          </div>
          <Button color="light" onClick={() => setView("list")}>
            <i className="bx bx-arrow-back me-1"></i> Back
          </Button>
        </div>

        {loading && <div className="text-muted p-3">Loading...</div>}

        {!loading && pendingRequests.length === 0 && (
          <div className="uom-empty-state">
            <p className="uom-empty-title">Nothing pending</p>
            <p className="uom-empty-sub">All approved requests already have a CWIP record.</p>
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {pendingRequests.map((req) => (
            <div
              key={req._id}
              className="uom-table-card p-3"
              style={{ cursor: "pointer" }}
              onClick={() => selectRequest(req)}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{req.requestNumber}</div>
                  <div className="text-muted small">
                    {req.itemName} · Qty {req.quantity} · {req.centerId?.title}
                  </div>
                </div>
                <div className="fw-semibold">{money(req.totalCost)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "form" && selectedRequest) {
    return (
      <div className="uom-form-page">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h4 className="uom-form-title mb-0">Create CWIP Record</h4>
          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Create CWIP"}
          </Button>
        </div>
        <p className="text-muted mb-4">
          From Request: <strong>{selectedRequest.requestNumber}</strong>
        </p>

        <div className="uom-form-panel">
          <div className="uom-table-card p-3 mb-3">
            <div className="fw-semibold">{selectedRequest.itemName}</div>
            <div className="text-muted small">
              Qty {selectedRequest.quantity} · Total Cost {money(selectedRequest.totalCost)}
            </div>
          </div>

          <Label>Expected Completion Date (optional)</Label>
          <Input
            type="date"
            className="mb-3"
            value={expectedCompletionDate}
            onChange={(e) => setExpectedCompletionDate(e.target.value)}
          />

          <Label>Remarks</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="uom-form-footer d-flex justify-content-end gap-2 mt-3">
            <Button color="light" onClick={() => setView("list")} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create CWIP"}
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
          <h4>Capital Work in Progress</h4>
          <p>Cost held temporarily while assets are being installed/set up</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openSelectRequest}>
            <i className="bx bx-plus me-1"></i> Create
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={cwips}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No CWIP records yet</div>}
        />
      </div>
    </div>
  );
};

export default CWIP;