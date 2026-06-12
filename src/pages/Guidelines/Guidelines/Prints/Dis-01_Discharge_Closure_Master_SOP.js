import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ModuleHeader,
  SectionTitle,
  BulletList,
  WarningBox,
  CalloutBox,
  Table,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Doc ID", "Dis-01"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Governance | Patient Exit | Medico-Legal | Documentation"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 23, 87, 88, 89, 90, 99, 103); NABH COP 3, 5, MOM 1–5; Clinical Establishments Act 2010; Consumer Protection Act 2019; NDPS Act 1985; BNS 2023; IPC; CrPC"],
  ["NABH Chapter", "COP | MOM | ACE | RM | QM"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Staff"],
  ["Companion Documents", "DC-002 through DC-010 (individual exit pathway SOPs)"],
  ["Classification", "CONFIDENTIAL — Internal Clinical Governance Document"],
];

const EXIT_PATHWAYS_ROWS = [
  ["1", "Routine Planned Discharge", "DC-002", "MHCA §86/87 (voluntary right); RC-03 criteria", "Standard — clinical decision"],
  ["2", "LAMA / DAMA (Against Medical Advice)", "Dis-03", "MHCA §99 (no unlawful detention); RC-04", "Medico-legal event — immediate action"],
  ["3", "Absconding Patient", "Dis-05", "MHCA §103 (recall provision); BNS 2023", "Emergency — activate within 15 minutes"],
  ["4", "Transfer to Another Facility", "Dis-06", "Clinical Establishments Act 2010; NABH COP", "Clinical decision — medico-legal handover"],
  ["5", "Referral Discharge", "Dis-06", "NMC Code of Ethics (continuity of care)", "Clinical decision — CCP mandatory"],
  ["6", "Death / Expiry", "Dis-04", "BNS 2023; MLC provisions; MHCA §31; NDPS", "Critical — time-sensitive legal obligations"],
  ["7", "Emergency Hospital Transfer", "Dis-07", "SE-04 (Medical Emergency SOP); ADM-002", "Emergency — within minutes"],
  ["8", "Programme Completion Discharge", "Dis-08", "CP-001 (Care Pathways); RC-03", "Standard — structured completion"],
  ["9", "Administrative Closure", "Dis-10", "NABH MOM; DG-02 (Records Retention)", "Follows every exit type"],
  ["10", "Legal / Police / Court-Directed Closure", "Dis-11", "BNS 2023; CrPC; MHCA §§73–80; NDPS §64A", "Requires Clinical Director involvement"],
];

const STEP_A_ROWS = [
  ["Planned discharge", "Treating Psychiatrist", "Dis-02 discharge readiness criteria met; MDT agreement"],
  ["AMA / LAMA / DAMA", "Treating Psychiatrist after capacity assessment", "Capacity confirmed; RC-04 protocol followed"],
  ["Emergency transfer", "Medical Officer / Psychiatrist", "Clinical instability meeting ADM-002 transfer criteria"],
  ["Death", "Duty Doctor / Treating Physician", "Clinical death confirmed; time documented"],
  ["Absconding", "Nursing In-Charge confirms absence", "15-minute mark; search protocol activated"],
  ["Legal / Court-directed", "Clinical Director + Legal Adviser", "Court order or police direction received and verified"],
];

const STEP_C_ROWS = [
  ["Diagnosis and current recovery stage explained in plain language", "Treating Psychiatrist / Psychologist"],
  ["Medication: names, doses, purpose, side effects, duration, what happens if stopped", "Treating Psychiatrist / Nursing"],
  ["Relapse warning signs — specific to diagnosis — what to watch for", "Psychologist / Counsellor"],
  ["When and where to seek help — emergency contacts, nearest psychiatrist, helpline", "MSW"],
  ["Follow-up plan — dates, facility, responsible person", "MSW"],
  ["For de-addiction: AA/NA/SMART Recovery; sponsor; aftercare plan", "Counsellor / MSW"],
  ["For elderly/dementia: home environment, caregiver training, community nurse", "MSW / OT"],
  ["Confidentiality: what family can and cannot be told — per MHCA §23 and FAM-F-003", "Treating Psychiatrist"],
];

