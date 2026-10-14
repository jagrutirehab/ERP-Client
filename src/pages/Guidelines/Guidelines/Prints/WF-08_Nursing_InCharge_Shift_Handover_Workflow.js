import React, { forwardRef, Fragment } from "react";
import {
  tableCellStyle,
  ChecklistItem,
  SectionHeader,
  EscalationBox,
  WorkflowHeader,
  DocumentControlTable,
  WorkflowFooter,
  WorkflowWrapper,
} from "./WorkflowComponents";

const ORANGE = "#b84d00";

const DOC_CONTROL_ROWS = [
  { label: "Workflow Code", value: <strong>WF-08</strong> },
  { label: "Version", value: "1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Regulatory Basis", value: "MHCA 2017; NABH COP 9; Indian Nursing Council Standards" },
  { label: "Cross-Reference", value: "WF-02 (Staff Nurse Workflow), CL-11 (Agitation), Command & Escalation Protocol" },
  { label: "Applies To", value: "All Nursing In-Charges and shift nursing teams · All four verticals · All 18 centres" },
];

const orangeHeadCell = { ...tableCellStyle, background: ORANGE, color: "#fff", fontWeight: "bold" };

const OrangeTable = ({ cols, rows }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
    <thead>
      <tr>{cols.map((c) => <th key={c.label} style={{ ...orangeHeadCell, width: c.width }}>{c.label}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={j} style={j === 0 ? { ...tableCellStyle, fontWeight: "bold" } : tableCellStyle}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const STAGE1_ROWS = [
  ["1", "Sign in; collect ward keys, medication trolley keys, duty phone, registers", "Start of shift"],
  ["2", "Receive SBAR handover from outgoing In-Charge", "Start of shift"],
  ["3", "Confirm patient count, census, and bed status", "Start of shift"],
  ["4", "Confirm observation levels for every patient (L1 q30min / L2 q15min / L3 continuous / L4 1:1)", "Start of shift"],
  ["5", "Review high-risk register: suicide, violence, absconding, restraint, withdrawal", "Start of shift"],
  ["6", "Verify controlled-drug (NDPS) count with two-nurse check", "Start of shift"],
  ["7", "Allocate nurses to patients/zones; brief team", "Start of shift"],
];

const SBAR_ROWS = [
  ["S — Situation", "Patient count; critical patients; new admissions; incidents this shift"],
  ["B — Background", "Diagnosis; admission category (MHCA section); relevant history"],
  ["A — Assessment", "Current vitals/behaviour; medication adherence; risk status; observation level"],
  ["R — Recommendation", "Pending orders; tasks due; patients to watch; escalation triggers"],
];

const GOVERNANCE_ROWS = [
  ["Observation Levels", "Enforce assigned levels; spot-check nurse compliance", "Patient missing from assigned location"],
  ["Medication Governance", "Verify MAR completion; NDPS two-nurse check; no end-of-shift batch signing", "Missing dose entry; count mismatch"],
  ["Vitals Monitoring", "Ensure all rounds done; abnormal thresholds escalated", "SpO2 <92%, Pulse <50/>120, GCS drop, seizure"],
  ["Restraint Oversight", "Written psychiatrist order only; vitals q15min; Restraint Register current", "Duration exceeds order"],
  ["Incident Management", "Ensure incident forms filed same day; inform duty doctor and Centre Manager", "Any sentinel event / injury / absconding"],
  ["Registers", "Nursing notes, injection, I/O, food, instrument count all current", "Any incomplete register"],
];

const STAGE4_ROWS = [
  ["1", "Confirm all nursing notes completed — no unsigned entries"],
  ["2", "Confirm MAR signed for every dose this shift"],
  ["3", "Confirm I/O, food, injection, instrument registers complete"],
  ["4", "Confirm all incidents documented and reported"],
  ["5", "Prepare SBAR handover sheet — critical patients, pending tasks, restraint status"],
  ["6", "Give verbal + written SBAR handover; both In-Charges sign handover register"],
];

const KEY_STANDARDS = [
  ["100% shifts with signed SBAR handover", "Handover register audit"],
  ["Zero unsigned nursing/MAR entries at shift end", "10% sample audit"],
  ["NDPS count reconciled every shift", "Two-nurse signature log"],
  ["Observation levels enforced 100%", "Spot-check compliance log"],
];

const Wf08NursingInChargeWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="WF-08 — Nursing In-Charge &amp; Shift Handover Workflow"
        docId="WF-08"
        version="Version 1.0"
        effectiveDate="01 June 2026"
        subtitle="All Nursing In-Charges and shift nursing teams · All four verticals · All 18 centres"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* CORE PRINCIPLE */}
      <div style={{ background: "#fff8f5", border: `2px solid ${ORANGE}`, borderRadius: "4px", padding: "12px 14px", marginBottom: "1.5rem" }}>
        <strong style={{ color: ORANGE, fontSize: "1rem" }}>CORE PRINCIPLE</strong>
        <p style={{ margin: "6px 0 0" }}>
          The Nursing In-Charge is accountable for ward safety, medication governance, observation-level enforcement, and a complete, structured handover at every shift change. <strong>No shift ends without a signed SBAR handover.</strong>
        </p>
      </div>

      {/* STAGE 1 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={ORANGE}>STAGE 1 — SHIFT START (Nursing In-Charge)</SectionHeader>
        <OrangeTable
          cols={[{ label: "Step", width: "5%" }, { label: "Action", width: "77%" }, { label: "Timeframe", width: "18%" }]}
          rows={STAGE1_ROWS}
        />
      </div>

      {/* STAGE 2 — SBAR */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={ORANGE}>STAGE 2 — SBAR HANDOVER FORMAT (Mandatory at Every Shift Change)</SectionHeader>
        <OrangeTable
          cols={[{ label: "Element", width: "22%" }, { label: "Content" }]}
          rows={SBAR_ROWS}
        />
      </div>

      {/* STAGE 3 — GOVERNANCE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={ORANGE}>STAGE 3 — DURING SHIFT — GOVERNANCE DUTIES</SectionHeader>
        <OrangeTable
          cols={[{ label: "Area", width: "20%" }, { label: "Standard", width: "45%" }, { label: "Escalate If", width: "35%" }]}
          rows={GOVERNANCE_ROWS}
        />
      </div>

      <EscalationBox>
        CALL DUTY DOCTOR IMMEDIATELY: SpO2 &lt;92% · seizure · GCS drop · Pulse &lt;50 or &gt;120 · suspected self-harm/attempt · patient missing from ward
      </EscalationBox>

      <EscalationBox>
        ESCALATE TO CENTRE MANAGER + CLINICAL DIRECTOR: sentinel event · patient death · serious assault · absconding beyond 30 min
      </EscalationBox>

      {/* STAGE 4 — SHIFT END */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={ORANGE}>STAGE 4 — SHIFT END (Before Handover)</SectionHeader>
        <OrangeTable
          cols={[{ label: "Step", width: "5%" }, { label: "Action" }]}
          rows={STAGE4_ROWS}
        />
      </div>

      {/* KEY STANDARDS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={ORANGE}>KEY STANDARDS</SectionHeader>
        <OrangeTable
          cols={[{ label: "Standard", width: "55%" }, { label: "Indicator" }]}
          rows={KEY_STANDARDS}
        />
      </div>

      {/* DOCUMENTATION GATE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">HANDOVER COMPLETE — DOCUMENTATION GATE</SectionHeader>
        <ChecklistItem tick><span><strong>All nursing notes completed and signed</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>MAR signed for every dose</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>All registers (I/O, food, injection, instrument) complete</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Incidents documented and escalated</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>NDPS count reconciled (two-nurse)</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>SBAR handover sheet prepared</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Verbal + written handover given; both In-Charges signed</strong></span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf08NursingInChargeWorkflow;
