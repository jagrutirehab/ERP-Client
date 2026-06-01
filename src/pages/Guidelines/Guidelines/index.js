import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AccountingChecklistPrint from "./Prints/AccountingPrint";
import AdmissionDischargePrint from "./Prints/AdmissionDischargePrint";
import EnquiryTakingPrint from "./Prints/EnquiryPrint";
import Guideline from "./Guideline";
import HygieneMaintenancePrint from "./Prints/HygienePrint";
import RehabilitationGuidelinesPrint from "./Prints/RehabPrint";
import BedsideNotesPrint from "./Prints/BedsideNotesPrint";
import Adm01VoluntaryAdmissionSOP from "./Prints/Adm-01_Voluntary_Independent_Admission_SOP";
import Adm02RejectionCriteriaSOP from "./Prints/Adm-02_Admission_Rejection_Criteria_SOP";
import Adm03LabInvestigationsSOP from "./Prints/Adm-03_Admission_Lab_Investigations_SOP";
import Adm04CapacityAssessmentSOP from "./Prints/Adm-04_Capacity_Assessment_SOP";
import Adm05EmergencyInvoluntarySOP from "./Prints/Adm-05_Emergency_Involuntary_Admission_SOP";
import Adm06ClinicalCarePathwaysSOP from "./Prints/Adm-06_Clinical_Care_Pathways_LOS_Policy";

const guidelines = [
  {
    id: 1,
    name: "Accounting Guidelines",
    description:
      "Accounting Guidelines are a set of rules and procedures that guide the accounting process in a business. They ensure that the financial records are accurate and compliant with the relevant laws and regulations.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Accounting",
    print: AccountingChecklistPrint,
  },
  {
    id: 2,
    name: "Admission Discharge Guidelines",
    description:
      "Admission Discharge Guidelines are a set of rules and procedures that guide the admission and discharge process in a business. They ensure that the patient is admitted and discharged in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Admission Discharge",
    print: AdmissionDischargePrint,
  },
  {
    id: 3,
    name: "Enquiry Taking Guidelines",
    description:
      "Enquiry Taking Guidelines are a set of rules and procedures that guide the enquiry taking process in a business. They ensure that the enquiry is taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Enquiry",
    print: EnquiryTakingPrint,
  },
  {
    id: 4,
    name: "Hygiene Maintenance Guidelines",
    description:
      "Hygiene Maintenance Guidelines are a set of rules and procedures that guide the hygiene maintenance process in a business. They ensure that the hygiene is maintained in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Hygiene Maintenance",
    print: HygieneMaintenancePrint,
  },
  {
    id: 5,
    name: "Rehabilitation Guidelines",
    description:
      "Rehabilitation Guidelines are a set of rules and procedures that guide the rehabilitation process in a business. They ensure that the rehabilitation is done in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Rehabilitation",
    print: RehabilitationGuidelinesPrint,
  },
  {
    id: 6,
    name: "Bedside Notes Guidelines",
    description:
      "Bedside Notes Guidelines are a set of rules and procedures that guide the bedside notes process in a business. They ensure that the bedside notes are taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Bedside Notes",
    print: BedsideNotesPrint,
  },
  {
    id: 7,
    name: "Adm-01 — Voluntary (Independent) Admission SOP",
    description:
      "Mandatory clinical, legal, and administrative procedure for admitting a patient under Independent (Voluntary) Admission per MHCA 2017 Sections 86 & 87 — informed consent, capacity assessment, patient rights, and EMR gate checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — MHCA",
    print: Adm01VoluntaryAdmissionSOP,
  },
  {
    id: 8,
    name: "Adm-02 — Admission Rejection & Referral Criteria SOP",
    description:
      "Evidence-informed criteria for refusing admission to JRCPL facilities and the protocol for safe referral of rejected patients to appropriate medical facilities — covers clinical instability, medical risk, de-addiction, geriatric, and administrative grounds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Triage — Safety",
    print: Adm02RejectionCriteriaSOP,
  },
  {
    id: 9,
    name: "Adm-03 — Admission Laboratory Investigations SOP",
    description:
      "Standardised admission lab protocol for Psychiatry (≤50), Elderly (>50), and De-addiction patients — routine panels, age- and substance-specific add-ons, repeat monitoring schedule, and critical-value action thresholds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — Investigations",
    print: Adm03LabInvestigationsSOP,
  },
  {
    id: 10,
    name: "Adm-04 — Decision-Making Capacity Assessment SOP",
    description:
      "Step-by-step procedure for assessing, documenting, and acting on decision-making capacity under MHCA 2017 Section 4 — the four-point test, NR identification, admission classification, mandatory reassessment, and prohibited actions.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Governance — MHCA",
    print: Adm04CapacityAssessmentSOP,
  },
  {
    id: 11,
    name: "Adm-05 — Emergency & Involuntary Admission SOP",
    description:
      "Complete framework for emergency and involuntary (supported) admissions under MHCA 2017 — 72-hour Emergency Admission Certificate, Sec. 89 supported, Sec. 90 dual-psychiatrist involuntary, MHRB compliance timeline, and restraint legal boundaries.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Emergency — MHCA",
    print: Adm05EmergencyInvoluntarySOP,
  },
  {
    id: 12,
    name: "Adm-06 — Clinical Care Pathways, Programme Duration & LOS Policy",
    description:
      "Authoritative reference for all six clinical programmes — Acute Psychiatric, Psychiatric Rehab, Alcohol De-Addiction, Drug De-Addiction, Elderly/Dementia, and End of Life — with standard duration, phase structure, outcome milestones, and cross-programme governance.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Programme — LOS",
    print: Adm06ClinicalCarePathwaysSOP,
  },
];

const GuidelinesDashboard = () => {
  const [query, setQuery] = useState("");

  const filteredGuidelines = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guidelines;
    return guidelines.filter((g) => {
      const haystack = `${g.name} ${g.description} ${g.type}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="w-100 d-flex flex-column w-100 bg-white p-4 gap-2 mb-4">
      <h1 className="display-6 font-weight-bold text-primary">Guidelines</h1>
      <p className="text-muted lead">
        Manage your guidelines with ease and efficiency
      </p>
      <div className="">
        <div className="w-100 w-md-auto" style={{ maxWidth: "300px" }}>
          <div className="position-relative w-100">
            <Search
              className="position-absolute"
              style={{
                left: "8px", // left end alignment
                top: "50%", // vertical center
                transform: "translateY(-50%)",
                height: "18px",
                width: "18px",
                color: "#6c757d",
                pointerEvents: "none", // icon won't capture clicks
              }}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search guidelines..."
              className={`form-control`}
              style={{
                paddingLeft: "36px", // leave room for the icon
                paddingRight: "12px",
                height: "40px",
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-3">
          <h3 className="h4 mb-0">Guidelines List</h3>
        </div>

        <div className="list-group">
          {filteredGuidelines.length === 0 ? (
            <div className="text-muted p-3">
              No guidelines match your search.
            </div>
          ) : (
            filteredGuidelines.map((guideline) => (
              <Guideline key={guideline.id} guideline={guideline} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidelinesDashboard;
