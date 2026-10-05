import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getRFQs, deleteRFQ } from "../../../../helpers/backend_helper";
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

const StatusPill = ({ status }) => (
  <span className={`uom-status-pill status-${status === "closed" ? "active" : "inactive"}`}>
    <span className="dot"></span> {status === "closed" ? "Closed" : "Draft"}
  </span>
);

const RFQList = ({ onAdd, onOpen }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "RFQ", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "RFQ", "DELETE");

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchRFQs = async () => {
      setLoading(true);
      try {
        const res = await getRFQs({ search });
        if (cancelled) return;
        setRfqs(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load RFQs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRFQs();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRFQ(deleteTarget._id);
      toast.success("RFQ deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't delete RFQ.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { name: "RFQ Number", selector: (row) => row.rfqNumber, sortable: true, width: "160px" },
    {
      name: "PR Reference",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.prId?.prNumber} — {row.prId?.prTitle}
        </span>
      ),
    },
    {
      name: "Vendors",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.vendorQuotes?.length || 0} vendor(s)
        </span>
      ),
    },
    {
      name: "Quotes Received",
      cell: (row) => {
        const received = (row.vendorQuotes || []).filter((vq) => vq.quotedAt).length;
        return (
          <span className="uom-cell-muted">
            {received} / {row.vendorQuotes?.length || 0}
          </span>
        );
      },
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
          <Button size="sm" color="light" onClick={() => onOpen(row)}>
            <i className="bx bx-show"></i>
          </Button>
          {canDelete && row.status === "draft" && (
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
          <h4>Request for Quotation (RFQ)</h4>
          <p>Send requirements to vendors and record their quotes for comparison</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search RFQ number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create RFQ
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={rfqs}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No RFQs found</p>
              <p className="uom-empty-sub">Create an RFQ from an approved Purchase Requisition.</p>
            </div>
          }
        />
      </div>

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this RFQ?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && <strong>{deleteTarget.rfqNumber}</strong>} will be permanently deleted.
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

export default RFQList;