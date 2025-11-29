import { useState } from 'react';
import {
  Button,
  ButtonGroup,
  CardBody, Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';
import TechIssue from './Views/TechIssue';
import Hiring from './Views/Hiring';
import SalaryAdvance from './Views/SalaryAdvance';
import ExitEmployees from './Views/ExitEmployees';

const tabOptions = ["PENDING", "HISTORY"];
const subTabOptions = ["HIRING", "TECH ISSUE", "NEW JOINNING", "EMPLOYEE LEAVING ORGANIZATION", "TRANSFER OF EMPLOYEE", "SALARY ADVANCE", "THIRD PARTY MANPOWER"];

const ApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [activeSubTab, setActiveSubTab] = useState("HIRING");

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const handleTabSwicth = (type, tab) => {
    // dispatch(clearMedicineApprovals());

    if (type === "parent") {
      setActiveTab(() => {
        setActiveSubTab("HIRING");
        return tab;
      });
    } else {
      setActiveSubTab(tab);
    }
  };

  const renderComponent = () => {
    if (activeSubTab === "HIRING") {
      return (
        <Hiring activeTab={activeTab} />
      )
    }

    if (activeSubTab === "TECH ISSUE") {
      return (
        <TechIssue activeTab={activeTab} />
      )
    }

    if (activeSubTab === "SALARY ADVANCE") {
      return (
        <SalaryAdvance activeTab={activeTab} />
      )
    }

    if (activeSubTab === "EMPLOYEE LEAVING ORGANIZATION") {
      return (
        <ExitEmployees activeTab={activeTab} />
      )
    }
  }

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">
          APPROVALS
        </h1>
      </div>
      <Nav tabs className="mb-3">
        {tabOptions.map((tab) => (
          <NavItem key={tab}>
            <NavLink
              className={activeTab === tab ? "active" : ""}
              onClick={() => handleTabSwicth("parent", tab)}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <div className="d-flex justify-content-center">
        <ButtonGroup style={{ gap: "8px" }}>
          {subTabOptions.map((tab) => (
            <Button
              key={tab}
              color={activeSubTab === tab ? "primary" : "light"}
              onClick={() => handleTabSwicth("subTab", tab)}
              size="sm"
              style={{
                minWidth: "90px",
                fontWeight: 500,
                borderRadius: "6px",
                border:
                  activeSubTab === tab ? "none" : "1px solid #ccc",
                backgroundColor:
                  activeSubTab === tab ? "#0d6efd" : "transparent",
                color: activeSubTab === tab ? "#fff" : "#333",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="mt-4">{renderComponent()}</div>
    </CardBody>
  )
}

export default ApprovalDashboard;