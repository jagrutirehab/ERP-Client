import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, ButtonGroup, Container } from "reactstrap";
import { connect } from "react-redux";
import {
  DASHBOARD,
  DB_LOGS,
  FINANACE,
  HUBSPOT_CONTACTS,
  LEAD_ANALYTICS,
  OPD_ANALYTICS,
  PATIENT_ANALYTICS,
  REPORT,
  BOOKING,
  DOCTOR_ANALYTICS,
  CENTER_BEDS_ANALYTICS,
  MI_REPORTING,
  ADMISSION_FORMS,
  REPORT_UPDATED,
} from "../../Components/constants/report";
import Dashboard from "./Components/Dashboard";
import ReportAnalytics from "./Components/Report";
import Finance from "./Components/Finance";
import Patient from "./Components/Patient";
import Lead from "./Components/Lead";
import OPD from "./Components/OPD";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DBLogs from "./Components/DBLogs";
import HubspotContacts from "./Components/Hubspot";
import Booking from "./Components/Booking";
import Doctor from "./Components/Doctor";
import CenterBedsAnalytics from "./Components/CenterBeds";
import MIReporting from "./Components/MIReporting";
import AdmissionForms from "./Components/AdmissionForms";
import { usePermissions } from "../../Components/Hooks/useRoles";
import RenderWhen from "../../Components/Common/RenderWhen";

const NAV_ITEMS = [
  { key: DASHBOARD, label: "Dashboard" },
  { key: REPORT, label: "Report" },
  { key: REPORT_UPDATED, label: "Report (Updated Date)" },
  { key: FINANACE, label: "Finance" },
  { key: ADMISSION_FORMS, label: "Admission" },
  { key: PATIENT_ANALYTICS, label: "Patient Analytics" },
  { key: DOCTOR_ANALYTICS, label: "Doctor Analytics" },
  { key: DB_LOGS, label: "DB Logs" },
  { key: LEAD_ANALYTICS, label: "Lead Analytics" },
  { key: OPD_ANALYTICS, label: "OPD Analytics" },
  { key: BOOKING, label: "Booking" },
  { key: CENTER_BEDS_ANALYTICS, label: "Center Beds" },
];

const Report = ({}) => {
  const [view, setView] = useState(REPORT);

  const handleView = (v) => setView(v);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={"Report"} pageTitle={"Report"} />
          {/* Desktop: original ButtonGroup look */}
          <ButtonGroup className="d-none d-lg-flex mb-3">
            {NAV_ITEMS.map(({ key, label }) => (
              <Button
                key={key}
                color="primary"
                outline={view !== key}
                onClick={() => handleView(key)}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>

          {/* Mobile: wrapped pill buttons */}
          <div className="d-flex d-lg-none flex-wrap gap-2 mb-3">
            {NAV_ITEMS.map(({ key, label }) => (
              <Button
                key={key}
                size="sm"
                color="primary"
                outline={view !== key}
                className="rounded-pill"
                onClick={() => handleView(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div>
            {view === DASHBOARD && <Dashboard view={view} />}
            {view === REPORT && <ReportAnalytics view={view} />}
            {view === REPORT_UPDATED && <ReportAnalytics view={view} />}
            {view === FINANACE && <Finance view={view} />}
            {view === ADMISSION_FORMS && <AdmissionForms view={view} />}
            {view === PATIENT_ANALYTICS && <Patient view={view} />}
            {view === DOCTOR_ANALYTICS && <Doctor view={view} />}
            {view === LEAD_ANALYTICS && <Lead view={view} />}
            {view === OPD_ANALYTICS && <OPD view={view} />}
            {view === DB_LOGS && <DBLogs view={view} />}
            {view === HUBSPOT_CONTACTS && <HubspotContacts view={view} />}
            {view === BOOKING && <Booking view={view} />}
            {view === CENTER_BEDS_ANALYTICS && (
              <CenterBedsAnalytics view={view} />
            )}
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
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Report);
