import React, { forwardRef, Fragment } from "react";
import {
  tableCellStyle,
  tableHeadStyle,
  ChecklistItem,
  SectionHeader,
  EscalationBox,
  WorkflowHeader,
  DocumentControlTable,
  WorkflowFooter,
  WorkflowWrapper,
} from "./WorkflowComponents";

const INDIGO = "#2d3a8c";

const DOC_CONTROL_ROWS = [
  { label: "Workflow Code", value: <strong>WF-07</strong> },
  { label: "Version", value: "1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Regulatory Basis", value: "MHCA 2017; NABH COP 3, 5; IPS Clinical Practice Guidelines 2022" },
  { label: "Cross-Reference", value: "WF-01 (Psychiatrist), CL-01 to CL-20 (Treatment Protocols)" },
  { label: "Applies To", value: "All clinical team members across all four verticals · All 18 centres" },
];

const indigoHeadCell = { ...tableCellStyle, background: INDIGO, color: "#fff", fontWeight: "bold" };

const SimpleTable = ({ cols, rows }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
    <thead>
      <tr>{cols.map((c) => <th key={c.label} style={{ ...indigoHeadCell, width: c.width }}>{c.label}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => <td key={j} style={j === 0 ? { ...tableCellStyle, fontWeight: "bold" } : tableCellStyle}>{cell}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

const MEETING_STRUCTURE = [
  ["Frequency", "Weekly (every patient reviewed at least weekly); daily huddle for high-risk patients"],
  ["Chair", "Treating / Lead Consultant Psychiatrist"],
  ["Duration", "45–90 minutes depending on census"],
  ["Documentation", "All decisions recorded in each patient's EMR the SAME day"],
  ["Quorum", "Psychiatrist + Nursing In-Charge + Psychologist + MSW minimum"],
];

const ATTENDEES = [
  ["Lead Psychiatrist (Chair)", "Clinical decisions; treatment plan approval; risk sign-off"],
  ["Clinical Psychologist", "Psychometric findings; therapy progress; formulation"],
  ["Psychiatric Social Worker (MSW)", "Family situation; discharge planning; social/legal factors"],
  ["Nursing In-Charge", "Ward behaviour; medication adherence; incidents; observation levels"],
  ["Duty Doctor / RMO", "Physical health, comorbidities, investigation results"],
  ["(As needed) Dietitian, OT, Pharmacist", "Specialist input for relevant patients"],
];

const AGENDA_COLS = [
  { label: "Item", width: "6%" },
  { label: "Focus", width: "67%" },
  { label: "Lead", width: "27%" },
];

const AGENDA_ROWS = [
  ["1", "New admissions (< 7 days) — formulation, provisional plan, ELOS", "Psychiatrist"],
  ["2", "High-risk patients — suicide, violence, absconding, restraint review", "Psychiatrist + Nursing"],
  ["3", "Treatment review — response, medication changes, scale scores (PANSS/PHQ-9/etc.)", "Psychiatrist + Psychologist"],
  ["4", "Discharge planning — readiness, CCP, family, follow-up", "MSW"],
  ["5", "Incidents & safety — events since last MDT; corrective actions", "Nursing In-Charge"],
  ["6", "Family/legal matters — DAMA, MHRB, consent, complaints", "MSW"],
  ["7", "Pending tasks & documentation gaps", "Chair"],
];

const WORKFLOW_COLS = [
  { label: "Phase", width: "12%" },
  { label: "Action", width: "53%" },
  { label: "Responsible", width: "22%" },
  { label: "Timeframe", width: "13%" },
];

const WORKFLOW_ROWS = [
  ["BEFORE", "Circulate patient list + flag high-risk cases", "Nursing In-Charge", "Day before"],
  ["BEFORE", "Ensure scale scores, reports, investigations are updated in EMR", "Psychologist / Duty Doctor", "Day before"],
  ["DURING", "Review each patient against standing agenda; reach documented decisions", "All / Chair", "At meeting"],
  ["DURING", "Assign actions with named owner + deadline for each decision", "Chair", "At meeting"],
  ["AFTER", "Record MDT decisions in each patient's EMR", "Treating clinician", "Same day"],
  ["AFTER", "Update treatment plans, ELOS, discharge dates", "Psychiatrist", "Same day"],
  ["AFTER", "Track open actions to next MDT", "Chair", "Ongoing"],
];

const KEY_STANDARDS = [
  ["≥ 95% scheduled MDT meetings held", "Monthly audit"],
  ["Every patient reviewed at least weekly", "EMR timestamp audit"],
  ["All MDT decisions documented same day", "10% sample audit"],
  ["High-risk patients reviewed every MDT", "High-risk register cross-check"],
];

const Wf07MdtMeetingWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="WF-07 — Multidisciplinary Team (MDT) Meeting Workflow"
        docId="WF-07"
        version="Version 1.0"
        effectiveDate="01 June 2026"
        subtitle="All clinical team members across all four verticals · All 18 centres"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* MEETING STRUCTURE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={INDIGO}>MEETING STRUCTURE</SectionHeader>
        <SimpleTable cols={[{ label: "Attribute", width: "22%" }, { label: "Standard" }]} rows={MEETING_STRUCTURE} />
      </div>

      {/* MANDATORY ATTENDEES */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={INDIGO}>MANDATORY ATTENDEES</SectionHeader>
        <SimpleTable cols={[{ label: "Role", width: "32%" }, { label: "Contribution to MDT" }]} rows={ATTENDEES} />
      </div>

      {/* STANDING AGENDA */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={INDIGO}>STANDING AGENDA</SectionHeader>
        <SimpleTable cols={AGENDA_COLS} rows={AGENDA_ROWS} />
      </div>

      {/* WORKFLOW BEFORE / DURING / AFTER */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={INDIGO}>WORKFLOW — BEFORE, DURING, AFTER</SectionHeader>
        <SimpleTable cols={WORKFLOW_COLS} rows={WORKFLOW_ROWS} />
      </div>

      {/* KEY STANDARDS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={INDIGO}>KEY STANDARDS</SectionHeader>
        <SimpleTable cols={[{ label: "Standard", width: "55%" }, { label: "Indicator" }]} rows={KEY_STANDARDS} />
      </div>

      <EscalationBox>
        ESCALATE TO CLINICAL DIRECTOR: Unresolved high-risk management disagreement · sentinel event reviewed at MDT · complex involuntary/legal case · safeguarding concern
      </EscalationBox>

      {/* DOCUMENTATION GATE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">MDT COMPLETE — DOCUMENTATION GATE</SectionHeader>
        <ChecklistItem tick><span><strong>Every listed patient reviewed</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Decisions recorded in each EMR same day</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Treatment plans / ELOS / discharge dates updated</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Actions assigned with owner + deadline</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>High-risk register reconciled</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Open actions carried to next MDT</strong></span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf07MdtMeetingWorkflow;
