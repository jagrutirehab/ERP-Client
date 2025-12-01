import { useState } from "react";
import {
    CardBody,
    Nav,
    NavItem,
    NavLink,
    Spinner,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import PendingJoinings from "./Views/PendingJoinings";
import JoiningHistory from "./Views/JoiningHistory";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const NewJoining = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [activeTab, setActiveTab] = useState("PENDING");


    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading, roles } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "NEW_JOININGS", "READ");

    if (!loading && !hasUserPermission) {
        navigate("/unauthorized");
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner color="primary" />
            </div>
        )
    }

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };
    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="content-wrapper">
                <div className="text-center text-md-left">
                    <h1 className="display-6 fw-bold text-primary">NEW JOINING EMPLOYEES</h1>
                </div>
                <Nav tabs className="mb-3">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "PENDING" })}
                            onClick={() => toggle("PENDING")}
                            style={{ cursor: "pointer", fontWeight: 500 }}
                        >
                            Pending
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "HISTORY" })}
                            onClick={() => toggle("HISTORY")}
                            style={{ cursor: "pointer", fontWeight: 500 }}
                        >
                            History
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="PENDING">
                        <PendingJoinings
                            activeTab={activeTab}
                            hasUserPermission={hasUserPermission}
                            hasPermission={hasPermission}
                            roles={roles}
                        />
                    </TabPane>
                    <TabPane tabId="HISTORY">
                        <JoiningHistory
                            activeTab={activeTab}
                            hasUserPermission={hasUserPermission}
                            hasPermission={hasPermission}
                            roles={roles}
                        />
                    </TabPane>
                </TabContent>
            </div>
        </CardBody>
    );
};

export default NewJoining;
