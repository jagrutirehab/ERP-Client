import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApproval,
  SectionTitle,
  BulletList,
  WarningBox,
  CalloutBox,
Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Doc ID", "Dis-02"],
  ["Version", "2.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Vertical / Scope", "All Four Verticals — All 18 Centres"],
  ["Category", "Clinical Governance | Patient Safety | Continuity of Care"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 23, 87, 89); NABH MOM 1-5; NABH COP; NMC Code of Ethics; Clinical Establishments Act 2010"],
  ["NABH Chapter", "MOM | COP | ACE | QM"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Clinical Disciplines"],
  ["Classification", "CONFIDENTIAL — Internal Clinical Governance Document"],
];

const DEFINITIONS_ROWS = [
  ["Planned Discharge", "A discharge that is clinically anticipated, planned in advance, and executed after all readiness criteria are formally met and documented."],
  ["Discharge Readiness", "The clinical and functional state in which a patient is safe to transition from inpatient/residential to community or outpatient care."],
  ["Discharge Planning Meeting (DPM)", "A structured MDT meeting convened to review and finalise discharge plans for high-risk or complex patients."],
  ["Discharge Summary", "The mandatory clinical document completed by the treating psychiatrist at discharge, as required by NABH MOM standards."],
  ["Continuation of Care Plan (CCP)", "A structured outpatient plan including follow-up schedule, medication, crisis contact, and relapse prevention strategy."],
];

const LEGAL_ROWS = [
  ["MHCA 2017 Sec. 18", "Right to treatment — discharge must not be used to deny ongoing care when clinically required."],
  ["MHCA 2017 Sec. 23", "Medical records including discharge summary are confidential; release governed by law."],
  ["MHCA 2017 Sec. 87-90", "Voluntary patients retain right to request discharge; supported/involuntary discharge requires MHRB compliance."],
  ["NABH MOM 1-5", "Discharge summary is a mandatory clinical record; must be completed within 24 hours of discharge."],
  ["NMC Code of Ethics", "Physicians must ensure continuity of care at transition points; abandonment at discharge is professional misconduct."],
];

const CLINICAL_STABILITY_ROWS = [
  ["Psychiatric", "No acute suicidal ideation (C-SSRS Score 0 on active ideation for minimum 5 consecutive days)", "C-SSRS"],
  ["Psychiatric", "No uncontrolled psychosis, mania, or severe agitation", "MSE, CGI"],
  ["De-Addiction", "Withdrawal completed and medically stable (CIWA/COWS within normal limits)", "CIWA-Ar / COWS"],
  ["Medical", "Comorbid medical conditions stable and follow-up arranged", "Treating physician clearance"],
  ["Medication", "Stable, optimised medication regimen; no dose changes in last 48 hours", "Treating psychiatrist"],
];

const TIMELINE_ROWS = [
  ["Day of admission", "Estimated Length of Stay (ELOS) documented in EMR", "Treating Psychiatrist"],
  ["7 days before planned discharge", "Discharge planning initiated — EMR flag set; family notified", "Treating Psychiatrist / SW"],
  ["5 days before discharge", "Family counselling session 1 completed and documented", "Psychologist / SW"],
  ["3 days before discharge", "MDT review: clinical readiness confirmed or discharge deferred", "MDT — all disciplines"],
  ["2 days before discharge", "Family counselling session 2 — medication, relapse, crisis plan", "Psychologist / SW"],
  ["1 day before discharge", "Discharge summary drafted; follow-up appointment confirmed; prescription ready", "Treating Psychiatrist"],
  ["Day of discharge", "All documentation complete; medication dispensed; family briefed; discharge summary signed and issued", "Psychiatrist + Nursing"],
];

