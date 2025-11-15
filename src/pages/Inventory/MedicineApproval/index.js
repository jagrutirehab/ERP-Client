import { useState } from "react";
import {
    Button,
    ButtonGroup,
    CardBody,
    Nav,
    NavItem,
    NavLink
} from "reactstrap";
import PatientList from "./components/PatientList";
import MedicineApprovalSummary from "./components/MedicineApprovalSummary";
import History from "./components/History";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearMedicineApprovals } from "../../../store/features/pharmacy/pharmacySlice";

const tabOptions = ["OPD", "IPD"];
const subTabOptions = ["ALL", "DETAILED", "HISTORY"];

const MedicineApproval = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("OPD");
    const [activeSubTab, setActiveSubTab] = useState("ALL");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "MEDICINEAPPROVAL", "READ");

    if (!loading && !hasUserPermission) {
        navigate("/unauthorized");
    }

    const handleTabSwicth = (type, tab) => {
        dispatch(clearMedicineApprovals());

        if (type === "parent") {
            setActiveTab(() => {
                setActiveSubTab("ALL");
                return tab;
            });
        } else {
            setActiveSubTab(tab);
        }
    };

    const renderComponent = () => {
        if (activeSubTab === "ALL") {
            return (
                <MedicineApprovalSummary
                    activeTab={activeTab}
                    activeSubTab={activeSubTab}
                    hasUserPermission={hasUserPermission}
                />
            );
        }

        if (activeSubTab === "DETAILED") {
            return (
                <PatientList
                    activeTab={activeTab}
                    activeSubTab={activeSubTab}
                    hasUserPermission={hasUserPermission}
                />
            );
        }

        if (activeSubTab === "HISTORY") {
            return (
                <History
                    activeTab={activeTab}
                    activeSubTab={activeSubTab}
                    hasUserPermission={hasUserPermission}
                />
            );
        }
    };

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
                                onClick={() => handleTabSwicth("parent", tab)}
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
                                onClick={() => handleTabSwicth("subTab", tab)}
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

                <div className="mt-4">{renderComponent()}</div>
            </div>
        </CardBody>
    );
};

export default MedicineApproval;
