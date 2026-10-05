import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, CardBody, Nav, NavItem, NavLink, Col, Row, Spinner } from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { usePermissions } from "../../Components/Hooks/useRoles";
import Reports from "./Views/Reports";
import RunScripts from "./Views/RunScripts";
import RunHistory from "./Views/RunHistory";

const ALL_TABS = [
    { id: "reports", label: "Reports", permission: "REPORTS" },
    { id: "scripts", label: "Run Scripts", permission: "RUN_SCRIPTS" },
    { id: "history", label: "Run History", permission: "RUN_HISTORY" },
];

const MISMaster = () => {
    const navigate = useNavigate();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { loading: permissionLoader, hasPermission } = usePermissions(token);

    const tabs = useMemo(
        () => ALL_TABS.filter((tab) => hasPermission("MIS_MASTER", tab.permission, "READ")),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [permissionLoader]
    );

    useEffect(() => {
        if (permissionLoader) return;
        if (tabs.length === 0) {
            navigate("/unauthorized");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabs, permissionLoader]);

    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        if (!permissionLoader && !activeTab && tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionLoader, tabs]);

    document.title = "MIS Master";

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="MIS Master" pageTitle="MIS Master" />

                {permissionLoader || tabs.length === 0 ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : (
                    <Row>
                        <Col md={2}>
                            <Card>
                                <CardBody className="p-2">
                                    <Nav pills className="flex-column">
                                        {tabs.map((tab) => (
                                            <NavItem key={tab.id}>
                                                <NavLink
                                                    className={classnames({ active: activeTab === tab.id }, "mb-1")}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setActiveTab(tab.id)}
                                                >
                                                    {tab.label}
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                    </Nav>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md={10}>
                            {activeTab === "reports" && <Reports />}
                            {activeTab === "scripts" && <RunScripts />}
                            {activeTab === "history" && <RunHistory />}
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default MISMaster;
