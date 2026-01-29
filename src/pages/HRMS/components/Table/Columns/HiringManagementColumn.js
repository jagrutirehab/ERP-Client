import { Badge } from "reactstrap";
import moment from "moment";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { format } from "date-fns";
import { capitalizeWords } from "../../../../../utils/toCapitalize";

const Center = ({ children }) => (
  <div className="d-flex justify-content-center align-items-center">
    {children}
  </div>
);

export const HiringActionColumns = ({ onActionClick }) => [
  {
    name: <div>Designation</div>,
    selector: (row) => {
      return (
        <div className="d-flex align-items-center flex-wrap gap-1">
          <span className="fw-semibold">
            {row.designation?.name
              ?.toLowerCase()
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          {row?.designation?.status === "PENDING" &&
            renderStatusBadge(row?.designation?.status)}
        </div>
      );
    },
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
    minWidth: "120px",
  },
  {
    name: <div>Raised For</div>,
    selector: (row) => (
      <div>
        <div>{capitalizeWords(row?.centerManager?.name || "-")}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {row?.centerManager?.email || "-"}
        </div>
      </div>
    ),
    wrap: true,
    minWidth: "200px",
  },

  {
    name: <Center>Status</Center>,
    cell: (row) => {
      const status = row?.status?.toLowerCase();

      if (status === "approved")
        return (
          <Center>
            <Badge pill color="success">
              Approved
            </Badge>
          </Center>
        );

      if (status === "rejected")
        return (
          <Center>
            <Badge pill color="danger">
              Rejected
            </Badge>
          </Center>
        );

      return (
        <Center>
          <Badge pill color="warning">
            Pending
          </Badge>
        </Center>
      );
    },
    width: "120px",
  },

  {
    name: <Center>Preferred Gender</Center>,
    cell: (row) => <Center>{row?.preferredGender || "-"}</Center>,
    width: "160px",
  },

  {
    name: <Center>Required Count</Center>,
    cell: (row) => <Center>{row?.requiredCount ?? "-"}</Center>,
    width: "150px",
  },
  {
    name: <Center>HR Assigned</Center>,
    cell: (row) => (
      <Center>
        <div>
          <div className="fw-semibold">{row?.hr?.name || "-"}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.hr?.email || "-"}
          </div>
        </div>
      </Center>
    ),
    minWidth: "200px",
  },

  {
    name: <div>Filled By</div>,
    selector: (row) => (
      <div>
        <div>{capitalizeWords(row?.filledBy?.name || "-")}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {row?.filledBy?.email || "-"}
        </div>
      </div>
    ),
    wrap: true,
    minWidth: "200px",
  },
  {
    name: <div>Filled At</div>,
    selector: (row) => {
      if (!row?.updatedAt) return "-";
      const date = new Date(row.updatedAt);
      if (isNaN(date)) return "-";
      return format(date, "dd MMM yyyy, hh:mm a");
    },
    wrap: true,
    minWidth: "180px",
  },
  {
    name: <div>Acted By</div>,
    selector: (row) => (
      <div>
        <div>{capitalizeWords(row?.actedBy?.name || "-")}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {row?.actedBy?.email || "-"}
        </div>
      </div>
    ),
    wrap: true,
    minWidth: "200px",
  },
  {
    name: <div>Acted At</div>,
    selector: (row) => {
      if (!row?.actedAt) return "-";
      const date = new Date(row.actedAt);
      if (isNaN(date)) return "-";
      return format(date, "dd MMM yyyy, hh:mm a");
    },
    wrap: true,
    minWidth: "180px",
  },

  {
    name: <Center>Contact Number</Center>,
    cell: (row) => <Center>{row?.contactNumber || "-"}</Center>,
    width: "160px",
  },

  {
    name: <Center>Note</Center>,
    cell: (row) => (
      <Center>
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row?.note || "-"}
        </div>
      </Center>
    ),
    wrap: true,
    minWidth: "170px",
  },

  {
    name: <div>Interviewer</div>,
    selector: (row) => (
      <div>
        <div>{capitalizeWords(row?.interviewer?.name || "-")}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {row?.interviewer?.email || "-"}
        </div>
      </div>
    ),
    wrap: true,
    minWidth: "200px",
  },
  {
    name: <div>Update Status</div>,
    selector: (row) => renderStatusBadge(row?.updateStatus),
  },
  {
    name: <Center>Remarks</Center>,
    cell: (row) => <Center>{row?.remarks || "-"}</Center>,
    width: "150px",
  },
  {
    name: <Center>Priority</Center>,
    cell: (row) => <Center>{row?.priority || "-"}</Center>,
    width: "150px",
  },

  {
    name: <Center>Action</Center>,
    cell: (row) => (
      <Center>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center"
          onClick={() => onActionClick(row)}
          title="Edit"
        >
          <Pencil size={16} />
        </button>
      </Center>
    ),
    width: "120px",
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];
