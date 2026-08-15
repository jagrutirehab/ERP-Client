import { Button } from "reactstrap";
import { Check, X } from "lucide-react";
import Select from "react-select";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";

export const BiometricAdditionColumns = ({
  onApprove,
  onReject,
  hasWritePermission,
  status,
  // users = [],
  // assignedUsers = {},
  // onAssign,
} = {}) => [
  {
    name: "ECode",
    selector: (row) => row?.employee?.eCode || "-",
    sortable: true,
    minWidth: "120px",
    wrap: true,
  },
  {
    name: "Name",
    selector: (row) => row?.employee?.name || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Author",
    selector: (row) => row?.author?.name || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Center",
    selector: (row) => row?.employee?.currentLocation?.title || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Department",
    selector: (row) => row?.employee?.department?.department || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Designation",
    selector: (row) => row?.employee?.designation?.name || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Biometric ID",
    selector: (row) => row?.biometricId || "-",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Created On",
    selector: (row) => row?.createdAt || "-",
    sortable: true,
    minWidth: "150px",
    wrap: true,
    cell: (row) =>
      row?.createdAt ? (
        <span>
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ) : (
        "-"
      ),
  },
  {
    name: "Status",
    selector: (row) => row?.status || "-",
    sortable: true,
    minWidth: "130px",
    cell: (row) => {
      const statusMap = {
        addition_pending: "PENDING",
        addition_approved: "APPROVED",
        addition_rejected: "REJECTED",
      };
      return renderStatusBadge(
        statusMap[row?.status] || row?.status?.toUpperCase(),
      );
    },
  },
  ...(hasWritePermission && status === "addition_pending"
    ? [
        // {
        //   name: "Assign To",
        //   minWidth: "200px",
        //   cell: (row) => (
        //     <div style={{ width: "180px" }}>
        //       <Select
        //         placeholder="Select user..."
        //         options={users}
        //         value={assignedUsers[row._id] || null}
        //         onChange={(option) => onAssign(row._id, option)}
        //         classNamePrefix="react-select"
        //         menuPortalTarget={document.body}
        //         styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        //         isClearable
        //       />
        //     </div>
        //   ),
        // },
        {
          name: "Actions",
          minWidth: "130px",
          cell: (row) => (
            <div className="d-flex gap-2">
              <Button
                color="success"
                size="sm"
                title="Approve"
                // disabled={!assignedUsers[row._id]}
                onClick={() => onApprove(row)}
                style={{
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  // opacity: !assignedUsers[row._id] ? 0.5 : 1,
                }}
              >
                <Check size={16} strokeWidth={2.5} />
              </Button>
              <Button
                color="danger"
                size="sm"
                title="Reject"
                // disabled={!!assignedUsers[row._id]}
                onClick={() => onReject(row)}
                style={{
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  // opacity: !!assignedUsers[row._id] ? 0.5 : 1,
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </Button>
            </div>
          ),
        },
      ]
    : []),
  ...(["addition_approved", "addition_rejected"].includes(status)
    ? [
        {
          name: "Actioned By",
          selector: (row) => row?.requestActionBy?.name || "-",
          sortable: true,
          minWidth: "150px",
          wrap: true,
        },
        // {
        //   name: "Assigned To",
        //   selector: (row) => row?.assignedTo?.name || "-",
        //   sortable: true,
        //   minWidth: "150px",
        //   wrap: true,
        // },
        {
          name: "Actioned On",
          selector: (row) => row?.actionOn || "-",
          sortable: true,
          minWidth: "150px",
          wrap: true,
          cell: (row) =>
            row?.actionOn ? (
              <span>
                {new Date(row.actionOn).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ) : (
              "-"
            ),
        },
        {
          name: "Reason",
          selector: (row) => row?.additionReason || "-",
          sortable: true,
          minWidth: "200px",
          wrap: true,
          cell: (row) =>
            row?.additionReason ? (
              <span
                title={row.additionReason}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  fontSize: "13px",
                  color: status === "addition_rejected" ? "#dc3545" : "inherit",
                }}
              >
                {row.additionReason}
              </span>
            ) : (
              "-"
            ),
        },
      ]
    : []),
];
