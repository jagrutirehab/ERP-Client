import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolControlTable,
  ProtocolApprovalNew,
  SectionTitle,
  BulletList,
  CalloutBox,
  WarningBox,
  Table,
} from "./ProtocolComponents";

const NAVY = "#1e2d5a";

const CONTROL_ROWS = [
  ["SOP Number", "Dis-10"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Administration | Records Management | NABH Compliance"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Exit Types | Clinical, Nursing, Accounts & Admin Staff"],
  ["Regulatory Basis", "NABH MOM 1-5 | Clinical Establishments Act 2010 | MHCA 2017 Sec. 23 | IT Act 2000 (EMR)"],
  ["Related SOPs", "Dis-01 (Master) | All Dis-02 to Dis-11 | R-11 (Accounts Executive SOP)"],
];

const CLINICAL_DOC_ITEMS = [
  "□ Discharge summary completed by treating psychiatrist and filed in EMR — within 24 hours of exit",
  "□ All nursing notes for the final shift completed and signed",
  "□ All MDT notes finalised — final MDT meeting minutes filed",
  "□ All investigation reports uploaded to EMR — labs, ECG, imaging",
  "□ All consent forms filed in the patient's record — admission, treatment, AMA (if applicable), transfer",
  "□ Medication Administration Record (MAR) completed for all days of admission",
  "□ All incident reports filed (if any occurred during admission)",
  "□ Restraint register entries completed (if restraint was used)",
  "□ Family communication log completed and filed",
];

const BILLING_ITEMS = [
  "□ Final bill prepared — itemised with all charges: accommodation, medication, ECT, investigations, sundry",
  "□ Final bill reviewed by Centre Manager and signed",
  "□ Payment received and receipt issued — or payment plan signed by NR",
  "□ Security deposit refunded or credited — receipt issued",
  "□ Insurance / TPA claim submitted and acknowledged (if applicable)",
  "□ Pharmacy: unused medication returned or accounted for in billing",
  "□ Accounts record closed — zero balance confirmed or outstanding amount documented",
];

const PHYSICAL_CLOSURE_ITEMS = [
  "□ Patient wristband removed and disposal logged in nursing notes",
  "□ All personal belongings returned — ADM-F-13 discharge section completed and signed by patient / NR",
  "□ All valuables returned from centre safe — safe receipt surrendered",
  "□ Patient ID documents returned — Aadhar, passport, any documents held at admission",
  "□ Ward room inspected — no patient items left; any damage noted and reported",
  "□ Security gate log updated — patient departure time recorded",
  "□ Bed / room flagged as available in the admission system",
];

const EMR_CLOSURE_ITEMS = [
  "□ EMR admission record formally closed — exit date and time entered; exit pathway tagged correctly",
  "□ Discharge pathway tagged: Planned / AMA / Transfer / Death / Absconding / Legal",
  "□ All physical documents scanned and uploaded to EMR patient file",
  "□ NABH audit compliance marker applied in EMR",
  "□ 30-day follow-up reminder set in EMR (for all planned discharges)",
  "□ MHRB discharge notification sent if applicable (Sec. 89/90 exits)",
  "□ Patient satisfaction survey collected (for planned discharges) — filed",
];

const RETENTION_ROWS = [
  ["General inpatient medical records — Adults", "7 years from date of discharge", "Physical file + EMR", "Centre Manager + Clinical Director written sign-off"],
  ["General inpatient medical records — Minors", "7 years from date of discharge OR 3 years from attaining majority (18) — whichever is longer", "Physical file + EMR", "Centre Manager + Clinical Director"],
  ["MLC-related records", "Indefinitely — until all legal proceedings are concluded", "Physical file + EMR — flagged MLC", "Clinical Director + Legal Adviser authorisation only"],
  ["NDPS-related treatment records", "As per NDPS Act — minimum 7 years; court-directed cases: until case closure", "Physical file + EMR — flagged NDPS", "Clinical Director + Legal Adviser"],
  ["Death records — Non-MLC", "7 years", "Physical file + EMR", "Centre Manager + Clinical Director"],
  ["Death records — MLC", "Indefinitely or until legal resolution", "Physical file + EMR — flagged MLC", "Clinical Director + Legal Adviser only"],
  ["MHRB correspondence (Sec. 89/90)", "7 years", "Physical file + EMR", "Centre Manager + Clinical Director"],
];

