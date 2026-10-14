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

const DOC_CONTROL_ROWS = [
  { label: "Doc ID", value: "WF-01" },
  { label: "Version", value: "Version 1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Applies To", value: "All Consultant Psychiatrists · Senior Residents · Medical Officers" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Classification", value: <strong>CONFIDENTIAL — For Internal Use Only</strong> },
];

const CORE_DOMAINS = [
  {
    domain: "Clinical Decision-Making",
    standard: "Daily ward round every patient · Formal written entry every 24 hrs · All treatment plans countersigned within 24 hrs of admission",
    indicator: "100% plans countersigned · Zero unsigned entries",
  },
  {
    domain: "Staff Education",
    standard: "One clinical learning point shared with nursing at each ward round (< 3 min) · Min. 2 structured teaching sessions per unit per month",
    indicator: "Teaching register · Monthly audit",
  },
  {
    domain: "Behavioural Safety",
    standard: "De-escalation first-line always · restraint only on written psychiatrist order when de-escalation has failed · post-incident debrief within 24 hrs",
    indicator: "Restraint register · Debrief log",
  },
  {
    domain: "Documentation",
    standard: "Every note: Date · Time · MSE · Assessment · Plan · Signature · 'Continue treatment' alone is NOT acceptable",
    indicator: "Monthly 10% sample audit ≥ 95%",
  },
  {
    domain: "Error Correction",
    standard: "Stop error immediately and calmly · Explain correct approach privately · Teach · Debrief within 24 hrs · Supervision log entry",
    indicator: "Supervision log · 2-week follow-up",
  },
  {
    domain: "MDT Leadership",
    standard: "Chair weekly MDT · Agenda: high-risk, upcoming discharge, observation levels correctstaff concerns, incidents · MDT decisions in case notes same day",
    indicator: "≥ 95% MDT meetings held",
  },
  {
    domain: "System Safety",
    standard: "Safety concern log · Clinical Director notified within 2 hrs of any sentinel event / suicide attempt / patient death",
    indicator: "RCA within 72 hrs of sentinel event",
  },
];

const Wf01PsychiatristOnDutyWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="Psychiatrist — On-Duty Workflow"
        docId="WF-01"
        version="Version 1.0"
        effectiveDate="01 June 2026"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* START OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>START OF DUTY — Complete in Sequence Before Ward Round</SectionHeader>
        <ChecklistItem><span><strong>Sign in</strong> &nbsp; Log duty start time · Duty register</span></ChecklistItem>
        <ChecklistItem><span><strong>Receive handover from outgoing doctor</strong> &nbsp; Critical patients · Overnight events · Pending orders · Clinical changes</span></ChecklistItem>
        <ChecklistItem><span><strong>Review nursing notes &amp; incident register</strong> &nbsp; Flag patients deteriorated overnight · Confirm restraint log</span></ChecklistItem>
        <ChecklistItem><span><strong>Brief with Nursing In-Charge</strong> &nbsp; High-risk list confirmed · Observation levels correct · Any medication refusals?</span></ChecklistItem>
        <ChecklistItem><span><strong>Identify priority patients for first round</strong> &nbsp; New admissions (&lt; 24 hrs) · Suicidal / high-risk · Clinically changed · Pending orders</span></ChecklistItem>
        <ChecklistItem><span><strong>Commence ward round</strong> &nbsp; Highest priority first</span></ChecklistItem>
      </div>

      {/* CORE DUTY DOMAINS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>CORE DUTY DOMAINS — 7 Leadership Standards</SectionHeader>
        <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
          <thead>
            <tr>
              <th style={{ ...tableHeadStyle, width: "20%" }}>Domain</th>
              <th style={tableHeadStyle}>Non-Negotiable Standard</th>
              <th style={{ ...tableHeadStyle, width: "25%" }}>Measurable Indicator</th>
            </tr>
          </thead>
          <tbody>
            {CORE_DOMAINS.map((row) => (
              <tr key={row.domain}>
                <td style={tableCellStyle}><strong>{row.domain}</strong></td>
                <td style={tableCellStyle}>{row.standard}</td>
                <td style={tableCellStyle}>{row.indicator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EscalationBox>
        ESCALATE TO CLINICAL DIRECTOR WITHIN 2 HOURS: Suicide attempt · Patient death · Sentinel event · Serious assault · Complex involuntary admission (legal)
      </EscalationBox>

      {/* END OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">END OF DUTY — Before Leaving</SectionHeader>
        <ChecklistItem tick><span><strong>All case notes written</strong> &nbsp; No unsigned entries remaining</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Pending orders handed over</strong> &nbsp; Verbal + written · incoming doctor acknowledged</span></ChecklistItem>
        <ChecklistItem tick><span><strong>High-risk patients flagged</strong> &nbsp; Specifically highlighted in verbal handover</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Incidents documented</strong> &nbsp; Nursing In-Charge informed · incident forms submitted</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Duty register signed</strong> &nbsp; Departure time logged</span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf01PsychiatristOnDutyWorkflow;
