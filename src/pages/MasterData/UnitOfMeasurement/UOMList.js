import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getUoms, deleteUom } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "./uom.scss";

const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: "#fff",
      borderBottom: "1px solid #edeff3",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#475569",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "14px",
      color: "#101828",
      "&:not(:last-of-type)": {
        borderBottomColor: "#edeff3",
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#fafbfc",
      borderBottomColor: "#edeff3",
      outline: "none",
    },
  },
  pagination: {
    style: {
      borderTopColor: "#edeff3",
      fontSize: "13px",
      color: "#667085",
    },
  },
};

const StatusPill = ({ status }) => (
  <span className={`uom-status-pill status-${status}`}>
    <span className="dot"></span> {status === "active" ? "Active" : "Inactive"}
  </span>
);

const UOMList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "UOM", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "UOM", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "UOM", "DELETE");
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUoms = async () => {
      setLoading(true);
      try {
        const res = await getUoms({ search });
        if (cancelled) return;
        setUoms(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load units. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUoms();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUom(deleteTarget._id);
      toast.success("Unit deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't delete unit. Please try again.",
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span className="uom-cell-primary">{row.name}</span>,
    },
    {
      name: "Symbol",
      selector: (row) => row.symbol,
      cell: (row) => <span className="uom-symbol-badge">{row.symbol}</span>,
    },
    {
      name: "Description",
      cell: (row) => (
        <span className="uom-cell-muted">{row.description || "—"}</span>
      ),
    },
    {
      name: "Status",
      width: "130px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Actions",
      width: "120px",
      right: true,
      cell: (row) => (
        <div className="uom-row-actions">
          {canEdit && (
            <button
              type="button"
              className="uom-icon-btn"
              title="Edit"
              onClick={() => onEdit(row)}
            >
              <i className="bx bx-edit-alt"></i>
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="uom-icon-btn is-danger"
              title="Delete"
              onClick={() => setDeleteTarget(row)}
            >
              <i className="bx bx-trash"></i>
            </button>
          )}
          {!canEdit && !canDelete && (
            <span className="text-muted small">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Unit of Measurements</h4>
          {/* <p>Manage measurement units used across your item catalog</p> */}
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add unit
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
          data={uoms}
          customStyles={tableCustomStyles}
          progressPending={loading}
          progressComponent={
            <div className="w-100 p-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="uom-skeleton mb-2"
                  style={{ height: 44 }}
                />
              ))}
            </div>
          }
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No units found</p>
              <p className="uom-empty-sub">
                Try adjusting your search, or add your first unit.
              </p>
            </div>
          }
        />
      </div>

      <Modal
        isOpen={!!deleteTarget}
        toggle={() => setDeleteTarget(null)}
        centered
      >
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this unit?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && (
              <>
                <strong>{deleteTarget.name}</strong> ({deleteTarget.symbol})
              </>
            )}{" "}
            will be permanently deleted. This cannot be undone.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <Button
              color="light"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
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

export default UOMList;
