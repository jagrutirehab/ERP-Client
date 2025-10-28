import React, { useState } from 'react'
import { NavItem, Nav, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from "classnames";
import PaymentProcessing from '../Components/PaymentProcessing';
import PendingApprovals from '../Components/PendingApprovals';

const ApprovalDashboard = () => {

  const [activeTab, setActiveTab] = useState("approval");

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
          <PendingApprovals activeTab={activeTab} />
        </TabPane>
        <TabPane tabId="paymentProcessing">
          <PaymentProcessing activeTab={activeTab} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}



export default ApprovalDashboard;