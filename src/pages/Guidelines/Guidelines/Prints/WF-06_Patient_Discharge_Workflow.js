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

const TEAL = "#1a5c5c";

const DOC_CONTROL_ROWS = [
  { label: "Workflow Code", value: <strong>WF-06</strong> },
  { label: "Version", value: "1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Regulatory Basis", value: "MHCA 2017 (Sec. 88, 89, 90); NABH COP; Clinical Establishments Act 2010" },
  { label: "Cross-Reference", value: "Dis-04 (Expiry/Death), Dis-F-01 (Planned Summary), Dis-F-03 (DAMA), Dis-F-12 (Continuation of Care)" },
  { label: "Applies To", value: "All clinical, nursing, MSW and admissions staff · All four verticals · All 18 centres" },
];

const stageHeadCellStyle = { ...tableCellStyle, background: TEAL, color: "#fff", fontWeight: "bold" };

const StageTable = ({ columns, rows }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.label} style={{ ...stageHeadCellStyle, width: col.width }}>{col.label}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={j} style={tableCellStyle}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const STEP_COLS = [
  { label: "Step", width: "5%" },
  { label: "Action", width: "55%" },
  { label: "Responsible", width: "25%" },
  { label: "Timeframe", width: "15%" },
];

const DISCHARGE_TYPES = [
  ["Planned", "Clinical goals met; psychiatrist-cleared", "Discharge readiness criteria met"],
  ["Against Medical Advice (DAMA)", "Patient/family leaves against clinical advice", "Risk explained + documented; Dis-F-03"],
  ["Supported (§89/§90)", "Involuntary patient discharged", "MHRB compliance; Dis-F-04/05"],
  ["Inter-facility Transfer", "Moved to another facility", "Transfer certificate Dis-F-07"],
  ["Expiry / Death", "Death in facility", "Dis-04 protocol; MLC if applicable"],
];

const STAGE1_ROWS = [
  [<strong>1</strong>, "Identify discharge-ready patient at MDT; confirm provisional discharge date", "MDT", "5–7 days before"],
  [<strong>2</strong>, "Begin Continuation of Care Plan (CCP, Dis-F-12)", "MSW", "5–7 days before"],
  [<strong>3</strong>, "Assess family readiness, home environment, relapse-recognition training", "MSW", "5–7 days before"],
  [<strong>4</strong>, "Confirm first OPD follow-up appointment", "MSW / Reception", "Before discharge"],
  [<strong>5</strong>, "Community linkage — AA/NA/SMART, halfway home, vocational rehab if needed", "MSW", "Before discharge"],
];

const STAGE2_ROWS = [
  [<strong>6</strong>, "Confirm discharge readiness: symptom stability, oral-medication adherence, insight", "Treating Psychiatrist", "Day of clearance"],
  [<strong>7</strong>, "Final risk assessment (C-SSRS); confirm no active risk", "Psychiatrist", "Day of clearance"],
  [<strong>8</strong>, "Psychiatrist writes and signs discharge clearance", "Psychiatrist", "Before discharge"],
  [<strong>9</strong>, "Reconcile discharge medication; counsel patient + family", "Psychiatrist / Pharmacist", "Before discharge"],
];

const STAGE3_ROWS = [
  [<strong>10</strong>, "Complete Discharge Summary (diagnosis, course, medications, follow-up)", "Treating Psychiatrist", "Day of discharge"],
  [<strong>11</strong>, "Medication Discharge Sheet (Dis-F-13)", "Psychiatrist / Pharmacist", "Day of discharge"],
  [<strong>12</strong>, "Continuation of Care Plan finalised and handed to family (Dis-F-12)", "MSW", "Day of discharge"],
  [<strong>13</strong>, "Relapse Prevention Plan + 24-hr crisis helpline given to family", "MSW / Psychologist", "Day of discharge"],
  [<strong>14</strong>, "Property & belongings return certificate (Dis-F-14)", "Nursing In-Charge", "Day of discharge"],
];

