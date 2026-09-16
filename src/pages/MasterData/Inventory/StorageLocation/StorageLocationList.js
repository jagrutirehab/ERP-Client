    import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getStorageLocations, deleteStorageLocation } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const StorageLocationList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "STORAGE_LOCATION", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "STORAGE_LOCATION", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "STORAGE_LOCATION", "DELETE");

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await getStorageLocations({ search });
        if (cancelled) return;
        setLocations(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStorageLocation(deleteTarget._id);
      toast.success("Storage location deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't delete.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Code", selector: (row) => row.code, sortable: true, width: "120px" },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Status",
      width: "100px",
      cell: (row) => (
        <span className={`uom-status-pill ${row.status === "active" ? "status-active" : "status-inactive"}`}>
          <span className="dot"></span> {row.status}
        </span>
      ),
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
          <h4>Storage Locations</h4>
          <p>Racks and bins within each center, used for putaway</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add Location
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={locations}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No storage locations found</p>
            </div>
          }
        />
      </div>

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this location?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && <strong>{deleteTarget.name}</strong>} will be permanently deleted.
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

export default StorageLocationList;