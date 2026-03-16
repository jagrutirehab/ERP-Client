import { Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import RecordingSidebar from "./Sidebar/sidebar";
import CallRecordings from "./Pages/CallRecordings";
import MoreDetails from "./Pages/MoreDetails";

const RecordingIndex = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { loading: permissionLoader, hasPermission } =
        usePermissions(token);

    // const hasUserPermission = hasPermission("ISSUES", null, "READ");

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

    // if (!permissionLoader && !hasUserPermission) {
    //     navigate("/unauthorized");
    // }

    // document.title = "recording Dashboard";

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

                                        <RecordingSidebar />

                                        <Routes>
                                            {/* <Route index element={<TechIssues />} /> */}
                                            <Route path="call" element={<CallRecordings/>} />
                                            <Route path="more/:id" element={<MoreDetails />} />
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

export default RecordingIndex;