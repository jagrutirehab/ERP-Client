import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, ButtonGroup, Container } from "reactstrap";
import { connect } from "react-redux";
import {
  DASHBOARD,
  DB_LOGS,
  FINANACE,
  LEAD_ANALYTICS,
  OPD_ANALYTICS,
  PATIENT_ANALYTICS,
  REPORT,
} from "../../Components/constants/report";
import Dashboard from "./Components/Dashboard";
import ReportAnalytics from "./Components/Report";
import Finance from "./Components/Finance";
import Patient from "./Components/Patient";
import Lead from "./Components/Lead";
import OPD from "./Components/OPD";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DBLogs from "./Components/DBLogs";

const Report = ({}) => {
  const [view, setView] = useState(REPORT);

  const handleView = (v) => setView(v);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={"Report"} pageTitle={"Report"} />
          <ButtonGroup>
            {" "}
            <Button
              outline={view !== DASHBOARD}
              onClick={() => handleView(DASHBOARD)}
            >
              Dashboard
            </Button>{" "}
            <Button
              outline={view !== REPORT}
              onClick={() => handleView(REPORT)}
            >
              Report
            </Button>{" "}
            <Button
              outline={view !== FINANACE}
              onClick={() => handleView(FINANACE)}
            >
              Finance
            </Button>
            <Button
              outline={view !== PATIENT_ANALYTICS}
              onClick={() => handleView(PATIENT_ANALYTICS)}
            >
              Patient Analytics
            </Button>
            <Button
              outline={view !== DB_LOGS}
              onClick={() => handleView(DB_LOGS)}
            >
              DB Logs
            </Button>
            <Button
              outline={view !== LEAD_ANALYTICS}
              onClick={() => handleView(LEAD_ANALYTICS)}
            >
              Lead Analytics
            </Button>
            <Button
              outline={view !== OPD_ANALYTICS}
              onClick={() => handleView(OPD_ANALYTICS)}
            >
              OPD Analytics
            </Button>
          </ButtonGroup>
          <div>
            {view === DASHBOARD && <Dashboard view={view} />}
            {view === REPORT && <ReportAnalytics view={view} />}
            {view === FINANACE && <Finance view={view} />}
            {view === PATIENT_ANALYTICS && <Patient view={view} />}
            {view === LEAD_ANALYTICS && <Lead view={view} />}
            {view === OPD_ANALYTICS && <OPD view={view} />}
            {view === DB_LOGS && <DBLogs view={view} />}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

Report.propTypes = {
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  data: state.Report.data,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Report);
