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
import Wf01PsychiatristOnDutyWorkflow from "./Prints/WF-01_Psychiatrist_On_Duty_Workflow";
import Wf02StaffNurseOnDutyWorkflow from "./Prints/WF-02_Staff_Nurse_On_Duty_Workflow";
import Wf03PsychologistOnDutyWorkflow from "./Prints/WF-03_Psychologist_On_Duty_Workflow";
import Wf04MswOnDutyWorkflow from "./Prints/WF-04_MSW_On_Duty_Workflow";
import Wf05PatientAdmissionWorkflow from "./Prints/WF-05_Patient_Admission_Workflow";
import Wf06PatientDischargeWorkflow from "./Prints/WF-06_Patient_Discharge_Workflow";
import Wf07MdtMeetingWorkflow from "./Prints/WF-07_MDT_Meeting_Workflow";
import Wf08NursingInChargeWorkflow from "./Prints/WF-08_Nursing_InCharge_Shift_Handover_Workflow";
import Select from "react-select";

const guidelines = [
  {
    id: 1,
    name: "Adm-01 — Voluntary (Independent) Admission SOP",
    description:
      "Mandatory clinical, legal, and administrative procedure for admitting a patient under Independent (Voluntary) Admission per MHCA 2017 Sections 86 & 87 — informed consent, capacity assessment, patient rights, and EMR gate checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — MHCA",
    print: Adm01VoluntaryAdmissionSOP,
    link: "adm-01-voluntary-admission-sop",
    category: "admission",
  },
  {
    id: 2,
    name: "Adm-02 — Admission Rejection & Referral Criteria SOP",
    description:
      "Evidence-informed criteria for refusing admission to JRCPL facilities and the protocol for safe referral of rejected patients to appropriate medical facilities — covers clinical instability, medical risk, de-addiction, geriatric, and administrative grounds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Triage — Safety",
    print: Adm02RejectionCriteriaSOP,
    link: "adm-02-rejection-criteria-sop",
    category: "admission",
  },
  {
    id: 3,
    name: "Adm-03 — Admission Laboratory Investigations SOP",
    description:
      "Standardised admission lab protocol for Psychiatry (≤50), Elderly (>50), and De-addiction patients — routine panels, age- and substance-specific add-ons, repeat monitoring schedule, and critical-value action thresholds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — Investigations",
    print: Adm03LabInvestigationsSOP,
    link: "adm-03-lab-investigations-sop",
    category: "admission",
  },
  {
    id: 4,
    name: "Adm-04 — Decision-Making Capacity Assessment SOP",
    description:
      "Step-by-step procedure for assessing, documenting, and acting on decision-making capacity under MHCA 2017 Section 4 — the four-point test, NR identification, admission classification, mandatory reassessment, and prohibited actions.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Governance — MHCA",
    print: Adm04CapacityAssessmentSOP,
    link: "adm-04-capacity-assessment-sop",
    category: "admission",
  },
  {
    id: 5,
    name: "Adm-05 — Emergency & Involuntary Admission SOP",
    description:
      "Complete framework for emergency and involuntary (supported) admissions under MHCA 2017 — 72-hour Emergency Admission Certificate, Sec. 89 supported, Sec. 90 dual-psychiatrist involuntary, MHRB compliance timeline, and restraint legal boundaries.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Emergency — MHCA",
    print: Adm05EmergencyInvoluntarySOP,
    link: "adm-05-emergency-involuntary-sop",
    category: "admission",
  },
  {
    id: 6,
    name: "Adm-06 — Clinical Care Pathways, Programme Duration & LOS Policy",
    description:
      "Authoritative reference for all six clinical programmes — Acute Psychiatric, Psychiatric Rehab, Alcohol De-Addiction, Drug De-Addiction, Elderly/Dementia, and End of Life — with standard duration, phase structure, outcome milestones, and cross-programme governance.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Programme — LOS",
    print: Adm06ClinicalCarePathwaysSOP,
    link: "adm-06-clinical-care-pathways-sop",
    category: "admission",
  },
  {
    id: 7,
    name: "Accounting Guidelines",
    description:
      "Accounting Guidelines are a set of rules and procedures that guide the accounting process in a business. They ensure that the financial records are accurate and compliant with the relevant laws and regulations.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Accounting",
    print: AccountingChecklistPrint,
    link: "accounting-guidelines",
    category: "general",
  },
  {
    id: 8,
    name: "Admission Discharge Guidelines",
    description:
      "Admission Discharge Guidelines are a set of rules and procedures that guide the admission and discharge process in a business. They ensure that the patient is admitted and discharged in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Admission Discharge",
    print: AdmissionDischargePrint,
    link: "admission-discharge-guidelines",
    category: "general",
  },
  {
    id: 9,
    name: "Enquiry Taking Guidelines",
    description:
      "Enquiry Taking Guidelines are a set of rules and procedures that guide the enquiry taking process in a business. They ensure that the enquiry is taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Enquiry",
    print: EnquiryTakingPrint,
    link: "enquiry-guidelines",
    category: "general",
  },
  {
    id: 10,
    name: "Hygiene Maintenance Guidelines",
    description:
      "Hygiene Maintenance Guidelines are a set of rules and procedures that guide the hygiene maintenance process in a business. They ensure that the hygiene is maintained in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Hygiene Maintenance",
    print: HygieneMaintenancePrint,
    link: "hygiene-guidelines",
    category: "general",

  },
  {
    id: 11,
    name: "Rehabilitation Guidelines",
    description:
      "Rehabilitation Guidelines are a set of rules and procedures that guide the rehabilitation process in a business. They ensure that the rehabilitation is done in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Rehabilitation",
    print: RehabilitationGuidelinesPrint,
    link: "rehabilitation-guidelines",
    category: "general",
  },
  {
    id: 12,
    name: "Bedside Notes Guidelines",
    description:
      "Bedside Notes Guidelines are a set of rules and procedures that guide the bedside notes process in a business. They ensure that the bedside notes are taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Bedside Notes",
    print: BedsideNotesPrint,
    link: "bedside-notes-guidelines",
    category: "general",
  },
  {
    id: 13,
    name: "WF-01 — Psychiatrist On Duty Workflow",
    description:
      "Start-of-duty sequence, 7 leadership standards (decision-making, staff education, behavioural safety, documentation, error correction, MDT leadership, system safety), and end-of-duty sign-off checklist for psychiatrists, senior residents, and medical officers.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf01PsychiatristOnDutyWorkflow,
    link: "wf-01-psychiatrist-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 14,
    name: "WF-02 — Staff Nurse On-Duty Workflow",
    description:
      "Eight-step shift-start sequence, core duties covering observation levels, five-rights medication, vitals thresholds, injection register, I/O charts, physical care, and restraint, plus end-of-shift SBAR handover checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf02StaffNurseOnDutyWorkflow,
    link: "wf-02-staff-nurse-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 15,
    name: "WF-03 — Psychologist On-Duty Workflow",
    description:
      "Eight-step pre-session preparation, core duty streams (individual therapy, group therapy, assessment, family counselling, intake, supervision) with same-day documentation requirements, and end-of-duty sign-off for psychologists and counsellors.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf03PsychologistOnDutyWorkflow,
    link: "wf-03-psychologist-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 16,
    name: "WF-04 — MSW On-Duty Workflow",
    description:
      "Eight-step start-of-duty preparation, core duty streams (social assessment, family counselling, discharge planning, community linkage, legal/financial aid, intake, patient advocacy), and end-of-duty documentation checklist for medical social workers.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf04MswOnDutyWorkflow,
    link: "wf-04-msw-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 17,
    name: "WF-05 — Patient Admission Workflow",
    description:
      "Five-stage admission protocol: triage, clinical assessment (MSE, capacity, risk, legal basis), consent and registration, ward orientation, and post-admission milestones — with documentation gate checklist per MHCA 2017 and NABH ACC.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf05PatientAdmissionWorkflow,
    link: "wf-05-patient-admission-workflow",
    category: "workflow",
  },
  {
    id: 18,
    name: "WF-06 — Patient Discharge Workflow",
    description:
      "Five-stage discharge process: planning (5–7 days prior), clinical clearance, documentation (summary, CCP, relapse plan), financial clearance, and post-discharge MSW follow-up — with discharge-type definitions and documentation gate checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf06PatientDischargeWorkflow,
    link: "wf-06-patient-discharge-workflow",
    category: "workflow",
  },
  {
    id: 19,
    name: "WF-07 — MDT Meeting Workflow",
    description:
      "Weekly MDT structure: quorum requirements, mandatory attendees, 7-item standing agenda (new admissions, high-risk, treatment review, discharge, incidents, legal/family, documentation gaps), before/during/after workflow, and key standards with audit indicators.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf07MdtMeetingWorkflow,
    link: "wf-07-mdt-meeting-workflow",
    category: "workflow",
  },
  {
    id: 20,
    name: "WF-08 — Nursing In-Charge Shift Handover Workflow",
    description:
      "Four-stage accountability framework: shift start (NDPS count, observation levels, team brief), SBAR handover format, during-shift governance (observation, medication, vitals, restraint, incidents, registers), and shift-end checklist — with dual escalation triggers and audit standards.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf08NursingInChargeWorkflow,
    link: "wf-08-nursing-incharge-shift-handover-workflow",
    category: "workflow",
  },
];

