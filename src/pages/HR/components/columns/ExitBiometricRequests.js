import { Button } from "reactstrap";
import { Check, X } from "lucide-react";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { normalizeText } from "../helpers/normalizeText";

export const ExitBiometricRequests = ({
  onApprove,
  onReject,
  status,
  type,
  hasWritePermission,
} = {}) => {
  console.log("status", status);

  return [
    {
      name: "ECode",
      selector: (row) => row?.employee?.eCode || "-",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Biometric Id",
      selector: (row) => row?.employee?.biometricId || "-",
      sortable: true,
      minWidth: "120px",
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
      name: "Name",
      selector: (row) => row?.employee?.name || "-",
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
      selector: (row) =>
        normalizeText(row?.employee?.department?.department) || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Designation",
      selector: (row) => normalizeText(row?.employee?.designation?.name) || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Employment Type",
      selector: (row) => normalizeText(row?.employee?.employmentType) || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) =>
        row?.employee?.officialEmail || row?.employee?.email || "-",
      sortable: true,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Contact",
      selector: (row) => row?.employee?.mobile || "-",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Joining Date",
      selector: (row) => row?.employee?.joinningDate || "-",
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
      selector: (row) => row?.exit || "-",
      sortable: true,
      minWidth: "130px",
      cell: (row) => {
        return renderStatusBadge(row?.exit?.toUpperCase());
      },
    },
    ...(["approved", "rejected"].includes(status)
      ? [
          {
            name: "Action On",
            selector: (row) => row?.exitActionOn || "-",
            sortable: true,
            minWidth: "150px",
            wrap: true,
            cell: (row) =>
              row?.exitActionOn ? (
                <span>
                  {new Date(row.exitActionOn).toLocaleDateString("en-IN", {
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
            selector: (row) => row?.exitReason || "-",
            sortable: true,
            minWidth: "200px",
            wrap: true,
            cell: (row) =>
              row?.exitReason ? (
                <span
                  title={row.exitReason}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    fontSize: "13px",
                    // color: status === "rejected" ? "#dc3545" : "inherit",
                  }}
                >
                  {normalizeText(row.exitReason)}
                </span>
              ) : (
                "-"
              ),
          },
        ]
      : hasWritePermission
        ? [
            {
              name: "Actions",
              minWidth: "130px",
              cell: (row) => (
                <div className="d-flex gap-2">
                  <Button
                    color="success"
                    size="sm"
                    title="Approve"
                    onClick={() => onApprove(row)}
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    title="Reject"
                    onClick={() => onReject(row)}
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <X size={16} strokeWidth={2.5} />
                  </Button>
                </div>
              ),
            },
          ]
        : []),
  ];
};
