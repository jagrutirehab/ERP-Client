import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { getAuditLogs } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const dateTimeFmt = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const MODULES = [
  { value: "", label: "All modules" },
  { value: "BUDGET", label: "Budget" },
  { value: "PR", label: "Purchase Requisition" },
  { value: "RFQ", label: "RFQ" },
  { value: "PO", label: "Purchase Order" },
  { value: "DI", label: "Delivery Intimation" },
  { value: "GRN", label: "GRN" },
  { value: "VENDOR", label: "Vendor" },
];

const MODULE_LABEL = MODULES.reduce((acc, m) => ({ ...acc, [m.value]: m.label }), {});

const ACTIONS = [
  { value: "", label: "All actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "submit", label: "Submit" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "cancel", label: "Cancel" },
  { value: "short_close", label: "Short close" },
  { value: "receive", label: "Receive" },
];

const ACTION_STYLE = {
  create: { bg: "#ecfdf3", color: "#067647" },
  update: { bg: "#eef2ff", color: "#4338ca" },
  delete: { bg: "#fef3f2", color: "#b42318" },
  submit: { bg: "#eef2ff", color: "#4338ca" },
  approve: { bg: "#ecfdf3", color: "#067647" },
  reject: { bg: "#fef3f2", color: "#b42318" },
  cancel: { bg: "#fef3f2", color: "#b42318" },
  short_close: { bg: "#f2f4f7", color: "#475467" },
  receive: { bg: "#ecfdf3", color: "#067647" },
};

const ActionPill = ({ action }) => {
  const s = ACTION_STYLE[action] || { bg: "#f2f4f7", color: "#475467" };
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
        textTransform: "capitalize",
      }}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
};

const show = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

// Opens under a row: what exactly changed, plus any extra facts (amounts, reasons)
const Details = ({ data }) => {
  const changes = data.changes ? Object.entries(data.changes) : [];
  const meta = data.metadata ? Object.entries(data.metadata) : [];
  return (
    <div className="p-3" style={{ background: "#fafbfc" }}>
      {changes.length > 0 && (
        <table className="table table-sm mb-3" style={{ maxWidth: 640 }}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {changes.map(([field, v]) => (
              <tr key={field}>
                <td className="text-capitalize">{field.replace(/([A-Z])/g, " $1")}</td>
                <td className="text-muted">{show(v?.from)}</td>
                <td className="fw-semibold">{show(v?.to)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {meta.length > 0 && (
        <div className="d-flex flex-wrap gap-4">
          {meta.map(([k, v]) => (
            <div key={k}>
              <div className="text-muted small text-capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
              <div className="fw-semibold">{show(v)}</div>
            </div>
          ))}
        </div>
      )}
      {changes.length === 0 && meta.length === 0 && (
        <div className="text-muted small">No extra details were recorded for this entry.</div>
      )}
    </div>
  );
};

const AuditLogs = () => {
  const handleAuthError = useAuthError();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  // wait for the user to stop typing before asking the server
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAuditLogs({
      page,
      limit: perPage,
      search,
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res?.data || []);
        setTotal(res?.pagination?.total || 0);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load audit logs.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, search, moduleFilter, actionFilter, from, to, refreshFlag]);

  const resetFilters = () => {
    setModuleFilter("");
    setActionFilter("");
    setFrom("");
    setTo("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const columns = [
    {
      name: "When",
      width: "160px",
      cell: (row) => <span className="uom-cell-muted">{dateTimeFmt(row.createdAt)}</span>,
    },
    {
      name: "Module",
      width: "170px",
      cell: (row) => <span className="uom-cell-muted">{MODULE_LABEL[row.module] || row.module}</span>,
    },
    {
      name: "Record",
      minWidth: "190px",
      cell: (row) => <span className="uom-cell-primary">{row.entityNumber || "—"}</span>,
    },
    {
      name: "Action",
      width: "130px",
      cell: (row) => <ActionPill action={row.action} />,
    },
    {
      name: "What happened",
      minWidth: "300px",
      cell: (row) => <span className="small">{row.summary || "—"}</span>,
    },
    {
      name: "Done by",
      width: "150px",
      cell: (row) => (
        <span className="uom-cell-muted">{row.performedBy?.name || row.performedByName || "—"}</span>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Audit Logs</h4>
          <p>Who did what, to which record, and when. Entries cannot be edited or deleted.</p>
        </div>
        <Button color="light" onClick={() => setRefreshFlag((f) => f + 1)}>
          <i className="bx bx-refresh me-1"></i> Refresh
        </Button>
      </div>

      <div className="d-flex gap-2 flex-wrap mb-3 align-items-end">
        <div className="uom-search-wrap mb-0" style={{ maxWidth: 260 }}>
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search record or text..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Input
          type="select"
          style={{ maxWidth: 200 }}
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
        >
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Input>
        <Input
          type="select"
          style={{ maxWidth: 160 }}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </Input>
        <div>
          <div className="text-muted small">From</div>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <div className="text-muted small">To</div>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button color="light" onClick={resetFilters}>
          Clear
        </Button>
      </div>

      <div className="uom-table-card" style={{ overflowX: "auto" }}>
        <DataTable
          columns={columns}
          data={rows}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={total}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[25, 50, 100]}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          expandableRows
          expandableRowsComponent={Details}
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No audit entries found</p>
              <p className="uom-empty-sub">Actions are recorded here as people create, approve, change or receive things.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AuditLogs;