import React, { forwardRef, Fragment } from "react";
import {
  tableCellStyle,
  tableHeadStyle,
  ChecklistItem,
  SectionHeader,
  EscalationBox,
  WorkflowHeader,
  DocumentControlTable,
  NumberedStepsTable,
  WorkflowFooter,
  WorkflowWrapper,
} from "./WorkflowComponents";

const DOC_CONTROL_ROWS = [
  { label: "Doc ID", value: "WF-03" },
  { label: "Version", value: "Version 1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Applies To", value: "All Clinical Psychologists · Counsellors on Duty" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Classification", value: <strong>CONFIDENTIAL — For Internal Use Only</strong> },
];

const START_OF_DUTY = [
  { step: "1", action: "Sign in", detail: "Duty register" },
  { step: "2", action: "Review case notes & nursing records", detail: "Overnight events · incident register · restraint log · patients flagged by nursing" },
  { step: "3", action: "Plan daily therapy schedule", detail: "Individual therapy · Group sessions · Assessments due · Family counselling · Priority patients first" },
  { step: "4", action: "Flag priority patients", detail: "High-risk (active suicidal ideation) seen first · new admissions (intake due) · overdue assessment reports" },
  { step: "5", action: "Brief with nursing team", detail: "Confirm observation levels for your patients · alert nursing to any patient of concern" },
  { step: "6", action: "Review pending tasks & reports", detail: "Overdue session notes · assessment reports · family call-backs due today" },
  { step: "7", action: "Coordinate with duty psychiatrist", detail: "Share clinical concerns · confirm MDT agenda · joint sessions needed?" },
  { step: "8", action: "Commence first session", detail: "Highest priority patient first" },
];

const CORE_STREAMS = [
  {
    stream: "Individual Therapy",
    actions: "CBT · MI · Relapse Prevention · Supportive Psychotherapy",
    documentation: "Session note: Date · Time · Patient · Session type · Themes · Risk status · Plan · Signature",
  },
  {
    stream: "Group Therapy",
    actions: "Psychoeducation · Life Skills · Anger Management · Coping Strategies",
    documentation: "Attendance register signed · Group note filed in EMR",
  },
  {
    stream: "Psychological Assessment",
    actions: "IQ · Personality · ASI · Cognitive · Trauma screening",
    documentation: "Assessment report within agreed timeline · copy to treating psychiatrist",
  },
  {
    stream: "Family Counselling",
    actions: "Psychoeducation · Boundary-setting · Codependency · Support planning",
    documentation: "Family session note: attendees · key issues · recommendations · risk",
  },
  {
    stream: "New Admission Intake",
    actions: "Biopsychosocial history within 48 hrs · C-SSRS risk assessment · preliminary treatment goals",
    documentation: "Intake report in EMR · coordinate with MSW on social history",
  },
  {
    stream: "Supervision & Training",
    actions: "Supervise interns · junior psychologists · MSWs · counsellors",
    documentation: "Supervision note: case discussed · competency observed · guidance given",
  },
];

const Wf03PsychologistOnDutyWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="Clinical Psychologist — On-Duty Workflow"
        docId="WF-03"
        version="Version 1.0"
        effectiveDate="01 June 2026"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* START OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>START OF DUTY — Before First Session</SectionHeader>
        <NumberedStepsTable items={START_OF_DUTY} />
      </div>

      {/* CORE DUTY STREAMS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>CORE DUTY STREAMS</SectionHeader>
        <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
          <thead>
            <tr>
              <th style={{ ...tableHeadStyle, width: "18%" }}>Stream</th>
              <th style={tableHeadStyle}>Key Actions</th>
              <th style={{ ...tableHeadStyle, width: "35%" }}>Documentation — Same Day</th>
            </tr>
          </thead>
          <tbody>
            {CORE_STREAMS.map((row) => (
              <tr key={row.stream}>
                <td style={tableCellStyle}><strong>{row.stream}</strong></td>
                <td style={tableCellStyle}>{row.actions}</td>
                <td style={tableCellStyle}>{row.documentation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EscalationBox>
        ESCALATE IMMEDIATELY — Notify Duty Psychiatrist + Nursing In-Charge: Active suicidal ideation disclosed · Self-harm or attempt disclosed · Patient refuses session and is acutely distressed · Family crisis during session
      </EscalationBox>

      {/* END OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">END OF DUTY</SectionHeader>
        <ChecklistItem tick><span><strong>All session notes filed in EMR</strong> &nbsp; Same day — never backdated</span></ChecklistItem>
        <ChecklistItem tick><span><strong>High-risk concerns communicated</strong> &nbsp; Duty psychiatrist + nursing team informed — documented</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Assessment reports completed or timeline updated</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Tomorrow's schedule planned</strong> &nbsp; Priority patients identified</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Pending tasks handed over</strong> &nbsp; If shift-based role</span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf03PsychologistOnDutyWorkflow;