const STEP_D_ROWS = [
  ["Discharge Summary (NABH format)", "All exits", "Treating Psychiatrist", "Within 24 hours"],
  ["Prescription / Medication Continuation Sheet", "All exits with medication", "Treating Psychiatrist", "Before exit"],
  ["Follow-Up Instructions (patient-readable)", "All planned exits", "Nursing / MSW", "Before exit"],
  ["Certificates (fitness, sobriety, capacity, NDPS)", "As applicable", "Treating Psychiatrist", "Before handover"],
  ["Investigation Reports (copies)", "All exits", "Nursing / Admin", "With discharge summary"],
  ["Risk Acknowledgement Form", "AMA; high-risk discharge", "Treating Psychiatrist", "Before exit"],
  ["Family Counselling Documentation", "All exits", "Psychologist / MSW", "Before exit"],
  ["Death Summary", "Death / expiry", "Duty Doctor / Consultant", "Before body handover"],
  ["Incident Report", "Absconding; death; AMA; emergency transfer", "Centre Head", "Within 4 hours"],
];

const STEP_E_ROWS = [
  ["Pharmacy reconciliation", "All medications charged; unused stock returned or noted", "Pharmacist"],
  ["Laboratory charges", "All pending lab charges added to final bill", "Accounts"],
  ["Room / programme charges", "Daily rate × days; pro-rated for partial days", "Accounts"],
  ["Security deposit settlement", "Refund balance or collect outstanding balance; receipt issued", "Accounts"],
  ["FRP / NR signature on final bill", "Final bill acknowledged in writing", "Accounts"],
  ["Insurance / TPA claims", "Pre-discharge notification to insurer; documents submitted", "Accounts"],
];

const HIGH_RISK_DOC_ROWS = [
  ["AMA discharge of suicidal patient", "Risk counselling note; AMA-F-001; family counselling; 48-hour follow-up call documented"],
  ["Transfer refusal by family", "Family refusal documented; risks explained and signed; Clinical Director informed; time-stamped"],
  ["CPR and resuscitation", "CPR sheet with times; medications given; response; team present; outcome"],
  ["Death within 24 hours of admission", "Automatic MLC; police intimation; preserve evidence; sentinel event review mandatory"],
  ["Restraint-related adverse event at exit", "RST-F-001 completed; SIL-F-001 if serious injury; SMHA notification if required"],
  ["Media or legal inquiry after exit", "Clinical Director + Legal Adviser before any response; no staff statements without authorisation"],
  ["Consumer court or human rights complaint", "Full documentation package retrieved; Clinical Director manages; no retrospective documentation"],
];

const KPI_ROWS = [
  ["Discharge summary completed before patient exits (or within 24 hrs)", "100%", "Centre Head", "Monthly"],
  ["Medication handover completed and signed — all exits", "100%", "Nursing In-Charge", "Monthly"],
  ["ADM-F-005 discharge section completed — all exits", "100%", "Nursing In-Charge", "Monthly"],
  ["Family counselling documented — all planned exits", "100%", "Psychologist / MSW", "Monthly"],
  ["AMA cases — AMA-F-001 completed and signed", "100%", "Centre Head", "Monthly"],
  ["Death cases — MLC assessed and police intimated within 2 hours", "100%", "Clinical Director", "Per event"],
  ["Absconding — police intimated within 3 hours", "100%", "Centre Head", "Per event"],
  ["Administrative closure completed within 24 hours of physical exit", ">=98%", "Centre Head", "Monthly"],
  ["30-day follow-up call completed — all planned discharges", ">=90%", "MSW", "Monthly"],
  ["30-day readmission rate", "<=15% (De-addiction); <=10% (Psychiatric)", "Clinical Director", "Monthly"],
];

const REVISION_ROWS = [
  ["1.0 | 01.06.2026", "Dr. Amar Shinde", "Initial version — master discharge and closure SOP; ten exit pathways; universal eight-stage workflow; medico-legal protection framework"],
];

