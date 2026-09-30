import { useNavigate } from "react-router-dom";
import { Badge } from "reactstrap";

export const leaveColumns = (navigate) => [
  {
    name: <div className="text-center">ECode</div>,
    selector: (row) => row?.eCode || "-",
    sortable: true,
    center: true,
  },
  {
    name: <div className="text-center">Employee Name</div>,
    selector: (row) => row?.employeeId?.name || "-",
    // sortable: true,
    center: true,
  },
  {
    name: <div className="text-center">Center</div>,
    selector: (row) => row?.center?.title || "-",
    // sortable: true,
    center: true,
  },
  {
    name: <div className="text-center">Approval Manager</div>,
    selector: (row) => row?.approvalAuthority?.name || "-",
    grow: 1,
    minWidth: "140px",
    center: true,
  },
  {
    name: <div className="text-center">View</div>,
    minWidth: "200px",
    center: true,
    cell: (row) => {
      return (
        <div className="d-flex justify-content-center align-items-center w-100">
          <p
            className="text-black m-0 cursor-pointer"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            onClick={() =>
              navigate(`/hr/leaves/history/for/${row?.employeeId?._id}`, {
                state: row,
              })
            }
          >
            View Leaves
          </p>
        </div>
      );
    },
  },
];
