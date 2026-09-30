import { Button, ButtonGroup, CardBody, Spinner } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { useState } from "react";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import Dashboard from "./Views/Dashboard";
import Logs from "./Views/Logs";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { Navigate } from "react-router-dom";


const tabOptions = ["DASHBOARD", "LOGS"];

const MyAttendance = () => {
    const [activeTab, setActiveTab] = useState("DASHBOARD");
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader } =
        usePermissions(token);

    const hasUserPermission = hasPermission(
        "HR",
        "MY_ATTENDANCE",
        "READ"
    );

    if (permissionLoader) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner
                    color="primary"
                    className="d-block"
                    style={{ width: "3rem", height: "3rem" }}
                />
            </div>
        );
    }

    if (!permissionLoader && !hasUserPermission) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={{ width: isMobile ? "100%" : "78%" }}
        >
            <div className="d-flex justify-content-start mb-3">
                <ButtonGroup>
                    {tabOptions.map((tab) => {
                        const isActive = activeTab === tab;

                        return (
                            <Button
                                key={tab}
                                size="sm"
                                color={isActive ? "primary" : "light"}
                                onClick={() => setActiveTab(tab)}
                                className="mx-1"
                                style={{
                                    minWidth: "100px",
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                    border: isActive ? "none" : "1px solid #ccc",
                                    backgroundColor: isActive ? "#0d6efd" : "transparent",
                                    color: isActive ? "#fff" : "#333",
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                {capitalizeWords(tab)}
                            </Button>
                        );
                    })}
                </ButtonGroup>
            </div>
            <div>
                {activeTab === "DASHBOARD" && (
                    <Dashboard />
                )}
                {activeTab === "LOGS" && (
                    <Logs />
                )}
            </div>
        </CardBody>
    );
};

export default MyAttendance;