const Dis01DischargeClosureMasterSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-01"
      title="Discharge & Closure Management SOP — Master Document"
      icdLine="Doc ID: Dis-01 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <CalloutBox>
      Every patient who leaves JRCPL — whether planned, unplanned, by transfer, or by death — must exit through a defined, documented pathway. This SOP establishes the master framework. The ten exit pathway SOPs (DC-002 to DC-010) provide the step-by-step operational detail for each type. The quality of discharge documentation is a direct measure of clinical governance maturity and medico-legal protection.
    </CalloutBox>

    {/* 1. Purpose */}
    <SectionTitle>1. Purpose</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      This SOP establishes the complete Discharge and Closure Management System for Jagrutii Rehab Centre Pvt. Ltd. across all 18 centres and all four clinical verticals. It defines all patient exit pathways, the mandatory documentation for each, the roles responsible, and the legal and regulatory obligations that apply to each exit type.
    </p>

    {/* 2. Scope */}
    <SectionTitle>2. Scope</SectionTitle>
    <BulletList items={[
      "All patients at discharge, transfer, referral, or death across all JRCPL centres",
      "All clinical, nursing, administrative, accounts, and security staff involved in patient exits",
      "All four verticals: Psychiatric Care, De-Addiction, Elderly Care, Child & Adolescent Psychiatry",
      "All admission categories: voluntary (§86/§87), supported (§89/§90), emergency (§98), and NDPS compulsory",
    ]} />

    {/* 3. Ten Exit Pathways */}
    <SectionTitle>3. Ten Exit Pathways</SectionTitle>
    <Table
      cols={[
        { label: "#", width: "4%", center: true },
        { label: "Exit Pathway", width: "22%" },
        { label: "SOP Reference", width: "10%", center: true },
        { label: "Legal Basis", width: "34%" },
        { label: "Priority", width: "30%" },
      ]}
      rows={EXIT_PATHWAYS_ROWS}
    />

    {/* 4. Universal Discharge Workflow */}
    <SectionTitle>4. Universal Discharge Workflow — Eight Stages</SectionTitle>
    <CalloutBox>
      This eight-stage sequence applies to ALL exit types. Individual SOPs (DC-002 to DC-011) define what changes at each stage for each pathway. No stage may be skipped. All stages must be documented in the EMR.
    </CalloutBox>

    <ModuleHeader>Step A — Clinical Decision</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      The treating psychiatrist makes the clinical exit decision. For planned discharge: Discharge Readiness Criteria (RC-03) must be met. For transfer: clinical indication documented. For AMA: capacity assessed (CAP-F-001). For death: medical team present.
    </p>
    <Table
      cols={[
        { label: "Exit Type", width: "22%" },
        { label: "Who Decides", width: "35%" },
        { label: "Criteria Required", width: "43%" },
      ]}
      rows={STEP_A_ROWS}
    />

    <ModuleHeader>Step B — MDT Review</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      For all planned exits: MDT review is mandatory before discharge is confirmed. For emergency exits (absconding, emergency transfer, death): MDT review occurs as soon as practicable after the immediate situation is managed.
    </p>
    <BulletList items={[
      "MDT members: Treating Psychiatrist, Psychologist, Nursing In-Charge, Medical Social Worker, OT (where applicable), Centre Manager",
      "MDT review note must include: exit rationale, risk at exit, outstanding clinical concerns, community support plan",
      "For high-risk discharge: Clinical Director must be informed before discharge is confirmed",
    ]} />

    <ModuleHeader>Step C — Family Counselling</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Pre-discharge family counselling is mandatory for all planned exit types. Content varies by programme and exit type — see individual SOPs.
    </p>
    <Table
      cols={[
        { label: "Core Content — All Exits", width: "65%" },
        { label: "Who Provides", width: "35%" },
      ]}
      rows={STEP_C_ROWS}
    />

    <ModuleHeader>Step D — Documentation</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      All discharge documentation must be completed before the patient leaves the premises. The discharge summary is a mandatory NABH MOM document and must be completed within 24 hours of discharge — ideally before discharge.
    </p>
    <Table
      cols={[
        { label: "Document", width: "28%" },
        { label: "Required For", width: "22%" },
        { label: "Completed By", width: "23%" },
        { label: "EMR Upload", width: "27%" },
      ]}
      rows={STEP_D_ROWS}
    />

    <ModuleHeader>Step E — Billing & Financial Clearance</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Final billing and financial clearance must be completed before the patient's physical exit. For emergency exits (medical transfer, absconding, death): billing follows as soon as practicable.
    </p>
    <Table
      cols={[
        { label: "Item", width: "28%" },
        { label: "Action", width: "50%" },
        { label: "Responsible", width: "22%" },
      ]}
      rows={STEP_E_ROWS}
    />

    <ModuleHeader>Step F — Medication Handover</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Medication handover is a patient safety intervention — not a formality. The nursing in-charge or treating psychiatrist explains every medication to the patient and primary family member before discharge.
    </p>
    <BulletList items={[
      "Each medication explained: name, dose, frequency, purpose, common side effects, what to do if a dose is missed",
      "Duration of supply provided: minimum 7–14 days' supply at discharge; 30 days for stable patients",
      "Emergency warning signs: specific symptoms requiring immediate medical attention listed in writing",
      "NDPS controlled substances: dispensed per narcotic register; maximum 30-day supply; patient/NR signs narcotic dispensing register",
      "Patient/NR signs the Medication Education Acknowledgement (RC-03-F-002)",
    ]} />

    <ModuleHeader>Step G — Physical Exit Clearance</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Physical exit clearance ensures the patient's physical presence in the centre is formally closed before departure.
    </p>
    <BulletList items={[
      " Patient wristband / ID band removed and destroyed — logged in nursing notes",
      " All belongings returned per ADM-F-005 discharge section — patient / NR signs",
      " Valuables returned from Centre Safe — receipt surrendered",
      " Ward room inspected — no patient items left behind; any damage noted",
      " Security clearance — reception / gate log updated; visitor register closed for this patient",
      " Vehicle confirmed for patient transport (especially for elderly, post-sedation, or high-risk patients)",
      " For AMA: patient confirmed to have departed physically — time noted",
      " For death: body identification confirmed; mortuary transfer or family handover documented",
    ]} />

    <ModuleHeader>Step H — Digital & Administrative Closure</ModuleHeader>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Administrative closure must be completed within 24 hours of physical exit for all exits, and within 4 hours for deaths and high-risk exits.
    </p>
    <BulletList items={[
      " EMR admission record formally closed — discharge date and time entered; exit pathway tagged",
      " All documents scanned and uploaded — discharge summary, prescriptions, consent forms, referral letters",
      " Audit tag applied in EMR — NABH compliance marker",
      " Patient feedback collected (planned exits) — satisfaction survey",
      " 30-day follow-up reminder set in EMR — for all planned discharges",
      " File archived per DG-02 (Medical Records Retention SOP)",
      " Room / bed flagged as available in admission system",
      " MHRB notification sent if applicable (§89/§90 discharge)",
    ]} />

    {/* 5. Medico-Legal Protection Framework */}
    <SectionTitle>5. Medico-Legal Protection Framework</SectionTitle>
    <WarningBox>
      ⚠ For rehab and psychiatric facilities, the quality of discharge documentation is the primary defence in allegations, MHCA inspections, police inquiries, consumer court proceedings, and human rights complaints. Every exit must be documented as if it will be reviewed in a court of law.
    </WarningBox>

    <SectionTitle>5.1 Mandatory Time-Stamped Documentation — All Exits</SectionTitle>
    <BulletList items={[
      "Time of clinical decision to discharge / transfer / refer — documented by treating psychiatrist",
      "Time of family notification — who was called, what was said, response",
      "Time of each escalation call — to Clinical Director, on-call doctor, family",
      "Vital signs at time of clinical deterioration or exit decision",
      "Time of MHRB notification (for §89/§90 exits)",
      "Time of police intimation (for MLC deaths, absconding, legal exits)",
      "Time of patient physical departure from premises",
      "Time of body handover (death cases) — two signatures",
    ]} />

    <SectionTitle>5.2 High-Risk Documentation Triggers</SectionTitle>
    <Table
      cols={[
        { label: "Situation", width: "30%" },
        { label: "Additional Documentation Required", width: "70%" },
      ]}
      rows={HIGH_RISK_DOC_ROWS}
    />

    {/* 6. KPI Monitoring */}
    <SectionTitle>6. KPI Monitoring</SectionTitle>
    <Table
      cols={[
        { label: "KPI", width: "42%" },
        { label: "Target", width: "20%" },
        { label: "Measured By", width: "20%" },
        { label: "Frequency", width: "18%" },
      ]}
      rows={KPI_ROWS}
    />

    {/* 7. Revision History */}
    <SectionTitle>7. Revision History</SectionTitle>
    <Table
      cols={[
        { label: "Version / Date", width: "18%" },
        { label: "Revised By", width: "18%" },
        { label: "Summary of Changes", width: "64%" },
      ]}
      rows={REVISION_ROWS}
    />

  </ProtocolWrapper>
));

export default Dis01DischargeClosureMasterSOP;
