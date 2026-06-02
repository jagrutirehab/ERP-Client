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
  { label: "Doc ID", value: "WF-02" },
  { label: "Version", value: "Version 1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Applies To", value: "All Shifts · Staff Nurses · Junior Nurses · Trainee Nurses" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Classification", value: <strong>CONFIDENTIAL — For Internal Use Only</strong> },
];

const START_OF_DUTY = [
  { step: "1", action: "Sign in", detail: "Log duty time · Collect: ward keys · medication trolley keys · duty phone · nursing register" },
  { step: "2", action: "SBAR Handover", detail: "Patient count · critical patients · IV drips · incidents · restraint status · pending doctor orders" },
  { step: "3", action: "Review Registers", detail: "Nursing notes · medication chart · injection register · incident register · I/O chart · food chart from previous shift" },
  { step: "4", action: "Vitals Round — ALL", detail: "BP · Pulse · Temp · SpO2 · RR · GCS — document all · abnormals → duty doctor IMMEDIATELY" },
  { step: "5", action: "Flag Priority Patients", detail: "Abnormal vitals · IV patients · new admissions · patients on observation or restraint · low intake" },
  { step: "6", action: "Dressings Round", detail: "Identify all dressing patients · clean · dress · document · restock trolley · wound deterioration → doctor" },
  { step: "7", action: "Medication & IV Check", detail: "Verify stock vs prescription chart · check all IV lines (rate/site/patency/expiry) · count instruments · discrepancies → In-Charge" },
  { step: "8", action: "Brief with Duty Doctor", detail: "Report abnormal vitals · clinical changes · pending orders · new admissions · risk concerns → commence duties" },
];

const CORE_DUTIES = [
  { area: "Observation Levels", standard: "L1 General: q30 min · L2 Enhanced: q15 min · L3 Close: continuous · L4 (1:1): arm's-reach always", escalate: "Patient missing from assigned location" },
  { area: "Medications — Five Rights", standard: "Right Patient · Right Drug · Right Dose · Right Route · Right Time · Document immediately after each dose — NEVER at end of shift", escalate: "Refusal > 15 min → duty doctor · NDPS: two-nurse check mandatory" },
  { area: "Vitals — Escalate Thresholds", standard: "Temp <35.5°C or >38.5°C · Pulse <50 or >110 · BP <90/60 or >160/90 · SpO2 <92% · RR <10 or >24", escalate: "Call duty doctor before continuing round" },
  { area: "Injection Register", standard: "All injections: drug · dose · route · site · time · counter-signed by In-Charge", escalate: "Missing entry or instrument count mismatch → In-Charge immediately" },
  { area: "I/O & Food Charts", standard: "Document all fluid in/out · calculate fluid balance · record meal intake (full/half/refused)", escalate: "Multiple consecutive refusals → duty doctor" },
  { area: "Physical Care", standard: "Dressings — wound care early each shift · Position changes — 2-hourly repositioning · Hygiene — hair/nails/bathing/oral daily", escalate: "Wound deterioration · pressure sore → duty doctor" },
  { area: "Restraint", standard: "Written psychiatrist order only · minimum force · vitals every 15 min · document in Restraint Register", escalate: "Duration > ordered → contact psychiatrist immediately" },
];

const Wf02StaffNurseOnDutyWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="Staff Nurse — On-Duty Workflow"
        docId="WF-02"
        version="Version 1.0"
        effectiveDate="01 June 2026"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* START OF DUTY */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>START OF DUTY — Complete in Sequence · Every Shift</SectionHeader>
        <NumberedStepsTable items={START_OF_DUTY} />
      </div>

      {/* CORE DUTIES DURING SHIFT */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader>CORE DUTIES DURING SHIFT</SectionHeader>
        <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
          <thead>
            <tr>
              <th style={{ ...tableHeadStyle, width: "18%" }}>Area</th>
              <th style={tableHeadStyle}>Standard</th>
              <th style={{ ...tableHeadStyle, width: "28%" }}>Escalate If</th>
            </tr>
          </thead>
          <tbody>
            {CORE_DUTIES.map((row) => (
              <tr key={row.area}>
                <td style={tableCellStyle}><strong>{row.area}</strong></td>
                <td style={tableCellStyle}>{row.standard}</td>
                <td style={tableCellStyle}>{row.escalate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EscalationBox>
        CALL DUTY DOCTOR IMMEDIATELY: SpO2 &lt;92% · Seizure · GCS drop · Pulse &lt;50 or &gt;120 · Suspected self-harm or attempt · Patient missing from ward
      </EscalationBox>

      {/* END OF SHIFT */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">END OF SHIFT — Both Nurses Sign Before Handover</SectionHeader>
        <ChecklistItem tick><span><strong>Nursing notes completed</strong> &nbsp; Every patient · no unsigned entries</span></ChecklistItem>
        <ChecklistItem tick><span><strong>MAR signed</strong> &nbsp; Every medication dose administered this shift</span></ChecklistItem>
        <ChecklistItem tick><span><strong>I/O · Food · Injection · Instrument registers completed</strong> &nbsp; All entries signed</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Incidents documented</strong> &nbsp; Incident form submitted to Nursing In-Charge</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Handover sheet prepared</strong> &nbsp; SBAR format · critical patients · pending tasks · restraint status</span></ChecklistItem>
        <ChecklistItem tick><span><strong>SBAR verbal handover given</strong> &nbsp; Incoming nurse acknowledged · both nurses signed handover register</span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf02StaffNurseOnDutyWorkflow;
