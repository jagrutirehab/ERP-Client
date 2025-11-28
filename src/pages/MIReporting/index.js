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

const MIReporting = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasMiReportingPermission = hasPermission("MI_REPORTING", null, "READ");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasMiReportingPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMiReportingPermission, permissionLoader]);

  return (
    <React.Fragment>
      <div className="page-content overflow-hidden">
        <div className="">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar />
              <Routes>
                <Route path="/center-leads-mom" element={<CenterLeadsMoM />} />
                <Route path="/center-leads-mtd" element={<CenterLeadsMTD />} />
                <Route path="/owner-leads-mom" element={<OwnerLeadsMoM />} />
                <Route path="/owner-leads-mtd" element={<OwnerLeadsMTD />} />
                <Route path="/city-quality" element={<CityQuality />} />
                <Route path="/owner-quality" element={<OwnerQuality />} />
                <Route path="/city-visit-date" element={<CityVisitDate />} />
                <Route path="/owner-visit-date" element={<OwnerVisitDate />} />
                <Route
                  path="/city-visited-date"
                  element={<CityVisitedDate />}
                />
                <Route
                  path="/owner-visited-date"
                  element={<OwnerVisitedDate />}
                />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({});

// export default connect(mapStateToProps)(MIReporting);
export default MIReporting;
