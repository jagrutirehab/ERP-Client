import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  WarningBox,
  CalloutBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["SOP Number", "Dis-08"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Governance | Continuity of Care | Patient Safety"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Six Clinical Programmes | All Clinical Staff"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 87) | NABH MOM 1-5 | CP-001 (Care Pathways & LOS Policy)"],
  ["Related SOPs", "Dis-01 (Master) | Dis-02 (Discharge Planning & Readiness) | Dis-09 (Continuation of Care Plan)"],
];

const COMPLETION_CRITERIA_ROWS = [
  ["All Dis-02 Discharge Readiness Criteria met — clinical stability, functional stability, insight, safety awareness", "Dis-02 checklist; MSE; C-SSRS; CIWA/COWS", "Treating Psychiatrist"],
  ["MDT Final Discharge Review completed — all team members agree patient is ready", "MDT meeting minutes", "MDT Chair (Treating Psychiatrist)"],
  ["Programme milestones achieved per CP-001 (Care Pathways)", "Programme milestone checklist per vertical", "Treating Psychiatrist + Psychologist"],
  ["Discharge summary drafted and reviewed", "NABH format — see Section 5", "Treating Psychiatrist"],
  ["Continuation of Care Plan (Dis-09) completed and handed over", "CCP form", "MSW / Psychologist"],
  ["Medication reconciled and supply prepared — minimum 14 days", "Pharmacy reconciliation", "Nursing In-Charge + Pharmacist"],
  ["Family / NR discharge counselling session completed", "Counselling documentation", "Psychologist / MSW"],
  ["Outpatient follow-up appointment confirmed — date, doctor, facility", "Appointment letter", "MSW / Accounts"],
  ["Final accounts settled — zero balance or payment plan signed", "Account clearance form", "Accounts Executive"],
];

const MDT_REVIEW_ROWS = [
  ["Clinical status review — current MSE, risk level, medication stability", "Treating Psychiatrist"],
  ["Functional status — ADL, self-care, social interaction, programme participation", "Nursing In-Charge"],
  ["Psychological progress — insight, coping strategies, relapse warning signs identified", "Psychologist / Counsellor"],
  ["Psychosocial status — family support, home environment, community resources", "MSW"],
  ["Continuation of Care Plan review — outpatient schedule, crisis plan, medication adherence plan", "MSW + Treating Psychiatrist"],
  ["Risk at discharge — low / moderate / high; risk mitigation plan", "Treating Psychiatrist"],
  ["Patient's own voice — patient's goals post-discharge; concerns addressed", "Treating Psychiatrist / Psychologist"],
];

const DISCHARGE_DAY_ROWS = [
  ["Morning", "CLINICAL REVIEW: Treating psychiatrist conducts final clinical review. MSE documented. Risk level confirmed. Discharge confirmed as clinically appropriate. Sign discharge order in EMR."],
  ["Morning", "DISCHARGE SUMMARY: Final discharge summary completed by treating psychiatrist. Filed in EMR. Printed copy prepared for patient. NABH requirement: completed before patient exits."],
  ["Morning", "MEDICATION HANDOVER: Nursing In-Charge explains every medication to patient and primary family member. Name, dose, frequency, purpose, side effects, what to do if dose missed. Medication supply handed over. Narcotic dispensing register signed (if applicable)."],
  ["Late Morning", "FAMILY COUNSELLING SESSION: Psychologist and/or MSW conducts the final family counselling session. Cover: diagnosis, recovery stage, relapse warning signs, crisis contacts, follow-up plan, family's role in ongoing recovery."],
  ["Late Morning", "CCP HANDOVER: MSW hands over the printed Continuation of Care Plan to patient and NR. Reviews each element. Confirms first outpatient appointment date is clear to both patient and family."],
  ["Midday", "ACCOUNTS CLEARANCE: Final bill presented, reviewed, and settled. Security deposit refunded (or credited against balance). Accounts Executive issues zero-balance receipt."],
  ["Midday", "BELONGINGS RETURN: All personal items returned as per ADM-F-13 inventory. Patient / NR signs the return acknowledgement. Any valuables returned from centre safe."],
  ["Afternoon", "PHYSICAL EXIT: Wristband removed and logged. Security gate log updated. Vehicle confirmed for patient transport. For elderly / post-sedation patients: family escort confirmed before exit is approved."],
];

