import React from "react";
import { Container, Spinner } from "reactstrap";
import { Route, Routes, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Employee from "./Employee";
import { usePermissions } from "../../Components/Hooks/useRoles";
import NewJoiningApprovals from "./NewJoining/Approvals";
import NewJoiningIT from "./NewJoining/IT";
import FNFApproval from "./ExitEmployees/FNFApproval";
import ExitApprovals from "./ExitEmployees/Approvals";
import ExitEmployeeIT from "./ExitEmployees/IT";
import TransferApprovals from "./Transfer/Approvals";
import OutgoingEmployeeApprovals from "./Transfer/OutgoingEmployeeApprovals";
import IncomingEmployeeApprovals from "./Transfer/IncomingEmployeeApprovals";
import TransferEmployeeIT from "./Transfer/IT";
import SalaryAdvanceApproval from "./SalaryAdvance/Approvals";
import AddSalaryAdvanceRequest from "./SalaryAdvance/AddRequest";
import AddExitRequest from "./ExitEmployees/AddRequest";
import AddNewJoiningRequest from "./NewJoining/AddRequest";
import AddTransferRequest from "./Transfer/AddRequest";
import AddHiringRequest from "./Hiring/AddRequest";
import HiringApproval from "./Hiring/Approvals";
import AddTPMRequest from "./TPM/AddRequest";
import TPMApproval from "./TPM/Approvals";
import AttendanceLogs from "../HRMS/Attendance/Logs";
import AttendanceMetrics from "../HRMS/Attendance/Metrics";
import MyAttendance from "../HRMS/Attendance/MyAttendance";
import EmployeeAttendance from "../HRMS/Attendance/EmployeeDetails";
import AssignManager from "../HRMS/EmployeeReporting/AssignManager";
import ManageEmployeeReportings from "../HRMS/EmployeeReporting/Manage";
import LeaveHistory from "../HRMS/Leaves/LeaveHistory";
import LeaveApplications from "../HRMS/Leaves/LeaveApplications";
import ManageLeaves from "../HRMS/Leaves/ManageLeaves";
import MyLeaves from "../HRMS/Leaves/MyLeaves";
import Policies from "../HRMS/Policies";
import IndividualLeavesOfEmp from "../HRMS/Leaves/EmployeeIndvidualLeaves";
import GetBalanceLeaves from "../HRMS/Leaves/getBalanceLeaves";
import MyRegularizations from "../HRMS/Attendance/Regularization/myRegularizations";
import GetRegularizationsRequest from "../HRMS/Attendance/Regularization/getRequest";
import AddIncentivesRequest from "./Incentives/AddRequest";
import IncentivesApproval from "./Incentives/Approvals";
import MainDashboard from "../HRMS/Attendance/MainDashboard";

const HR = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", null, "READ");

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  if (!permissionLoader && !hasUserPermission) {
    navigate("/unauthorized");
  }

  document.title = "HR Dashboard";

  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="patient-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar />
              <Routes>
                {/* <Route path={`/dashboard`} element={<HRDashboard />} /> */}
                <Route path={`/employee`} element={<Employee />} />
                {/* <Route path={`/approvals`} element={<ApprovalDashboard />} /> */}

                <Route
                  path={`/new-joinings/add`}
                  element={<AddNewJoiningRequest />}
                />
                <Route
                  path={`/new-joinings/approval`}
                  element={<NewJoiningApprovals />}
                />
                <Route path={`/new-joinings/it`} element={<NewJoiningIT />} />

                <Route
                  path={`/exit-employees/add`}
                  element={<AddExitRequest />}
                />
                <Route
                  path={`/exit-employees/approval`}
                  element={<ExitApprovals />}
                />
                <Route path={`/exit-employees/fnf`} element={<FNFApproval />} />
                <Route
                  path={`/exit-employees/it`}
                  element={<ExitEmployeeIT />}
                />

                <Route
                  path={`/salary-advance/add`}
                  element={<AddSalaryAdvanceRequest />}
                />
                <Route
                  path={`/salary-advance/approval`}
                  element={<SalaryAdvanceApproval />}
                />

                <Route
                  path={`/transfer-employees/add`}
                  element={<AddTransferRequest />}
                />
                <Route
                  path={`/transfer-employees/approval`}
                  element={<TransferApprovals />}
                />
                <Route
                  path={`/transfer-employees/outgoing`}
                  element={<OutgoingEmployeeApprovals />}
                />
                <Route
                  path={`/transfer-employees/incoming`}
                  element={<IncomingEmployeeApprovals />}
                />
                <Route
                  path={`/transfer-employees/it`}
                  element={<TransferEmployeeIT />}
                />

                <Route path={`/hiring/add`} element={<AddHiringRequest />} />
                <Route path={`/hiring/approval`} element={<HiringApproval />} />

                <Route path={`/tpm/add`} element={<AddTPMRequest />} />
                <Route path={`/tpm/approval`} element={<TPMApproval />} />


                <Route path={`/attendance/main/dashboard`} element={<MainDashboard />} />
                <Route path={`/attendance/logs`} element={<AttendanceLogs />} />
                <Route
                  path={`/attendance/metrics`}
                  element={<AttendanceMetrics />}
                />
                <Route path={`/attendance/self`} element={<MyAttendance />} />
                <Route
                  path={`/attendance/:employeeId`}
                  element={<EmployeeAttendance />}
                />
                <Route path={`/reporting/assign`} element={<AssignManager />} />
                <Route
                  path={`/reporting/manage`}
                  element={<ManageEmployeeReportings />}
                />

                <Route path={`/attendance/my/regularizations`} element={<MyRegularizations />} />
                <Route path={`/attendance/regularizations/requests`} element={<GetRegularizationsRequest />} />


                <Route path={`/leaves/history`} element={<LeaveHistory />} />
                <Route path={`/leaves/apply`} element={<LeaveApplications />} />
                <Route path={`/leaves/manage`} element={<ManageLeaves />} />
                <Route path={`/leaves/my/leaves`} element={<MyLeaves />} />
                <Route path={`/leaves/my/balance/leaves`} element={<GetBalanceLeaves />} />
                <Route path={`/policies`} element={<Policies />} />
                <Route
                  path={"/leaves/history/for/:id"}
                  element={<IndividualLeavesOfEmp />}
                />

                <Route path={`/incentives/add`} element={<AddIncentivesRequest />} />
                <Route path={`/incentives/approval`} element={<IncentivesApproval />} />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default HR;
