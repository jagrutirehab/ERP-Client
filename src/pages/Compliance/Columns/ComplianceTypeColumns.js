import React from "react";
import { Button } from "reactstrap";
import { Pencil, Eye } from "lucide-react";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

const centreLabel = (type) => {
  if (!type.applicableCenters?.length) return "No centres";
  return type.applicableCenters.map((c) => c.title).filter(Boolean).join(", ");
};

export const getComplianceTypeColumns = ({
  roles,
  openView,
  openEdit,
  handleToggleActive,
} = {}) => [
  {
    name: <div>Name</div>,
    selector: (row) => row.name,
    cell: (row) => (
      <div className="py-1">
        <div className="fw-medium">{capitalizeWords(row.name)}</div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {capitalizeWords(row.shortName)}
        </div>
      </div>
    ),
    wrap: true,
    minWidth: "180px",
  },
  {
    name: <div>Category</div>,
    selector: (row) => (row.category?.name ? capitalizeWords(row.category.name) : "—"),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Renewal</div>,
    selector: (row) => (row.hasExpiry ? `${row.defaultLeadDays}d lead` : "No expiry"),
    wrap: true,
    minWidth: "110px",
  },
  {
    name: <div>Applicable centres</div>,
    selector: (row) => centreLabel(row),
    wrap: true,
    minWidth: "200px",
  },
  {
    name: <div>Status</div>,
    selector: (row) => (row.active ? "Active" : "Inactive"),
    cell: (row) => (
      <span
        className="fw-medium"
        style={{ fontSize: 13, color: row.active ? "#1D5A41" : "#66706C" }}
      >
        {row.active ? "Active" : "Inactive"}
      </span>
    ),
    wrap: true,
    minWidth: "100px",
  },
  {
    name: <div>Created on</div>,
    selector: (row) => formatDateTime(row.createdAt),
    wrap: true,
    minWidth: "180px",
  },
  {
    name: <div>Author</div>,
    selector: (row) => (row.createdBy?.name ? capitalizeWords(row.createdBy.name) : "—"),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Last updated by</div>,
    selector: (row) => (row.updatedBy?.name ? capitalizeWords(row.updatedBy.name) : "—"),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Actions</div>,
    cell: (row) => (
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => openView(row)}
          title="View"
        >
          <Eye size={14} />
        </button>
        <CheckPermission accessRolePermission={roles?.permissions} subAccess="COMPLIANCE_TYPES" permission="edit">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openEdit(row)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <Button
            color={row.active ? "danger" : "success"}
            className="text-white"
            size="sm"
            onClick={() => handleToggleActive(row)}
          >
            {row.active ? "Deactivate" : "Activate"}
          </Button>
        </CheckPermission>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "220px",
  },
];
