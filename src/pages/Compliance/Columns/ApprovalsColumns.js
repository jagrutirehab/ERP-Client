import React from "react";
import { Button, Spinner } from "reactstrap";
import { ClipboardCheck, Eye } from "lucide-react";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

export const getApprovalsColumns = ({
  roles,
  statusFilter,
  loadingReviewId,
  onOpenReview,
} = {}) => [
  {
    name: <div>Submitted</div>,
    selector: (row) => formatDateTime(row.submittedAt),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Centre</div>,
    selector: (row) => capitalizeWords(row.centreName) || "—",
    wrap: true,
    minWidth: "110px",
  },
  {
    name: <div>Compliance type</div>,
    selector: (row) => capitalizeWords(row.categoryName) || "—",
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Submitted by</div>,
    selector: (row) => capitalizeWords(row.submittedBy) || "—",
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <div>Files</div>,
    selector: (row) => (row.fileNames.length ? `${row.fileNames.length} file(s)` : "—"),
    wrap: true,
    minWidth: "90px",
  },
  {
    name: <div>Status</div>,
    selector: (row) => row.status,
    cell: (row) => renderStatusBadge(row.status.toUpperCase()),
    wrap: true,
    minWidth: "100px",
  },
  {
    name: <div>Actions</div>,
    cell: (row) => {
      const loading = loadingReviewId === row.id;
      return statusFilter === "PENDING" ? (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={loading}
            onClick={() => onOpenReview(row, true)}
            title="View"
          >
            {loading ? <Spinner size="sm" /> : <Eye size={14} />}
          </button>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="APPROVALS" permission="edit">
            <Button
              color="success"
              className="text-white"
              size="sm"
              disabled={loading}
              onClick={() => onOpenReview(row, false)}
            >
              {loading ? <Spinner size="sm" /> : <><ClipboardCheck size={14} className="me-1" /> Review</>}
            </Button>
          </CheckPermission>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={loading}
          onClick={() => onOpenReview(row, true)}
          title="View"
        >
          {loading ? <Spinner size="sm" /> : <Eye size={14} />}
        </button>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "190px",
  },
];