const RECORD_REQUEST_ROWS = [
  ["Patient themselves (with capacity)", "Full medical records", "Patient written request + ID verification", "Centre Manager processes; records provided within 7 working days"],
  ["Nominated Representative / NR (MHCA §23)", "Records as authorised by patient or MHCA provisions", "NR's written request + NR appointment document", "Centre Manager + Clinical Director review; records provided within 7 working days"],
  ["Court / Police — with valid order", "Records specified in the court order / warrant", "Court order or police warrant — verified by Centre Manager + Clinical Director", "Clinical Director + Legal Adviser manage release; copies retained; original signed receipt obtained"],
  ["Insurance / TPA", "Relevant treatment records for claim processing", "Patient / NR written consent for release", "Accounts + Centre Manager process; only records relevant to claim released"],
  ["Another treating facility", "Clinical summary and relevant records for continuity of care", "Patient / NR written consent", "Treating Psychiatrist + Centre Manager; sent directly to receiving clinician"],
  ["Media / General Public", "NONE", "N/A — never without court order", "Refuse. Refer to Clinical Director immediately."],
];

const NABH_AUDIT_ITEMS = [
  "Complete admission to discharge narrative reconstructable from the file alone — no gaps in clinical documentation",
  "All entries dated, timed, and signed — no unsigned entries; no undated entries",
  "Medication record complete for all days — no blank days",
  "Consent forms present for: admission, treatment, ECT (if applicable), restraint (if applicable), transfer (if applicable)",
  "Discharge summary present and dated within 24 hours of exit",
  "Exit pathway clearly tagged in EMR — no patient record without an exit type",
  "Follow-up calls documented in EMR — 48-hour, 7-day, and 30-day calls logged",
];

const SubHeading = ({ children }) => (
  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: NAVY, marginTop: "0.8rem", marginBottom: "0.4rem" }}>
    {children}
  </p>
);

const Dis10AdministrativeClosureSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-10"
      title="Administrative Closure — Records, Billing & File Management"
      icdLine="SOP Dis-10 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <CalloutBox>
      Administrative Closure is a Clinical Governance Standard — Administrative closure is not a back-office task. It is the final stage of clinical governance for every patient exit. An incomplete administrative record is a NABH non-compliance finding, a medico-legal vulnerability, and a quality gap. Every closed file must be audit-ready — meaning: a NABH inspector, a court, or a clinical director must be able to reconstruct the patient's entire stay from the record alone.
    </CalloutBox>

    {/* 1. Administrative Closure Checklist */}
    <SectionTitle>1. Administrative Closure Checklist — All Exit Types</SectionTitle>
    <p style={{ fontSize: "0.88rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
      The following checklist must be completed within 24 hours of every patient exit. Centre Manager verifies completion.
    </p>

    <SubHeading>A. Clinical Documentation</SubHeading>
    <BulletList items={CLINICAL_DOC_ITEMS} />

    <SubHeading>B. Billing &amp; Accounts</SubHeading>
    <BulletList items={BILLING_ITEMS} />

    <SubHeading>C. Physical Closure</SubHeading>
    <BulletList items={PHYSICAL_CLOSURE_ITEMS} />

    <SubHeading>D. EMR &amp; Digital Closure</SubHeading>
    <BulletList items={EMR_CLOSURE_ITEMS} />

    {/* 2. Medical Records Retention */}
    <SectionTitle>2. Medical Records Retention — Standards</SectionTitle>
    <Table
      cols={[
        { label: "Record Type", width: "22%" },
        { label: "Retention Period", width: "24%" },
        { label: "Storage Method", width: "22%" },
        { label: "Destruction Authorisation", width: "32%" },
      ]}
      rows={RETENTION_ROWS}
    />
    <WarningBox>
      Record Destruction Rules — No medical record may be destroyed without written authorisation from the Clinical Director. No MLC or NDPS record may ever be destroyed without Legal Adviser confirmation that all proceedings are concluded. Any tampering with, alteration of, or destruction of a medical record is a criminal offence under BNS 2023 and grounds for immediate termination.
    </WarningBox>

    {/* 3. Record Request & Release */}
    <SectionTitle>3. Record Request &amp; Release</SectionTitle>
    <Table
      cols={[
        { label: "Requestor", width: "20%" },
        { label: "What May Be Released", width: "24%" },
        { label: "Authorisation Required", width: "26%" },
        { label: "Procedure", width: "30%" },
      ]}
      rows={RECORD_REQUEST_ROWS}
    />

    {/* 4. NABH Audit Readiness */}
    <SectionTitle>4. NABH Audit Readiness — Closed File Standards</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
      Every closed patient file — physical and digital — must meet the following standards for NABH audit readiness:
    </p>
    <BulletList items={NABH_AUDIT_ITEMS} />
  </ProtocolWrapper>
));

export default Dis10AdministrativeClosureSOP;
