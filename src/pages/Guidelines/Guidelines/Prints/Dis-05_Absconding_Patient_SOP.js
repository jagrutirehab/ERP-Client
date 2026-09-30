import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  WarningBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["SOP Number", "Dis-05"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Governance | Patient Safety | Medico-Legal"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Four Clinical Verticals | All Clinical & Support Staff"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 103 — Recall); BNS 2023; NABH COP | ACE | RM | QM"],
  ["Related SOPs", "Dis-01 (Master) | Dis-02 (Discharge Planning) | Adm-05 (Emergency Involuntary Admission)"],
];

const DEFINITIONS_ROWS = [
  ["Absconding", "A patient leaving the facility premises without clinical authorisation or formal discharge, regardless of admission category"],
  ["Elopement", "Absconding by a patient who has actively evaded staff — implies deliberate concealment of intention to leave"],
  ["AWOL (Absent Without Leave)", "A patient whose whereabouts are unknown and who has not returned at the expected time"],
  ["MHCA Sec. 103 Recall", "The legal power to recall an involuntary patient who absconds — requires police assistance; applicable to Sec. 89/90 admissions"],
  ["High-Risk Absconding", "Absconding by a patient with active suicidal ideation, severe psychosis, active withdrawal, or a history of self-harm"],
];

const RISK_ROWS = [
  ["Active suicidal ideation + impulsive behaviour", "HIGH", "Level 3/4 observation; ward door secured; daily risk review"],
  ["Previous absconding history (this or prior admission)", "HIGH", "Document in EMR; daily nursing risk note; family briefed"],
  ["Involuntary admission (Sec. 89/90) expressing wish to leave", "HIGH", "MDT review immediately; Clinical Director informed; engagement plan"],
  ["Voluntary admission expressing repeated desire to leave", "MODERATE", "Therapeutic engagement; AMA protocol activated; family involved"],
  ["Newly admitted patient — orientation incomplete", "MODERATE", "Nursing orientation completed within 2 hours; buddy system first 24 hrs"],
  ["Active withdrawal — disinhibited, confused, or agitated", "MODERATE-HIGH", "Enhanced observation; CIWA-Ar / COWS monitoring; restrict access to exit"],
  ["No stated wish to leave; settled behaviour", "LOW", "Standard observation; routine monitoring"],
];

const RESPONSE_ROWS = [
  ["0–5 min", "STAFF DISCOVERS PATIENT MISSING: Any staff member who notices a patient is missing must immediately inform the Nursing In-Charge. Do not search alone. Do not delay to investigate independently."],
  ["0–5 min", "CONFIRM ABSENCE: Nursing In-Charge confirms the patient is not in their room, bathroom, garden, activity areas, or any other part of the facility. Note the exact time patient was last seen."],
  ["5–10 min", "ACTIVATE SEARCH: Nursing In-Charge organises an immediate structured search of all facility areas — rooms, bathrooms, common areas, garden, roof, all exits. Assign staff to each zone."],
  ["5–10 min", "NOTIFY DUTY DOCTOR & PSYCHIATRIST: Call duty doctor and treating psychiatrist immediately. State: patient name, admission type, last seen time, clinical risk level (especially suicidal ideation, active psychosis, withdrawal status)."],
  ["10–15 min", "NOTIFY CENTRE MANAGER: Centre Manager informed within 15 minutes. Centre Manager takes operational lead — contacts security, locks perimeter exits if safe to do so, checks CCTV if available."],
  ["15 min", "DOCUMENT TIME OF ABSCONDING: Time of absconding is formally logged as: the last confirmed time patient was seen on premises. This timestamp is legally critical — document precisely."],
  ["15–30 min", "FAMILY NOTIFICATION: Treating psychiatrist or Centre Manager calls the patient's primary family contact (Nominated Representative / FRP). Inform calmly and factually. Ask if patient has contacted them. Document: who was called, what was said, family response."],
  ["30–60 min", "CLINICAL DIRECTOR NOTIFICATION: Clinical Director notified for all high-risk absconding (suicidal, psychotic, active withdrawal, involuntary patients). Required within 30 minutes."],
];

