import { Badge } from "reactstrap";

export const policyColumn = () => [
  {
    name: <div>Policy Name</div>,
    selector: (row) => row?.policyName || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Earned Leaves</div>,
    selector: (row) => row?.earnedLeaves || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Festive Leaves</div>,
    selector: (row) => row?.festiveLeaves || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Week Offs</div>,
    selector: (row) => row?.weekOffs || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Unpaid Leaves</div>,
    selector: (row) => row?.unpaidLeaves || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Posted On</div>,
    selector: (row) => row?.postedOn || "-",
    grow: 1.5,
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Status</div>,
    selector: (row) => (
      <Badge color={row?.status === "Active" ? "success" : "danger"}>
        {row?.status || "-"}
      </Badge>
    ),
    grow: 1.2,
    wrap: true,
    minWidth: "120px",
  },
];
