import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getItemMasters,
  deleteItemMaster,
  getItemTypes,
  getItemCategories,
  getUoms,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import ImportItemsModal from "./ImportItemsModal";
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

const OverviewField = ({ label, value }) => (
  <div className="im-overview-field">
    <div className="im-overview-label">{label}</div>
    <div className="im-overview-value">{value ?? "—"}</div>
  </div>
);

const OverviewSection = ({ icon, title, children }) => (
  <div className="im-overview-section">
    <div className="im-overview-section-title">
      <i className={`bx ${icon}`}></i> {title}
    </div>
    <div className="im-overview-grid">{children}</div>
  </div>
);

const ItemMasterList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ITEM_MASTER", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "ITEM_MASTER", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "ITEM_MASTER", "DELETE");
  const canImport = hasPermission("MASTERDATA", "ITEM_MASTER", "WRITE");
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
  const [uomMap, setUomMap] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [overviewItem, setOverviewItem] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

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

    getUoms({})
      .then((res) => {
        const map = {};
        (res?.data || []).forEach(
          (u) => (map[u._id] = `${u.name} (${u.symbol})`),
        );
        setUomMap(map);
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItemMaster(deleteTarget._id);
      toast.success("Item deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't delete item. Please try again.",
        );
      }
    } finally {
      setDeleting(false);
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
      width: "140px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="im-close-btn"
            style={{ width: 32, height: 32 }}
            title="Overview"
            onClick={() => setOverviewItem(row)}
          >
            <i className="bx bx-show" style={{ fontSize: 16 }}></i>
          </button>
          {canEdit && (
            <button
              type="button"
              className="im-close-btn"
              style={{ width: 32, height: 32 }}
              title="Edit"
              onClick={() => onEdit(row)}
            >
              <i className="bx bx-edit-alt" style={{ fontSize: 16 }}></i>
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="im-close-btn"
              style={{
                width: 32,
                height: 32,
                color: "#d92d20",
                borderColor: "#fecdca",
              }}
              title="Delete"
              onClick={() => setDeleteTarget(row)}
            >
              <i className="bx bx-trash" style={{ fontSize: 16 }}></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  const yn = (v) => (v ? "Yes" : "No");

  return (
    <div className="im-surface">
      <div className="im-toolbar-row">
        <div className="im-toolbar-title">
          {total} item{total === 1 ? "" : "s"}
        </div>
        <div className="d-flex gap-2">
          {canImport && (
            <Button color="primary" onClick={() => setImportOpen(true)}>
              <i className="bx bx-upload me-1"></i> Import Items
            </Button>
          )}
          {canCreate && (
            <Button color="primary" onClick={onAdd}>
              <i className="bx bx-plus me-1"></i> Create Item
            </Button>
          )}
        </div>
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

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        toggle={() => setDeleteTarget(null)}
        centered
      >
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this item?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && (
              <>
                <strong>{deleteTarget.itemName}</strong>{" "}
                {deleteTarget.itemCode && `(${deleteTarget.itemCode})`}
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

      {/* Overview modal — full detail, all 4 tabs worth of data */}
      <Modal
        isOpen={!!overviewItem}
        toggle={() => setOverviewItem(null)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          {overviewItem && (
            <>
              <div className="im-overview-header">
                <div className="im-overview-title">
                  <h5>{overviewItem.itemName}</h5>
                  <span className="im-table-code">
                    {overviewItem.itemCode || "—"}
                  </span>
                </div>
                <StatusPill status={overviewItem.status} />
              </div>

              <div className="im-overview-body">
                <OverviewSection icon="bx-sitemap" title="Categorization">
                  <OverviewField
                    label="Item Type"
                    value={typeMap[overviewItem.itemTypeId]}
                  />
                  <OverviewField
                    label="Sub Type"
                    value={overviewItem.subType}
                  />
                  <OverviewField
                    label="L1 Category"
                    value={categoryMap[overviewItem.l1Category]}
                  />
                  <OverviewField
                    label="L2 Category"
                    value={categoryMap[overviewItem.l2Category]}
                  />
                  <OverviewField
                    label="L3 Category"
                    value={categoryMap[overviewItem.l3Category]}
                  />
                  <OverviewField
                    label="L4 Category"
                    value={categoryMap[overviewItem.l4Category]}
                  />
                </OverviewSection>

                <OverviewSection
                  icon="bx-purchase-tag"
                  title="Description & Classification"
                >
                  <OverviewField label="Brand" value={overviewItem.brand} />
                  <OverviewField
                    label="UOM"
                    value={uomMap[overviewItem.uomId]}
                  />
                  <OverviewField
                    label="Base Price"
                    value={`₹${overviewItem.basePrice ?? 0}`}
                  />
                  <OverviewField
                    label="Parent Item"
                    value={
                      overviewItem.parentItemId ? "Has parent" : "Standalone"
                    }
                  />
                  <OverviewField
                    label="Created At"
                    value={
                      overviewItem.createdAt
                        ? new Date(overviewItem.createdAt).toLocaleDateString()
                        : "—"
                    }
                  />
                  <OverviewField
                    label="Updated At"
                    value={
                      overviewItem.updatedAt
                        ? new Date(overviewItem.updatedAt).toLocaleDateString()
                        : "—"
                    }
                  />
                </OverviewSection>

                {overviewItem.longDescription && (
                  <div className="im-overview-desc-block">
                    <div className="im-overview-label mb-2">
                      Long Description
                    </div>
                    <p className="im-overview-desc-text">
                      {overviewItem.longDescription}
                    </p>
                  </div>
                )}

                <OverviewSection icon="bx-layer" title="Stock Thresholds">
                  <OverviewField
                    label="Min Level"
                    value={overviewItem.stockThresholds?.minLevel}
                  />
                  <OverviewField
                    label="Max Level"
                    value={overviewItem.stockThresholds?.maxLevel}
                  />
                  <OverviewField
                    label="Safety Stock"
                    value={overviewItem.stockThresholds?.safetyStock}
                  />
                </OverviewSection>

                <OverviewSection icon="bx-calendar-check" title="Planning">
                  <OverviewField
                    label="Reorder Qty"
                    value={overviewItem.planning?.reorderQty}
                  />
                  <OverviewField
                    label="Lead Time (Days)"
                    value={overviewItem.planning?.leadTimeDays}
                  />
                  <OverviewField
                    label="Inventory Class"
                    value={
                      overviewItem.planning?.inventoryClass ===
                      "sales_inventory"
                        ? "Sales Inventory"
                        : overviewItem.planning?.inventoryClass ===
                            "procurement_inventory"
                          ? "Procurement Inventory"
                          : "—"
                    }
                  />
                  <OverviewField
                    label="Allow Invoice w/o Stock"
                    value={yn(overviewItem.planning?.allowInvoiceWithoutStock)}
                  />
                  <OverviewField
                    label="Avg Daily Usage"
                    value={overviewItem.usageMetrics?.avgDailyUsage}
                  />
                </OverviewSection>

                <OverviewSection icon="bx-truck" title="Procurement Info">
                  <OverviewField
                    label="Manufacturer"
                    value={overviewItem.procurementInfo?.manufacturerName}
                  />
                  <OverviewField
                    label="MPN"
                    value={overviewItem.procurementInfo?.mpn}
                  />
                  <OverviewField
                    label="Country of Origin"
                    value={overviewItem.procurementInfo?.countryOfOrigin}
                  />
                  <OverviewField
                    label="HSN / SAC Code"
                    value={overviewItem.hsnSacCode}
                  />
                </OverviewSection>

                <OverviewSection icon="bx-shield-quarter" title="Controls">
                  <OverviewField
                    label="Taggable Asset"
                    value={yn(overviewItem.controls?.taggableAsset)}
                  />
                  <OverviewField
                    label="Serializable"
                    value={yn(overviewItem.controls?.serializable)}
                  />
                  <OverviewField
                    label="Batch Tracked"
                    value={yn(overviewItem.controls?.batchTracked)}
                  />
                  <OverviewField
                    label="Hazardous Material"
                    value={yn(overviewItem.controls?.hazardousMaterial)}
                  />
                  <OverviewField
                    label="Maintainable"
                    value={yn(overviewItem.controls?.maintainable)}
                  />
                  <OverviewField
                    label="Inspection Required"
                    value={yn(overviewItem.controls?.inspectionRequired)}
                  />
                </OverviewSection>

                <OverviewSection icon="bx-purchase-tag" title="GL Accounts">
                  <OverviewField
                    label="Cost GL Account"
                    value={overviewItem.glAccounts?.costGlAccount}
                  />
                  <OverviewField
                    label="Depreciation GL Account"
                    value={overviewItem.glAccounts?.depreciationGlAccount}
                  />
                  <OverviewField
                    label="Accum. Depreciation GL"
                    value={
                      overviewItem.glAccounts?.accumulatedDepreciationGlAccount
                    }
                  />
                </OverviewSection>

                {overviewItem.customAttributes?.length > 0 && (
                  <div className="im-overview-section">
                    <div className="im-overview-section-title">
                      <i className="bx bx-customize"></i> Custom Attributes
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {overviewItem.customAttributes.map((a) => (
                        <div key={a._id} className="im-overview-attr-row">
                          <span className="im-overview-attr-key">{a.key}</span>
                          <span className="im-overview-attr-value">
                            {a.dataType === "checkbox"
                              ? yn(a.value === "true")
                              : a.value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {overviewItem.productImages?.length > 0 && (
                  <div className="im-overview-section">
                    <div className="im-overview-section-title">
                      <i className="bx bx-image"></i> Product Images
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {overviewItem.productImages.map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt=""
                          className="im-image-thumb"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="im-overview-footer">
                <Button color="light" onClick={() => setOverviewItem(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      <ImportItemsModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setRefreshFlag((f) => f + 1)}
      />
    </div>
  );
};

export default ItemMasterList;
