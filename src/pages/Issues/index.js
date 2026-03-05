import { Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import IssuesSidebar from "./Sidebar/sidebar";
import TechIssues from "./Views/TechIssue";
import MyIssues from "./Pages/MyIssues";
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
                                            <Route path="tech" element={<TechIssues />} />
                                            <Route path="my/issues" element={<MyIssues/>}/>
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