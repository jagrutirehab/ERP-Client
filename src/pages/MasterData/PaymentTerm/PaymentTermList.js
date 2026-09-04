import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import {
  getPaymentTerms,
  deletePaymentTerm,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "../UnitOfMeasurement/uom.scss";

const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: "#fff",
      borderBottom: "1px solid #edeff3",
      minHeight: "44px",
    },
  },
  headCells: {
    style: { fontSize: "13px", fontWeight: 600, color: "#475569" },
  },
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
  pagination: {
    style: { borderTopColor: "#edeff3", fontSize: "13px", color: "#667085" },
  },
};

const StatusPill = ({ status }) => (
  <span className={`uom-status-pill status-${status}`}>
    <span className="dot"></span> {status === "active" ? "Active" : "Inactive"}
  </span>
);

const PAYMENT_TYPE_LABELS = {
  advance: "Advance",
  net: "Net",
  cod: "Cash on Delivery",
  partial: "Partial",
};

const PaymentTermList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "PAYMENT_TERM_CREATE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "PAYMENT_TERM_EDIT", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "PAYMENT_TERM_DELETE", "WRITE");

  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchTerms = async () => {
      setLoading(true);
      try {
        const res = await getPaymentTerms({ search });
        if (cancelled) return;
        setTerms(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message || error?.message || "Couldn't load payment terms.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTerms();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const handleDelete = async (id) => {
    try {
      await deletePaymentTerm(id);
      toast.success("Payment term deleted successfully");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message || error?.message || "Couldn't delete payment term.",
        );
      }
    }
  };

  const columns = [
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      width: "140px",
      cell: (row) => <span className="uom-symbol-badge">{row.code}</span>,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      cell: (row) => <span className="uom-cell-primary">{row.description}</span>,
    },
    {
      name: "Type",
      cell: (row) => (
        <span className="uom-cell-muted text-capitalize">
          {PAYMENT_TYPE_LABELS[row.paymentType] || row.paymentType}
        </span>
      ),
    },
    {
      name: "Due Days",
      width: "110px",
      selector: (row) => row.dueDays,
    },
    {
      name: "Default",
      width: "100px",
      cell: (row) =>
        row.isDefault ? (
          <span className="uom-status-pill status-active">Yes</span>
        ) : (
          <span className="uom-cell-muted">No</span>
        ),
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Actions",
      width: "120px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          {canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row)}>
              <i className="bx bx-edit-alt"></i>
            </Button>
          )}
          {canDelete && (
            <Button size="sm" color="light" onClick={() => handleDelete(row._id)}>
              <i className="bx bx-trash text-danger"></i>
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
          <h4>Payment Terms</h4>
          <p>Manage payment terms and due-date rules used across vendors</p>
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add payment term
          </Button>
        )}
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={terms}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No payment terms found</p>
              <p className="uom-empty-sub">
                Try adjusting your search, or add your first payment term.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PaymentTermList;