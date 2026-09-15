import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { getPOs, approvePO } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

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

const StatusPill = ({ status }) => (
  <span className={`uom-status-pill status-${status === "approved" ? "active" : "inactive"}`}>
    <span className="dot"></span> {status === "approved" ? "Approved" : "Draft"}
  </span>
);

const PO_TYPE_LABELS = {
  pr_based: "PR-Based",
  direct: "Direct",
  contract_based: "Contract-Based",
};

const POList = ({ onAdd, onOpen }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "PO", "WRITE");
  const canApprove = hasPermission("MASTERDATA", "PO", "DELETE");

  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchPOs = async () => {
      setLoading(true);
      try {
        const res = await getPOs({ search });
        if (cancelled) return;
        setPos(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load POs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPOs();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const handleApprove = async (id) => {
    try {
      await approvePO(id);
      toast.success("PO approved successfully");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't approve PO.");
      }
    }
  };

  const columns = [
    { name: "PO Number", selector: (row) => row.poNumber, sortable: true, width: "160px" },
    {
      name: "Type",
      width: "130px",
      cell: (row) => <span className="uom-cell-muted">{PO_TYPE_LABELS[row.poType]}</span>,
    },
    {
      name: "Vendor",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.vendorId?.tradeName || row.vendorId?.legalName || "—"}
        </span>
      ),
    },
    {
      name: "Net Payable",
      cell: (row) => <span className="uom-cell-primary">{money(row.netPayable)}</span>,
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
        {
      name: "Actions",
      width: "180px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" color="light" onClick={() => onOpen(row)}>
            <i className="bx bx-show"></i>
          </Button>
          {row.status === "draft" && canApprove && (
            <Button size="sm" color="success" onClick={() => handleApprove(row._id)}>
              Approve
            </Button>
          )}
        </div>
      ),
    },  
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Purchase Orders</h4>
          <p>Official orders issued to vendors — PR-based, direct, or contract-based</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search PO number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create PO
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={pos}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No purchase orders found</p>
              <p className="uom-empty-sub">Create a PO from a closed RFQ, or directly.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default POList;