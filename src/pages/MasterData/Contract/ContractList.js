import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getContracts, deleteContract } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
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

const StatusPill = ({ status }) => {
  const cls = status === "active" ? "status-active" : status === "expired" ? "status-inactive" : "status-blacklisted";
  return (
    <span className={`uom-status-pill ${cls}`}>
      <span className="dot"></span> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ContractList = ({ onAdd, onEdit,onView}) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "CONTRACT", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "CONTRACT", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "CONTRACT", "DELETE");

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await getContracts({ search });
        if (cancelled) return;
        setContracts(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load contracts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchContracts();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContract(deleteTarget._id);
      toast.success("Contract deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't delete contract.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { name: "Contract ID", selector: (row) => row.contractId, sortable: true, width: "140px" },
    {
      name: "Title",
      cell: (row) => <span className="uom-cell-primary">{row.title}</span>,
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
      name: "Value",
      cell: (row) => <span className="uom-cell-primary">{money(row.contractValue)}</span>,
    },
    {
      name: "End Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.endDate)}</span>,
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
        {
      name: "Actions",
      width: "150px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" color="light" onClick={() => onView(row)}>
            <i className="bx bx-show"></i>
          </Button>
          {canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row)}>
              <i className="bx bx-edit-alt"></i>
            </Button>
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
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Contract Management</h4>
          <p>Vendor contracts — service, supply, maintenance, lease and more</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search contract ID, number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create Contract
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={contracts}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No contracts found</p>
              <p className="uom-empty-sub">Create your first vendor contract.</p>
            </div>
          }
        />
      </div>

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this contract?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && <strong>{deleteTarget.contractId}</strong>} will be permanently deleted.
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
    </div>
  );
};

export default ContractList;