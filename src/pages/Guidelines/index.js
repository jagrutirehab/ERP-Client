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
import Adm01VoluntaryAdmissionSOPPage from "./Guidelines/Adm-01_Voluntary_Independent_Admission_SOP";
import Adm02RejectionCriteriaSOPPage from "./Guidelines/Adm-02_Admission_Rejection_Criteria_SOP";
import Adm03LabInvestigationsSOPPage from "./Guidelines/Adm-03_Admission_Lab_Investigations_SOP";
import Adm04CapacityAssessmentSOPPage from "./Guidelines/Adm-04_Capacity_Assessment_SOP";
import Adm05EmergencyInvoluntarySOPPage from "./Guidelines/Adm-05_Emergency_Involuntary_Admission_SOP";
import Adm06ClinicalCarePathwaysSOPPage from "./Guidelines/Adm-06_Clinical_Care_Pathways_LOS_Policy";
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
                    id: "adm-01-voluntary-admission-sop",
                    label: "Adm-01 — Voluntary Admission SOP",
                    link: "adm-01-voluntary-admission-sop",
                    icon: "bx bx-user-check", // voluntary / consent
                  },
                  {
                    id: "adm-02-rejection-criteria-sop",
                    label: "Adm-02 — Rejection & Referral Criteria SOP",
                    link: "adm-02-rejection-criteria-sop",
                    icon: "bx bx-block", // rejection / refusal
                  },
                  {
                    id: "adm-03-lab-investigations-sop",
                    label: "Adm-03 — Lab Investigations SOP",
                    link: "adm-03-lab-investigations-sop",
                    icon: "bx bx-test-tube", // labs
                  },
                  {
                    id: "adm-04-capacity-assessment-sop",
                    label: "Adm-04 — Capacity Assessment SOP",
                    link: "adm-04-capacity-assessment-sop",
                    icon: "bx bx-brain", // capacity / cognition
                  },
                  {
                    id: "adm-05-emergency-involuntary-sop",
                    label: "Adm-05 — Emergency & Involuntary Admission SOP",
                    link: "adm-05-emergency-involuntary-sop",
                    icon: "bx bx-error", // emergency
                  },
                  {
                    id: "adm-06-clinical-care-pathways-sop",
                    label: "Adm-06 — Clinical Care Pathways & LOS",
                    link: "adm-06-clinical-care-pathways-sop",
                    icon: "bx bx-git-branch", // pathways / branches
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
                  path="adm-01-voluntary-admission-sop"
                  element={<Adm01VoluntaryAdmissionSOPPage />}
                />
                <Route
                  path="adm-02-rejection-criteria-sop"
                  element={<Adm02RejectionCriteriaSOPPage />}
                />
                <Route
                  path="adm-03-lab-investigations-sop"
                  element={<Adm03LabInvestigationsSOPPage />}
                />
                <Route
                  path="adm-04-capacity-assessment-sop"
                  element={<Adm04CapacityAssessmentSOPPage />}
                />
                <Route
                  path="adm-05-emergency-involuntary-sop"
                  element={<Adm05EmergencyInvoluntarySOPPage />}
                />
                <Route
                  path="adm-06-clinical-care-pathways-sop"
                  element={<Adm06ClinicalCarePathwaysSOPPage />}
                />
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
