import { Badge } from "reactstrap";
import moment from "moment";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";

const Center = ({ children }) => (
  <div className="d-flex justify-content-center align-items-center">
    {children}
  </div>
);

export const HiringActionColumns = ({ onActionClick }) => [
  {
    name: <Center>Role</Center>,
    cell: (row) => <Center>{row?.designation?.name || "-"}</Center>,
    minWidth: "220px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
    minWidth: "120px",
  },
  {
    name: <Center>Center Manager</Center>,
    cell: (row) => <Center>{row?.centerManager?.name || "-"}</Center>,
    minWidth: "150px",
  },
  {
    name: <Center>Center Manager Contact</Center>,
    cell: (row) => <Center>{row?.centerManager?.mobile || "-"}</Center>,
    minWidth: "180px",
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
    name: <Center>HR</Center>,
    cell: (row) => <Center>{row?.hr?.name || row?.hr || "-"}</Center>,
    width: "140px",
  },

  {
    name: <Center>Filled By</Center>,
    cell: (row) => (
      <Center>{row?.filledBy?.name || row?.filledBy || "-"}</Center>
    ),
    width: "140px",
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
    name: <Center>Acted On</Center>,
    cell: (row) => (
      <Center>
        {row?.actedAt ? moment(row.actedAt).format("DD-MM-YYYY") : "-"}
      </Center>
    ),
    width: "150px",
  },
  {
    name: <Center>Interviewer</Center>,
    cell: (row) => <Center>{row?.interviewer?.name || "-"}</Center>,
    width: "150px",
  },
  {
    name: <Center>Update Status</Center>,
    cell: (row) => <Center>{row?.updateStatus || "-"}</Center>,
    width: "150px",
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
    name: <Center>Acted On</Center>,
    cell: (row) => (
      <Center>
        {row?.updatedAt ? moment(row?.updatedAt).format("DD-MM-YYYY") : "-"}
      </Center>
    ),
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
