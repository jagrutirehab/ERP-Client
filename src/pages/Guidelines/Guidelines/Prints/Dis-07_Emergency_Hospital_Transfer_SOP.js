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
  ["SOP Number", "Dis-07"],
  ["Version", "1.0"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Category", "Clinical Emergency | Patient Safety | Medico-Legal"],
  ["Prepared By", "Dr Amar Shinde, Clinical Director"],
  ["Approved By", "Mr. Hemant Shinde, CEO, Founder & Director"],
  ["Applies To", "All 18 Centres | All Four Clinical Verticals | All Clinical & Support Staff"],
  ["Regulatory Basis", "Clinical Establishments Act 2010 | NMC Code of Ethics | MHCA 2017 | BNS 2023 (MLC) | NABH COP"],
  ["Related SOPs", "Dis-01 (Master) | Dis-06 (Planned Transfer) | Dis-04 (Death Management)"],
];

const ACTIVATION_ROWS = [
  ["Cardiorespiratory arrest / CPR in progress", "Unresponsive; no pulse; no breathing", "Code Blue → CPR → Ambulance simultaneously"],
  ["Severe withdrawal complications", "DTs with hyperthermia >39°C; status epilepticus; CIWA-Ar >25 unresponsive to treatment", "Duty doctor → IV access → Ambulance"],
  ["Acute medical emergency", "Myocardial infarction; stroke; acute abdomen; anaphylaxis; severe hypoglycaemia", "Stabilise → Ambulance immediately"],
  ["Respiratory distress", "SpO2 <88% despite oxygen; respiratory rate >30/min; cyanosis", "Oxygen → Ambulance immediately"],
  ["Severe psychiatric emergency beyond JRCPL capacity", "Post-attempt requiring surgical repair; overdose requiring gastric lavage/ICU", "Stabilise → Ambulance immediately"],
  ["Severe hypotension", "SBP <80 mmHg not responding to initial management", "IV fluids → Ambulance immediately"],
  ["Altered consciousness / coma", "GCS <10; sudden loss of consciousness; suspected intracranial event", "Lateral position → Airway → Ambulance"],
];

const RESPONSE_ROWS = [
  ["0–2 min", "CALL FOR HELP: Any staff member who identifies the emergency calls 'Emergency — Room [X]' loudly and activates the emergency bell/call system. Do not leave the patient alone."],
  ["0–2 min", "DUTY DOCTOR TO BEDSIDE: Duty doctor attends immediately. Begins ABCDE assessment (Airway, Breathing, Circulation, Disability, Exposure). Starts BLS/ACLS if indicated."],
  ["2–5 min", "CALL AMBULANCE: Centre Manager or designated staff calls the empanelled ambulance service simultaneously while medical response continues. State: 'Medical emergency — adult patient — [condition] — [address]. Bring paramedic team.'"],
  ["2–5 min", "NOTIFY TREATING PSYCHIATRIST & CLINICAL DIRECTOR: Duty doctor calls treating psychiatrist and Clinical Director simultaneously. Brief update: patient condition, action taken, ambulance called."],
  ["5–10 min", "STABILISE FOR TRANSFER: Maintain airway, IV access, oxygen. Do not transfer an unstable patient without IV access and airway secured. Attach monitoring if available."],
  ["10–15 min", "NOTIFY FAMILY / NR: Centre Manager calls the patient's NR or primary family contact. Inform calmly: 'There is a medical emergency. We have called an ambulance and are transferring [patient name] to [hospital name]. Please meet us there.'"],
  ["15–20 min", "PREPARE TRANSFER DOCUMENTS: While stabilisation continues, nursing staff prepare the Emergency Transfer Pack (see Section 3). Do not delay transfer for documents — send the pack with the escort."],
  ["20 min", "AMBULANCE DEPARTURE: Patient departs with clinical escort. Escort maintains monitoring and clinical care during transit."],
];

const TRANSFER_PACK_ROWS = [
  ["Emergency Clinical Summary", "One-page summary: patient name, DOB, diagnosis, reason for transfer, treatment given at JRCPL, current medications, known allergies, vital signs at time of transfer", "Duty Doctor — 5 minutes"],
  ["Medication List", "All current medications: drug name, dose, frequency, last dose time and date", "Nursing In-Charge"],
  ["Relevant Investigation Results", "Most recent labs, ECG, chest X-ray — printed or photographed", "Nursing / Admin"],
  ["Consent for Emergency Transfer", "Signed by NR if available. If NR unavailable: 'Emergency — patient incapacitated; NR being notified' documented by doctor", "Nursing In-Charge"],
  ["JRCPL Contact Card", "Centre Manager name and number; treating psychiatrist number; Clinical Director number", "Nursing In-Charge"],
  ["MLC Flag (if applicable)", "Written note: 'This transfer may constitute an MLC — assess on arrival'", "Duty Doctor"],
];

