import React from "react";
import { Container } from "reactstrap";
import { Route, Routes } from "react-router-dom";
import SecondaryLeftSidebar from "../../Components/Common/LeftSidebar";
import GuidelinesDashboard from "./Guidelines";
import AccountingGuidelines from "./Guidelines/AccountingGuidelines";
import AdmissionDischargeGuidelines from "./Guidelines/AdmissionDischargeGuidelines";
import EnquiryGuidelines from "./Guidelines/EnquiryGuidelines";
import HygieneGuidelines from "./Guidelines/HygieneGuidelines";
import RehabiliationGuidelines from "./Guidelines/RehabiliationGuidelines";
import BedsideNotesGuidelines from "./Guidelines/BedsideNotesGuidelines";
// import Main from "./Main";
// import PatientDetails from "./PatientDetails";

const Guidelines = () => {
  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="patient-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <SecondaryLeftSidebar
                title="Guidelines"
                items={[
                  {
                    id: "guidelines-management",
                    label: "Guidelines Management",
                    link: ".",
                    icon: "bx bx-home",
                  },
                  {
                    id: "accounting-guidelines",
                    label: "Accounting Guidelines",
                    link: "accounting-guidelines",
                    icon: "bx bx-calculator", // accounting
                  },
                  {
                    id: "admission-discharge-guidelines",
                    label: "Admission Discharge Guidelines",
                    link: "admission-discharge-guidelines",
                    icon: "bx bx-log-in-circle", // admission/discharge
                  },
                  {
                    id: "enquiry-taking-guidelines",
                    label: "Enquiry Taking Guidelines",
                    link: "enquiry-guidelines",
                    icon: "bx bx-question-mark", // enquiry
                  },
                  {
                    id: "hygiene-maintenance-guidelines",
                    label: "Hygiene Maintenance Guidelines",
                    link: "hygiene-guidelines",
                    icon: "bx bx-shield-quarter", // hygiene / protection
                  },
                  {
                    id: "rehabilitation-guidelines",
                    label: "Rehabilitation Guidelines",
                    link: "rehabilitation-guidelines",
                    icon: "bx bx-dumbbell", // rehab / physical strength
                  },
                  {
                    id: "bedside-notes-guidelines",
                    label: "Bedside Notes Guidelines",
                    link: "bedside-notes-guidelines",
                    icon: "bx bx-notepad", // notes
                  },
                ]}
              />
              <Routes>
                <Route index element={<GuidelinesDashboard />} />
                <Route
                  path={`accounting-guidelines`}
                  element={<AccountingGuidelines />}
                />
                <Route
                  path="admission-discharge-guidelines"
                  element={<AdmissionDischargeGuidelines />}
                />
                <Route
                  path="enquiry-guidelines"
                  element={<EnquiryGuidelines />}
                />
                <Route
                  path="hygiene-guidelines"
                  element={<HygieneGuidelines />}
                />
                <Route
                  path="rehabilitation-guidelines"
                  element={<RehabiliationGuidelines />}
                />
                <Route
                  path="bedside-notes-guidelines"
                  element={<BedsideNotesGuidelines />}
                />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Guidelines;
