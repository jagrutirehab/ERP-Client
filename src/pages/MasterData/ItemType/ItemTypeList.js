import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Badge, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getItemTypes,
  deleteItemType,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "../shared/itemMasterForms.scss";

const SkeletonRows = () => (
  <div className="im-skeleton-wrap">
    {[1, 2, 3, 4, 5].map((i) => (
      <div className="im-skeleton-row" key={i}>
        <div className="im-skeleton-bar" style={{ width: 90 }}></div>
        <div className="im-skeleton-bar" style={{ width: 100 }}></div>
        <div className="im-skeleton-bar" style={{ flex: 1 }}></div>
        <div className="im-skeleton-bar" style={{ width: 100 }}></div>
        <div className="im-skeleton-bar" style={{ width: 90 }}></div>
        <div className="im-skeleton-bar" style={{ width: 110 }}></div>
        <div className="im-skeleton-bar" style={{ width: 90 }}></div>
        <div className="im-skeleton-bar" style={{ width: 130 }}></div>
      </div>
    ))}
  </div>
);

const ItemTypeList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ITEM_TYPE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "ITEM_TYPE", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "ITEM_TYPE", "DELETE");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await getItemTypes({ search });
        if (cancelled) return;
        setItems(res?.data || []);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load item types",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItemType(deleteTarget._id);
      toast.success("Item type deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't delete item type.",
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Sub Types",
      cell: (row) => (
        <div className="d-flex flex-wrap gap-1">
          {(row.subTypes || []).length === 0 && (
            <span className="text-muted small">—</span>
          )}
          {(row.subTypes || []).map((s) => (
            <Badge key={s._id} color="light" className="text-dark border">
              {s.name}
            </Badge>
          ))}
        </div>
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">Item Types</h5>
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add Item Type
          </Button>
        )}
      </div>

      <div className="im-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="im-table-card">
        <DataTable
          columns={columns}
          data={items}
          progressPending={loading}
          progressComponent={<SkeletonRows />}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="im-empty-state">
              <h6>No classification yet</h6>
              <p>
                Create item types and sub types to organize your catalog. Types
                group items; sub types refine them further.
              </p>
              {canCreate && (
                <Button color="primary" onClick={onAdd}>
                  <i className="bx bx-plus me-1"></i> Create first type
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this item type?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && <strong>{deleteTarget.name}</strong>} will be permanently deleted.
            {(deleteTarget?.subTypes || []).length > 0 && (
              <span className="d-block text-danger mt-2">
                This type has {deleteTarget.subTypes.length} sub type(s) which will also be affected.
              </span>
            )}
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

export default ItemTypeList;