import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import CityLeadStatus from "./CityLeadStatus";
import OwnerLeadStatus from "./OwnerLeadStatus";

const LeadStatus = () => {
  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Lead Status" pageTitle="MI Reporting" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Nav tabs className="nav-tabs-custom nav-success mb-3">
                  <NavItem>
                    <NavLink
                      style={{ cursor: "pointer" }}
                      className={classnames({
                        active: activeTab === "1",
                      })}
                      onClick={() => {
                        toggleTab("1");
                      }}
                    >
                      City Wise
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      style={{ cursor: "pointer" }}
                      className={classnames({
                        active: activeTab === "2",
                      })}
                      onClick={() => {
                        toggleTab("2");
                      }}
                    >
                      Owner Wise
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <CityLeadStatus />
                  </TabPane>
                  <TabPane tabId="2">
                    <OwnerLeadStatus />
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LeadStatus;
