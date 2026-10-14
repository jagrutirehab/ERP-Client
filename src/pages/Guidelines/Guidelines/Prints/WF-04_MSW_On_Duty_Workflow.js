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
  { label: "Doc ID", value: "WF-04" },
  { label: "Version", value: "Version 1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Applies To", value: "All Medical Social Workers at JRCPL" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Classification", value: <strong>CONFIDENTIAL — For Internal Use Only</strong> },
];

const START_OF_DUTY = [
  { step: "1", action: "Sign in", detail: "Collect register & case files" },
  { step: "2", action: "Review case files & previous notes", detail: "New admissions needing intake · patients flagged for discharge · family concerns or complaints · MLC/DAMA events" },
  { step: "3", action: "Prepare family contact task list", detail: "Post-discharge calls due (48hr/7day/30day) · new admission family orientation (< 72 hrs) · crisis follow-up first" },
  { step: "4", action: "Flag priority cases — document check", detail: "New admissions: consent + dual KYC complete? · Discharge-ready: CCP drafted? · Legal/DAMA: paperwork current?" },
  { step: "5", action: "Coordinate with clinical team", detail: "Joint family sessions today? · Patient with active family conflict? · Discharge timeline confirmed?" },
  { step: "6", action: "Review legal & financial matters", detail: "Outstanding bills to chase · Insurance/TPA claims pending · Government scheme applications in progress" },
  { step: "7", action: "Review aftercare & referral status", detail: "AA/NA attendance confirmed · community linkages made · OPD appointments confirmed" },
  { step: "8", action: "Commence family calls & intake work", detail: "Highest priority first" },
];

const CORE_STREAMS = [
  {
    stream: "Social Assessment",
    actions: "Family background · finances · housing · social support network within 48 hrs of admission",
    documentation: "Social History Report in EMR",
  },
  {
    stream: "Family Contact & Counselling",
    actions: "Weekly update call · family orientation session · psychoeducation · boundary-setting · codependency",
    documentation: "Contact Log: date · contact · content · response · action",
  },
  {
    stream: "Discharge Planning",
    actions: "Begin 5-7 days before discharge · confirm: family readiness · home environment · CCP · first OPD appointment",
    documentation: "Dis-F-12 (CCP) drafted · psychiatrist reviews and signs",
  },
  {
    stream: "Community Linkage",
    actions: "AA/NA/SMART referral · halfway homes · vocational rehab · OPD referral letters",
    documentation: "Referral Record: date + confirmation received",
  },
  {
    stream: "Legal & Financial Aid",
    actions: "Government scheme enrolment · MLC paperwork · DAMA protocol · Insurance/TPA claims",
    documentation: "Legal File separate from clinical file",
  },
  {
    stream: "New Admission Intake",
    actions: "Social history · FRP identification · dual KYC (Adm-F-11A) · contact verification call Day 1",
    documentation: "Admission File: all forms complete before patient enters ward",
  },
  {
    stream: "Patient Advocacy & Crisis",
    actions: "Rights protection (MHCA Sec. 18-28) · grievance handling · family conflict resolution",
    documentation: "All complaints: document → Centre Manager same day",
  },
];

const Wf04MswOnDutyWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="Medical Social Worker (MSW) — On-Duty Workflow"
        docId="WF-04"
        version="Version 1.0"
        effectiveDate="01 June 2026"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* START OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>START OF DUTY — Before Family Contact Work Begins</SectionHeader>
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
              <th style={{ ...tableHeadStyle, width: "32%" }}>Documentation — Same Day</th>
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
        ESCALATE IMMEDIATELY — Duty Psychiatrist + Centre Manager: Family refusing discharge · Patient rights violation · DAMA situation · Financial dispute turning aggressive · MLC event arising
      </EscalationBox>

      {/* END OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">END OF DUTY</SectionHeader>
        <ChecklistItem tick><span><strong>All family contacts logged</strong> &nbsp; Contact Log updated — date · time · content · response</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Legal/financial tasks documented and handed over</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Discharge planning status updated in EMR</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Any crisis or complaint</strong> &nbsp; Clinical team and Centre Manager informed</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Pending tasks noted for next duty day</strong></span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf04MswOnDutyWorkflow;
