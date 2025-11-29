import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import HubSpotContactsTable from "./HubSpotContactsTable";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const MIReporting = () => {
  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasMiReportingViewPermission = hasPermission(
    "MI_REPORTING",
    "VIEW_MI_REPORTING",
    "READ"
  );

  return (
    <div className="mt-4">
      <Card>
        <CardBody>
          <h4 className="card-title mb-4">MI Reporting</h4>

          <Nav tabs className="nav-tabs-custom nav-success mb-3">
            <RenderWhen isTrue={hasMiReportingViewPermission}>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  HubSpot Contacts
                </NavLink>
              </NavItem>
            </RenderWhen>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({ active: activeTab === "2" })}
                onClick={() => toggleTab("2")}
              >
                Lead Analytics
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({ active: activeTab === "3" })}
                onClick={() => toggleTab("3")}
              >
                Conversion Metrics
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({ active: activeTab === "4" })}
                onClick={() => toggleTab("4")}
              >
                Campaign Performance
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <HubSpotContactsTable />
            </TabPane>
            <TabPane tabId="2">
              <div className="text-center py-5">
                <h5 className="text-muted">Lead Analytics - Coming Soon</h5>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div className="text-center py-5">
                <h5 className="text-muted">Conversion Metrics - Coming Soon</h5>
              </div>
            </TabPane>
            <TabPane tabId="4">
              <div className="text-center py-5">
                <h5 className="text-muted">
                  Campaign Performance - Coming Soon
                </h5>
              </div>
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};

export default MIReporting;
