import React from 'react'
import { Container, Spinner } from 'reactstrap';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Employee from './Employee';
import { usePermissions } from '../../Components/Hooks/useRoles';
import NewJoiningApprovals from './NewJoining/Approvals';
import NewJoiningIT from './NewJoining/IT';
import FNFApproval from './ExitEmployees/FNFApproval';
import ExitApprovals from './ExitEmployees/Approvals';
import ExitEmployeeIT from './ExitEmployees/IT';
import TransferApprovals from './Transfer/Approvals';
import OutgoingEmployeeApprovals from './Transfer/OutgoingEmployeeApprovals';
import IncomingEmployeeApprovals from './Transfer/IncomingEmployeeApprovals';
import TransferEmployeeIT from './Transfer/IT';
import SalaryAdvanceApproval from './SalaryAdvance/Approvals';
import AddSalaryAdvanceRequest from './SalaryAdvance/AddRequest';
import AddExitRequest from './ExitEmployees/AddRequest';
import AddNewJoiningRequest from './NewJoining/AddRequest';
import AddTransferRequest from './Transfer/AddRequest';
import AddHiringRequest from './Hiring/AddRequest';
import HiringApproval from './Hiring/Approvals';

const HR = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", null, "READ");

    if (permissionLoader) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner color="primary" />
            </div>
        )
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

                                <Route path={`/new-joinings/add`} element={<AddNewJoiningRequest />} />
                                <Route path={`/new-joinings/approval`} element={<NewJoiningApprovals />} />
                                <Route path={`/new-joinings/it`} element={<NewJoiningIT />} />

                                <Route path={`/exit-employees/add`} element={<AddExitRequest />} />
                                <Route path={`/exit-employees/approval`} element={<ExitApprovals />} />
                                <Route path={`/exit-employees/fnf`} element={<FNFApproval />} />
                                <Route path={`/exit-employees/it`} element={<ExitEmployeeIT />} />

                                <Route path={`/salary-advance/add`} element={<AddSalaryAdvanceRequest />} />
                                <Route path={`/salary-advance/approval`} element={<SalaryAdvanceApproval />} />

                                <Route path={`/transfer-employees/add`} element={<AddTransferRequest />} />
                                <Route path={`/transfer-employees/approval`} element={<TransferApprovals />} />
                                <Route path={`/transfer-employees/outgoing`} element={<OutgoingEmployeeApprovals />} />
                                <Route path={`/transfer-employees/incoming`} element={<IncomingEmployeeApprovals />} />
                                <Route path={`/transfer-employees/it`} element={<TransferEmployeeIT />} />

                                <Route path={`/hiring/add`} element={<AddHiringRequest />} />
                                <Route path={`/hiring/approval`} element={<HiringApproval />} />
                            </Routes>
                        </div>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    )
}

export default HR;