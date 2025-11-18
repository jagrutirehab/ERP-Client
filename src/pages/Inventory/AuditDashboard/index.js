import { useState } from "react";
import {
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import PendingAudits from "./Views/PendingAudits";
import AuditHistory from "./Views/AuditHistory";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const AuditDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [activeTab, setActiveTab] = useState("PENDING");


  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("PHARMACY", "AUDIT", "READ");

  if (!loading && !hasUserPermission) {
    navigate("/unauthorized");
  }

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left">
          <h1 className="display-6 fw-bold text-primary">AUDIT DASHBOARD</h1>
        </div>
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "PENDING" })}
              onClick={() => toggle("PENDING")}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              Pending
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "HISTORY" })}
              onClick={() => toggle("HISTORY")}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              History
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="PENDING">
            <PendingAudits
              activeTab={activeTab}
              hasUserPermission={hasUserPermission}
              roles={roles} />
          </TabPane>
          <TabPane tabId="HISTORY">
            <AuditHistory
              activeTab={activeTab}
              hasUserPermission={hasUserPermission}
              hasPermission={hasPermission}
              roles={roles} />
          </TabPane>
        </TabContent>
      </div>
    </CardBody>
  );
};

export default AuditDashboard;