const POLICE_ROWS = [
  ["Involuntary admission (MHCA Sec. 89/90)", "MANDATORY", "Within 3 hours of confirmed absconding", "MHCA 2017 Sec. 103 — recall provision"],
  ["High-risk voluntary: active suicidal ideation", "STRONGLY RECOMMENDED", "Within 3 hours — Centre Manager + Clinical Director decision", "BNS 2023; duty of care"],
  ["Voluntary patient with capacity, low risk", "Not mandatory — family and clinical team decide", "As clinically indicated", "MHCA Sec. 87 — right to self-determination"],
  ["Minor (under 18)", "MANDATORY — also notify child protection", "Immediately", "BNS 2023; Juvenile Justice Act"],
  ["NDPS-ordered treatment patient", "MANDATORY", "Within 3 hours", "NDPS Act — court-directed treatment"],
];

const RETURN_ROWS = [
  ["Step 1", "Welcome the patient calmly and without confrontation. Do not scold, lecture, or express frustration. Clinical safety first."],
  ["Step 2", "Immediate clinical assessment by duty doctor: physical injuries, intoxication, withdrawal status, mental state. Document findings."],
  ["Step 3", "Treating psychiatrist reviews the patient within 2 hours of return: MSE, risk re-assessment, trigger exploration. Update care plan."],
  ["Step 4", "Family notification: inform family the patient has returned safely. Document the call."],
  ["Step 5", "Therapeutic debrief by psychologist or counsellor within 24 hours: explore what triggered the absconding; address unmet needs."],
  ["Step 6", "Review and update the risk management plan: observation level, ward access, therapeutic engagement strategy."],
  ["Step 7", "Complete incident report within 4 hours. Conduct MDT review within 48 hours. Implement preventive measures."],
];

const DOCUMENTATION_ITEMS = [
  " Time patient was last seen — confirmed by staff name, location, and circumstances",
  " Time absconding was confirmed — and by whom",
  " Structured search conducted — areas checked, staff involved, outcome",
  " Treating psychiatrist notified — time and response",
  " Centre Manager notified — time and response",
  " Clinical Director notified (high-risk cases) — time and response",
  " Family / NR notified — who, when, what was said, their response",
  " Police intimated (if required) — station, officer, time, FIR number",
  " SMHA notification (if 72 hours unresolved) — date, reference number",
  " Incident report completed within 4 hours",
  " MDT review completed within 48 hours — minutes filed",
];

const KPI_ROWS = [
  ["All absconding incidents reported within 15 minutes of confirmation", "100%", "Monthly"],
  ["Police intimated within 3 hours for mandatory categories", "100%", "Per event"],
  ["Family notified within 30 minutes of confirmed absconding", "100%", "Monthly"],
  ["Incident report completed within 4 hours", "100%", "Monthly"],
  ["MDT review conducted within 48 hours of absconding", "100%", "Monthly"],
  ["Risk assessment updated for all patients on return", "100%", "Per event"],
];

