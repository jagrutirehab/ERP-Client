import React, { useState } from "react";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";
import classnames from "classnames";
import SummaryReport from "../Components/SummaryReport";
import DetailedReport from "../Components/DetailedReport";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("CASH", "CASHREPORTS", "READ");

  if (!hasUserPermission) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">
          You don't have permission to access this section
        </h5>
      </div>
    );
  }

  return (
    <React.Fragment>
      <h5 className="fw-bold mb-3">Financial Reports</h5>

      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "summary" })}
            onClick={() => setActiveTab("summary")}
            style={{ cursor: "pointer" }}
          >
            Summary Report
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "detail" })}
            onClick={() => setActiveTab("detail")}
            style={{ cursor: "pointer" }}
          >
            Detailed Report
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <SummaryReport
          activeTab={activeTab}
          roles={roles}
          hasUserPermission={hasUserPermission}
        />
        <DetailedReport
          activeTab={activeTab}
          roles={roles}
          hasUserPermission={hasUserPermission}
        />
      </TabContent>
    </React.Fragment>
  );
};

export default Reports;
