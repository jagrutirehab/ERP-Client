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
  { label: "Workflow Code", value: <strong>WF-05</strong> },
  { label: "Version", value: "1.0" },
  { label: "Effective Date", value: "1st June 2026" },
  { label: "Review Date", value: "May 2027" },
  { label: "Next Version", value: "1st June 2027" },
  { label: "Prepared By", value: "Dr. Amar Shinde, Clinical Director" },
  { label: "Approved By", value: "Dr. Bharat Mali, Cluster Head Psychiatrist" },
  { label: "Regulatory Basis", value: "MHCA 2017 (Sec. 85-89); NABH ACC; Clinical Establishments Act 2010" },
  { label: "Cross-Reference", value: "Adm-01 (Voluntary), Adm-02 (Rejection), Adm-05 (Emergency/Involuntary), Adm-03 (Lab Investigations)" },
  { label: "Applies To", value: "All clinical and admissions staff · All four verticals · All 18 centres" },
];

const stageTableStyle = {
  borderCollapse: "collapse",
  marginTop: "0",
  width: "100%",
};

const stageHeadCellStyle = {
  ...tableCellStyle,
  background: TEAL,
  color: "#fff",
  fontWeight: "bold",
};

const StageTable = ({ columns, rows }) => (
  <table style={stageTableStyle}>
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

const STAGE1_COLS = [
  { label: "Step", width: "5%" },
  { label: "Action", width: "55%" },
  { label: "Responsible", width: "25%" },
  { label: "Timeframe", width: "15%" },
];

const STAGE1_ROWS = [
  [<strong>1</strong>, "Receive patient/family; record presenting complaint, urgency, admission category", "Reception / Admissions Coord.", "Immediate"],
  [<strong>2</strong>, "Initiate Pre-Admission Screening Checklist (Adm-F-001) — vitals, BSL, ECG if indicated", "Nursing", "Within 15 min"],
  [<strong>3</strong>, "Apply Admission Rejection Criteria (Adm-02) — if any met, DO NOT admit; refer safely", "Duty Doctor", "Within 30 min"],
  [<strong>4</strong>, <span>If medically stable → proceed to clinical assessment</span>, "Duty Doctor", "—"],
];

const STAGE2_ROWS = [
  [<strong>5</strong>, "Full psychiatric history + Mental Status Examination", "Psychiatrist", "Within 1 hr"],
  [<strong>6</strong>, "Formal capacity assessment (four-point test, MHCA Sec. 4)", "Psychiatrist", "Within 1 hr"],
  [<strong>7</strong>, "Risk assessment: C-SSRS (suicide), violence, absconding, self-neglect", "Psychiatrist", "Within 1 hr"],
  [<strong>8</strong>, "Confirm admission category & legal basis (Voluntary §87 / Supported §89 / Involuntary §90 / Emergency §98)", "Psychiatrist", "Before admission"],
  [<strong>9</strong>, "Check Advance Directive register; verify/offer Nominated Representative", "Psychiatrist", "Before consent"],
];

const STAGE3_ROWS = [
  [<strong>10</strong>, "Full information disclosure: diagnosis, treatment, alternatives, rights, charges", "Psychiatrist", "Before consent"],
  [<strong>11</strong>, "Obtain written informed consent (Adm-F-002); thumb impression + 2 witnesses if cannot sign", "Psychiatrist", "Before admission"],
  [<strong>12</strong>, "Register patient — unique JRCPL ID; government photo ID documented", "Admissions Coord.", "At arrival"],
  [<strong>13</strong>, "Financial Responsibility Agreement signed", "Centre Manager", "Before admission"],
  [<strong>14</strong>, "Upload signed consent to EMR; offer copy to patient (mandatory MHCA Sec. 21)", "Psychiatrist", "Immediately"],
];

const STAGE4_ROWS = [
  [<strong>15</strong>, "Ward & bed assignment per clinical need and gender", "Nursing In-Charge", "At admission"],
  [<strong>16</strong>, "Belongings inventory; prohibited items removed per SOP", "Nursing / MSW", "At admission"],
  [<strong>17</strong>, "Apply patient wristband (name, JRCPL ID, admission date, allergy status)", "Nursing In-Charge", "At admission"],
  [<strong>18</strong>, "Ward orientation; rights booklet provided and acknowledged", "Assigned Nurse", "Within 2 hrs"],
  [<strong>19</strong>, "Baseline lab investigations drawn (per Adm-03)", "Nursing / Lab", "Within 4 hrs"],
];

const STAGE5_COLS = [
  { label: "Timeframe", width: "18%" },
  { label: "Requirement", width: "57%" },
  { label: "Responsible", width: "25%" },
];

const STAGE5_ROWS = [
  ["Within 4 hrs", <strong>Provisional diagnosis + initial management plan in EMR</strong>, "Treating Psychiatrist"],
  ["Within 24 hrs", <strong>Biopsychosocial history (psychologist)</strong>, "Psychologist"],
  ["Within 48 hrs", <strong>Social history + family contact verification</strong>, "MSW"],
  ["Within 48 hrs", <strong>Nursing assessment (allergy, fall risk, care plan)</strong>, "Nursing In-Charge"],
  ["Within 72 hrs", <strong>Formal Treatment Plan — goals, interventions, ELOS, discharge criteria</strong>, "MDT"],
];

const Wf05PatientAdmissionWorkflow = forwardRef((props, ref) => (
  <Fragment>
    <WorkflowWrapper ref={ref} classnames={props.classnames}>
      <WorkflowHeader
        heading={props.heading}
        title="WF-05 — Patient Admission Workflow"
        docId="WF-05"
        version="Version 1.0"
        effectiveDate="01 June 2026"
        subtitle="All clinical and admissions staff · All four verticals · All 18 centres"
      />

      <DocumentControlTable rows={DOC_CONTROL_ROWS} />

      {/* STAGE 1 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 1 — FIRST CONTACT &amp; TRIAGE (Reception / Admissions Coordinator)</SectionHeader>
        <StageTable columns={STAGE1_COLS} rows={STAGE1_ROWS} />
      </div>

      <EscalationBox>
        ESCALATE: Any abnormal vital, GCS &lt; 15, or rejection-criteria trigger → refer to general hospital immediately. Do not delay for consent or payment.
      </EscalationBox>

      {/* STAGE 2 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 2 — CLINICAL ASSESSMENT (Treating Psychiatrist)</SectionHeader>
        <StageTable columns={STAGE1_COLS} rows={STAGE2_ROWS} />
      </div>

      {/* STAGE 3 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 3 — CONSENT &amp; REGISTRATION</SectionHeader>
        <StageTable columns={STAGE1_COLS} rows={STAGE3_ROWS} />
      </div>

      {/* STAGE 4 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 4 — WARD ADMISSION &amp; ORIENTATION</SectionHeader>
        <StageTable columns={STAGE1_COLS} rows={STAGE4_ROWS} />
      </div>

      {/* STAGE 5 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color={TEAL}>STAGE 5 — POST-ADMISSION CLINICAL MILESTONES</SectionHeader>
        <StageTable columns={STAGE5_COLS} rows={STAGE5_ROWS} />
      </div>

      <EscalationBox>
         ESCALATE TO CLINICAL DIRECTOR: Complex involuntary admission · capacity dispute · safeguarding concern · admission of a minor
      </EscalationBox>

      {/* DOCUMENTATION GATE */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeader color="#1e7e34">ADMISSION COMPLETE — DOCUMENTATION GATE</SectionHeader>
        <ChecklistItem tick><span><strong>Pre-admission screening completed</strong> &nbsp; (Adm-F-001)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Capacity assessment documented</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Advance Directive checked; NR offer documented</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Informed consent signed and uploaded</strong> &nbsp; (Adm-F-002)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Financial Responsibility Agreement signed</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Wristband applied; rights booklet acknowledged</strong></span></ChecklistItem>
        <ChecklistItem tick><span><strong>Provisional diagnosis + plan in EMR</strong> &nbsp; (within 4 hrs)</span></ChecklistItem>
        <ChecklistItem tick><span><strong>Medication prescription in EMR</strong> &nbsp; (within 2 hrs)</span></ChecklistItem>
      </div>

      <WorkflowFooter />
    </WorkflowWrapper>
  </Fragment>
));

export default Wf05PatientAdmissionWorkflow;
