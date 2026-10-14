import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  WarningBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Doc ID", "DC-007"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Medico-Legal | Clinical Safety | Patient Dignity | Family Support"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Regulatory Basis", "BNS 2023 (Bharatiya Nyaya Sanhita — Sec. 174 CrPC equivalent); Registration of Births & Deaths Act 1969; MHCA 2017 (Sec. 31); NABH COP 9; NDPS Act 1985"],
  ["NABH Chapter", "COP | RM | QM | ACE"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Staff"],
  ["Critical", "All in-facility deaths must be assessed for Medico-Legal Case (MLC) status — death within 24 hours of admission is ALWAYS MLC"],
  ["Related SOPs", "SE-04 Medical Emergency & ICU Escalation SOP; SIL-F-001 Serious Illness Consent"],
];

const ASSESSMENT_ROWS = [
  ["Pulse", "Carotid and radial — 60 seconds", "Time of assessment; findings"],
  ["Respiration", "Chest movement; breath sounds — 30 seconds", "Presence or absence; rate if present"],
  ["Pupils", "Torch examination — size, equality, reaction to light", "Dilated / fixed / reactive"],
  ["Cardiac activity", "Auscultation — 2 minutes; ECG if available", "Heart sounds; ECG findings"],
  ["GCS", "If any consciousness level", "Score documented"],
];

const MLC_ROWS = [
  ["Death within 24 hours of admission", "Patient admitted yesterday; cause unclear", "MANDATORY — within 2 hours"],
  ["Suspected or confirmed suicide", "Hanging, OD, wrist cut, jumping — any cause", "MANDATORY — within 2 hours"],
  ["Unnatural or suspicious death", "Fall, assault, unknown cause, unexplained injuries", "MANDATORY — within 2 hours"],
  ["Death under restraint", "Patient was physically restrained at or near time of death", "MANDATORY — within 2 hours; also SMHA notification"],
  ["Death following escape / absconding", "Patient died after absconding from the centre", "MANDATORY"],
  ["Sudden unexpected death", "No warning signs; previously stable patient; cause unclear", "MANDATORY"],
  ["Non-MLC — natural death (expected)", "Terminal illness; palliative programme; clinical deterioration expected and documented", "Not mandatory — but family counselling and expiry summary mandatory"],
];

const EXPIRY_SUMMARY_ROWS = [
  ["Patient details", "Name, age, sex, JRCPL ID, UHID, ward / room, admission date"],
  ["Diagnosis", "Primary and secondary diagnoses; ICD-11 codes"],
  ["Brief clinical history", "Reason for admission; significant events during admission; treatment course"],
  ["Treatment given", "Medications; therapies; ICU transfers; procedures; investigations"],
  ["Events before death", "Specific narrative: time, observed symptoms, nursing actions, doctor called, response — precise times"],
  ["Resuscitation details", "CPR started at: ___; ACLS provided: ___; Oxygen / intubation: ___; Medications and times: ___; Response: ___; Duration: ___"],
  ["Death declaration", "Patient declared dead at ___ by Dr. ___"],
  ["Probable cause of death", "Immediate cause; underlying condition; contributing factors"],
  ["MLC status", "MLC / Non-MLC; police intimated at ___; MLC reference no.: ___"],
  ["Relative communication", "Name and relation informed; time informed; counselling provided by"],
  ["Signature", "Treating Consultant + Duty Doctor — names, designations, registration numbers, signatures, date and time"],
];

const BODY_HANDOVER_ROWS = [
  ["Non-MLC — natural death", "Body handed to family after expiry summary and death certificate issued; family signs body handover form", "Body Handover Form; ADM-F-005 belongings; two signatures"],
  ["MLC — pending police formalities", "Body NOT handed over until police inquest complete and release authorised; body shifted to mortuary if required", "Police release order; mortuary transfer form; then handover form"],
  ["Post-mortem requested / ordered", "Body sent to government mortuary under police escort; family informed", "Transfer form; chain of custody documented"],
  ["No family / unclaimed body", "Police take charge; centre documents efforts to contact family", "All attempts documented; police handed custody with paperwork"],
];

