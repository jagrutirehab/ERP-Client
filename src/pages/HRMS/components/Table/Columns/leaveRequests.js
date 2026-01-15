import { Badge } from "reactstrap";
import moment from "moment";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Left = ({ children }) => (
  <div className="text-start w-100">{children}</div>
);

export const leaveRequestsColumns = (handleAction, actionLoadingId) => [
  {
    name: <Center>ECode</Center>,
    cell: (row) => <Center>{row?.eCode || "-"}</Center>,
    width: "140px",
  },
  {
    name: <Center>Employee Name</Center>,
    cell: (row) => <Center>{row?.employeeId?.name || "-"}</Center>,
    width: "180px",
  },
  {
    name: <Center>Leave Type</Center>,
    cell: (row) => <Center>{row?.leaveType || "-"}</Center>,
    width: "150px",
  },
  {
    name: <Center>From</Center>,
    cell: (row) => (
      <Center>
        {row?.fromDate ? moment(row.fromDate).format("DD MMM YYYY") : "-"}
      </Center>
    ),
    width: "130px",
  },
  {
    name: <Center>To</Center>,
    cell: (row) => (
      <Center>
        {row?.toDate ? moment(row.toDate).format("DD MMM YYYY") : "-"}
      </Center>
    ),
    width: "130px",
  },
  {
    name: <Center>Days</Center>,
    cell: (row) => <Center>{row?.days ?? "-"}</Center>,
    width: "90px",
  },
  {
    name: <Center>Shift</Center>,
    cell: (row) => <Center>{row?.shiftTime || "-"}</Center>,
    width: "120px",
  },
  {
    name: <Center>Reason</Center>,
    cell: (row) => <Center>{row?.leaveReason || "-"}</Center>,
    width: "220px",
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

      if (status === "pending")
        return (
          <Center>
            <Badge pill color="warning">
              Pending
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
      if (status === "retrieved")
        return (
          <Center>
            <Badge pill color="danger">
              Retrieved
            </Badge>
          </Center>
        );

      return (
        <Center>
          <Badge pill color="secondary">
            Unknown
          </Badge>
        </Center>
      );
    },
    width: "120px",
  },

  {
    name: "Action",
    cell: (row) =>
      row?.status?.toLowerCase() === "pending" ? (
        actionLoadingId === row._id ? (
          <button className="btn btn-sm btn-secondary" disabled>
            Processing...
          </button>
        ) : (
          <div className="d-flex gap-1 justify-content-center">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleAction(row.parentDocId, row._id, "approved")}
            >
              Approve
            </button>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleAction(row.parentDocId, row._id, "rejected")}
            >
              Reject
            </button>
          </div>
        )
      ) : (
        <span className="text-muted">—</span>
      ),
    width: "160px",
  },
  {
    name: <Center>Action On</Center>,
    cell: (row) => (
      <Center>
        {row?.actionOn
          ? new Date(row.actionOn)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(",", "")
          : "-"}
      </Center>
    ),
    width: "120px",
  },
];
