import { useState } from "react";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useNavigate } from "react-router-dom";
import ReturnableList from "./components/ReturnableList";
import ReturnHistoryList from "./components/ReturnHistoryList";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const SUB_TAB_OPTIONS = [
    { value: "PENDING", label: "Dispensed" },
    { value: "HISTORY", label: "Returned" },
];

const MedicineReturn = () => {
    const navigate = useNavigate();
    const [activeSubTab, setActiveSubTab] = useState("PENDING");
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "MEDICINE_RETURN", "READ");

    if (!loading && !hasUserPermission) {
        navigate("/unauthorized");
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="d-flex flex-column h-100">
                <div className="mb-3">
                    <h5 className="mb-1 fw-semibold">Medicine Return</h5>
                    <p className="text-muted mb-0 fs-13">
                        Return dispensed medicines back to inventory
                    </p>
                </div>

                <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
                    {SUB_TAB_OPTIONS.map((tab) => {
                        const isActive = activeSubTab === tab.value;
                        return (
                            <NavItem key={tab.value}>
                                <NavLink
                                    href="#"
                                    active={isActive}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveSubTab(tab.value);
                                    }}
                                    style={{
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
                                    }}
                                >
                                    {tab.label}
                                </NavLink>
                            </NavItem>
                        );
                    })}
                </Nav>

                <div className="mt-3">
                    {activeSubTab === "PENDING" && (
                        <ReturnableList activeTab="IPD" hasUserPermission={hasUserPermission} />
                    )}
                    {activeSubTab === "HISTORY" && (
                        <ReturnHistoryList activeTab="IPD" hasUserPermission={hasUserPermission} />
                    )}
                </div>
            </div>
        </CardBody>
    );
};

export default MedicineReturn;
