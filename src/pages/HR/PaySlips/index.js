import { useMemo, useState } from "react";
import {
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import MyPaySlips from "./Views/MyPaySlips";
import EmployeePaySlips from "./Views/EmployeePaySlips";

const tabStyles = {
  base: {
    cursor: "pointer",
    fontWeight: 500,
    borderRadius: "6px 6px 0 0",
    padding: "8px 16px",
    transition: "color 0.15s ease",
    // Reset all Bootstrap active-tab styles
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#6c757d",
  },
  active: {
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid #3f5f9f",
    color: "#3f5f9f",
    fontWeight: 600,
  },
};

const Payslips = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [searchParams] = useSearchParams();

  const microUser = localStorage.getItem("micrologin");
  const parsedUser = microUser ? JSON.parse(microUser) : null;
  const token = parsedUser?.token || null;

  const { hasPermission, loading } = usePermissions(token);

  // Everyone can see their own payslip
  const hasMyPayslipPermission = true;

  // Only HR users can see employee payslips
  const hasEmployeePayslipPermission = hasPermission(
    "HR",
    "EMPLOYEE_PAYSLIPS",
    "READ"
  );

  const defaultTab = useMemo(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "EMPLOYEE_PAYSLIPS" &&
      hasEmployeePayslipPermission
    ) {
      return "EMPLOYEE_PAYSLIPS";
    }
    return "MY_PAYSLIPS";
  }, [searchParams, hasEmployeePayslipPermission]);

  const [activeTab, setActiveTab] = useState(defaultTab);

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

  if (!hasMyPayslipPermission && !hasEmployeePayslipPermission) {
    navigate("/unauthorized");
  }

  const toggle = (tab, e) => {
    // Stop the click from bubbling up to any sidebar-closing parent handlers
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (tab === "EMPLOYEE_PAYSLIPS" && !hasEmployeePayslipPermission) return;
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left">
          <h1 className="display-6 fw-bold text-primary">PAYSLIPS</h1>
        </div>

        <Nav
          tabs
          className="mb-3"
          style={{ borderBottom: "1px solid #dee2e6" }}
        >
          <NavItem>
            <NavLink
              tag="button"
              type="button"
              className={classnames({ active: activeTab === "MY_PAYSLIPS" })}
              onClick={(e) => toggle("MY_PAYSLIPS", e)}
              style={{
                ...tabStyles.base,
                ...(activeTab === "MY_PAYSLIPS" ? tabStyles.active : {}),
              }}
            >
              My Pay Slips
            </NavLink>
          </NavItem>

          {hasEmployeePayslipPermission && (
            <NavItem>
              <NavLink
                tag="button"
                type="button"
                className={classnames({
                  active: activeTab === "EMPLOYEE_PAYSLIPS",
                })}
                onClick={(e) => toggle("EMPLOYEE_PAYSLIPS", e)}
                style={{
                  ...tabStyles.base,
                  ...(activeTab === "EMPLOYEE_PAYSLIPS"
                    ? tabStyles.active
                    : {}),
                }}
              >
                Employees Pay Slips
              </NavLink>
            </NavItem>
          )}
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="MY_PAYSLIPS">
            <MyPaySlips activeTab={activeTab} />
          </TabPane>

          {hasEmployeePayslipPermission && (
            <TabPane tabId="EMPLOYEE_PAYSLIPS">
              <EmployeePaySlips activeTab={activeTab} />
            </TabPane>
          )}
        </TabContent>
      </div>
    </CardBody>
  );
};

export default Payslips;