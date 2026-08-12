import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import {
  getItemMasters,
  updateItemMasterStatus,
  getItemTypes,
  getItemCategories,
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

const FILTERS = [
  { key: "all", label: "All items" },
  { key: "active", label: "Active" },
  { key: "discontinued", label: "Discontinued" },
];
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

const tableCustomStyles = {
  table: {
    style: {
      backgroundColor: "#fff",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f8f9fb",
      borderBottomWidth: "1px",
      borderBottomColor: "#edeff3",
      minHeight: "46px",
    },
  },
  headCells: {
    style: {
      fontSize: "11.5px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#667085",
    },
  },
  rows: {
    style: {
      minHeight: "58px",
      fontSize: "13.5px",
      color: "#101828",
      "&:not(:last-of-type)": {
        borderBottomColor: "#edeff3",
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8f9fb",
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

const ItemMasterList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ITEM_CREATE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "ITEM_EDIT", "WRITE");
  const canChangeStatus = hasPermission(
    "MASTERDATA",
    "ITEM_STATUS_CHANGE",
    "WRITE",
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [typeMap, setTypeMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    getItemTypes({})
      .then((res) => {
        const map = {};
        (res?.data || []).forEach((t) => (map[t._id] = t.name));
        setTypeMap(map);
      })
      .catch(() => {});

    getItemCategories({})
      .then((res) => {
        const map = {};
        (res?.data || []).forEach((c) => (map[c._id] = c.name));
        setCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = { page, limit, search };
        if (filter !== "all") params.status = filter;
        const res = await getItemMasters(params);
        if (cancelled) return;
        setItems(res?.data || []);
        setTotal(res?.pagination?.total || 0);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load items",
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
  }, [page, limit, search, filter, refreshFlag]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateItemMasterStatus(id, status);
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
    {
      name: "Item Code",
      width: "130px",
      cell: (row) =>
        row.itemCode ? (
          <span className="im-table-code">{row.itemCode}</span>
        ) : (
          <span className="im-table-sub">—</span>
        ),
    },
    {
      name: "Status",
      width: "130px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "Short Description",
      selector: (row) => row.itemName,
      sortable: true,
      cell: (row) => (
        <span className="im-table-primary-cell">{row.itemName}</span>
      ),
    },
    {
      name: "L1",
      selector: (row) => categoryMap[row.l1Category] || "—",
      width: "120px",
    },
    { name: "Brand", selector: (row) => row.brand || "—", width: "120px" },
    {
      name: "Item Type",
      selector: (row) => typeMap[row.itemTypeId] || "—",
      width: "140px",
    },
    {
      name: "Created At",
      selector: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
      width: "120px",
      cell: (row) => (
        <span className="im-table-sub">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "190px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          {canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row)}>
              <i className="bx bx-edit-alt"></i>
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
                onClick={() => handleStatusChange(row._id, "discontinued")}
              >
                Discontinue
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
    <div className="im-surface">
      <div className="im-toolbar-row">
        <div className="im-toolbar-title">
          {total} item{total === 1 ? "" : "s"}
        </div>
        {canCreate && (
          <Button color="primary" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Create Item
          </Button>
        )}
      </div>

      <div className="im-toolbar-row" style={{ marginTop: -6 }}>
        <div className="im-filter-pills-row mb-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`im-filter-pill ${filter === f.key ? "active" : ""}`}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="im-search-wrap mb-0">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="im-table-card">
        <DataTable
          columns={columns}
          data={items}
          progressPending={loading}
          progressComponent={<SkeletonRows />}
          highlightOnHover
          pointerOnHover
          customStyles={tableCustomStyles}
          pagination
          paginationServer
          paginationTotalRows={total}
          paginationDefaultPage={page}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newLimit, p) => {
            setLimit(newLimit);
            setPage(p);
          }}
          noDataComponent={
            <div className="im-empty-state">
              {/* <div className="im-empty-icon">
                <i className="bx bx-package"></i>
              </div> */}
              <h6>No items found</h6>
              <p>
                Try adjusting your search or filters, or create your first item.
              </p>
              {canCreate && (
                <Button color="primary" onClick={onAdd}>
                  <i className="bx bx-plus me-1"></i> Create Item
                </Button>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ItemMasterList;