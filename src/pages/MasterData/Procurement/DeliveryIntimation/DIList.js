import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { getDIs, markDIReceived } from "../../../../helpers/backend_helper";
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

const StatusPill = ({ status }) => (
  <span className={`uom-status-pill ${status === "received" ? "status-active" : "status-inactive"}`}>
    <span className="dot"></span> {status === "received" ? "Received" : "Pending"}
  </span>
);

const DIList = ({ onAdd }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "DELIVERY_INTIMATION", "WRITE");
  const canMarkReceived = hasPermission("MASTERDATA", "DELIVERY_INTIMATION", "WRITE");

  const [dis, setDis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchDIs = async () => {
      setLoading(true);
      try {
        const res = await getDIs({ search });
        if (cancelled) return;
        setDis(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load DIs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDIs();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const handleMarkReceived = async (id) => {
    try {
      await markDIReceived(id);
      toast.success("Marked as received");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't update.");
      }
    }
  };

  const columns = [
    { name: "DI Number", selector: (row) => row.intimationNumber, sortable: true, width: "160px" },
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
      name: "Invoice #",
      cell: (row) => <span className="uom-cell-muted">{row.invoiceNumber}</span>,
    },
    {
      name: "Expected Delivery",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.expectedDeliveryDate)}</span>,
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Actions",
      width: "160px",
      right: true,
      cell: (row) =>
        row.status === "pending" && canMarkReceived ? (
          <Button size="sm" color="success" onClick={() => handleMarkReceived(row._id)}>
            Mark Received
          </Button>
        ) : (
          <span className="text-muted small">—</span>
        ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Delivery Intimations</h4>
          <p>Vendor advance notices before goods arrive</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search DI number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create DI
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={dis}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No delivery intimations found</p>
              <p className="uom-empty-sub">Create one from an approved Purchase Order.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DIList;