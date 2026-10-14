import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  CalloutBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["SOP Number", "Dis-09"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Governance | Continuity of Care | Patient Safety"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Four Clinical Verticals | MSW, Psychologist, Treating Psychiatrist"],
  ["Regulatory Basis", "NMC Code of Ethics (continuity of care) | MHCA 2017 Sec. 18, 19 | NABH COP | WHO Mental Health Action Plan"],
  ["Related SOPs", "Dis-01 (Master) | Dis-02 (Discharge Planning) | Dis-08 (Programme Completion)"],
];

const CCP_AUTHORSHIP_ROWS = [
  ["Outpatient follow-up schedule — dates, doctor, facility", "MSW + Treating Psychiatrist", "48 hours before discharge"],
  ["Medication plan — names, doses, duration, refill instructions", "Treating Psychiatrist", "Before discharge"],
  ["Relapse warning signs — patient-specific, written in plain language", "Psychologist / Counsellor", "48 hours before discharge"],
  ["Crisis contact protocol — what to do, who to call, emergency number", "MSW + Treating Psychiatrist", "Before discharge"],
  ["Community support referrals — AA/NA, support groups, community nurse", "MSW", "48 hours before discharge"],
  ["Family psychoeducation summary — what family needs to know and do", "Psychologist / MSW", "Before discharge"],
  ["De-addiction specific: sponsor details, NA/AA meeting schedule", "Counsellor / MSW", "Before discharge (de-addiction only)"],
  ["Elderly specific: caregiver plan, community nurse, day care", "MSW / OT", "Before discharge (elderly only)"],
];

const FOLLOWUP_SCHEDULE_ROWS = [
  ["Psychiatric Care", "Within 7 days of discharge", "Weekly × 4; fortnightly × 2; monthly thereafter", "JRCPL OPD or referring psychiatrist"],
  ["De-Addiction", "Within 5 days of discharge", "Weekly × 8; fortnightly × 4; monthly thereafter", "JRCPL OPD + AA/NA schedule"],
  ["Elderly Care", "Within 7 days of discharge", "Weekly × 4 (community nurse if home); monthly OPD", "JRCPL OPD + community nurse"],
  ["Child & Adolescent", "Within 7 days of discharge", "Weekly × 4; fortnightly thereafter", "JRCPL OPD + school counsellor liaison"],
];

const RELAPSE_ROWS = [
  ["Psychiatric", "Sleep changes; withdrawal from family; stopping medication; return of specific delusional themes; increased irritability; self-harm thoughts returning"],
  ["De-Addiction", "Craving episodes; hanging around old using friends; emotional distress without coping; romanticising use; missing meetings; hiding behaviour"],
  ["Elderly Care", "Increased confusion; repeated falls; refusing medication; agitation; withdrawal from activities; signs of caregiver burnout"],
];

const CRISIS_ROWS = [
  ["Medication running out", "Call JRCPL reception or OPD immediately — do not stop medication", "JRCPL Reception number"],
  ["Relapse warning signs appearing", "Call treating psychiatrist or JRCPL helpline the same day", "Treating Psychiatrist number"],
  ["Psychiatric emergency — suicidal thought / aggressive behaviour", "Go to nearest emergency department OR call iCall / Vandrevala helpline", "112 / iCall: 9152987821"],
  ["Missed OPD appointment", "Call MSW within 24 hours to reschedule — do not miss two consecutive appointments", "MSW number"],
  ["Medication side effects", "Call treating psychiatrist before stopping any medication", "Treating Psychiatrist number"],
];

const FOLLOWUP_CALLS_ROWS = [
  ["Call 1", "48 hours post-discharge", "MSW / Nursing", "Confirm safe arrival home; medications started; family settled; any immediate concerns", "EMR — discharge follow-up log"],
  ["Call 2", "7 days post-discharge", "MSW / Psychologist", "Check medication adherence; first OPD attended; any warning signs; family coping", "EMR — discharge follow-up log"],
  ["Call 3", "30 days post-discharge", "Treating Psychiatrist / MSW", "Clinical review by phone; relapse status; OPD adherence; social functioning; readmission risk", "EMR — discharge follow-up log"],
  ["Call 4 (high-risk only)", "90 days post-discharge", "MSW", "Long-term recovery check; sustained community integration; readmission flag if needed", "EMR — discharge follow-up log"],
];

const CALL_SCRIPT_ROWS = [
  ["Open", "'Hello, this is [name] from Jagrutii Rehab Centre calling to check on [patient name]. Is this a good time to speak?'"],
  ["Safety", "'How is [patient] doing today? Any concerns about safety or unusual behaviour?'"],
  ["Medication", "'Is [patient] taking their medicines regularly? Any side effects or problems getting the medicines?'"],
  ["Follow-Up", "'Did [patient] attend the outpatient appointment on [date]? If not — why not? Let's reschedule.'"],
  ["Warning Signs", "'Have you noticed any of the warning signs we discussed before discharge?' [Refer to CCP warning signs list]"],
  ["Support", "'Is the family managing well? Any support you need from us?'"],
  ["Close", "'We are here for you. Please call us anytime. Our number is [number]. The next call will be on [date].'"],
];