const POST_TRANSFER_ITEMS = [
  "□ Emergency clinical summary completed and sent with patient",
  "□ Ambulance called — time documented",
  "□ Receiving hospital pre-notified — confirmed acceptance",
  "□ Family/NR notified — time, person spoken to, content of conversation",
  "□ Clinical Director notified — time",
  "□ MLC status assessed and documented",
  "□ Police intimated if MLC — station, officer, time",
  "□ Incident report completed within 4 hours of transfer",
  "□ Post-transfer follow-up call within 4 hours — patient status confirmed at receiving facility",
  "□ Full clinical documentation completed within 24 hours",
  "□ Sentinel event review if patient dies within 24 hours — Clinical Director leads",
];

const Dis07EmergencyHospitalTransferSOP = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="Dis-07"
      title="Emergency Hospital Transfer — Life-Threatening Medical Emergency"
      icdLine="SOP Dis-07 | Version 1.0 | Effective: 1st June 2026 | Review: May 2027"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Standard Operating Procedure"
      version="1.0"
    />

    <ProtocolControlTable rows={CONTROL_ROWS} />

    <WarningBox>
      🔴 Emergency — Minutes Matter: Emergency hospital transfer is activated when a patient's condition is immediately life-threatening and requires emergency department or ICU-level care. Time from decision to ambulance departure: target ≤ 20 minutes. Do NOT delay transfer to complete paperwork — stabilise and send. Documentation follows. ALL emergency transfers within 24 hours of admission are potential MLC — assess immediately.
    </WarningBox>

    {/* 1. Activation Criteria */}
    <SectionTitle>1. Activation Criteria — When to Call an Emergency Transfer</SectionTitle>
    <Table
      cols={[
        { label: "Emergency Condition", width: "26%" },
        { label: "Specific Triggers", width: "40%" },
        { label: "Immediate Action", width: "34%" },
      ]}
      rows={ACTIVATION_ROWS}
    />

    {/* 2. Emergency Response */}
    <SectionTitle>2. Emergency Response — Step by Step</SectionTitle>
    <Table
      cols={[
        { label: "Time", width: "13%" },
        { label: "Action", width: "87%" },
      ]}
      rows={RESPONSE_ROWS}
    />

    {/* 3. Emergency Transfer Pack */}
    <SectionTitle>3. Emergency Transfer Pack — What Goes With the Patient</SectionTitle>
    <Table
      cols={[
        { label: "Document", width: "22%" },
        { label: "Contents", width: "54%" },
        { label: "Who Prepares", width: "24%" },
      ]}
      rows={TRANSFER_PACK_ROWS}
    />

    {/* 4. Empanelled Hospitals */}
    <SectionTitle>4. Empanelled Hospitals — Preparation</SectionTitle>
    <BulletList items={[
      "Every JRCPL centre must maintain an updated list of empanelled emergency hospitals with: name, address, phone number, estimated travel time, and bed confirmation contact",
      "The list must be reviewed and updated quarterly — Centre Manager responsibility",
      "The on-call hospital must be pre-notified before the ambulance departs: 'Transferring a [age]/[gender] with [condition]. Estimated arrival: [time].'",
      "If the primary empanelled hospital cannot accept: activate the secondary hospital immediately — do not delay",
      "For NDPS patients: empanelled hospital must be informed of NDPS status before transfer — affects legal obligations on receiving end",
    ]} />

    {/* 5. MLC Assessment */}
    <SectionTitle>5. MLC Assessment — All Emergency Transfers</SectionTitle>
    <WarningBox>
      ⚠ All Emergency Transfers Within 24 Hours of Admission Are Automatic MLC — Assess every emergency transfer for MLC status at the time of transfer decision. Document MLC assessment in the clinical note — even if the conclusion is 'not MLC.' For MLC cases: police intimation required — call the nearest police station within 2 hours of the transfer. Preserve all clinical records related to the emergency — nothing may be altered or removed.
    </WarningBox>

    {/* 6. Post-Transfer Documentation */}
    <SectionTitle>6. Post-Transfer Documentation &amp; Follow-Up</SectionTitle>
    <BulletList items={POST_TRANSFER_ITEMS} />
  </ProtocolWrapper>
));

export default Dis07EmergencyHospitalTransferSOP;
