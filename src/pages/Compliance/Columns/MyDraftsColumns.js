import React from "react";
import { Button, Spinner } from "reactstrap";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

export const getMyDraftsColumns = ({
  roles,
  onView,
  onContinue,
  onDiscard,
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
    name: <div>Licence / reg. no.</div>,
    selector: (row) => row.licenceNumber || "—",
    wrap: true,
    minWidth: "140px",
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
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={loading}
            onClick={() => onView(row)}
            title="View"
          >
            {loading ? <Spinner size="sm" /> : <Eye size={14} />}
          </button>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="MY_DRAFTS" permission="edit">
            <Button
              color="success"
              size="sm"
              className="text-white text-nowrap"
              onClick={() => onContinue(row)}
            >
              <Pencil size={14} className="me-1" /> Continue
            </Button>
          </CheckPermission>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="MY_DRAFTS" permission="delete">
            <Button color="light" size="sm" className="border text-danger" onClick={() => onDiscard(row)}>
              <Trash2 size={14} />
            </Button>
          </CheckPermission>
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "170px",
  },
];