const HIGH_RISK_ROWS = [
  ["Recent suicide attempt (within current admission)", "DPM + Clinical Director approval + safety contract signed by patient and family"],
  ["Active suicidal ideation at any point in last 7 days", "DPM + C-SSRS clearance documented for 5 consecutive days + follow-up within 72 hours"],
  ["Poor insight into illness or treatment refusal history", "Psychologist written opinion on insight; education session documented"],
  ["Family conflict or unsafe home environment", "Social worker assessment + alternative placement plan if required"],
  ["Active legal / court involvement", "Clinical Director review + legal team notification + documentation audit"],
  ["Involuntary admission being discharged", "MHRB notification + compliance with Section 90 discharge provisions"],
  ["Comorbid severe medical illness", "Medical clearance letter from treating physician required before discharge"],
];

const ROLES_ROWS = [
  ["Treating Psychiatrist", "Final clinical decision on discharge; completes discharge summary; signs prescription; chairs DPM for high-risk cases"],
  ["Clinical Psychologist", "Documents insight, relapse prevention plan, family counselling; participates in DPM"],
  ["Medical Social Worker", "Family counselling; home environment assessment; community linkages; CCP coordination"],
  ["Nursing In-Charge", "Confirms ADL and functional status; coordinates medication dispensing; EMR discharge checklist"],
  ["Centre Manager", "Administrative discharge clearance; billing; transport coordination"],
  ["Clinical Director", "Reviews and approves all high-risk discharge plans; reviews 30-day readmission KPIs monthly"],
];

const EMR_CHECKLIST_ROWS = [
  ["Discharge readiness criteria documented — all domains", "Treating Psychiatrist", "Day before discharge"],
  ["C-SSRS score 0 confirmed for 5 days (if applicable)", "Psychiatrist + Nursing", "5 days pre-discharge"],
  ["MDT discharge review documented", "All MDT Members", "3 days pre-discharge"],
  ["Family counselling sessions 1 & 2 documented", "Psychologist / SW", "As per timeline"],
  ["Discharge summary completed and signed", "Treating Psychiatrist", "Day of discharge"],
  ["Medication education acknowledgement signed", "Nursing + Patient/Family", "Day of discharge"],
  ["Continuation of Care Plan issued", "Treating Psychiatrist / SW", "Day of discharge"],
  ["Follow-up appointment confirmed in writing", "Centre Manager / Outpatient Coordinator", "Day before discharge"],
];

const KPI_ROWS = [
  ["Discharge readiness checklist completed for all discharges", "100%", "Centre Manager", "Monthly"],
  ["Discharge summary issued within 24 hours of discharge", ">= 95%", "Centre Manager", "Monthly"],
  ["Follow-up appointment confirmed before discharge", "100%", "Outpatient Coordinator", "Monthly"],
  ["Family counselling (minimum 2 sessions) documented", "100%", "Psychologist / SW Lead", "Monthly"],
  ["Readmission within 30 days — De-addiction", "<= 15%", "Clinical Director", "Monthly"],
  ["Readmission within 30 days — Psychiatric", "<= 10%", "Clinical Director", "Monthly"],
  ["High-risk discharge plans reviewed by Clinical Director", "100%", "Clinical Director", "Monthly"],
];

const REVISION_ROWS = [
  ["1.0", "15.02.2026", "Dr. Amar Shinde", "Initial version — Jagruti Rehabilitation Centre"],
  ["2.0", "01.06.2026", "Dr. Amar Shinde", "Full rewrite to JRCPL standard; NABH MOM aligned; high-risk protocol; CCP; KPIs expanded"],
];

