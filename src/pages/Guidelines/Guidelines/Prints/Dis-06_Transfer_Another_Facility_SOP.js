import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  WarningBox,
  CalloutBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["SOP Number", "Dis-06"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Governance | Continuity of Care | Medico-Legal"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Four Clinical Verticals | All Clinical Staff"],
  ["Regulatory Basis", "Clinical Establishments Act 2010 | NABH COP | NMC Code of Ethics | MHCA 2017 | BNS 2023"],
  ["Related SOPs", "Dis-01 (Master) | Dis-07 (Emergency Hospital Transfer) | Dis-09 (Continuation of Care Plan)"],
];

const INDICATIONS_ROWS = [
  ["Medical condition beyond JRCPL scope", "Acute cardiac event stabilised; surgical need; ICU requirement post-emergency", "Urgent — Dis-07 if life-threatening"],
  ["Specialist psychiatric input", "Treatment-resistant case; forensic assessment; specialised ECT beyond centre capacity", "Planned — 24–48 hrs coordination"],
  ["Higher dependency level", "Patient requires 24-hr nursing care beyond current centre's capacity", "Planned — 24–48 hrs"],
  ["Continued care closer to home", "Family request; practical logistics after clinical stability achieved", "Planned — family-driven, clinically appropriate"],
  ["Programme-specific transfer", "De-addiction patient requiring dual-diagnosis psychiatric unit", "Planned — MDT decision"],
  ["NDPS court-directed transfer", "Court orders transfer to government facility or specific centre", "Legal — follows Dis-11"],
];

const DECISION_ROWS = [
  ["Step 1", "CLINICAL DECISION: Treating psychiatrist documents the clinical indication for transfer. For planned transfers: MDT review and agreement required. Document rationale clearly — 'why this patient cannot continue treatment at JRCPL.'"],
  ["Step 2", "CLINICAL DIRECTOR NOTIFICATION: Clinical Director informed of all inter-facility transfers before they occur — no exceptions. High-risk transfers require Clinical Director approval."],
  ["Step 3", "RECEIVING FACILITY CONFIRMATION: Centre Manager or MSW contacts the receiving facility. Confirm: bed availability, clinical capability, admission acceptance, treating doctor name, and expected admission time. Document confirmation in writing."],
  ["Step 4", "PATIENT & FAMILY CONSENT: Treating psychiatrist discusses transfer with patient and NR/family. Explain: reason for transfer, receiving facility, what will happen there, how follow-up will be managed. Obtain signed Transfer Consent (Dis-06-F-001)."],
  ["Step 5", "INSURANCE/TPA NOTIFICATION: Accounts notifies insurer/TPA if patient is covered. Pre-authorisation for transfer obtained if required."],
];

const DOCUMENTATION_ROWS = [
  ["Clinical Transfer Summary", "Full psychiatric history, current diagnosis, treatment received, medications, clinical status at transfer, reason for transfer, risk summary", "Treating Psychiatrist", "Before patient leaves"],
  ["Medication Reconciliation Sheet", "All current medications: names, doses, frequency, duration, last dose given, supply sent with patient", "Nursing In-Charge", "Before patient leaves"],
  ["Investigation Reports", "All relevant labs, ECG, imaging — originals or certified copies", "Nursing / Admin", "Before patient leaves"],
  ["Discharge Summary (partial)", "Summary of JRCPL admission — to be completed fully within 24 hours", "Treating Psychiatrist", "Within 24 hours of transfer"],
  ["Referral Letter", "Addressed to receiving consultant; clinical reasoning; management requests; follow-up expectations", "Treating Psychiatrist", "Before patient leaves"],
  ["Transfer Consent Form", "Signed by patient (if capacity) or NR; documents patient's understanding and agreement", "Nursing In-Charge", "Before patient leaves"],
  ["Belongings Transfer List", "Patient's personal items, medications, documents — signed by escort and family", "Nursing In-Charge", "At transfer"],
];

