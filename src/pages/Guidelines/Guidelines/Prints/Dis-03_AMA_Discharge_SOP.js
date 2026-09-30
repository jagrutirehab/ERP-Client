import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  WarningBox,
  CalloutBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Doc ID", "Dis-03"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Vertical / Scope", "All Four Verticals — All 18 Centres"],
  ["Category", "Medico-Legal | Patient Rights | Clinical Governance"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 21, 23, 87, 89, 90, 99); Indian Contract Act 1872; NABH COP; NMC Code of Ethics"],
  ["NABH Chapter", "COP | ACE | RM | QM"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Clinical Disciplines"],
  ["Classification", "CONFIDENTIAL — Internal Clinical Governance Document"],
];

const DEFINITIONS_ROWS = [
  ["AMA Discharge", "A discharge that proceeds at the request of the patient or their legally authorised representative, against the clinical recommendation of the treating psychiatrist."],
  ["Mental Capacity", "The legal and clinical ability to understand, retain, weigh information, and communicate a decision about treatment — as defined under MHCA 2017."],
  ["Legally Authorised Representative", "For voluntary patients: the patient. For supported admission: the NR. For minors: parent or legal guardian. For involuntary admission: MHRB governs discharge."],
  ["AMA Declaration Form", "The legally binding signed document executed by the patient or LAR confirming voluntary departure against clinical advice. Form Dis-03-F-001."],
  ["High-Risk AMA", "An AMA request involving active suicidal ideation, severe psychosis, active withdrawal, court involvement, or a patient who lacks capacity."],
];

const LEGAL_ROWS = [
  ["MHCA 2017 Sec. 87", "Voluntary patients (with capacity) have an inherent right to request discharge; this right must be respected unless incapacity or involuntary criteria apply."],
  ["MHCA 2017 Sec. 89-90", "Patients admitted on supported or involuntary basis cannot self-discharge; LAR or MHRB governs. AMA process differs — see Section 10."],
  ["MHCA 2017 Sec. 99", "Detaining a voluntary patient with capacity who requests discharge constitutes unlawful detention. Criminal liability applies."],
  ["MHCA 2017 Sec. 21", "AMA process must be applied uniformly regardless of financial status, family pressure, or institutional convenience."],
  ["NMC Code of Ethics", "Clinicians must document risk counselling at AMA; failure to document constitutes professional misconduct."],
];

const CAPACITY_DECISION_ROWS = [
  ["Has capacity — requests discharge", "Respect the decision. Proceed to Step 4 (Risk Counselling) and Step 5 (Documentation). May not be detained."],
  ["Lacks capacity — voluntary admission", "Escalate to NR. Consider transition to Supported Admission (Sec. 89). Document all actions. Centre Head informed."],
  ["Lacks capacity — no NR available", "Treating psychiatrist documents justification for continued admission. Escalate to Clinical Director. MHRB notification may be required."],
  ["Supported admission (Sec. 89) — NR requests discharge", "NR has authority to request discharge. Clinical team provides risk counselling to NR. NR signs AMA Declaration."],
  ["Involuntary admission (Sec. 90) — patient demands discharge", "Patient does not have unilateral right to discharge. Escalate to Clinical Director. MHRB review may be required."],
];

const STEP5_DOC_ROWS = [
  ["AMA Declaration Form (Dis-03-F-001)", "Patient or LAR + witness", "Before departure"],
  ["Capacity Assessment (CAP-F-001)", "Treating Psychiatrist", "Within 1 hour of request"],
  ["Risk counselling documentation", "Treating Psychiatrist", "Before departure"],
  ["AMA clinical note in EMR", "Treating Psychiatrist", "Within 2 hours"],
  ["AMA discharge summary", "Treating Psychiatrist", "Before departure or within 24 hours"],
];

const HIGH_RISK_ROWS = [
  ["Active suicidal ideation at time of AMA request", "Centre Head + Clinical Director informed; consider MHCA Sec. 90 grounds", "Immediately"],
  ["Severe psychosis or mania", "Clinical Director approval required; Sec. 89/90 assessment mandatory", "Immediately"],
  ["Active alcohol/drug withdrawal with medical risk", "Medical officer assessment; consider hospital transfer before AMA", "Within 30 minutes"],
  ["Family threatening to remove patient by force", "Centre Head + security; document threat; police notification if required", "Immediately"],
  ["Court-ordered admission or NDPS compulsory treatment", "Clinical Director + Legal Team; court may need to be notified", "Immediately"],
  ["Child / adolescent AMA (parent-driven)", "Clinical Director + Child Protection Officer; consider POCSO / Juvenile Justice Act implications", "Immediately"],
];

