import { useState } from "react";
import {
    Button,
    ButtonGroup,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import PatientList from "./components/PatientList";
import MedicineApprovalSummary from "./components/MedicineApprovalSummary";
import History from "./components/History";
import { ipdPatients, opdPatients } from "../dummydata";

const MedicineApproval = () => {
    const [activeTab, setActiveTab] = useState("OPD");
    const [activeSubTab, setActiveSubTab] = useState("ALL");

    return (
        <CardBody className="bg-white p-4" style={{ width: "78%" }}>
            <div className="content-wrapper">
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-5 fw-bold text-primary">APPROVE MEDICINE</h1>
                </div>

                <Nav tabs className="mb-3">
                    <NavItem>
                        <NavLink
                            className={activeTab === "OPD" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("OPD");
                                setActiveSubTab("ALL");
                            }}
                            style={{ cursor: "pointer", fontWeight: 500 }}
                        >
                            OPD
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink
                            className={activeTab === "IPD" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("IPD");
                                setActiveSubTab("ALL");
                            }}
                            style={{ cursor: "pointer", fontWeight: 500 }}
                        >
                            IPD
                        </NavLink>
                    </NavItem>
                </Nav>


                <div className="d-flex justify-content-center my-3">
                    <ButtonGroup style={{ gap: "8px" }}>
                        <Button
                            color={activeSubTab === "ALL" ? "primary" : "light"}
                            onClick={() => setActiveSubTab("ALL")}
                            size="sm"
                            style={{
                                minWidth: "90px",
                                fontWeight: 500,
                                borderRadius: "6px",
                                border: activeSubTab === "ALL" ? "none" : "1px solid #ccc",
                                backgroundColor:
                                    activeSubTab === "ALL" ? "#0d6efd" : "transparent",
                                color: activeSubTab === "ALL" ? "#fff" : "#333",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            ALL
                        </Button>

                        <Button
                            color={activeSubTab === "DETAILED" ? "primary" : "light"}
                            onClick={() => setActiveSubTab("DETAILED")}
                            size="sm"
                            style={{
                                minWidth: "90px",
                                fontWeight: 500,
                                borderRadius: "6px",
                                border: activeSubTab === "DETAILED" ? "none" : "1px solid #ccc",
                                backgroundColor:
                                    activeSubTab === "DETAILED" ? "#0d6efd" : "transparent",
                                color: activeSubTab === "DETAILED" ? "#fff" : "#333",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            Detailed
                        </Button>

                        <Button
                            color={activeSubTab === "HISTORY" ? "primary" : "light"}
                            onClick={() => setActiveSubTab("HISTORY")}
                            size="sm"
                            style={{
                                minWidth: "90px",
                                fontWeight: 500,
                                borderRadius: "6px",
                                border: activeSubTab === "HISTORY" ? "none" : "1px solid #ccc",
                                backgroundColor:
                                    activeSubTab === "HISTORY" ? "#0d6efd" : "transparent",
                                color: activeSubTab === "HISTORY" ? "#fff" : "#333",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            History
                        </Button>
                    </ButtonGroup>

                </div>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="OPD">
                        <TabContent activeTab={activeSubTab}>
                            <TabPane tabId="ALL">
                                <div className="p-4 text-center">
                                    <p className="text-muted mb-0">No data available.</p>
                                </div>
                            </TabPane>
                            <TabPane tabId="DETAILED">
                                <PatientList patients={opdPatients} type="OPD" />
                            </TabPane>
                            <TabPane tabId="HISTORY">
                                <div className="p-4 text-center">
                                    <p className="text-muted mb-0">No data available.</p>
                                </div>
                            </TabPane>
                        </TabContent>
                    </TabPane>

                    <TabPane abPane tabId="IPD">
                        <TabContent activeTab={activeSubTab}>
                            <TabPane tabId="ALL">
                                <MedicineApprovalSummary />
                            </TabPane>
                            <TabPane tabId="DETAILED">
                                <PatientList patients={ipdPatients} type="IPD" />
                            </TabPane>
                            <TabPane tabId="HISTORY">
                                <History />
                            </TabPane>
                        </TabContent>
                    </TabPane>
                </TabContent>
            </div>
        </CardBody>

    );
};

export default MedicineApproval;