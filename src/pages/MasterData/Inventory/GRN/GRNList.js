import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { getGRNs } from "../../../../helpers/backend_helper";
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

const GRNList = ({ onAdd }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "GRN", "WRITE");

  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchGRNs = async () => {
      setLoading(true);
      try {
        const res = await getGRNs({ search });
        if (cancelled) return;
        setGrns(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load GRNs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGRNs();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const columns = [
    { name: "GRN Number", selector: (row) => row.grnNumber, sortable: true, width: "160px" },
    {
      name: "PO Number",
      cell: (row) => <span className="uom-cell-muted">{row.poId?.poNumber || "—"}</span>,
    },
    {
      name: "Vendor",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.poId?.vendorId?.tradeName || row.poId?.vendorId?.legalName || "—"}
        </span>
      ),
    },
    {
      name: "DI Reference",
      cell: (row) => (
        <span className="uom-cell-muted">{row.deliveryIntimationId?.intimationNumber || "—"}</span>
      ),
    },
    {
      name: "Received Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.receivedDate)}</span>,
    },
    {
      name: "Lines",
      width: "80px",
      cell: (row) => <span className="uom-cell-muted">{row.lineItems?.length || 0}</span>,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Goods Receipt Notes</h4>
          <p>Physical verification of items received against Purchase Orders</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search GRN number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create GRN
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={grns}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No GRNs found</p>
              <p className="uom-empty-sub">Create one from a received Delivery Intimation.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default GRNList;