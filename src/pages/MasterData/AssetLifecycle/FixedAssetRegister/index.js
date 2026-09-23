import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getFixedAssets,
  updateFixedAsset,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_META = {
  active: {
    label: "Active",
    cls: "status-active",
    icon: "bx-check-circle",
    color: "#12b76a",
  },
  under_maintenance: {
    label: "Under Maintenance",
    cls: "status-draft",
    icon: "bx-wrench",
    color: "#f79009",
  },
  written_off: {
    label: "Written Off",
    cls: "status-blacklisted",
    icon: "bx-x-circle",
    color: "#f04438",
  },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.active;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div
    className="d-flex align-items-start gap-3 py-2"
    style={{ borderBottom: "1px solid #f1f3f5" }}
  >
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "#f5f6fa",
        flexShrink: 0,
      }}
    >
      <i className={`bx ${icon} text-primary`}></i>
    </div>
    <div>
      <div className="text-muted" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div className="fw-semibold" style={{ fontSize: 14 }}>
        {value}
      </div>
    </div>
  </div>
);

const FixedAssetRegister = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canEdit = hasPermission("MASTERDATA", "FIXED_ASSET", "WRITE");

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [detailModal, setDetailModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFixedAssets({ search })
      .then((res) => {
        if (!cancelled) setAssets(res?.data || []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load assets.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, refreshFlag]);

  const handleStatusChange = async (asset, newStatus) => {
    if (asset.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await updateFixedAsset(asset._id, { status: newStatus });
      toast.success("Asset status updated");
      setDetailModal(res?.data || { ...asset, status: newStatus });
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't update.",
        );
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns = [
    {
      name: "Asset Tag",
      selector: (row) => row.assetTag,
      sortable: true,
      width: "150px",
    },
    { name: "Asset Name", selector: (row) => row.assetName, sortable: true },
    {
      name: "Category",
      cell: (row) => <span className="uom-cell-muted">{row.category}</span>,
    },
    {
      name: "Cost",
      cell: (row) => (
        <span className="uom-cell-primary">{money(row.purchaseCost)}</span>
      ),
    },
    {
      name: "Site",
      cell: (row) => (
        <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>
      ),
    },
    {
      name: "Purchase Date",
      cell: (row) => (
        <span className="uom-cell-muted">{dateFmt(row.purchaseDate)}</span>
      ),
    },
    {
      name: "Status",
      width: "160px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "",
      width: "100px",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => setDetailModal(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Fixed Assets Register</h4>
          <p>
            Permanent record of every capitalized asset — cost, location, and
            status
          </p>
        </div>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search asset name or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={assets}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No assets registered yet</p>
              <p className="uom-empty-sub">
                Assets appear here automatically once capitalized (see Asset
                Capitalization).
              </p>
            </div>
          }
        />
      </div>

      {/* Detail Modal — polished */}
      <Modal
        isOpen={!!detailModal}
        toggle={() => setDetailModal(null)}
        centered
        size="md"
      >
        <ModalBody className="p-0">
          {detailModal && (
            <>
              {/* Header strip */}
              <div
                className="p-4 pb-3"
                style={{ borderBottom: "1px solid #f1f3f5" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{detailModal.assetName}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="text-muted"
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          background: "#f5f6fa",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {detailModal.assetTag}
                      </span>
                      <StatusPill status={detailModal.status} />
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Purchase Cost
                    </div>
                    <div className="fs-4 fw-bold text-primary">
                      {money(detailModal.purchaseCost)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-4">
                <DetailRow
                  icon="bx-category"
                  label="Category"
                  value={detailModal.category}
                />
                <DetailRow
                  icon="bx-calendar"
                  label="Purchase Date"
                  value={dateFmt(detailModal.purchaseDate)}
                />
                <DetailRow
                  icon="bx-map-pin"
                  label="Site"
                  value={detailModal.centerId?.title || "—"}
                />
                {detailModal.storageLocationId && (
                  <DetailRow
                    icon="bx-door-open"
                    label="Location"
                    value={`${detailModal.storageLocationId?.name || ""} (${detailModal.storageLocationId?.code || ""})`}
                  />
                )}
                <DetailRow
                  icon="bx-note"
                  label="Remarks"
                  value={detailModal.remarks || "—"}
                />
              </div>

              {/* Status changer */}
              {canEdit && (
                <div
                  className="px-4 py-3 mt-2"
                  style={{
                    background: "#fafbfc",
                    borderTop: "1px solid #f1f3f5",
                  }}
                >
                  <div
                    className="text-muted mb-2"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                    }}
                  >
                    UPDATE STATUS
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                      <Button
                        key={key}
                        size="sm"
                        outline={detailModal.status !== key}
                        style={
                          detailModal.status === key
                            ? {
                                backgroundColor: meta.color,
                                borderColor: meta.color,
                                color: "#fff",
                              }
                            : { borderColor: meta.color, color: meta.color }
                        }
                        disabled={updatingStatus || detailModal.status === key}
                        onClick={() => handleStatusChange(detailModal, key)}
                      >
                        <i className={`bx ${meta.icon} me-1`}></i>
                        {meta.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end p-3">
                <Button color="light" onClick={() => setDetailModal(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default FixedAssetRegister;
