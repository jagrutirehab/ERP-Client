import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { getGRNsForPutaway, getPutaways } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

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

const SummaryCard = ({ label, sub, value }) => (
  <div className="uom-table-card p-3" style={{ flex: 1 }}>
    <div className="text-muted small">{label}</div>
    <div className="fs-3 fw-bold">{value}</div>
    <div className="text-muted small">{sub}</div>
  </div>
);

const PutawayList = ({ onAdd }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "PUTAWAY", "WRITE");

  const [tab, setTab] = useState("pending"); // "pending" | "all"
  const [pendingGRNs, setPendingGRNs] = useState([]);
  const [putaways, setPutaways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [grnRes, pwRes] = await Promise.all([
          getGRNsForPutaway(),
          getPutaways({ search }),
        ]);
        if (cancelled) return;
        setPendingGRNs(grnRes?.data || []);
        setPutaways(pwRes?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const doneToday = putaways.filter((p) => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const pendingColumns = [
    { name: "GRN #", selector: (row) => row.grnNumber, sortable: true, width: "160px" },
    {
      name: "PO #",
      cell: (row) => <span className="uom-cell-muted">{row.poId?.poNumber || "—"}</span>,
    },
    {
      name: "Delivery Site",
      cell: (row) => <span className="uom-cell-muted">{row.poId?.deliverySiteId?.title || "—"}</span>,
    },
    {
      name: "Received Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.receivedDate)}</span>,
    },
    {
      name: "Actions",
      right: true,
      cell: (row) => (
        <Button size="sm" color="primary" onClick={() => onAdd(row)}>
          Putaway
        </Button>
      ),
    },
  ];

  const allColumns = [
    { name: "Putaway #", selector: (row) => row.putawayNumber, sortable: true, width: "160px" },
    {
      name: "Reference",
      cell: (row) => <span className="uom-cell-muted">{row.grnId?.grnNumber || "—"}</span>,
    },
    {
      name: "Location",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Items",
      width: "90px",
      cell: (row) => <span className="uom-cell-muted">{row.lineItems?.length || 0}</span>,
    },
    {
      name: "Created",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Putaway Management</h4>
          <p>Assign received items to storage locations</p>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4">
        <SummaryCard label="Pending GRNs" sub="To Action" value={pendingGRNs.length} />
        <SummaryCard label="Drafts" sub="—" value={0} />
        <SummaryCard label="Pending Appr" sub="—" value={0} />
        <SummaryCard label="Done Today" sub="Completed" value={doneToday} />
      </div>

      <div className="d-flex gap-2 mb-3">
        <Button
          color={tab === "pending" ? "primary" : "light"}
          onClick={() => setTab("pending")}
        >
          Pending GRNs
        </Button>
        <Button color={tab === "all" ? "primary" : "light"} onClick={() => setTab("all")}>
          All Records
        </Button>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search putaway..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        {tab === "pending" ? (
          <DataTable
            columns={pendingColumns}
            data={pendingGRNs}
            customStyles={tableCustomStyles}
            progressPending={loading}
            pagination
            highlightOnHover
            noDataComponent={
              <div className="uom-empty-state">
                <p className="uom-empty-title">No records found</p>
                <p className="uom-empty-sub">All GRNs have been put away.</p>
              </div>
            }
          />
        ) : (
          <DataTable
            columns={allColumns}
            data={putaways}
            customStyles={tableCustomStyles}
            progressPending={loading}
            pagination
            highlightOnHover
            noDataComponent={
              <div className="uom-empty-state">
                <p className="uom-empty-title">No records found</p>
              </div>
            }
          />
        )}
      </div>

      {!canCreate && (
        <div className="text-muted small mt-2">
          You don't have permission to create putaway records.
        </div>
      )}
    </div>
  );
};

export default PutawayList;