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
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const tabOptions = ["OPD", "IPD"];
const subTabOptions = ["ALL", "DETAILED", "HISTORY"];

const MedicineApproval = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("OPD");
    const [activeSubTab, setActiveSubTab] = useState("ALL");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "MEDICINEAPPROVAL", "READ");


    if (!loading && !hasUserPermission) {
        navigate("/unauthorized");
    }


    return (
        <CardBody className="bg-white px-4 pt-2 w-100">
            <div className="content-wrapper">
                <div className="text-center text-md-left">
                    <h1 className="display-6 fw-bold text-primary">APPROVE MEDICINE</h1>
                </div>

                <Nav tabs className="mb-3">
                    {tabOptions.map((tab) => (
                        <NavItem key={tab}>
                            <NavLink
                                className={activeTab === tab ? "active" : ""}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setActiveSubTab("ALL");
                                }}
                                style={{ cursor: "pointer", fontWeight: 500 }}
                            >
                                {tab}
                            </NavLink>
                        </NavItem>
                    ))}
                </Nav>

                <div className="d-flex justify-content-center">
                    <ButtonGroup style={{ gap: "8px" }}>
                        {subTabOptions.map((tab) => (
                            <Button
                                key={tab}
                                color={activeSubTab === tab ? "primary" : "light"}
                                onClick={() => setActiveSubTab(tab)}
                                size="sm"
                                style={{
                                    minWidth: "90px",
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                    border:
                                        activeSubTab === tab ? "none" : "1px solid #ccc",
                                    backgroundColor:
                                        activeSubTab === tab ? "#0d6efd" : "transparent",
                                    color: activeSubTab === tab ? "#fff" : "#333",
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="OPD">
                        <TabContent activeTab={activeSubTab}>
                            <TabPane tabId="ALL">
                                <MedicineApprovalSummary activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                            <TabPane tabId="DETAILED">
                                <PatientList activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                            <TabPane tabId="HISTORY">
                                <History activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                        </TabContent>
                    </TabPane>

                    <TabPane tabId="IPD">
                        <TabContent activeTab={activeSubTab}>
                            <TabPane tabId="ALL">
                                <MedicineApprovalSummary activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                            <TabPane tabId="DETAILED">
                                <PatientList activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                            <TabPane tabId="HISTORY">
                                <History activeTab={activeTab} activeSubTab={activeSubTab} hasUserPermission={hasUserPermission} />
                            </TabPane>
                        </TabContent>
                    </TabPane>
                </TabContent>
            </div>
        </CardBody>
    );
};

export default MedicineApproval;