const STAGE4_ROWS = [
  [<strong>15</strong>, "Final billing reconciliation; insurance/TPA claim closure", "Accounts / Centre Manager", "Day of discharge"],
  [<strong>16</strong>, "EMR discharge entry; bed released in system", "Nursing In-Charge", "Day of discharge"],
  [<strong>17</strong>, "Wristband removed; patient escorted out with family", "Nursing", "At discharge"],
];

const STAGE5_COLS = [
  { label: "Timeframe", width: "18%" },
  { label: "Action", width: "57%" },
  { label: "Responsible", width: "25%" },
];

const STAGE5_ROWS = [
  ["48 hours", <strong>First follow-up call — settling in, medication check</strong>, "MSW"],
  ["7 days", <strong>Adherence audit; psychoeducation refresh</strong>, "MSW"],
  ["30 days", <strong>Relapse-risk review; confirm OPD attendance</strong>, "MSW"],
  ["Ongoing", <strong>Monthly × 6 months, then quarterly</strong>, "MSW / OPD team"],
];

const Wf06PatientDischargeWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="WF-06 — Patient Discharge Workflow"
        docId="WF-06"
        version="Version 1.0"
        effectiveDate="01 June 2026"
        subtitle="All clinical, nursing, MSW and admissions staff · All four verticals · All 18 centres"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* DISCHARGE TYPES */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>DISCHARGE TYPES</SectionHeader>
        <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
          <thead>
            <tr>
              <th style={{ ...stageHeadCellStyle, width: "20%" }}>Type</th>
              <th style={stageHeadCellStyle}>Definition</th>
              <th style={{ ...stageHeadCellStyle, width: "30%" }}>Key Requirement</th>
            </tr>
          </thead>
          <tbody>
            {DISCHARGE_TYPES.map((row, i) => (
              <tr key={i}>
                <td style={tableCellStyle}><strong>{row[0]}</strong></td>
                <td style={tableCellStyle}>{row[1]}</td>
                <td style={tableCellStyle}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STAGE 1 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 1 — DISCHARGE PLANNING BEGINS (5–7 Days Before)</SectionHeader>
        <StageTable columns={STEP_COLS} rows={STAGE1_ROWS} />
      </div>

      {/* STAGE 2 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 2 — CLINICAL CLEARANCE</SectionHeader>
        <StageTable columns={STEP_COLS} rows={STAGE2_ROWS} />
      </div>

      {/* STAGE 3 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 3 — DISCHARGE DOCUMENTATION</SectionHeader>
        <StageTable columns={STEP_COLS} rows={STAGE3_ROWS} />
      </div>

      {/* STAGE 4 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 4 — FINANCIAL &amp; ADMINISTRATIVE CLEARANCE</SectionHeader>
        <StageTable columns={STEP_COLS} rows={STAGE4_ROWS} />
      </div>

      {/* STAGE 5 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 5 — POST-DISCHARGE FOLLOW-UP (MSW)</SectionHeader>
        <StageTable columns={STAGE5_COLS} rows={STAGE5_ROWS} />
      </div>

      <EscalationBox>
         ESCALATE: DAMA situation · family refusing safe discharge · §89/§90 discharge requiring MHRB · any death (activate Dis-04) → Duty Psychiatrist + Centre Manager; Clinical Director within 2 hrs for death/sentinel event
      </EscalationBox>

      {/* DOCUMENTATION GATE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">DISCHARGE COMPLETE — DOCUMENTATION GATE</SectionHeader>
        <ChecklistItem tick><span><strong>Psychiatrist discharge clearance signed</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Discharge Summary completed and in EMR</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Medication Discharge Sheet given</strong> &nbsp; (Dis-F-13)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Continuation of Care Plan handed to family</strong> &nbsp; (Dis-F-12)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Relapse Prevention Plan + crisis helpline provided</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Property return certificate signed</strong> &nbsp; (Dis-F-14)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Billing reconciled; bed released</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>48-hr follow-up call scheduled</strong></span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf06PatientDischargeWorkflow;
