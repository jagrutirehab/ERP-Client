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
  ["SOP Number", "Dis-11"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Medico-Legal | Clinical Governance | Regulatory Compliance"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Four Verticals | CLINICAL DIRECTOR MANDATORY INVOLVEMENT"],
  ["Regulatory Basis", "BNS 2023 | CrPC | MHCA 2017 Sec. 73–80 | NDPS Act Sec. 64A | Mental Health Review Board"],
  ["Related SOPs", "Dis-01 (Master) | Dis-04 (Death/MLC) | Adm-05 (Emergency Involuntary Admission)"],
];

const TYPES_ROWS = [
  ["Court order for release", "BNS 2023 / CrPC; Family Court order", "Habeas corpus petition; family court custody order; civil court direction", "Court — delivered in writing"],
  ["Police custody handover", "BNS 2023 (Sec. 174 equivalent); arrest warrant", "Police arrive with warrant for patient under criminal investigation", "Police officer with written authority"],
  ["Mental Health Review Board (MHRB) order", "MHCA 2017 Sec. 73–80", "MHRB reviews involuntary admission (Sec. 89/90) and orders discharge or transfer", "MHRB written order"],
  ["NDPS court-directed treatment completion", "NDPS Act Sec. 64A", "Court-ordered treatment programme completed; court issues discharge direction", "NDPS court written order"],
  ["Guardianship / family court order", "Family Court; Hindu Succession Act; Mental Health Act", "Court appoints guardian or directs placement", "Family court written order"],
  ["Human rights commission directive", "NHRC / SHRC", "Human rights commission investigation directs release or review", "Commission written directive"],
];

const VERIFICATION_ROWS = [
  ["Step 1", "RECEIVE THE DOCUMENT: All legal directions must be received in writing. A verbal instruction from a police officer, a phone call from a court clerk, or a family member's claim of a court order is NOT sufficient. Request the original written document."],
  ["Step 2", "DO NOT ACT IMMEDIATELY: Inform the police officer or court representative that JRCPL must verify the document before any action. This is legally appropriate — no legitimate authority will object to verification."],
  ["Step 3", "CALL CLINICAL DIRECTOR IMMEDIATELY: Clinical Director is notified the moment a legal direction is received. Clinical Director reviews the document personally. No actions are taken until Clinical Director confirms."],
  ["Step 4", "CALL LEGAL ADVISER: Legal Adviser is contacted for all court orders, police warrants, and contested situations. Legal Adviser confirms the document's authenticity, scope, and JRCPL's obligations."],
  ["Step 5", "CLINICAL ASSESSMENT: Treating psychiatrist conducts an urgent clinical assessment — is the patient safe to be released or transferred given their current mental state and clinical risk? Documents findings."],
  ["Step 6", "DOCUMENT EVERYTHING: From this point: every conversation, every instruction, every action is documented in real time with timestamps. The clinical record for legal-directed closures must be meticulous."],
];

const PATIENT_RIGHTS_ITEMS = [
  "Right to be informed: the patient must be told what is happening and why — in a language they understand",
  "Right to legal representation: if the patient requests a lawyer, this must be facilitated before handover proceeds where practicable",
  "Right to dignity: no patient may be physically coerced, restrained, or treated without clinical justification — even in the presence of police",
  "Right to clinical opinion: JRCPL's treating psychiatrist may formally document clinical concerns about the patient's safety if the legal direction is believed to pose risk — this does not block the legal process but creates a documented clinical record",
  "For Sec. 89/90 patients: MHRB order supersedes all other directions — MHRB discharge order cannot be overridden by family or police without a higher court order",
];

