import { Badge } from "reactstrap";
import moment from "moment";
import ButtonLoader from "../../../../../Components/Common/ButtonLoader";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Left = ({ children }) => (
  <div className="text-start w-100">{children}</div>
);

export const MyLeavesColumn = (handleAction, loadingLeaveId) => [
  {
    name: <Center>ECode</Center>,
    cell: (row) => <Center>{row?.eCode || "-"}</Center>,
    width: "140px",
  },
  {
    name: <Center>Manager Name</Center>,
    cell: (row) => <Center>{row?.approvalAuthority?.name || "-"}</Center>,
    width: "180px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => <Center>{row?.center?.name || "-"}</Center>,
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
            <Badge pill color="secondary">
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
        <div className="d-flex gap-1 justify-content-center">
          <button
            className="btn btn-sm btn-warning"
            disabled={loadingLeaveId === row._id}
            onClick={() =>
              handleAction(row.parentDocId, row._id, "retrieved", "retrieve")
            }
          >
            {loadingLeaveId === row._id ? "Processing..." : "Retrieve"}
          </button>

          {/* <button
            className="btn btn-sm btn-warning"
            disabled={loadingLeaveId === row._id}
            onClick={() =>
              handleAction(row.parentDocId, row._id, "deleted", "delete")
            }
          >
            {loadingLeaveId === row._id ? "Processing..." : "Delete"}
          </button> */}
        </div>
      ) : (
        <span className="text-muted">—</span>
      ),
    width: "200px",
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
