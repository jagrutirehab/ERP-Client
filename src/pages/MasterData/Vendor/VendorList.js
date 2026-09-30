import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getVendors,
  updateVendorStatus,
  deleteVendor,
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
  const canCreate = hasPermission("MASTERDATA", "VENDOR", "WRITE");
  const canEdit = hasPermission("MASTERDATA", "VENDOR", "WRITE");
  const canChangeStatus = hasPermission("MASTERDATA", "VENDOR", "DELETE");

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [overviewVendor, setOverviewVendor] = useState(null);
  const [showAccountNo, setShowAccountNo] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVendor(deleteTarget._id);
      toast.success("Vendor deleted successfully");
      setDeleteTarget(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't delete vendor. Please try again.",
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const primaryGstin = (row) =>
    row?.gstRegistrations?.find((g) => g.isPrimary)?.gstin ||
    row?.gstRegistrations?.[0]?.gstin ||
    "";

  const columns = [
    {
      name: "Vendor Code",
      selector: (row) => row.vendorCode,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className="small text-monospace fw-semibold text-dark">
          {row.vendorCode || "—"}
        </span>
      ),
    },
    {
      name: "Legal Name",
      selector: (row) => row.legalName,
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <span
          className="fw-semibold text-dark text-truncate d-inline-block"
          style={{ maxWidth: 220 }}
        >
          {row.legalName || row.tradeName || "—"}
        </span>
      ),
    },
    {
      name: "Alias",
      selector: (row) => row.alias,
      hide: "sm",
      cell: (row) => (
        <span className="small text-secondary">{row.alias || "—"}</span>
      ),
    },
    {
      name: "Vendor Type",
      selector: (row) => row.vendorType,
      sortable: true,
      hide: "md",
      cell: (row) => (
        <span className="text-capitalize small text-secondary">
          {(row.vendorType || "—").replace(/_/g, " ")}
        </span>
      ),
    },
    {
      name: "Supply Type",
      selector: (row) => row.supplyType,
      hide: "md",
      cell: (row) => (
        <span className="text-capitalize small text-secondary">
          {(row.supplyType || "—").replace(/_/g, " ")}
        </span>
      ),
    },
    {
      name: "PAN",
      hide: "lg",
      cell: (row) => (
        <span className="small text-monospace text-dark">{row.pan || "—"}</span>
      ),
    },
    {
      name: "GSTIN",
      hide: "lg",
      cell: (row) => (
        <span className="small text-monospace fw-medium text-dark">
          {primaryGstin(row) || "—"}
        </span>
      ),
    },
    {
      name: "Contact Person",
      selector: (row) => row.primaryContact?.name,
      hide: "md",
      cell: (row) => (
        <span className="small text-dark">
          {row.primaryContact?.name || "—"}
        </span>
      ),
    },
    {
      name: "Phone",
      hide: "lg",
      cell: (row) => (
        <span className="small text-secondary">
          {row.primaryContact?.phone || "—"}
        </span>
      ),
    },
    {
      name: "Email",
      hide: "lg",
      minWidth: "180px",
      cell: (row) => (
        <span
          className="small text-secondary text-truncate d-inline-block"
          style={{ maxWidth: 200 }}
        >
          {row.primaryContact?.email || "—"}
        </span>
      ),
    },
    {
      name: "Bank Mismatch",
      hide: "lg",
      width: "140px",
      cell: (row) =>
        row.bankDetails?.nameMismatch ? (
          <span className="vendor-status-pill status-blacklisted">Yes</span>
        ) : (
          <span className="small text-secondary">No</span>
        ),
    },
    {
      name: "KYB Verified",
      hide: "lg",
      width: "130px",
      cell: (row) =>
        row.kybVerified ? (
          <span className="vendor-status-pill status-active">Yes</span>
        ) : (
          <span className="small text-secondary">No</span>
        ),
    },
    {
      name: "Approval Status",
      width: "140px",
      cell: (row) => {
        const s = row.approvalStatus || "incomplete";
        const cls =
          s === "approved"
            ? "status-active"
            : s === "rejected"
              ? "status-blacklisted"
              : s === "pending"
                ? "status-draft"
                : "status-inactive";
        return (
          <span className={`vendor-status-pill ${cls}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      },
    },
    {
      name: "Actions",
      width: "130px",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="vendor-icon-btn"
            title="Overview"
            onClick={() => {
              setShowAccountNo(false);
              setOverviewVendor(row);
            }}
          >
            <i className="bx bx-show"></i>
          </button>
          {canEdit && (
            <button
              type="button"
              className="vendor-icon-btn"
              title="Edit"
              onClick={() => onEdit(row._id)}
            >
              <i className="bx bx-edit-alt"></i>
            </button>
          )}
          {canChangeStatus && (
            <button
              type="button"
              className="vendor-icon-btn is-danger"
              title="Delete"
              onClick={() => setDeleteTarget(row)}
            >
              <i className="bx bx-trash"></i>
            </button>
          )}
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

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        toggle={() => setDeleteTarget(null)}
        centered
      >
        <ModalBody className="p-4">
          <h5 className="mb-2">Delete this vendor?</h5>
          <p className="text-muted mb-4">
            {deleteTarget && (
              <>
                <strong>
                  {deleteTarget.legalName || deleteTarget.tradeName}
                </strong>{" "}
                {deleteTarget.vendorCode && `(${deleteTarget.vendorCode})`}
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

      {/* Overview modal */}
      {/* Overview modal */}
      <Modal
        isOpen={!!overviewVendor}
        toggle={() => setOverviewVendor(null)}
        centered
        size="xl"
      >
        <ModalBody className="p-0">
          {overviewVendor && (
            <div className="vendor-overview">
              <button
                type="button"
                className="vendor-overview-close"
                onClick={() => setOverviewVendor(null)}
              >
                <i className="bx bx-x"></i>
              </button>

              <div className="vendor-overview-grid">
                {/* ---------- Left: hero card ---------- */}
                <div className="vendor-overview-hero">
                  <div className="vendor-overview-hero-banner">
                    <span className="vendor-overview-code-badge">
                      {overviewVendor.vendorCode || "—"}
                    </span>
                  </div>
                  <div className="vendor-overview-hero-body">
                    <div className="vendor-overview-avatar">
                      {(() => {
                        const name = (
                          overviewVendor.legalName ||
                          overviewVendor.tradeName ||
                          "?"
                        ).trim();
                        const initials = name
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();
                        return initials || "?";
                      })()}
                    </div>
                    <h5 className="vendor-overview-name">
                      {overviewVendor.legalName || overviewVendor.tradeName}
                    </h5>

                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <span className="vendor-overview-chip">
                        {(overviewVendor.vendorType || "—").replace(/_/g, " ")}
                      </span>
                      <span
                        className={`vendor-status-pill status-${overviewVendor.status}`}
                      >
                        {overviewVendor.status}
                      </span>
                    </div>

                    <span className="vendor-overview-approval-chip">
                      <i className="bx bx-time-five"></i>{" "}
                      {(overviewVendor.approvalStatus || "incomplete")
                        .charAt(0)
                        .toUpperCase() +
                        (overviewVendor.approvalStatus || "incomplete").slice(
                          1,
                        )}
                    </span>

                    <div className="vendor-overview-hero-row">
                      <i className="bx bx-hash"></i>
                      <div>
                        <div className="vendor-overview-hero-label">PAN</div>
                        <div className="vendor-overview-hero-value">
                          {overviewVendor.pan || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="vendor-overview-hero-row">
                      <i className="bx bx-phone"></i>
                      <span>{overviewVendor.primaryContact?.phone || "—"}</span>
                    </div>
                    <div className="vendor-overview-hero-row">
                      <i className="bx bx-envelope"></i>
                      <span className="text-truncate">
                        {overviewVendor.primaryContact?.email || "—"}
                      </span>
                    </div>

                    <div className="vendor-overview-hero-dates">
                      <div>
                        <i className="bx bx-calendar-plus"></i> Created{" "}
                        {overviewVendor.createdAt
                          ? new Date(
                              overviewVendor.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </div>
                      <div>
                        <i className="bx bx-calendar-edit"></i> Updated{" "}
                        {overviewVendor.updatedAt
                          ? new Date(
                              overviewVendor.updatedAt,
                            ).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>

                    <Button
                      color="light"
                      className="w-100 mt-3"
                      onClick={() => setOverviewVendor(null)}
                    >
                      <i className="bx bx-arrow-back me-1"></i> Close
                    </Button>
                  </div>
                </div>

                {/* ---------- Right: sectioned cards ---------- */}
                <div className="vendor-overview-cards">
                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-user"></i> Identity & Compliance
                    </div>
                    <div className="vendor-overview-card-grid">
                      <div>
                        <div className="vendor-overview-label">Legal Name</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.legalName || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">
                          Alias / Trade Name
                        </div>
                        <div className="vendor-overview-value">
                          {overviewVendor.alias ||
                            overviewVendor.tradeName ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">Vendor Type</div>
                        <span className="vendor-overview-chip">
                          {(overviewVendor.vendorType || "—").replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                      </div>
                      <div>
                        <div className="vendor-overview-label">
                          MSME Registered
                        </div>
                        <span
                          className={`vendor-overview-flag ${overviewVendor.msmeRegistered ? "is-yes" : "is-no"}`}
                        >
                          {overviewVendor.msmeRegistered ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <div className="vendor-overview-label">MSME No.</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.udyamNumber || "—"}
                        </div>
                      </div>
                      <div className="vendor-overview-span-2">
                        <div className="vendor-overview-label">
                          Contact Person
                        </div>
                        <div className="vendor-overview-value">
                          {overviewVendor.primaryContact?.name || "—"}
                        </div>
                        <div className="vendor-overview-subline">
                          <i className="bx bx-phone"></i>{" "}
                          {overviewVendor.primaryContact?.phone || "—"}
                        </div>
                        <div className="vendor-overview-subline">
                          <i className="bx bx-envelope"></i>{" "}
                          {overviewVendor.primaryContact?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-file-blank"></i> Tax & Legal
                      Identifiers
                    </div>
                    <div className="vendor-overview-card-grid">
                      <div>
                        <div className="vendor-overview-label">PAN</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.pan || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">GSTIN</div>
                        <div className="vendor-overview-value">
                          {primaryGstin(overviewVendor) || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">CIN</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.cin || "—"}
                        </div>
                      </div>
                      <div className="vendor-overview-span-3">
                        <span
                          className={`vendor-overview-flag ${overviewVendor.bankDetails?.verified ? "is-yes" : "is-no"}`}
                        >
                          <i className="bx bx-shield"></i>{" "}
                          {overviewVendor.bankDetails?.verified
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-buildings"></i> GST Information
                    </div>
                    {overviewVendor.gstRegistrations?.length > 0 ? (
                      overviewVendor.gstRegistrations.map((g) => (
                        <div
                          key={g._id}
                          className="vendor-overview-card-grid mb-2"
                        >
                          <div>
                            <div className="vendor-overview-label">
                              Registration Type
                            </div>
                            <div className="vendor-overview-value text-capitalize">
                              {g.registrationType || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="vendor-overview-label">
                              Tax Type
                            </div>
                            <div className="vendor-overview-value text-uppercase">
                              {g.taxType || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="vendor-overview-label">
                              Reverse Charge
                            </div>
                            <span
                              className={`vendor-overview-flag ${g.reverseChargeApplicable ? "is-yes" : "is-no"}`}
                            >
                              {g.reverseChargeApplicable ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small mb-0">
                        No GST registrations on file.
                      </p>
                    )}
                  </div>

                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-calculator"></i> TDS Information
                    </div>
                    <div className="vendor-overview-card-grid">
                      <div>
                        <div className="vendor-overview-label">
                          TDS Applicable
                        </div>
                        <span
                          className={`vendor-overview-flag ${overviewVendor.tdsApplicable ? "is-yes" : "is-no"}`}
                        >
                          {overviewVendor.tdsApplicable ? "Yes" : "No"}
                        </span>
                      </div>
                      {overviewVendor.tdsApplicable && (
                        <>
                          <div>
                            <div className="vendor-overview-label">
                              TDS Section
                            </div>
                            <div className="vendor-overview-value">
                              {overviewVendor.tdsSection || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="vendor-overview-label">
                              TDS Rate
                            </div>
                            <div className="vendor-overview-value">
                              {overviewVendor.tdsRate ?? "—"}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="vendor-overview-card vendor-overview-span-full">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-map"></i> Address Details
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="vendor-overview-label mb-2">
                          Registered Address
                        </div>
                        <div className="vendor-overview-address">
                          <div className="vendor-overview-value">
                            {overviewVendor.registeredAddress?.line1 || "—"}
                          </div>
                          {overviewVendor.registeredAddress?.line2 && (
                            <div className="vendor-overview-value">
                              {overviewVendor.registeredAddress.line2}
                            </div>
                          )}
                          <div className="vendor-overview-subline">
                            {[
                              overviewVendor.registeredAddress?.city,
                              overviewVendor.registeredAddress?.state,
                              overviewVendor.registeredAddress?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="vendor-overview-label mb-2">
                          Billing Address
                        </div>
                        <div className="vendor-overview-address">
                          <div className="vendor-overview-value">
                            {overviewVendor.billingAddress?.line1 || "—"}
                          </div>
                          {overviewVendor.billingAddress?.line2 && (
                            <div className="vendor-overview-value">
                              {overviewVendor.billingAddress.line2}
                            </div>
                          )}
                          <div className="vendor-overview-subline">
                            {[
                              overviewVendor.billingAddress?.city,
                              overviewVendor.billingAddress?.state,
                              overviewVendor.billingAddress?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-wallet"></i> Bank & Payments
                    </div>
                    <div className="vendor-overview-card-grid">
                      <div>
                        <div className="vendor-overview-label">Bank Name</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.bankDetails?.bankName || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">
                          Account Number
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="vendor-overview-hero-value">
                            {overviewVendor.bankDetails?.accountNo
                              ? showAccountNo
                                ? overviewVendor.bankDetails.accountNo
                                : `••••${overviewVendor.bankDetails.accountNo.slice(-4)}`
                              : "—"}
                          </span>
                          {overviewVendor.bankDetails?.accountNo && (
                            <button
                              type="button"
                              className="vendor-overview-show-btn"
                              onClick={() => setShowAccountNo((s) => !s)}
                            >
                              {showAccountNo ? "Hide" : "Show"}
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">IFSC Code</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.bankDetails?.ifsc || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">
                          Bank Mismatch
                        </div>
                        <span
                          className={`vendor-overview-flag ${overviewVendor.bankDetails?.nameMismatch ? "is-yes" : "is-no"}`}
                        >
                          {overviewVendor.bankDetails?.nameMismatch
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      <div>
                        <div className="vendor-overview-label">UPI ID</div>
                        <div className="vendor-overview-value">
                          {overviewVendor.bankDetails?.upiId || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="vendor-overview-label">
                          Payment Terms
                        </div>
                        <div className="vendor-overview-value text-capitalize">
                          {(overviewVendor.paymentTerms || "—").replace(
                            /_/g,
                            " ",
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-overview-card">
                    <div className="vendor-overview-card-title">
                      <i className="bx bx-folder"></i> Documents
                    </div>
                    <div className="vendor-overview-doc-list">
                      {[
                        ["gst_certificate", "GST Certificate"],
                        ["pan_card", "PAN Card Copy"],
                        ["msme_certificate", "MSME Certificate"],
                        ["cancelled_cheque", "Cancelled Cheque"],
                        ["agreement_copy", "Agreement Copy"],
                        ["coi", "Certificate of Incorporation"],
                        ["moa", "Memorandum of Association"],
                        ["aoa", "Articles of Association"],
                      ].map(([type, label]) => {
                        const doc = overviewVendor.documents?.find(
                          (d) => d.docType === type,
                        );
                        return (
                          <div key={type} className="vendor-overview-doc-row">
                            <i className="bx bx-file"></i>
                            <div className="flex-grow-1">
                              <div className="vendor-overview-doc-name">
                                {label}
                              </div>
                              {doc ? (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="vendor-overview-doc-link"
                                >
                                  <i className="bx bx-show"></i> Preview
                                </a>
                              ) : (
                                <span className="vendor-overview-doc-empty">
                                  Not uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VendorList;
