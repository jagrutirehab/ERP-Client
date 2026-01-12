import React, { useEffect, useState } from "react";
import DataTableComponent from "../../components/Table/DataTable";
import { leaveColumns } from "../../components/Table/Columns/leave";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

// Dummy Data
const leaveHistory = [
  {
    id: 1,
    type: "Earned Leave",
    from: "25-12-2025",
    to: "26-12-2025",
    days: 2,
    status: "Approved",
    manager: "XYZ",
    shift: "Second Half",
    reason: "Personal work",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "19-12-2025",
    to: "19-12-2025",
    days: 1,
    status: "Approved",
    manager: "XYZ",
    shift: "Full Day",
    reason: "Health issue",
  },
  {
    id: 3,
    type: "Casual Leave",
    from: "10-12-2025",
    to: "10-12-2025",
    days: 1,
    status: "Pending",
    manager: "XYZ",
    shift: "First Half",
    reason: "Family function",
  },
];

const LeaveHistory = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [activeTab, setActiveTab] = useState("Approved");
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  // console.log("token", token);

  const {
    hasPermission,
    loading: permissionLoader,
    roles,
  } = usePermissions(token);

  // console.log("roles", roles);

  const hasUserPermission =
    // roles?.name === "SUPERADMIN" ||
    hasPermission("HRMS", "LEAVE_HISTORY", "READ");
  // console.log("hasUserPermission", hasUserPermission);

  useEffect(() => {
    if (!hasUserPermission) {
      navigate("/unauthorized");
    }
  }, []);

  const filteredData = leaveHistory?.filter((item) => item?.status === activeTab);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">LEAVE HISTORY</h1>
      </div>

      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "Approved" })}
            onClick={() => setActiveTab("Approved")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Approved
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "Pending" })}
            onClick={() => setActiveTab("Pending")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Pending
          </NavLink>
        </NavItem>
      </Nav>

      {/* Table */}
      <DataTableComponent
        columns={leaveColumns}
        data={filteredData}
        loading={false}
        pagination={false}
      />
    </CardBody>
  );
};

export default LeaveHistory;
