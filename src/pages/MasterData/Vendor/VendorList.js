import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import {
  getVendors,
  updateVendorStatus,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import "./vendor.scss";

// react-data-table-component renders inline styles, not classes,
// so the visual tokens are mirrored here to match vendor.scss
const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      minHeight: "46px",
    },
  },
  headCells: {
    style: {
      fontSize: "11.5px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#64748b",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
      fontSize: "13.5px",
      transition: "background-color 0.15s ease",
      "&:hover": { backgroundColor: "#f8fafc" },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#64748b",
      flexWrap: "wrap",
    },
  },
};

const VendorList = ({ onAdd, onEdit }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "VENDOR_CREATE", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "VENDOR_EDIT", "WRITE");
  const canChangeStatus = hasPermission(
    "MASTERDATA",
    "VENDOR_STATUS_CHANGE",
    "WRITE",
  );
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await getVendors({ page, limit: perPage, search });
        if (cancelled) return;
        setVendors(res?.data || []);
        setTotalRows(res?.pagination?.total || 0);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load vendors. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVendors();
    return () => {
      cancelled = true;
    };
  }, [page, perPage, search, refreshFlag]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateVendorStatus(id, status);
      toast.success(
        status === "active" ? "Vendor activated" : "Vendor deactivated",
      );
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't update status. Please try again.",
        );
      }
    }
  };

  const entityLabel = (row) => {
    const initials = (row.tradeName || "?").trim().charAt(0).toUpperCase();
    return (
      <div className="d-flex align-items-center gap-2 py-1">
        <div className="vendor-avatar">{initials}</div>
        <div className="text-truncate">
          <div
            className="fw-semibold text-dark text-truncate"
            style={{ fontSize: 13.5, maxWidth: 220 }}
          >
            {row.tradeName}
          </div>
          <div className="text-muted" style={{ fontSize: 11.5 }}>
            {row.vendorCode || "No code assigned"}
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      name: "Vendor",
      selector: (row) => row.tradeName,
      sortable: true,
      minWidth: "200px",
      grow: 2,
      cell: entityLabel,
    },
    {
      name: "Entity Type",
      selector: (row) => row.entityType,
      sortable: true,
      // Secondary detail — free up space on phones first
      hide: "sm",
      cell: (row) => (
        <span className="text-capitalize small text-secondary">
          {(row.entityType || "—").replace("_", " ")}
        </span>
      ),
    },
    {
      name: "GSTIN",
      // Technical identifier — drop before Entity Type once the viewport is
      // tablet-sized, since it's the least glanceable column
      hide: "md",
      cell: (row) => (
        <span className="small text-monospace fw-medium text-dark">
          {row.gstRegistrations?.find((g) => g.isPrimary)?.gstin || "—"}
        </span>
      ),
    },
    {
      name: "Status",
      width: "130px",
      cell: (row) => (
        <span className={`vendor-status-pill status-${row.status}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      minWidth: "150px",
      width: "190px",
      right: true,
      cell: (row) => (
        <div className="vendor-row-actions">
          {canEdit && (
            <Button size="sm" color="light" onClick={() => onEdit(row._id)}>
              <i className="bx bx-edit-alt"></i>
              <span className="vendor-btn-label">Edit</span>
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
                <i className="bx bx-check"></i>
                <span className="vendor-btn-label">Activate</span>
              </Button>
            ) : (
              <Button
                size="sm"
                color="warning"
                outline
                onClick={() => handleStatusChange(row._id, "inactive")}
              >
                <i className="bx bx-power-off"></i>
                <span className="vendor-btn-label">Deactivate</span>
              </Button>
            ))}
          {!canEdit && !canChangeStatus && <span className="text-muted small">—</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="vendor-page">
      <div className="vendor-list-header">
        <div>
          <h4 className="mb-1">Vendors</h4>
          <p className="text-muted mb-0 small">
            Manage onboarding, legal records, and status for every supplier.
          </p>
        </div>
         {canCreate && (
          <Button color="primary" className="px-3" onClick={onAdd}>
            <i className="bx bx-plus me-1"></i> Add vendor
          </Button>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="vendor-search-wrap">
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search by name, code"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <DataTable
          columns={columns}
          data={vendors}
          customStyles={tableCustomStyles}
          progressPending={loading}
          progressComponent={
            <div className="w-100 p-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="vendor-skeleton mb-2"
                  style={{ height: 44 }}
                />
              ))}
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationRowsPerPageOptions={[10, 25, 50]}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          highlightOnHover
          pointerOnHover
          responsive
          noDataComponent={
            search ? (
              <div className="vendor-empty-state">
                <i className="bx bx-search-alt"></i>
                <p className="mb-1 fw-semibold text-dark">
                  No vendors match "{search}"
                </p>
                <p className="mb-0 small text-muted">
                  Try a different name, code, or GSTIN.
                </p>
              </div>
            ) : (
              <div className="vendor-empty-state">
                <i className="bx bx-store"></i>
                <p className="mb-1 fw-semibold text-dark">No vendors yet</p>
                <p className="mb-0 small text-muted">
                  Click "Add vendor" to onboard your first supplier.
                </p>
              </div>
            )
          }
        />
      </div>
    </div>
  );
};

export default VendorList;
