import { Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import IssuesSidebar from "./Sidebar/sidebar";
import MyIssues from "./Pages/MyIssues";
import IssuesPage from "./Views/IssuesPage";
import RaiseTicket from "./Pages/RaiseTicket";
import Dashboard from "./Pages/Dashboard";
import MyRaisedTickets from "./Pages/MyRaisedTickets";
import HRissuesRequests from "./Pages/HRissuesRequests";
import FinanceIssues from "./Pages/FinanceIssues";
import PayslipsRequests from "./Pages/PayslipsRequests";
// import IssuesSidebar from "./Sidebar";
// import TechIssues from "./TechIssues";
// import OtherIssues from "./OtherIssues";

const Issues = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { loading: permissionLoader, hasPermission } =
        usePermissions(token);

    const hasUserPermission = hasPermission("ISSUES", null, "READ");

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

    document.title = "Issues Dashboard";

    const type = "";

    return (
        <React.Fragment>
            <div className="page-content p-0 overflow-hidden">
                <div className="patient-page p-0 m-0">
                    <Container fluid className="p-0 m-0">
                        <div className="page-conten overflow-hidden">
                            <div className="patient-page">
                                <Container fluid>
                                    <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">

                                        <IssuesSidebar />

                                        <Routes>
                                            {/* <Route index element={<TechIssues />} /> */}
                                            <Route path="tech" element={<IssuesPage type={"TECH"} />} />
                                            <Route path="purchase" element={<IssuesPage type={"PURCHASE"} />} />
                                            <Route path="review-submissions" element={<IssuesPage type={"REVIEW_SUBMISSION"} />} />
                                            <Route path="hr/issues" element={<IssuesPage type={"HR"} />} />
                                            
                                            <Route path="/my/finance/tickets" element={<FinanceIssues />} />
                                            <Route path="/finance/payslips/tickets" element={<PayslipsRequests />} />

                                            
                                            {/* <Route path="hr/issues/requests" element={<HRissuesRequests />} /> */}
                                            <Route path="my/issues" element={<MyIssues />} />
                                            <Route path="my/raised/tickets" element={<MyRaisedTickets />} />
                                            <Route path="raise/ticket" element={<RaiseTicket />} />
                                            <Route path="dashboard" element={<Dashboard />} />
                                        </Routes>
                                    </div>
                                </Container>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Issues;