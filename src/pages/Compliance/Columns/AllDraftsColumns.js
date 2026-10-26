import React from "react";
import { Spinner } from "reactstrap";
import { Eye, Pencil } from "lucide-react";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

export const getAllDraftsColumns = ({
  roles,
  currentUser,
  onView,
  onEdit,
  loadingRowId,
} = {}) => [
  {
    name: <div>Last saved</div>,
    selector: (row) => formatDateTime(row.updatedAt),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Centre</div>,
    selector: (row) => capitalizeWords(row.center?.title) || "—",
    wrap: true,
    minWidth: "110px",
  },
  {
    name: <div>Compliance type</div>,
    selector: (row) => capitalizeWords(row.complianceType?.name) || "—",
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Started by</div>,
    selector: (row) => capitalizeWords(row.submittedBy?.name) || row.submittedBy?.email || "—",
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <div>Files</div>,
    selector: (row) => (row.documents?.length ? `${row.documents.length} file(s)` : "None yet"),
    wrap: true,
    minWidth: "90px",
  },
  {
    name: <div>Actions</div>,
    cell: (row) => {
      const loading = loadingRowId === row._id;
      return (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={loading}
            onClick={() => onView(row)}
            title="View"
          >
            {loading ? <Spinner size="sm" /> : <Eye size={14} />}
          </button>
          {row.submittedBy?._id === currentUser?._id && (
            <CheckPermission accessRolePermission={roles?.permissions} subAccess="ALL_DRAFTS" permission="edit">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onEdit(row)}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            </CheckPermission>
          )}
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "110px",
  },
];
