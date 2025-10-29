import React, { useState } from 'react'
import { NavItem, Nav, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from "classnames";
import PaymentProcessing from '../Components/PaymentProcessing';
import PendingApprovals from '../Components/PendingApprovals';
import { usePermissions } from '../../../Components/Hooks/useRoles';

const ApprovalDashboard = () => {

  const [activeTab, setActiveTab] = useState("approval");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);

  const hasCreatePermission =
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "WRITE") ||
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "DELETE");

  return (
    <React.Fragment>
      <h5 className="fw-bold mb-3">Approval Dashboard</h5>
      <Nav tabs className="mb-2">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "approval" })}
            onClick={() => setActiveTab("approval")}
            style={{ cursor: "pointer" }}
          >
            Pending Approvals
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "paymentProcessing" })}
            onClick={() => setActiveTab("paymentProcessing")}
            style={{ cursor: "pointer" }}
          >
            Payment Processing
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="approval">
          <PendingApprovals activeTab={activeTab} hasCreatePermission={hasCreatePermission} roles={roles} />
        </TabPane>
        <TabPane tabId="paymentProcessing">
          <PaymentProcessing activeTab={activeTab} hasCreatePermission={hasCreatePermission} roles={roles} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}



export default ApprovalDashboard;