const Dis02DischargePlanningReadinessSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-02"
      title="Discharge Planning & Readiness SOP"
      icdLine="Doc ID: Dis-02 | Version 2.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="2.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <CalloutBox>
      Discharge is a clinical decision — not an administrative one. A premature discharge is a patient safety event. The MHCA 2017 affirms the right to treatment; discharging a patient who does not meet readiness criteria may constitute a violation of that right. Documentation of readiness is not a formality — it is a medico-legal defence.
    </CalloutBox>

    {/* 1. Purpose */}
    <SectionTitle>1. Purpose</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      This SOP establishes the mandatory framework for planning, executing, and documenting the safe discharge of patients from all Jagrutii Rehab Centre Pvt. Ltd. (JRCPL) facilities across all four clinical verticals: Psychiatric Care, De-Addiction, Elderly Care, and Child &amp; Adolescent Psychiatry.
    </p>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      It ensures that every discharge is clinically justified, fully documented, and that continuity of care is maintained through structured handover to the patient, family, and outpatient services.
    </p>

    {/* 2. Scope */}
    <SectionTitle>2. Scope</SectionTitle>
    <BulletList items={[
      "All planned discharges across all inpatient and residential programmes",
      "All four verticals: Psychiatric Care, De-Addiction, Elderly Care, Child & Adolescent Psychiatry",
      "All 18 JRCPL centres across India",
      "AMA (Against Medical Advice) discharge is governed separately under RC-04",
    ]} />

    {/* 3. Definitions */}
    <SectionTitle>3. Definitions</SectionTitle>
    <Table
      cols={[
        { label: "Term", width: "28%" },
        { label: "Definition", width: "72%" },
      ]}
      rows={DEFINITIONS_ROWS}
    />

    {/* 4. Legal & Regulatory Framework */}
    <SectionTitle>4. Legal &amp; Regulatory Framework</SectionTitle>
    <Table
      cols={[
        { label: "Provision", width: "22%" },
        { label: "Discharge Obligation", width: "78%" },
      ]}
      rows={LEGAL_ROWS}
    />

    {/* 5. Discharge Readiness Criteria */}
    <SectionTitle>5. Discharge Readiness Criteria</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      A patient may be discharged only when ALL applicable criteria below are met and documented in the EMR by the treating psychiatrist.
    </p>

    <SectionTitle>5.1 Clinical Stability — ALL must be met</SectionTitle>
    <Table
      cols={[
        { label: "Domain", width: "14%" },
        { label: "Criteria", width: "62%" },
        { label: "Assessment Tool", width: "24%" },
      ]}
      rows={CLINICAL_STABILITY_ROWS}
    />

    <SectionTitle>5.2 Functional Stability</SectionTitle>
    <BulletList items={[
      "Demonstrable improvement in Activities of Daily Living (ADL) appropriate to diagnosis and age",
      "Compliance with ward routine and therapeutic activities for minimum 5 days pre-discharge",
      "Basic self-care ability confirmed by nursing in-charge",
    ]} />

    <SectionTitle>5.3 Insight, Adherence &amp; Safety Awareness</SectionTitle>
    <BulletList items={[
      "Patient demonstrates understanding of their diagnosis (documented in psychologist note)",
      "Patient articulates importance of medication adherence and consequences of stopping",
      "Patient can identify personal relapse warning signs",
      "Patient knows crisis contact plan and emergency procedures",
    ]} />

    <SectionTitle>5.4 Family &amp; Social Readiness</SectionTitle>
    <BulletList items={[
      "Minimum two family counselling sessions completed and documented",
      "Home environment assessed and deemed safe for discharge",
      "Primary caregiver identified and briefed on care plan, medication, relapse signs, and crisis response",
      "Follow-up appointment confirmed and communicated to family in writing",
    ]} />

    <WarningBox>
      ⚠ If ANY criterion in Sections 5.1-5.4 is not met, discharge must be deferred. The treating psychiatrist documents the reason for deferral and the revised discharge timeline in the EMR.
    </WarningBox>

    {/* 6. Discharge Planning Timeline */}
    <SectionTitle>6. Discharge Planning Timeline</SectionTitle>
    <Table
      cols={[
        { label: "Trigger", width: "24%" },
        { label: "Action Required", width: "52%" },
        { label: "Responsible", width: "24%" },
      ]}
      rows={TIMELINE_ROWS}
    />

    {/* 7. High-Risk Discharge */}
    <SectionTitle>7. High-Risk Discharge — Enhanced Protocol</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The following categories require a formal Discharge Planning Meeting (DPM) convened at least 5 days before discharge:
    </p>
    <Table
      cols={[
        { label: "High-Risk Category", width: "34%" },
        { label: "Mandatory Additional Step", width: "66%" },
      ]}
      rows={HIGH_RISK_ROWS}
    />

    {/* 8. Discharge Summary */}
    <SectionTitle>8. Discharge Summary — Mandatory Content</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The discharge summary must be completed by the treating psychiatrist on the day of discharge and uploaded to the EMR within 24 hours.
    </p>
    <BulletList items={[
      "Patient demographics and unique JRCPL ID",
      "Admission date, discharge date, total length of stay",
      "Admission category (voluntary/supported/involuntary/emergency) and legal status at discharge",
      "Final ICD-11 diagnosis — primary and comorbid",
      "Clinical course summary — key events, response to treatment",
      "Current discharge prescription with dose and duration for all medications",
      "Risk assessment at discharge (C-SSRS; HCR-20 or equivalent where applicable)",
      "Outpatient follow-up plan: date, location, treating clinician",
      "Crisis plan: warning signs, emergency contacts, nearest emergency facility",
      "Treating psychiatrist signature and registration number",
    ]} />

    {/* 9. Medication Handover Protocol */}
    <SectionTitle>9. Medication Handover Protocol</SectionTitle>
    <ol style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Treating psychiatrist generates written prescription — minimum 2 weeks supply dispensed at discharge</li>
      <li style={{ marginBottom: "4px" }}>Nursing in-charge reviews medication list with patient and primary caregiver</li>
      <li style={{ marginBottom: "4px" }}>Education provided: name, dose, timing, duration, common side effects, what to do if dose missed</li>
      <li style={{ marginBottom: "4px" }}>Patient and caregiver sign Medication Education Acknowledgement (Form Dis-02-F-002)</li>
      <li style={{ marginBottom: "4px" }}>If patient is on controlled substances (NDPS): prescription compliance per NDPS Act; 30-day maximum supply; dispensing documented in narcotic register</li>
    </ol>

    {/* 10. Roles & Responsibilities */}
    <SectionTitle>10. Roles &amp; Responsibilities</SectionTitle>
    <Table
      cols={[
        { label: "Role", width: "24%" },
        { label: "Responsibility", width: "76%" },
      ]}
      rows={ROLES_ROWS}
    />

    {/* 11. EMR Gate */}
    <SectionTitle>11. EMR Gate — Documentation Checklist</SectionTitle>
    <Table
      cols={[
        { label: "Item", width: "44%" },
        { label: "Responsibility", width: "30%" },
        { label: "Timeframe", width: "26%" },
      ]}
      rows={EMR_CHECKLIST_ROWS}
    />

    {/* 12. KPI Monitoring */}
    <SectionTitle>12. KPI Monitoring</SectionTitle>
    <Table
      cols={[
        { label: "KPI", width: "44%" },
        { label: "Target", width: "12%" },
        { label: "Measured By", width: "24%" },
        { label: "Frequency", width: "20%" },
      ]}
      rows={KPI_ROWS}
    />

    {/* 13. Related Documents */}
    <SectionTitle>13. Related Documents</SectionTitle>
    <BulletList items={[
      "Dis-03 — Against Medical Advice (AMA) Discharge SOP",
      "Adm-01 — Admission, Informed Consent & Capacity Assessment SOP",
      "DG-01 — Clinical Documentation Standards SOP",
      "SE-01 — Suicide Risk Prevention & Management SOP",
      "Form Dis-02-F-001 — Discharge Readiness Checklist",
      "Form Dis-02-F-002 — Medication Education Acknowledgement",
      "Form Dis-02-F-003 — Continuation of Care Plan Template",
    ]} />

    {/* 14. Revision History */}
    <SectionTitle>14. Revision History</SectionTitle>
    <Table
      cols={[
        { label: "Version", width: "10%", center: true },
        { label: "Date", width: "14%" },
        { label: "Revised By", width: "20%" },
        { label: "Summary of Changes", width: "56%" },
      ]}
      rows={REVISION_ROWS}
    />

    <ProtocolApproval
      docCode="Dis-02"
      docTitle="Discharge Planning & Readiness SOP"
      approvedBy={{ name: "Mr. Hemant Shinde", title: "CEO, Founder & Director" }}
    />
  </ProtocolWrapper>
));

export default Dis02DischargePlanningReadinessSOP;
