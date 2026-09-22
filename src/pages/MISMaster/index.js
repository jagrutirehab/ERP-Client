import React, { useState } from "react";
import { Container, Card, CardBody, Nav, NavItem, NavLink, Col, Row } from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Reports from "./Views/Reports";
import RunScripts from "./Views/RunScripts";
import RunHistory from "./Views/RunHistory";

const TABS = [
    { id: "reports", label: "Reports" },
    { id: "scripts", label: "Run Scripts" },
    { id: "history", label: "Run History" },
];

const MISMaster = () => {
    const [activeTab, setActiveTab] = useState("reports");

    document.title = "MIS Master";

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="MIS Master" pageTitle="MIS Master" />

                <Row>
                    <Col md={2}>
                        <Card>
                            <CardBody className="p-2">
                                <Nav pills className="flex-column">
                                    {TABS.map((tab) => (
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
            </Container>
        </div>
    );
};

export default MISMaster;