const Dis05AbscondingPatientSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-05"
      title="Absconding Patient — Response, Search & Management Protocol"
      icdLine="SOP Dis-05 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      🔴 Critical — Time-Sensitive: Absconding is a patient safety emergency. The 15-minute response window is non-negotiable. Any patient leaving the premises without clinical authorisation must be treated as absconded until confirmed otherwise. For patients on involuntary admission (MHCA Sec. 89/90): police intimation within 3 hours is legally mandatory.
    </WarningBox>

    {/* 1. Purpose */}
    <SectionTitle>1. Purpose</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      This SOP defines the mandatory protocol for responding to, managing, and documenting the absconding of patients from all Jagrutii Rehabilitation Centres. It applies to all admission categories — voluntary, supported, and involuntary — across all four clinical verticals.
    </p>
    <BulletList items={[
      "To ensure a rapid, coordinated, and documented response to every absconding event",
      "To protect the patient's safety and Jagrutii's medico-legal position",
      "To meet MHCA 2017 Section 103 recall obligations for involuntary patients",
      "To enable systematic root cause analysis and prevention of future events",
    ]} />

    {/* 2. Definitions */}
    <SectionTitle>2. Definitions</SectionTitle>
    <Table
      cols={[
        { label: "Term", width: "26%" },
        { label: "Definition", width: "74%" },
      ]}
      rows={DEFINITIONS_ROWS}
    />

    {/* 3. Absconding Risk Assessment */}
    <SectionTitle>3. Absconding Risk Assessment — Prevention</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The best management of absconding is prevention. Every admitted patient must be assessed for absconding risk at admission and at each MDT review.
    </p>
    <Table
      cols={[
        { label: "Risk Factor", width: "34%" },
        { label: "Level", width: "16%" },
        { label: "Action", width: "50%" },
      ]}
      rows={RISK_ROWS}
    />

    {/* 4. Immediate Response Protocol */}
    <SectionTitle>4. Immediate Response Protocol — 15-Minute Activation</SectionTitle>
    <Table
      cols={[
        { label: "Time", width: "13%" },
        { label: "Action", width: "87%" },
      ]}
      rows={RESPONSE_ROWS}
    />

    {/* 5. Police Intimation */}
    <SectionTitle>5. Police Intimation — When &amp; How</SectionTitle>
    <Table
      cols={[
        { label: "Patient Category", width: "24%" },
        { label: "Police Required", width: "24%" },
        { label: "Timeframe", width: "26%" },
        { label: "Legal Basis", width: "26%" },
      ]}
      rows={POLICE_ROWS}
    />
    <WarningBox>
      ⚠ Police Intimation Procedure — Call the nearest police station — not emergency line unless immediate physical danger. State: 'We are Jagrutii Rehabilitation Centre. A patient has absconded. This is an FIR / intimation matter.' Provide: patient name, age, description, last seen time, admission type, clinical risk, family contact. Request: welfare check at patient's home address and known locations. Document: police station name, officer name, time of call, FIR number if issued.
    </WarningBox>

    {/* 6. MHCA 2017 Section 103 */}
    <SectionTitle>6. MHCA 2017 Section 103 — Recall of Involuntary Patients</SectionTitle>
    <BulletList items={[
      "Section 103 MHCA 2017 provides the legal framework for recalling an involuntary patient who absconds from a registered mental health establishment",
      "The Centre must notify the police in writing — provide the patient's details, admission order, and absconding circumstances",
      "Police are empowered to locate and return the patient to the facility without a separate court order",
      "The recall must be documented: police notification, patient's return (if applicable), clinical review on return",
      "If the patient cannot be located within 72 hours: notify the State Mental Health Authority (SMHA) in writing",
      "On return: mandatory clinical assessment by treating psychiatrist before re-admission to ward; risk level re-evaluated; admission category reviewed",
    ]} />

    {/* 7. Patient Returned */}
    <SectionTitle>7. Patient Returned — Protocol</SectionTitle>
    <Table
      cols={[
        { label: "Step", width: "12%", center: true },
        { label: "Action", width: "88%" },
      ]}
      rows={RETURN_ROWS}
    />

    {/* 8. Documentation */}
    <SectionTitle>8. Documentation — Mandatory</SectionTitle>
    <BulletList items={DOCUMENTATION_ITEMS} />

    {/* 9. KPI Monitoring */}
    <SectionTitle>9. KPI Monitoring</SectionTitle>
    <Table
      cols={[
        { label: "KPI", width: "56%" },
        { label: "Target", width: "14%" },
        { label: "Review", width: "30%" },
      ]}
      rows={KPI_ROWS}
    />

    <ProtocolApprovalNew
      docCode="Dis-05"
      docTitle="Absconding Patient — Response, Search & Management Protocol"
      approvedBy={{ name: "Mr. Hemant Shinde", title: "CEO, Founder & Director" }}
    />
  </ProtocolWrapper>
));

export default Dis05AbscondingPatientSOP;
