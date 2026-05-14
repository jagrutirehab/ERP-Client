import { Route, Routes, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Container, Spinner } from "reactstrap";
import React from "react";
import Trainingsidebar from "./Sidebar";
import Upload from "./Pages/Upload";
import Trainings from "./Pages/Trainings";
import AllTrainings from "./Pages/AllTrainings";
import TrainingDetail from "./Pages/TrainingDetail";
import TrainingHistory from "./Pages/TrainingHistory";
import TrainingHistoryDetail from "./Pages/HistoryDetail";
import CreateTrainers from "./Pages/CreateTrainers";
import TrainingRecords from "./Pages/TrainingRecords";

const Trainingindex = () => {
    const navigate = useNavigate();

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { loading: permissionLoader, hasPermission } =
        usePermissions(token);

    const hasUserPermission = hasPermission("TRAININGS", null, "READ");

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
                                        <Trainingsidebar />
                                        <Routes>
                                            <Route path="upload" element={<Upload />} />
                                            <Route path="view" element={<Trainings />} />
                                            <Route path="all" element={<AllTrainings />} />
                                            <Route path=":id" element={<TrainingDetail />} />
                                            <Route path="history" element={<TrainingHistory />} />
                                            <Route path="history/:id" element={<TrainingHistoryDetail />} />
                                            <Route path="create/record" element={<CreateTrainers />} />
                                            <Route path="get/record" element={<TrainingRecords />} />
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

export default Trainingindex;