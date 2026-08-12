import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Badge } from "reactstrap";
import { toast } from "react-toastify";
import {
  getItemTypes,
  updateItemTypeStatus,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "../shared/itemMasterForms.scss";

const StatusPill = ({ status }) => (
  <span
    className={`im-status-pill ${status === "active" ? "active" : "inactive"}`}
  >
    <span className="dot"></span> {status}
  </span>
);
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
  const canCreate = hasPermission("MASTERDATA", "ITEM_TYPE_CREATE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "ITEM_TYPE_EDIT", "WRITE");
  const canChangeStatus = hasPermission(
    "MASTERDATA",
    "ITEM_TYPE_STATUS_CHANGE",
    "WRITE",
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

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

  const handleStatusChange = async (id, status) => {
    try {
      await updateItemTypeStatus(id, status);
      toast.success("Status updated");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update status",
        );
      }
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
      name: "Status",
      width: "120px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Actions",
      width: "220px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          {canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row)}>
              <i className="bx bx-edit-alt"></i> Edit
            </Button>
          )}
          {canChangeStatus &&
            (row.status !== "active" ? (
              <Button
                size="sm"
                color="success"
                outline
                onClick={() => handleStatusChange(row._id, "active")}
              >
                Activate
              </Button>
            ) : (
              <Button
                size="sm"
                color="warning"
                outline
                onClick={() => handleStatusChange(row._id, "inactive")}
              >
                Deactivate
              </Button>
            ))}
          {!canEdit && !canChangeStatus && (
            <span className="text-muted small">—</span>
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
          {/* <p className="text-muted mb-0 small">
            Classify items — Fixed Asset, Consumable, Service, etc.
          </p> */}
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
              {/* <div className="im-empty-icon">
                <i className="bx bx-shapes"></i>
              </div> */}
              <h6>No classification yet</h6>
              <p>
                Create item types and sub types to organize your catalog. Types group items; sub
                types refine them further.
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
    </div>
  );
};

export default ItemTypeList;