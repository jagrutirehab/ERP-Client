import { Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import Sidebar from "./Sidebar";
import AttendanceLogs from "./Attendance/Logs";
import AttendanceMetrics from "./Attendance/Metrics";
import LeaveHistory from "./Leaves/LeaveHistory";
import LeaveApplications from "./Leaves/LeaveApplications";
import ManageLeaves from "./Leaves/ManageLeaves";
import MyLeaves from "./Leaves/MyLeaves";

const HRMS = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { loading: permissionLoader, hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("HRMS", null, "READ");

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

    document.title = "HRMS Dashboard";

    return (
          <React.Fragment>
            <div className="page-conten overflow-hidden">
                <div className="patient-page">
                    <Container fluid>
                        <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
                            <Sidebar />
                            <Routes>
                    
                                <Route path={`/attendance/logs`} element={<AttendanceLogs />} />
                                <Route path={`/attendance/metrics`} element={<AttendanceMetrics />} />
                                <Route path={`/leaves/history`} element={< LeaveHistory/>} />
                                <Route path={`/leaves/apply`} element={< LeaveApplications/>} />
                                <Route path={`/leaves/manage`} element={< ManageLeaves/>} />
                                <Route path={`/leaves/my/leaves`} element={< MyLeaves/>} />
                            </Routes>
                        </div>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    )
}

export default HRMS;