const POST_TRANSFER_ITEMS = [
  "□ Clinical transfer summary completed and filed in EMR before patient leaves",
  "□ All investigation reports sent with patient — copies retained in JRCPL file",
  "□ Transfer consent signed — filed in EMR",
  "□ Accounts: billing finalised; insurance/TPA notified; security deposit settled",
  "□ EMR record: transfer date/time entered; exit pathway tagged as 'Transfer'",
  "□ Clinical Director confirmation received for transfer",
  "□ Receiving facility acceptance confirmed in writing — filed in record",
  "□ Post-transfer follow-up call within 48 hours — confirm patient received; any handover issues resolved",
  "□ Administrative closure completed per Dis-10 within 24 hours",
];

const Dis06TransferAnotherFacilitySOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-06"
      title="Transfer to Another Facility — Clinical Transfer (Planned & Unplanned)"
      icdLine="SOP Dis-06 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      ⚠ Transfer is a Medico-Legal Handover — The moment a patient leaves JRCPL premises for another facility, clinical responsibility transfers. Transfer without a completed clinical summary and signed handover note constitutes clinical abandonment. No transfer may proceed without treating psychiatrist sign-off — for both clinical and medico-legal protection.
    </WarningBox>

    {/* 1. Purpose & Scope */}
    <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      This SOP governs the planned and unplanned clinical transfer of patients from any Jagrutii Rehabilitation Centre to another healthcare facility — including hospitals, nursing homes, other rehabilitation centres, or specialist services.
    </p>
    <BulletList items={[
      "Planned transfer: clinically anticipated, arranged in advance, for higher-level care, specialist input, or continued rehabilitation closer to home",
      "Unplanned transfer: clinically urgent but not a life-threatening emergency — patient requires facility-level care beyond JRCPL's scope (Emergency transfers follow Dis-07)",
      "All transfers require: clinical justification, patient/NR consent, treating psychiatrist approval, complete clinical documentation, and confirmed reception at the receiving facility",
    ]} />

    {/* 2. Clinical Indications */}
    <SectionTitle>2. Clinical Indications for Transfer</SectionTitle>
    <Table
      cols={[
        { label: "Indication", width: "24%" },
        { label: "Examples", width: "44%" },
        { label: "Urgency", width: "32%" },
      ]}
      rows={INDICATIONS_ROWS}
    />

    {/* 3. Transfer Decision & Authorisation */}
    <SectionTitle>3. Transfer Decision &amp; Authorisation</SectionTitle>
    <Table
      cols={[
        { label: "Step", width: "12%", center: true },
        { label: "Action", width: "88%" },
      ]}
      rows={DECISION_ROWS}
    />

    {/* 4. Transfer Documentation */}
    <SectionTitle>4. Transfer Documentation — Mandatory</SectionTitle>
    <Table
      cols={[
        { label: "Document", width: "22%" },
        { label: "Content", width: "38%" },
        { label: "Completed By", width: "20%" },
        { label: "Timing", width: "20%" },
      ]}
      rows={DOCUMENTATION_ROWS}
    />

    {/* 5. Transfer Escort Protocol */}
    <SectionTitle>5. Transfer Escort Protocol</SectionTitle>
    <BulletList items={[
      "Every transferred patient must be accompanied by a clinical escort — minimum one trained nurse for all transfers",
      "High-risk patients (suicidal, psychotic, agitated, post-sedation): escort must include a doctor and one nurse",
      "Escort duties: monitor clinical status during transit, manage any in-transit emergency, complete the verbal handover at the receiving facility",
      "Mode of transport: ambulance for all clinical transfers — private vehicle permitted only for stable patients with family present and treating psychiatrist written approval",
      "NDPS patients being transferred: police escort required if court-directed; NDPS dispensing register accompanies patient",
    ]} />
    <CalloutBox>
      Escort Handover at Receiving Facility — Escort delivers: clinical summary, medications, investigations, referral letter, belongings list. Verbal handover to receiving doctor using SBAR format: Situation → Background → Assessment → Recommendation. Escort obtains a written receipt of patient acceptance from the receiving facility. Escort returns receipt to JRCPL and files in the patient's closure record.
    </CalloutBox>

    {/* 6. Post-Transfer Documentation & Follow-Up */}
    <SectionTitle>6. Post-Transfer Documentation &amp; Follow-Up</SectionTitle>
    <BulletList items={POST_TRANSFER_ITEMS} />
  </ProtocolWrapper>
));

export default Dis06TransferAnotherFacilitySOP;