const POLICE_HANDOVER_ROWS = [
  ["Step 1", "Verify the warrant: police officer's ID, badge number, warrant details, issuing court, case number. Photocopy all documents — retain copies."],
  ["Step 2", "Clinical Director present or on call throughout the handover — must be reachable and informed at every step."],
  ["Step 3", "Treating psychiatrist documents clinical status at time of handover. If patient is medically unstable or suicidal: document this clearly and formally communicate it to the police officer in writing."],
  ["Step 4", "Ensure the patient understands what is happening. Inform calmly. If patient is distressed: provide brief therapeutic support before handover."],
  ["Step 5", "Prepare the police handover documentation package: clinical summary, current medications, risk summary, JRCPL contact details for clinical queries."],
  ["Step 6", "Family notification: notify NR of police custody handover immediately — unless the police order specifically prohibits family contact (document this restriction)."],
  ["Step 7", "Physical handover: patient is formally handed over to the named police officer. Handover receipt signed by police officer and JRCPL Centre Manager. Time documented."],
  ["Step 8", "Post-handover: JRCPL retains clinical responsibility for providing medical information to the custody facility if requested. Clinical Director manages all subsequent queries."],
];

const DOCUMENTATION_ROWS = [
  ["Legal Direction (original + copy)", "Court order / police warrant / MHRB order — photocopied and filed", "At receipt"],
  ["Clinical Director confirmation note", "CD's written confirmation of review and authorisation to proceed", "Before any action"],
  ["Legal Adviser confirmation", "Legal Adviser's verbal/written confirmation of document validity and JRCPL's obligations", "Before any action"],
  ["Clinical assessment at closure", "Treating psychiatrist's MSE and risk level at time of legal closure", "Before handover"],
  ["Patient communication note", "What the patient was told; their response; any clinical concerns raised", "Before handover"],
  ["Handover receipt", "Signed by receiving officer/authority + JRCPL Centre Manager; date/time; patient identity confirmed", "At handover"],
  ["Family notification note", "Who was called, when, what was said, family response", "Within 1 hour of handover"],
  ["Post-closure clinical summary", "Summary of admission and clinical status at closure — available for any subsequent medical enquiry", "Within 24 hours"],
];

const Dis11LegalPoliceCourClosureSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-11"
      title="Legal / Police / Court-Directed Closure — Court Orders | Police Handover | MHRB | NDPS"
      icdLine="SOP Dis-11 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      MANDATORY: No Legal-Directed Closure Without Clinical Director Sign-Off — Legal, police, and court-directed closures carry the highest medico-legal risk of any exit pathway. NO legal-directed closure may proceed without the Clinical Director's personal involvement and written sign-off. NO staff member may act on a verbal police instruction or unverified court direction — all legal directions must be in writing and verified. Legal Adviser must be consulted before any closure that involves criminal proceedings, court orders, or contested family situations.
    </WarningBox>

    {/* 1. Types of Legal-Directed Closure */}
    <SectionTitle>1. Types of Legal-Directed Closure</SectionTitle>
    <Table
      cols={[
        { label: "Type", width: "22%" },
        { label: "Legal Basis", width: "22%" },
        { label: "Trigger", width: "32%" },
        { label: "Who Initiates", width: "24%" },
      ]}
      rows={TYPES_ROWS}
    />

    {/* 2. Verification Protocol */}
    <SectionTitle>2. Verification Protocol — Before Any Action</SectionTitle>
    <Table
      cols={[
        { label: "Step", width: "10%", center: true },
        { label: "Action", width: "90%" },
      ]}
      rows={VERIFICATION_ROWS}
    />

    {/* 3. MHCA 2017 Patient Rights */}
    <SectionTitle>3. MHCA 2017 — Patient Rights During Legal Closure</SectionTitle>
    <p style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "0.5rem" }}>
      MHCA 2017 patient rights apply even during legal-directed closures. The existence of a court order or police direction does not suspend the patient's rights under the Act.
    </p>
    <BulletList items={PATIENT_RIGHTS_ITEMS} />

    {/* 4. Police Handover */}
    <SectionTitle>4. Police Handover — Specific Protocol</SectionTitle>
    <Table
      cols={[
        { label: "Step", width: "10%", center: true },
        { label: "Action", width: "90%" },
      ]}
      rows={POLICE_HANDOVER_ROWS}
    />

    {/* 5. Documentation */}
    <SectionTitle>5. Documentation — Legal-Directed Closures</SectionTitle>
    <Table
      cols={[
        { label: "Document", width: "24%" },
        { label: "Content", width: "50%" },
        { label: "Timing", width: "26%" },
      ]}
      rows={DOCUMENTATION_ROWS}
    />

  </ProtocolWrapper>
));

export default Dis11LegalPoliceCourClosureSOP;
