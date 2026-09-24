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
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const tabOptions = ["OPD", "IPD"];
const subTabOptions = ["ALL", "DETAILED", "HISTORY"];

const tabNavStyle = (isActive) => ({
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    cursor: "pointer",
    color: isActive ? "#212529" : "#0d6efd",
    background: isActive ? "#fff" : "transparent",
    border: isActive ? "1px solid #dee2e6" : "none",
    borderBottom: isActive ? "1px solid #fff" : "none",
    borderRadius: isActive ? "4px 4px 0 0" : 0,
    padding: "6px 14px",
    marginBottom: -1,
    textDecoration: "none",
});

const MedicineApproval = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("OPD");
    const [activeSubTab, setActiveSubTab] = useState("ALL");
    const isMobile = useMediaQuery("(max-width: 1000px)");
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
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="d-flex flex-column h-100">
                <div className="mb-3">
                    <h5 className="mb-1 fw-semibold">Medicine Approval</h5>
                    <p className="text-muted mb-0 fs-13">
                        Review and approve prescribed medicines for dispensing
                    </p>
                </div>

                <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
                    {tabOptions.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <NavItem key={tab}>
                                <NavLink
                                    href="#"
                                    active={isActive}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleTabSwicth("parent", tab);
                                    }}
                                    style={tabNavStyle(isActive)}
                                >
                                    {tab}
                                </NavLink>
                            </NavItem>
                        );
                    })}
                </Nav>

                <div className="d-flex justify-content-center mt-3">
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