const PROGRAMME_ROWS = [
  ["P1 — Acute Psychiatric Stabilisation", "C-SSRS: active ideation = 0 for minimum 5 consecutive days. Crisis plan documented. First psychiatry OPD within 7 days. Family psychoeducation completed."],
  ["P2 — Psychiatric Rehabilitation", "Functional milestones met (ADL, social functioning). Vocational or educational plan in place where applicable. MSW community linkage completed. 30-day and 90-day follow-up scheduled."],
  ["P3 — Alcohol De-Addiction", "CIWA-Ar within normal limits for minimum 7 days. AA/NA/SMART referral made and first meeting attended (where possible). Sponsor identified. Relapse prevention plan documented."],
  ["P4 — Drug De-Addiction", "COWS within normal limits for minimum 7 days. NA/SMART referral completed. Substitution therapy plan (buprenorphine / methadone) if applicable — receiving facility confirmed. NDPS documentation complete."],
  ["P5 — Elderly & Dementia Care", "Caregiver training completed (minimum 2 sessions). Home environment assessment completed by MSW or OT. Community nurse / day care arranged if needed. Falls and safety plan documented."],
  ["P6 — Palliative / End of Life", "Comfort care plan handed over. Palliative care team at home or hospice introduced. Family grief support initiated. Legal documents (advance directive) in order."],
];

const DISCHARGE_SUMMARY_ROWS = [
  ["Patient Details", "Full name, age, gender, address, MRD number, admission and discharge dates"],
  ["Admission Details", "Admission category (voluntary/supported/involuntary), admitting diagnosis, reason for admission"],
  ["Clinical Course", "Summary of treatment received: medications, ECT, therapeutic programme, response to treatment"],
  ["Discharge Diagnosis", "ICD-10 / DSM-5 diagnosis at discharge; any comorbid diagnoses"],
  ["Condition at Discharge", "MSE summary; risk level at discharge; functional status"],
  ["Medications at Discharge", "Full list: drug name, dose, frequency, duration, special instructions"],
  ["Investigations Summary", "Significant investigation findings during admission"],
  ["Continuation of Care Plan", "Outpatient schedule; next appointment; crisis contact; follow-up instructions"],
  ["Treating Clinician Signature", "Treating Psychiatrist name, designation, registration number, signature, date"],
];

const Dis08ProgrammeCompletionDischargeSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-08"
      title="Programme Completion Discharge — Structured Completion Discharge"
      icdLine="SOP Dis-08 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <CalloutBox>
      Programme Completion Principle — Programme completion discharge is a clinical achievement — not an administrative event. The discharge process is as therapeutically important as the admission. A well-executed discharge sets the trajectory for sustained recovery. Readiness criteria (Dis-02) must be met before programme completion is confirmed — duration alone is not sufficient.
    </CalloutBox>

    {/* 1. Programme Completion Criteria */}
    <SectionTitle>1. Programme Completion Criteria — All Programmes</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem", fontWeight: 600 }}>
      A patient may proceed to Programme Completion Discharge only when ALL of the following are confirmed:
    </p>
    <Table
      cols={[
        { label: "Criterion", width: "46%" },
        { label: "Assessment Tool", width: "28%" },
        { label: "Who Confirms", width: "26%" },
      ]}
      rows={COMPLETION_CRITERIA_ROWS}
    />

    {/* 2. MDT Final Discharge Review */}
    <SectionTitle>2. MDT Final Discharge Review</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The MDT Final Discharge Review is a structured meeting convened 48–72 hours before the planned discharge date. For programme completion, this meeting is mandatory.
    </p>
    <Table
      cols={[
        { label: "Agenda Item", width: "62%" },
        { label: "Owner", width: "38%" },
      ]}
      rows={MDT_REVIEW_ROWS}
    />

    {/* 3. Discharge Day */}
    <SectionTitle>3. Discharge Day — Step by Step</SectionTitle>
    <Table
      cols={[
        { label: "Time", width: "14%", center: true },
        { label: "Action", width: "86%" },
      ]}
      rows={DISCHARGE_DAY_ROWS}
    />

    {/* 4. Programme-Specific Requirements */}
    <SectionTitle>4. Programme-Specific Discharge Requirements</SectionTitle>
    <Table
      cols={[
        { label: "Programme", width: "24%" },
        { label: "Specific Discharge Requirements", width: "76%" },
      ]}
      rows={PROGRAMME_ROWS}
    />

    {/* 5. Discharge Summary */}
    <SectionTitle>5. Discharge Summary — NABH Mandatory Format</SectionTitle>
    <Table
      cols={[
        { label: "Section", width: "28%" },
        { label: "Required Content", width: "72%" },
      ]}
      rows={DISCHARGE_SUMMARY_ROWS}
    />
    <WarningBox>
      ⚠ Discharge Summary Timing — NABH MOM standard: discharge summary must be completed within 24 hours of discharge — ideally before the patient leaves. A discharge summary completed after the patient has left, without time documentation, is a NABH non-compliance finding. Centre Manager to verify all discharge summaries are completed and filed within 24 hours — daily check.
    </WarningBox>
  </ProtocolWrapper>
));

export default Dis08ProgrammeCompletionDischargeSOP;
