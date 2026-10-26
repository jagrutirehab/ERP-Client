import React from "react";
import { Button } from "reactstrap";
import { Pencil, Trash2 } from "lucide-react";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

export const getCategoryColumns = ({
  roles,
  openEdit,
  handleToggleActive,
  handleDeleteRequest,
} = {}) => [
  {
    name: <div>Name</div>,
    selector: (row) => capitalizeWords(row.name),
    cell: (row) => <span className="fw-medium">{capitalizeWords(row.name)}</span>,
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
    minWidth: "110px",
  },
  {
    name: <div>Author</div>,
    selector: (row) => (row.createdBy?.name ? capitalizeWords(row.createdBy.name) : "—"),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Created on</div>,
    selector: (row) => formatDateTime(row.createdAt),
    wrap: true,
    minWidth: "180px",
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
        <CheckPermission accessRolePermission={roles?.permissions} subAccess="CATEGORIES" permission="edit">
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
        <CheckPermission accessRolePermission={roles?.permissions} subAccess="CATEGORIES" permission="delete">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteRequest(row)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </CheckPermission>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "200px",
  },
];
