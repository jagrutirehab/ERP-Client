import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import {
  CardBody,
  Nav,
  NavItem,
  Spinner,
  TabContent,
  TabPane,
  NavLink,
} from "reactstrap";
import PendingApprovals from "./Views/PendingApprovals";
import ApprovalHistory from "./Views/ApprovalHistory";
import Status from "./Views/Status";

const HiringApproval = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [activeTab, setActiveTab] = useState("PENDING");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "HIRING_APPROVAL", "READ");

  if (!loading && !hasUserPermission) {
    navigate("/unauthorized");
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
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
          <h1 className="display-6 fw-bold text-primary">HIRING STATUS AND APPROVALS</h1>
        </div>
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "PENDING" })}
              onClick={() => toggle("PENDING")}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              Pending Approvals
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "STATUS" })}
              onClick={() => toggle("STATUS")}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              Hiring Status
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "HISTORY" })}
              onClick={() => toggle("HISTORY")}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              Approval History
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="PENDING">
            <PendingApprovals activeTab={activeTab} />
          </TabPane>
          <TabPane tabId="HISTORY">
            <ApprovalHistory activeTab={activeTab} />
          </TabPane>
          <TabPane tabId="STATUS">
            <Status activeTab={activeTab} />
          </TabPane>
        </TabContent>
      </div>
    </CardBody>
  );
};

export default HiringApproval;