const READMISSION_ROWS = [
  ["LOW", "Mild warning signs; medication adherent; family present and supportive", "Advance OPD appointment; increase call frequency"],
  ["MODERATE", "Multiple warning signs; missed OPD; family concerned but managing", "Same-day OPD or home visit; treating psychiatrist consulted; family briefed"],
  ["HIGH", "Active suicidal ideation; dangerous behaviour; medication stopped; family overwhelmed", "Immediate re-admission assessment; treating psychiatrist contacted same day; family guided to bring patient in"],
];

const Dis09ContinuationOfCarePlanSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-09"
      title="Continuation of Care Plan — Post-Discharge Follow-Up & Relapse Prevention"
      icdLine="SOP Dis-09 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <CalloutBox>
      Why CCP Matters — The risk of relapse is highest in the first 30 days after discharge. The Continuation of Care Plan is the clinical bridge between inpatient treatment and community recovery. Research consistently shows: patients with a structured post-discharge plan have significantly lower readmission rates. The CCP is not a formality — it is the most important clinical document a patient takes home.
    </CalloutBox>

    {/* 1. Purpose */}
    <SectionTitle>1. Purpose</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      This SOP defines the standards for creating, delivering, and following up on the Continuation of Care Plan (CCP) for all patients discharged from Jagrutii Rehabilitation Centres. It also defines the post-discharge follow-up call protocol.
    </p>
    <BulletList items={[
      "Ensure every discharged patient has a clear, written plan for continuing their recovery in the community",
      "Reduce the risk of relapse and unplanned readmission through structured follow-up",
      "Connect patients and families to community resources — outpatient services, support groups, crisis lines",
      "Maintain therapeutic continuity — the patient must feel held by the team even after discharge",
    ]} />

    {/* 2. CCP Authorship & Completion Timeline */}
    <SectionTitle>2. CCP — Authorship &amp; Completion Timeline</SectionTitle>
    <Table
      cols={[
        { label: "CCP Component", width: "44%" },
        { label: "Responsible Clinician", width: "28%" },
        { label: "Completion Deadline", width: "28%" },
      ]}
      rows={CCP_AUTHORSHIP_ROWS}
    />

    {/* 3. CCP Content */}
    <SectionTitle>3. CCP Content — Mandatory Sections</SectionTitle>

    <SectionTitle>3.1 Outpatient Follow-Up Schedule</SectionTitle>
    <Table
      cols={[
        { label: "Vertical", width: "20%" },
        { label: "First OPD", width: "22%" },
        { label: "Follow-Up Frequency", width: "34%" },
        { label: "Where", width: "24%" },
      ]}
      rows={FOLLOWUP_SCHEDULE_ROWS}
    />

    <SectionTitle>3.2 Relapse Warning Signs — Written in Plain Language</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Relapse warning signs must be individualised — not generic. The psychologist identifies them with the patient during the admission and documents them in the CCP.
    </p>
    <Table
      cols={[
        { label: "Vertical", width: "20%" },
        { label: "Common Relapse Warning Signs to Document", width: "80%" },
      ]}
      rows={RELAPSE_ROWS}
    />

    <SectionTitle>3.3 Crisis Contact Protocol</SectionTitle>
    <Table
      cols={[
        { label: "Situation", width: "24%" },
        { label: "Action", width: "46%" },
        { label: "Contact", width: "30%" },
      ]}
      rows={CRISIS_ROWS}
    />

    {/* 4. Post-Discharge Follow-Up Call Protocol */}
    <SectionTitle>4. Post-Discharge Follow-Up Call Protocol</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The MSW or assigned counsellor conducts structured follow-up calls after every planned discharge. Calls are documented in the EMR.
    </p>
    <Table
      cols={[
        { label: "Call", width: "14%" },
        { label: "Timing", width: "18%" },
        { label: "Conducted By", width: "22%" },
        { label: "Purpose", width: "30%" },
        { label: "Document In", width: "16%" },
      ]}
      rows={FOLLOWUP_CALLS_ROWS}
    />

    <SectionTitle>4.1 Follow-Up Call Script — Structure</SectionTitle>
    <Table
      cols={[
        { label: "Step", width: "14%", center: true },
        { label: "Script", width: "86%" },
      ]}
      rows={CALL_SCRIPT_ROWS}
    />

    {/* 5. Readmission Criteria & Pathway */}
    <SectionTitle>5. Readmission Criteria &amp; Pathway</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      If during any follow-up call the patient or family reports warning signs suggesting relapse, the following pathway is activated:
    </p>
    <Table
      cols={[
        { label: "Risk Level", width: "14%" },
        { label: "Criteria", width: "36%" },
        { label: "Action", width: "50%" },
      ]}
      rows={READMISSION_ROWS}
    />
  </ProtocolWrapper>
));

export default Dis09ContinuationOfCarePlanSOP;
