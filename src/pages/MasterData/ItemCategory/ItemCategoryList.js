import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import {
  getItemCategories,
  updateItemCategoryStatus,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "../shared/itemMasterForms.scss";

const LEVEL_LABEL = { 1: "L1", 2: "L2", 3: "L3", 4: "L4" };

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

const ItemCategoryList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ITEM_CATEGORY_CREATE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "ITEM_CATEGORY_EDIT", "WRITE");
  const canChangeStatus = hasPermission(
    "MASTERDATA",
    "ITEM_CATEGORY_STATUS_CHANGE",
    "WRITE",
  );

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await getItemCategories({ search });
        if (cancelled) return;
        setCategories(res?.data || []);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load categories",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateItemCategoryStatus(id, status);
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

  const parentName = (parentId) => {
    const parent = categories.find((c) => c._id === parentId);
    return parent ? parent.name : "—";
  };

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Code", selector: (row) => row.categoryCode || "—" },
    {
      name: "Level",
      width: "90px",
      cell: (row) => (
        <span className="badge bg-light text-dark border">
          {LEVEL_LABEL[row.level]}
        </span>
      ),
    },
    { name: "Parent", selector: (row) => parentName(row.parentCategoryId) },
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
          <h5 className="mb-1 fw-semibold">Item Categories</h5>
          <p className="text-muted mb-0 small">
            L1 to L4 hierarchy used for classifying items
          </p>
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add Category
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
          data={categories}
          progressPending={loading}
          progressComponent={<SkeletonRows />}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="py-5 text-muted text-center">
              <i
                className="bx bx-category-alt d-block mb-2"
                style={{ fontSize: 28 }}
              ></i>
              No categories found.
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ItemCategoryList;