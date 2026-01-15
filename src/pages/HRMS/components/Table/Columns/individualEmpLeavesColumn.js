import { useNavigate } from "react-router-dom";
import { Badge } from "reactstrap";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Left = ({ children }) => (
  <div className="text-start w-100">{children}</div>
);

export const IndividualLeavesColumn = () => [
  {
    name: <div className="text-center">Leave Type</div>,
    selector: (row) => row?.leaveType || "-",
    sortable: true,
    center: true,
  },
  {
    name: <div className="text-center">From</div>,
    selector: (row) =>
      row?.fromDate
        ? new Date(row.fromDate)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .replaceAll(" ", "/")
        : "-",
    center: true,
  },
  {
    name: <div className="text-center">To</div>,
    selector: (row) =>
      row?.toDate
        ? new Date(row.toDate)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .replaceAll(" ", "/")
        : "-",
    grow: 1,
    minWidth: "140px",
    center: true,
  },

  {
    name: <div className="text-center">Shift time</div>,
    selector: (row) => row?.shiftTime || "-",
    grow: 1,
    minWidth: "140px",
    center: true,
  },
  {
    name: <div className="text-center">No.of days</div>,
    selector: (row) => row?.days || "-",
    grow: 1,
    minWidth: "140px",
    center: true,
  },
  {
    name: <div className="text-center">Reason</div>,
    selector: (row) => row?.leaveReason || "-",
    grow: 1,
    minWidth: "140px",
    center: true,
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
];
