import { Badge } from "reactstrap";

export const leaveColumns = [
  {
    name: <div>ECode</div>,
    selector: (row) => row?.id || "-",
    sortable: true,
  },
  {
    name: <div>Leave Type</div>,
    selector: (row) => row?.type || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Approval Manager</div>,
    selector: (row) => row?.manager || "-",
    grow: 1,
    minWidth: "140px",
  },
  {
    name: <div>From</div>,
    selector: (row) => row?.from || "-",
    grow: 1,
    minWidth: "120px",
  },
  {
    name: <div>To</div>,
    selector: (row) => row?.to || "-",
    grow: 1,
    minWidth: "120px",
  },
  {
    name: <div>Days</div>,
    selector: (row) => row?.days ?? "-",
    center: true,
    grow: 0.6,
    minWidth: "80px",
  },
  {
    name: <div>Leave Shift</div>,
    selector: (row) => row?.shift || "-",
    grow: 1,
    minWidth: "120px",
  },
  {
    name: <div>Reason</div>,
    selector: (row) => row?.reason || "-",
    wrap: true,
    grow: 2,
    minWidth: "200px",
  },
  {
    name: <div>Status</div>,
    selector: (row) => {
      const status = row?.status;

      if (status === "Approved") {
        return <Badge color="success">Approved</Badge>;
      }

      if (status === "Pending") {
        return <Badge color="warning">Pending</Badge>;
      }

      return "-";
    },
    center: true,
    grow: 1,
    minWidth: "120px",
  },
];
