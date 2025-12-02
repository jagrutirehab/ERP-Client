import React, { useEffect } from "react";
import { Container } from "reactstrap";
import { Route, Routes, useNavigate } from "react-router-dom";

//redux
import { connect } from "react-redux";
import { usePermissions } from "../../Components/Hooks/useRoles";

// Components
import Sidebar from "./Sidebar";
import CenterLeadsMoM from "./CenterLeadsMoM";
import CenterLeadsMTD from "./CenterLeadsMTD";
import OwnerLeadsMoM from "./OwnerLeadsMoM";
import OwnerLeadsMTD from "./OwnerLeadsMTD";
import CityQuality from "./CityQuality";
import OwnerQuality from "./OwnerQuality";

import CityVisitDate from "./VisitDate/CityVisitDate";
import OwnerVisitDate from "./VisitDate/OwnerVisitDate";
import CityVisitedDate from "./VisitedDate/CityVisitedDate";
import OwnerVisitedDate from "./VisitedDate/OwnerVisitedDate";
import CityLeadStatus from "./LeadStatus/CityLeadStatus";
import OwnerLeadStatus from "./LeadStatus/OwnerLeadStatus";

const HubspotReporting = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasHubspotReportingPermission = hasPermission(
    "HUBSPOT_REPORTING",
    null,
    "READ"
  );

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasHubspotReportingPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHubspotReportingPermission, permissionLoader]);

  const hasHubspotCenterLeadsPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CENTER_LEADS_COUNT",
    "READ"
  );
  const hasHubspotOwnerLeadsPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_LEADS_COUNT",
    "READ"
  );
  const hasHubspotCityQualityPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_QUALITY_BREAKDOWN",
    "READ"
  );
  const hasHubspotOwnerQualityPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_QUALITY_BREAKDOWN",
    "READ"
  );
  const hasHubspotCityVisitPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_VISIT_DATE",
    "READ"
  );
  const hasHubspotOwnerVisitPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_VISIT_DATE",
    "READ"
  );
  const hasHubspotCityVisitedPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_VISITED_DATE",
    "READ"
  );
  const hasHubspotOwnerVisitedPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_VISITED_DATE",
    "READ"
  );
  const hasHubspotCityLeadStatusPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_LEAD_STATUS",
    "READ"
  );
  const hasHubspotOwnerLeadStatusPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_LEAD_STATUS",
    "READ"
  );

  return (
    <React.Fragment>
      <div className="page-content overflow-hidden">
        <div className="">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar />
              <Routes>
                {hasHubspotCenterLeadsPermission && (
                  <Route
                    path="/center-leads-mom"
                    element={<CenterLeadsMoM />}
                  />
                )}
                {hasHubspotCenterLeadsPermission && (
                  <Route
                    path="/center-leads-mtd"
                    element={<CenterLeadsMTD />}
                  />
                )}
                {hasHubspotOwnerLeadsPermission && (
                  <Route path="/owner-leads-mom" element={<OwnerLeadsMoM />} />
                )}
                {hasHubspotOwnerLeadsPermission && (
                  <Route path="/owner-leads-mtd" element={<OwnerLeadsMTD />} />
                )}
                {hasHubspotCityQualityPermission && (
                  <Route path="/city-quality" element={<CityQuality />} />
                )}
                {hasHubspotOwnerQualityPermission && (
                  <Route path="/owner-quality" element={<OwnerQuality />} />
                )}
                {hasHubspotCityVisitPermission && (
                  <Route path="/city-visit-date" element={<CityVisitDate />} />
                )}
                {hasHubspotOwnerVisitPermission && (
                  <Route
                    path="/owner-visit-date"
                    element={<OwnerVisitDate />}
                  />
                )}
                {hasHubspotCityVisitedPermission && (
                  <Route
                    path="/city-visited-date"
                    element={<CityVisitedDate />}
                  />
                )}
                {hasHubspotOwnerVisitedPermission && (
                  <Route
                    path="/owner-visited-date"
                    element={<OwnerVisitedDate />}
                  />
                )}
                {hasHubspotCityLeadStatusPermission && (
                  <Route
                    path="/city-lead-status"
                    element={<CityLeadStatus />}
                  />
                )}
                {hasHubspotOwnerLeadStatusPermission && (
                  <Route
                    path="/owner-lead-status"
                    element={<OwnerLeadStatus />}
                  />
                )}
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({});

// export default connect(mapStateToProps)(HubspotReporting);
export default HubspotReporting;