const categories = [
  { value: "all", label: "All" },
  { value: "admission", label: "Admission" },
  { value: "workflow", label: "Workflow" },
  { value: "sops", label: "SOPs" },
  { value: "general", label: "General" },
];

const GuidelinesDashboard = () => {
  const [query, setQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState({ value: "all", label: "All" });

  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((g) => {
      const matchesSearch =
        !query ||
        `${g.name} ${g.description} ${g.type}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory =
        selectedOption.value === "all" ||
        g.category === selectedOption.value;

      return matchesSearch && matchesCategory;
    });
  }, [query, selectedOption]);

  return (
    <div className="w-100 d-flex flex-column w-100 bg-white p-4 gap-2 mb-4">
      <h1 className="display-6 font-weight-bold text-primary">Guidelines</h1>
      <p className="text-muted lead">
        Manage your guidelines with ease and efficiency
      </p>
      <div className="d-flex gap-2 align-items-center">
        <div className="position-relative" style={{ width: "280px" }}>
          <Search
            className="position-absolute"
            style={{
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              height: "18px",
              width: "18px",
              color: "#6c757d",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <input
            type="text"
            placeholder="Search guidelines..."
            className="form-control"
            style={{
              paddingLeft: "36px",
              height: "40px",
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: "200px" }}>
          <Select
            options={categories}
            placeholder="Select category..."
            value={selectedOption}
            onChange={setSelectedOption}
          />
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
