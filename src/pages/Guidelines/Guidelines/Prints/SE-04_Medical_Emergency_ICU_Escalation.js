import React, { forwardRef, Fragment } from "react";
import {
  SectionHeader, BulletList, NumberedList,
  DataTable, ControlTable,
  NAVY, GOLD,
} from "./SEComponents";

// ── DATA ──────────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  ["SOP Code", "SE-04"],
  ["Effective From", "15.02.2026"],
  ["Applies To", "All centres within the Jagruti Network"],
  ["Approved By", "Dr. Amar Shinde | Founder & Clinical Director"],
  ["Review Cycle", "Annual or post-critical event"],
];

const KPI_ROWS = [
  ["Emergency response documentation within 2 hrs", "%", "≥ 95%", "Monthly"],
  ["Emergency equipment daily checklist compliance", "%", "100%", "Monthly"],
  ["Transfer documentation completeness", "%", "≥ 95%", "Quarterly"],
  ["RCA completion for severe cases", "%", "100%", "Quarterly"],
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Se04MedicalEmergencyIcuEscalation = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`}>
        <div style={{ borderBottom: `3px solid ${NAVY}`, paddingBottom: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ color: NAVY, fontWeight: "bold", fontSize: "0.85rem", letterSpacing: "0.04em" }}>Jagruti Rehabilitation Centre</div>
          <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1.4rem", marginTop: "4px" }}>SE-04 — Medical Emergency &amp; ICU Escalation SOP</div>
        </div>
      </div>

      <ControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionHeader>1. Purpose</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>This SOP establishes a structured protocol for:</p>
      <BulletList items={[
        "Identification of medical emergencies",
        "Immediate on-site response",
        "Stabilisation measures",
        "Transfer to higher medical facility",
        "Documentation and escalation",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>The objective is to ensure rapid intervention and legal defensibility.</p>

      {/* 2. SCOPE */}
      <SectionHeader>2. Scope</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Applies to all inpatient areas, including:</p>
      <BulletList items={[
        "Psychiatric wards",
        "Detox units",
        "Geriatric wards",
        "Therapy areas",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Applies to all staff on duty.</p>

      {/* 3. DEFINITION OF MEDICAL EMERGENCY */}
      <SectionHeader>3. Definition of Medical Emergency</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>A medical emergency includes but is not limited to:</p>
      <BulletList items={[
        "Seizure",
        "Delirium tremens",
        "Severe withdrawal complications",
        "Overdose",
        "Cardiac arrest",
        "Respiratory distress",
        "Severe allergic reaction",
        "Acute lithium toxicity",
        "Clozapine-related severe reaction",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Any life-threatening instability qualifies.</p>

      {/* 4. IMMEDIATE RESPONSE PROTOCOL */}
      <SectionHeader>4. Immediate Response Protocol</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Upon identification:</p>
      <NumberedList items={[
        "Call for medical assistance immediately",
        "Initiate basic life support (BLS) if indicated",
        "Check airway, breathing, circulation",
        "Monitor vitals",
        "Inform on-duty psychiatrist and physician",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Time of recognition must be recorded.</p>

      {/* 5. STABILISATION MEASURES */}
      <SectionHeader>5. Stabilisation Measures</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Depending on condition:</p>
      <BulletList items={[
        "Oxygen administration",
        "IV access",
        "Seizure management protocol",
        "Emergency medication administration",
        "Positioning for airway protection",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Emergency trolley must be available and checked daily.</p>

      {/* 6. ESCALATION TO HIGHER CENTRE / ICU */}
      <SectionHeader>6. Escalation to Higher Centre / ICU</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Immediate transfer required if:</p>
      <BulletList items={[
        "Persistent unstable vitals",
        "Recurrent seizures",
        "Severe respiratory compromise",
        "Altered consciousness",
        "Suspected internal injury",
      ]} />
      <p style={{ margin: "0 0 0.5rem" }}>Decision to transfer rests with treating psychiatrist/physician.</p>
      <p style={{ margin: "0 0 0.75rem" }}>Serious cases must be escalated to Dr. Amar Shinde within 24 hours.</p>

      {/* 7. AMBULANCE & TRANSFER PROTOCOL */}
      <SectionHeader>7. Ambulance &amp; Transfer Protocol</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Before transfer:</p>
      <BulletList items={[
        "Stabilise patient as much as possible",
        "Inform receiving hospital",
        "Send referral note",
        "Attach relevant medical records",
        "Inform family immediately",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Time of transfer must be documented.</p>

      {/* 8. EMERGENCY EQUIPMENT STANDARDS */}
      <SectionHeader>8. Emergency Equipment Standards</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Each centre must maintain:</p>
      <BulletList items={[
        "Functional oxygen supply",
        "Ambu bag",
        "Suction apparatus",
        "Emergency medications",
        "Glucometer",
        "Pulse oximeter",
        "Emergency crash cart",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Daily checklist mandatory.</p>

      {/* 9. DOCUMENTATION REQUIREMENTS */}
      <SectionHeader>9. Documentation Requirements</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>EMR must include:</p>
      <BulletList items={[
        "Nature of emergency",
        "Time detected",
        "Actions taken",
        "Medications administered",
        "Time of escalation",
        "Transfer details (if applicable)",
        "Outcome",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Incident must also be logged under Incident Reporting SOP.</p>

      {/* 10. POST-EVENT REVIEW */}
      <SectionHeader>10. Post-Event Review</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>All medical emergencies require:</p>
      <BulletList items={[
        "Case review within 72 hours",
        "RCA if severe",
        "Equipment audit",
        "Protocol adherence review",
      ]} />
      <p style={{ margin: "0 0 0.5rem" }}>Reviewed during MCR.</p>
      <p style={{ margin: "0 0 0.75rem" }}>Serious sentinel events reviewed by Dr. Amar Shinde.</p>

      {/* 11. KPI MONITORING */}
      <SectionHeader>11. KPI Monitoring</SectionHeader>
      <DataTable
        cols={[{ label: "KPI" }, { label: "UoM", width: "8%" }, { label: "Target", width: "14%" }, { label: "Review", width: "14%" }]}
        rows={KPI_ROWS}
      />

      {/* 12. NON-COMPLIANCE */}
      <SectionHeader>12. Non-Compliance</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Failure to follow emergency protocol may result in:</p>
      <BulletList items={[
        "Clinical review",
        "Disciplinary action",
        "Privilege restriction",
        "Escalation to Clinical Director",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Delayed escalation increases institutional liability.</p>

      {/* 13. REVIEW */}
      <SectionHeader>13. Review</SectionHeader>
      <p style={{ margin: "0 0 1.5rem" }}>This SOP shall be reviewed annually or after critical emergency event.</p>
    </div>
  </Fragment>
));

export default Se04MedicalEmergencyIcuEscalation;
