import React from 'react'
import { Container, Spinner } from 'reactstrap';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Employee from './Employee';
import NewJoining from './NewJoining';
import { usePermissions } from '../../Components/Hooks/useRoles';
import ExitEmployees from './ExitEmployees';

const HR = () => {
    const navigate = useNavigate();
    console.log({ Sidebar, Employee, NewJoining, ExitEmployees });


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
                                <Route path={`/new-joinings`} element={<NewJoining />} />
                                <Route path={`/exit-employees`} element={<ExitEmployees />} />
                            </Routes>
                        </div>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    )
}

export default HR;