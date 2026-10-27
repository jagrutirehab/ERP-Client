import { Fragment } from "react";
import { Button } from "reactstrap";
import { Check, X } from "lucide-react";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { formatDateTime } from "../../../../utils/time";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { normalizeText } from "../helpers/normalizeText";

const PersonCell = ({ person }) => (
  <div>
    <div>{normalizeText(person?.name) || "-"}</div>
    <div style={{ fontSize: "12px", color: "#666" }}>
      {person?.email || ""}
    </div>
  </div>
);

const statusMap = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

const roundButton = {
  width: "32px",
  height: "32px",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
};

export const NewJoiningBiometricColumn = ({
  onApprove,
  onReject,
  tab,
  hasWritePermission,
} = {}) => [
    {
      name: "Name",
      selector: (row) => row?.employeeName?.toUpperCase() || "-",
      minWidth: "160px",
      wrap: true,
    },
    {
      name: "Center",
      selector: (row) => row?.center?.title || "-",
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Department",
      selector: (row) => row?.department || "-",
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
      name: "Shifts",
      selector: (row) => row?.shifts?.length || 0,
      minWidth: "200px",
      cell: (row) =>
        row?.shifts?.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              columnGap: "16px",
              rowGap: "4px",
              maxHeight: "120px",
              overflowY: "auto",
              width: "100%",
              padding: "4px 0",
              fontSize: "13px",
            }}
          >
            {row.shifts.map((s, i) => (
              <Fragment key={i}>
                <span className="fw-semibold">
                  {capitalizeWords(s.shift) || "-"}
                </span>
                <span className="text-muted">{s.answers || "-"}</span>
              </Fragment>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      name: "Status",
      selector: (row) => row?.status || "-",
      minWidth: "130px",
      cell: (row) =>
        renderStatusBadge(
          statusMap[row?.status] || row?.status?.toUpperCase() || "-",
        ),
    },
    {
      name: "Requested By",
      selector: (row) => row?.author?.name || "-",
      cell: (row) => <PersonCell person={row?.author} />,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Requested On",
      selector: (row) => row?.createdAt || "-",
      sortable: true,
      minWidth: "180px",
      wrap: true,
      cell: (row) => formatDateTime(row?.createdAt),
    },
    ...(tab === "PENDING" && hasWritePermission
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
                style={roundButton}
              >
                <Check size={16} strokeWidth={2.5} />
              </Button>
              <Button
                color="danger"
                size="sm"
                title="Reject"
                onClick={() => onReject(row)}
                style={roundButton}
              >
                <X size={16} strokeWidth={2.5} />
              </Button>
            </div>
          ),
        },
      ]
      : []),
    ...(tab === "HISTORY"
      ? [
        {
          name: "Actioned By",
          selector: (row) => row?.actionBy?.name || "-",
          cell: (row) => <PersonCell person={row?.actionBy} />,
          sortable: true,
          minWidth: "200px",
          wrap: true,
        },
        {
          name: "Actioned On",
          selector: (row) => row?.actionOn || "-",
          sortable: true,
          minWidth: "180px",
          wrap: true,
          cell: (row) => formatDateTime(row?.actionOn),
        },
        {
          name: "Reason",
          selector: (row) => row?.reason || "-",
          minWidth: "200px",
          wrap: true,
          cell: (row) =>
            row?.reason ? (
              <span
                title={row.reason}
                style={{
                  fontSize: "13px",
                  color:
                    row.status === "rejected" ? "#dc3545" : "inherit",
                }}
              >
                {row.reason}
              </span>
            ) : (
              "-"
            ),
        },
      ]
      : []),
  ];
