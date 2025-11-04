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
import PendingAudits from "./components/PendingAudits";
import AuditHistory from "./components/AuditHistory";

const AuditDashboard = () => {
  const [activeTab, setActiveTab] = useState("PENDING");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <CardBody className="p-3 bg-white" style={{ width: "78%" }}>
      <div className="content-wrapper">
        <div className="text-center text-md-left mb-4">
          <h1 className="display-4 font-weight-bold text-primary">AUDIT DASHBOARD</h1>
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
            <PendingAudits />
          </TabPane>
          <TabPane tabId="HISTORY">
            <AuditHistory />
          </TabPane>
        </TabContent>
      </div>
    </CardBody>
  );
};

export default AuditDashboard;