const KPI_ROWS = [
  ["Capacity assessment documented for all AMA cases", "100%", "Centre Manager", "Monthly"],
  ["Risk counselling documented for all AMA cases", "100%", "Centre Manager", "Monthly"],
  ["AMA Declaration Form completed or refusal documented", "100%", "Nursing In-Charge", "Monthly"],
  ["High-risk AMA cases escalated to Clinical Director", "100%", "Clinical Director", "Monthly"],
  ["Post-AMA 48-hour follow-up attempted", ">= 90%", "Centre Manager", "Monthly"],
  ["30-day readmission post-AMA", "< 40% target", "Clinical Director", "Monthly"],
  ["AMA rate as % of all discharges — alert if > 10%", "Monitored", "Clinical Director", "Monthly"],
];

const REVISION_ROWS = [
  ["1.0", "15.02.2026", "Dr. Amar Shinde", "Initial version — Jagruti Rehabilitation Centre"],
  ["2.0", "01.06.2026", "Dr. Amar Shinde", "Full rewrite — MHCA 2017 legal framework; capacity decision tree; high-risk escalation; post-AMA follow-up added"],
];

const Dis03AMADischargeSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-03"
      title="Against Medical Advice (AMA) Discharge SOP"
      icdLine="Doc ID: Dis-03 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="2.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      ⚠ AMA discharge is a legal event — not an informal discharge. Every AMA case carries significant medico-legal risk. Incomplete documentation exposes JRCPL and the treating clinician to civil and criminal liability. No administrative staff may authorise or facilitate AMA discharge without clinical sign-off.
    </WarningBox>

    {/* 1. Purpose */}
    <SectionTitle>1. Purpose</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      This SOP establishes the mandatory framework for responding to, managing, and documenting requests for discharge Against Medical Advice (AMA) at Jagrutii Rehab Centre Pvt. Ltd. across all 18 centres and all four clinical verticals.
    </p>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      It balances the patient's legal right to autonomy and self-determination against the clinical duty of care and the organisation's medico-legal obligations.
    </p>

    {/* 2. Scope */}
    <SectionTitle>2. Scope</SectionTitle>
    <BulletList items={[
      "All inpatient and residential patients — all four clinical verticals",
      "All admission categories: voluntary, supported, involuntary, and emergency admissions",
      "All clinical staff: psychiatrists, medical officers, psychologists, nursing staff, social workers",
      "Administrative and management staff who may receive initial AMA requests",
    ]} />

    {/* 3. Definitions */}
    <SectionTitle>3. Definitions</SectionTitle>
    <Table
      cols={[
        { label: "Term", width: "26%" },
        { label: "Definition", width: "74%" },
      ]}
      rows={DEFINITIONS_ROWS}
    />

    {/* 4. Legal Framework */}
    <SectionTitle>4. Legal Framework</SectionTitle>
    <Table
      cols={[
        { label: "Provision", width: "22%" },
        { label: "AMA Implication", width: "78%" },
      ]}
      rows={LEGAL_ROWS}
    />

    {/* 5. Step-by-Step AMA Protocol */}
    <SectionTitle>5. Step-by-Step AMA Protocol</SectionTitle>

    <SectionTitle>Step 1 — Receive &amp; Escalate (0–30 minutes)</SectionTitle>
    <ol style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Any staff member who receives an AMA request must NOT engage administratively — immediately inform the nursing in-charge.</li>
      <li style={{ marginBottom: "4px" }}>Nursing in-charge calls treating psychiatrist or on-call psychiatrist immediately.</li>
      <li style={{ marginBottom: "4px" }}>No discharge preparations (packing, billing) begin until clinical assessment is complete.</li>
      <li style={{ marginBottom: "4px" }}>Time and nature of request documented in nursing notes.</li>
    </ol>

    <SectionTitle>Step 2 — Clinical Assessment (within 1 hour)</SectionTitle>
    <ol start={5} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Treating or on-call psychiatrist attends and conducts urgent full clinical reassessment.</li>
      <li style={{ marginBottom: "4px" }}>MSE documented. Risk level classified: Low / Moderate / High.</li>
      <li style={{ marginBottom: "4px" }}>Reasons for AMA request explored and documented.</li>
      <li style={{ marginBottom: "4px" }}>Capacity formally assessed using JRCPL Capacity Assessment Form (CAP-F-001).</li>
    </ol>

    <SectionTitle>Step 3 — Capacity-Based Decision Tree</SectionTitle>
    <Table
      cols={[
        { label: "Capacity Status", width: "36%" },
        { label: "Action", width: "64%" },
      ]}
      rows={CAPACITY_DECISION_ROWS}
    />

    <SectionTitle>Step 4 — Risk Counselling (mandatory for ALL AMA cases)</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The treating psychiatrist must personally conduct and document risk counselling covering:
    </p>
    <BulletList items={[
      "Current clinical risks if discharged prematurely",
      "Relapse risk and timeline estimates",
      "Suicidal and self-harm risk (if applicable) — explained clearly in lay terms",
      "Risks of medication discontinuation — withdrawal, relapse, medical consequences",
      "Legal implications (if under court order, NDPS compulsory treatment, or child protection concerns)",
      "Available alternatives: therapeutic leave, family visit, treatment modification, second opinion",
    ]} />
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      Risk counselling must be offered to patient AND primary family member / NR. All must be documented in the EMR.
    </p>

    <SectionTitle>Step 5 — Documentation (mandatory before patient leaves)</SectionTitle>
    <Table
      cols={[
        { label: "Document", width: "36%" },
        { label: "Who Completes", width: "30%" },
        { label: "Timing", width: "34%" },
      ]}
      rows={STEP5_DOC_ROWS}
    />
    <WarningBox>
      ⚠ If patient or family refuses to sign the AMA Declaration: document the refusal to sign, the verbal request for discharge, and the clinical assessment outcome. Two staff witnesses sign the form. The refusal to sign does not prevent discharge of a capacitous voluntary patient.
    </WarningBox>

    <SectionTitle>Step 6 — Discharge Execution</SectionTitle>
    <ol start={9} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Issue AMA discharge summary clearly marked 'DISCHARGE AGAINST MEDICAL ADVICE'.</li>
      <li style={{ marginBottom: "4px" }}>Provide written prescription for medications — minimum 7-day supply; explain risks of non-compliance.</li>
      <li style={{ marginBottom: "4px" }}>Provide emergency contacts: JRCPL helpline, nearest emergency facility, crisis line.</li>
      <li style={{ marginBottom: "4px" }}>Advise immediate return if condition deteriorates.</li>
      <li style={{ marginBottom: "4px" }}>Document in EMR that all the above were provided.</li>
      <li style={{ marginBottom: "4px" }}>Report case in monthly AMA register; submit to Centre Manager same day.</li>
    </ol>

    {/* 6. High-Risk AMA */}
    <SectionTitle>6. High-Risk AMA — Enhanced Escalation Protocol</SectionTitle>
    <Table
      cols={[
        { label: "High-Risk Trigger", width: "30%" },
        { label: "Escalation Action", width: "50%" },
        { label: "Timeline", width: "20%" },
      ]}
      rows={HIGH_RISK_ROWS}
    />

    {/* 7. Detention */}
    <SectionTitle>7. Detention — Legal Boundary</SectionTitle>
    <CalloutBox>
      JRCPL may NOT detain a voluntary patient with mental capacity who requests discharge, regardless of clinical risk. Detention without legal authority under MHCA 2017 Sections 89-90 constitutes unlawful detention under Section 99 — a criminal offence. The correct response to a high-risk voluntary AMA is thorough documentation, risk counselling, and offering alternatives — not detention.
    </CalloutBox>

    {/* 8. Post-AMA Follow-Up */}
    <SectionTitle>8. Post-AMA Follow-Up</SectionTitle>
    <ol start={15} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Centre manager attempts telephonic follow-up within 48 hours of AMA discharge.</li>
      <li style={{ marginBottom: "4px" }}>Result of follow-up call documented in EMR.</li>
      <li style={{ marginBottom: "4px" }}>If a patient cannot be reached, inform the family member / NR.</li>
      <li style={{ marginBottom: "4px" }}>30-day readmission data tracked and reported to the Clinical Director monthly.</li>
    </ol>

    {/* 9. KPI Monitoring */}
    <SectionTitle>9. KPI Monitoring</SectionTitle>
    <Table
      cols={[
        { label: "KPI", width: "46%" },
        { label: "Target", width: "14%" },
        { label: "Measured By", width: "22%" },
        { label: "Frequency", width: "18%" },
      ]}
      rows={KPI_ROWS}
    />

    {/* 10. Related Documents */}
    <SectionTitle>10. Related Documents</SectionTitle>
    <BulletList items={[
      "Dis-02 — Discharge Planning & Readiness SOP",
      "CL-01 — Admission, Informed Consent & Capacity Assessment SOP",
      "CL-03 — Emergency & Involuntary Admission SOP",
      "SE-01 — Suicide Risk Prevention & Management SOP",
      "Form Dis-03-F-001 — AMA Declaration Form",
      "Form CAP-F-001 — Capacity Assessment Form",
    ]} />

    {/* 11. Revision History */}
    <SectionTitle>11. Revision History</SectionTitle>
    <Table
      cols={[
        { label: "Version", width: "10%", center: true },
        { label: "Date", width: "14%" },
        { label: "Revised By", width: "20%" },
        { label: "Summary of Changes", width: "56%" },
      ]}
      rows={REVISION_ROWS}
    />

    <ProtocolApprovalNew
      docCode="Dis-03"
      docTitle="Against Medical Advice (AMA) Discharge SOP"
      approvedBy={{ name: "Mr. Hemant Shinde", title: "CEO, Founder & Director" }}
    />
  </ProtocolWrapper>
));

export default Dis03AMADischargeSOP;