const CPR_ROWS = [
  ["Time patient last seen alive", "_______________"],
  ["Time found unresponsive / in cardiac arrest", "_______________"],
  ["Time BLS commenced", "_______________"],
  ["Time doctor arrived", "_______________"],
  ["Time ACLS commenced", "_______________"],
  ["Medications administered during resuscitation (name, dose, time)", ""],
  ["Response to resuscitation", "[ ] ROSC achieved  [ ] No ROSC"],
  ["Duration of resuscitation", "_______________ minutes"],
  ["Decision to stop resuscitation — by whom and on what basis", ""],
  ["Time of death declared", "_______________ by Dr. _______________"],
  ["DNAR order in place", "[ ] Yes — verified in EMR before decision to stop  [ ] No"],
  ["Team members present during resuscitation", "Names and designations:"],
];

const REVISION_ROWS = [
  ["1.0", "01.06.2026", "Dr. Amar Shinde", "Initial version — comprehensive MLC framework; expiry summary format; CPR documentation; sentinel event review"],
];

const Dis04ExpiryManagementSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-04"
      title="Expiry Management SOP"
      icdLine="Doc ID: DC-007 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      ⚠ Every in-facility death carries significant medico-legal obligations. Time stamps are the single most critical element of documentation. Police must be intimated within 2 hours for all MLC deaths. Do NOT hand over the body to family before police formalities are completed in MLC cases.
    </WarningBox>

    {/* 1. Step-by-Step Death Management Protocol */}
    <SectionTitle>1. Step-by-Step Death Management Protocol</SectionTitle>

    <SectionTitle>Step 1 — Emergency Identification</SectionTitle>
    <ol style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>The nurse discovers the patient unresponsive or in cardiac / respiratory arrest.</li>
      <li style={{ marginBottom: "4px" }}>Activate Emergency Code — call duty doctor IMMEDIATELY.</li>
      <li style={{ marginBottom: "4px" }}>Start BLS (Basic Life Support) immediately — do NOT wait for a doctor if trained nursing staff present.</li>
      <li style={{ marginBottom: "4px" }}>Note time patient was last seen alive — critical for death certificate.</li>
      <li style={{ marginBottom: "4px" }}>Call a psychiatrist / on-call doctor — within 2 minutes.</li>
      <li style={{ marginBottom: "4px" }}>Clear other patients from the area — maintain dignity and prevent panic.</li>
    </ol>

    <SectionTitle>Step 2 — Medical Assessment &amp; Resuscitation</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem", fontWeight: 600 }}>Doctor assesses and documents:</p>
    <Table
      cols={[
        { label: "Assessment", width: "18%" },
        { label: "Method", width: "48%" },
        { label: "Document", width: "34%" },
      ]}
      rows={ASSESSMENT_ROWS}
    />
    <p style={{ fontSize: "0.88rem", marginBottom: "0.4rem", fontWeight: 600 }}>If signs of life are absent: initiate ACLS per SE-04 protocol unless:</p>
    <BulletList items={[
      "Valid DNAR order is in place — documented in EMR and physically present on patient notes",
      "Rigor mortis is present — indicating death occurred significantly before discovery",
      "Injuries incompatible with life are present",
    ]} />

    <SectionTitle>Step 3 — Death Declaration</SectionTitle>
    <ol start={7} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>Doctor certifies death after adequate resuscitation attempt (unless DNAR applies).</li>
      <li style={{ marginBottom: "4px" }}>Document in EMR immediately: Time patient found unresponsive; Time resuscitation commenced; ACLS medications given and times; Duration of resuscitation; Time of death declared by Dr. ___</li>
      <li style={{ marginBottom: "4px" }}>Two doctors sign death declaration where possible — treating psychiatrist + duty doctor.</li>
      <li style={{ marginBottom: "4px" }}>Time of death is the time of clinical declaration — not the time of discovery.</li>
    </ol>

    <SectionTitle>Step 4 — Medico-Legal Case (MLC) Assessment</SectionTitle>
    <WarningBox>
      ⚠ The following situations make a death an automatic MLC. Check each against the clinical circumstances. If any apply: police must be intimated WITHIN 2 HOURS. Do NOT proceed with body handover until police formalities are complete.
    </WarningBox>
    <Table
      cols={[
        { label: "MLC Criterion", width: "28%" },
        { label: "Examples", width: "36%" },
        { label: "Police Intimation", width: "36%" },
      ]}
      rows={MLC_ROWS}
    />

    <SectionTitle>Step 5 — Family Communication</SectionTitle>
    <ol start={11} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>The treating psychiatrist or Clinical Director personally informs the family — not nursing or administrative staff.</li>
      <li style={{ marginBottom: "4px" }}>Communication documented: who was informed, relationship, time of call, how information was received, counselling provided.</li>
      <li style={{ marginBottom: "4px" }}>Family counselling provided by MSW / psychologist — bereavement support offered.</li>
      <li style={{ marginBottom: "4px" }}>For MLC deaths: family informed that police formalities must be completed before the body can be handed over — explained compassionately.</li>
      <li style={{ marginBottom: "4px" }}>Family meeting documented — cultural and religious preferences noted and respected.</li>
    </ol>

    <SectionTitle>Step 6 — MLC Documentation &amp; Police Intimation</SectionTitle>
    <ol start={16} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>The Centre Head or Clinical Director contacts the police station — phone first; written intimation follows within 1 hour.</li>
      <li style={{ marginBottom: "4px" }}>Preserve evidence: do not clean or move the area where the patient was found until police arrive. Do NOT remove any items from the scene.</li>
      <li style={{ marginBottom: "4px" }}>CCTV footage archived immediately — export and lock; do not overwrite.</li>
      <li style={{ marginBottom: "4px" }}>Police inquest completed — Centre Head present and cooperating; legal adviser on standby.</li>
      <li style={{ marginBottom: "4px" }}>Post-mortem: doctor advises family; police may request; non-MLC: family may request.</li>
      <li style={{ marginBottom: "4px" }}>MLC intimation number recorded in EMR and incident report.</li>
    </ol>

    <SectionTitle>Step 7 — Complete Expiry Summary</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem", fontWeight: 600 }}>Expiry Summary — Mandatory Content:</p>
    <Table
      cols={[
        { label: "Section", width: "24%" },
        { label: "Required Content", width: "76%" },
      ]}
      rows={EXPIRY_SUMMARY_ROWS}
    />

    <SectionTitle>Step 8 — Body Handover</SectionTitle>
    <Table
      cols={[
        { label: "Scenario", width: "24%" },
        { label: "Procedure", width: "46%" },
        { label: "Documentation", width: "30%" },
      ]}
      rows={BODY_HANDOVER_ROWS}
    />
    <BulletList items={[
      "Belongings inventory (ADM-F-005) completed — all items handed to next of kin; NOK signs",
      "Valuables from Centre Safe returned — receipt surrendered; two witnesses",
    ]} />

    <SectionTitle>Step 9 — Administrative Closure — Within 4 Hours</SectionTitle>
    <ol start={22} style={{ paddingLeft: "1.4rem", margin: "0.5rem 0 0.75rem", fontSize: "0.88rem" }}>
      <li style={{ marginBottom: "4px" }}>EMR closed — death date, time, and cause entered; exit type = 'Expiry'.</li>
      <li style={{ marginBottom: "4px" }}>Billing finalised — outstanding balance discussed sensitively with family; no aggressive billing at time of death.</li>
      <li style={{ marginBottom: "4px" }}>Incident report filed — mandatory for all in-facility deaths regardless of MLC status.</li>
      <li style={{ marginBottom: "4px" }}>Sentinel event review: mandatory if death is within 24 hours of admission, under restraint, by suicide, or unexplained. Clinical Director convenes review within 72 hours.</li>
      <li style={{ marginBottom: "4px" }}>Bereavement follow-up contact at 2 weeks — MSW calls family; offer counselling referral.</li>
      <li style={{ marginBottom: "4px" }}>SMHA notification if required — restraint-related death, suspected rights violation.</li>
    </ol>

    {/* 2. CPR Documentation Sheet */}
    <SectionTitle>2. CPR Documentation Sheet — Quick Reference</SectionTitle>
    <Table
      cols={[
        { label: "Time Point", width: "56%" },
        { label: "Document", width: "44%" },
      ]}
      rows={CPR_ROWS}
    />

    {/* Revision History */}
    <SectionTitle>Revision History</SectionTitle>
    <Table
      cols={[
        { label: "Version", width: "10%", center: true },
        { label: "Date", width: "14%" },
        { label: "Revised By", width: "20%" },
        { label: "Summary of Changes", width: "56%" },
      ]}
      rows={REVISION_ROWS}
    />

    <ProtocolApprovalNew
      docCode="Dis-04"
      docTitle="Expiry Management SOP"
      approvedBy={{ name: "Mr. Hemant Shinde", title: "CEO, Founder & Director" }}
    />
  </ProtocolWrapper>
));

export default Dis04ExpiryManagementSOP;
