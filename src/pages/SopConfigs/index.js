import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import SOPsidebar from "./Sidebar";
import SaveRule from "./pages/SaveRule";
import ManageRules from "./pages/ManageRules";
import Alerts from "./pages/Alerts";
import SopGuide from "./pages/SopGuide";

const SOPindex = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { loading: permissionLoader, hasPermission } =
        usePermissions(token);

    const hasUserPermission = hasPermission("SOPCONFIGS", null, "READ");

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


    return (
        <React.Fragment>
            <div className="page-content p-0 overflow-hidden">
                <div className="patient-page p-0 m-0">
                    <Container fluid className="p-0 m-0">
                        <div className="page-conten overflow-hidden">
                            <div className="patient-page">
                                <Container fluid>
                                    <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">

                                        <SOPsidebar />

                                        <Routes>
                                            <Route path="create" element={<Navigate to="/sop-configs/save" replace />} />
                                            <Route path="save" element={<SaveRule />} />
                                            <Route path="save/:id" element={<SaveRule />} />
                                            <Route path="manage" element={<ManageRules />} />
                                            <Route path="alerts" element={<Alerts />} />
                                            <Route path="guide" element={<SopGuide />} />
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

export default SOPindex;