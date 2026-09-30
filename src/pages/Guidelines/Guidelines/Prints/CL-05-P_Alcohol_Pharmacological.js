import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApprovalNew, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "CL-05-P"],
  ["Title", "Pharmacological Protocol — Alcohol Withdrawal & De-Addiction Management"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Review Date", "May 2027"],
  ["Detox Duration", "12 Days (Extended from 10-Day Protocol)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "De-Addiction IPD / All JRCPL Centres"],
  ["Regulatory Basis", "MHCA 2017 · NABH COP · NDPS Act 1985"],
];

const INTOXICATED_ROWS = [
  ["Orientation", "Assess Time / Place / Person"],
  ["Vitals", "Temperature, Pulse, Respiration, BP, Blood Sugar Level"],
  ["Head Injury", "Examine for scalp lacerations, GCS, pupils"],
  ["Acute Agitation", "Inj. SERENACE (Haloperidol) 1 amp IM — SOS"],
];

const BASELINE_INV_ROWS = [
  ["CBC", "Baseline haematological status", "WBC < 3.0 or > 15.0 × 10⁹/L"],
  ["LFT (AST, ALT, ALP, Bilirubin, Albumin)", "Liver function; hepatotoxicity monitoring", "Any value > 3× ULN — flag immediately"],
  ["RFT (Creatinine, BUN, eGFR)", "Renal clearance for benzodiazepines", "Creatinine > 1.5 mg/dL"],
  ["Serum Electrolytes (Na⁺, K⁺, Mg²⁺)", "Electrolyte correction before benzodiazepines", "Na < 130 mEq/L; K < 3.0 mEq/L"],
  ["RBS / HbA1c", "Glucose status in alcohol use", "RBS > 200 mg/dL → treat"],
  ["Serum Ammonia", "Hepatic encephalopathy screening", "Elevated + delirium → hepatic protocol"],
  ["Coagulation (PT/INR)", "Bleeding risk; liver function", "INR > 1.5 → physician review"],
  ["ECG", "Cardiac monitoring; QTc baseline", "QTc > 450 ms → cardiology alert"],
];

const CDZ_STANDARD_ROWS = [
  ["1", "4", "–", "4", "6", "14"],
  ["2", "3", "–", "4", "6", "13"],
  ["3", "3", "–", "3", "5", "11"],
  ["4", "2", "–", "3", "5", "10"],
  ["5", "2", "–", "2", "4", "8"],
  ["6", "1", "–", "2", "4", "7"],
  ["7", "1", "–", "1", "3", "5"],
  ["8", "0", "–", "1", "3", "4"],
  ["9", "0", "–", "0", "2", "2"],
  ["10", "0", "–", "0", "2", "2"],
  ["11", "0", "–", "0", "1", "1"],
  ["12", "0", "–", "0", "1", "1"],
];

const CDZ_ELDERLY_ROWS = [
  ["1", "2", "–", "2", "4", "8"],
  ["2", "2", "–", "2", "4", "8"],
  ["3", "1", "–", "2", "3", "6"],
  ["4", "1", "–", "2", "3", "6"],
  ["5", "1", "–", "1", "3", "5"],
  ["6", "1", "–", "1", "2", "4"],
  ["7", "0", "–", "1", "2", "3"],
  ["8", "0", "–", "1", "2", "3"],
  ["9", "0", "–", "0", "2", "2"],
  ["10", "0", "–", "0", "1", "1"],
  ["11", "0", "–", "0", "1", "1"],
  ["12", "0", "–", "0", "1", "1"],
];

const CIWA_ROWS = [
  ["< 8", "Mild", "Supportive care — hydration, B-vitamins, reassurance. No benzodiazepine required."],
  ["8–14", "Moderate", "PRN CDZ 10–20 mg oral. Re-assess in 1 hour."],
  ["15–19", "Severe", "Fixed schedule CDZ + PRN dose. Increase monitoring to q2h. Psychiatrist review."],
  ["≥ 20", "Critical", "Immediate senior psychiatrist review. Consider IV benzodiazepine, ICU transfer assessment."],
];

const ANTIEPILEPTIC_ROWS = [
  ["A", "Tab. Levetiracetam 500 mg", "1-0-1", "Days 1–5, then 250 mg BD × 5 days → STOP", "Preferred in hepatic impairment"],
  ["B", "Tab. Carbamazepine 200 mg", "0-0-1", "Days 1–10 → STOP", "Monitor LFT; avoid in QTc prolongation"],
];

const SUPPORTIVE_ROWS = [
  ["Inj. Thiamine (IV) → Tab. Thiamine 100 mg oral", "100 mg in 500 mL DNS slow IV Day 1; then 100 mg 1-0-1", "IV Day 1; Oral × 15 days", "Wernicke's prophylaxis — MANDATORY in all alcohol detox"],
  ["Tab. B-Plex / Levogen", "1-0-0", "30 days", "B-vitamin repletion"],
  ["Tab. Magnesium 400 mg (or equivalent)", "1-0-1", "Days 1–12", "Reduces seizure threshold; correct hypomagnesaemia"],
  ["Tab. PAN 40 (Pantoprazole)", "1-0-0 (before food)", "PRN / as required", "GI protection; antacid cover"],
  ["Tab. Emset 4 mg (Ondansetron)", "PRN for nausea", "Days 1–7 PRN", "Antiemetic cover during withdrawal"],
  ["Tab. Amlodipine 5 mg", "SOS — BP > 140/90 mmHg STAT", "PRN", "Escalate if BP persistent ≥ 160/100 mmHg"],
  ["Tab. Udiliv 300 mg", "1-0-1", "Full admission if LFT elevated", "Ursodeoxycholic acid — liver dysfunction management"],
  ["IV Fluids (DNS / NS)", "As per clinical assessment", "Days 1–3 if dehydrated", "Correct dehydration; hold if fluid overloaded"],
];

const HEPATIC_ENC_ROWS = [
  ["Tab. Udiliv 300 mg", "300 mg", "1-0-1", "Hepatoprotective"],
  ["Tab. Rifagut 550 mg", "550 mg", "1-0-1", "Reduce gut ammonia-producing bacteria"],
  ["Tab./Sachet Lornit 500 mg", "500 mg", "1-0-1", "Ammonia scavenger (L-Ornithine L-Aspartate)"],
  ["Syp. Duphalac 30 mL", "30 mL", "1-0-1 (or enema if no stools)", "Lactulose — promotes ammonia excretion"],
  ["Low-protein diet", "Per dietician", "Daily", "Reduce substrate for ammonia production"],
];

const MAINTENANCE_ROWS = [
  ["Tab. Acamprosate 333 mg", "> 65 kg: 2 tabs TDS; < 65 kg: 1-1-2", "With meals — 2-2-2 or 1-1-2", "Start after confirmed abstinence; renal dose adjust if eGFR < 30"],
  ["Tab. Topiramate 50 mg", "50 mg", "1-0-1", "Anticraving; also useful for weight gain"],
  ["Tab. Lopez / Ativan 2 mg", "2 mg", "0-0-1 (short-term, taper early)", "For residual anxiety / sleep; avoid prolonged use"],
  ["Tab. Baclofen 20 mg", "20 mg", "1-0-1", "Anticraving; especially in high-craving / anxious patients"],
  ["Tab. Naltrexone 50 mg", "50 mg", "1-0-0", "Opioid antagonist — reduces alcohol reward. Confirm no opioid use × 7 days. Check LFTs > 3× ULN."],
  ["Tab. Gabapentin 300 mg", "300–600 mg", "BD/TDS", "Adjunct for protracted withdrawal insomnia/anxiety; caution in SUD — taper at discharge"],
  ["SSRI (as clinically indicated)", "Per psychiatrist choice", "Morning", "Treat comorbid depression/anxiety — not primary anticraving agent"],
];

const DISCHARGE_RX_ROWS = [
  ["Tab. Lopez / Ativan 2 mg", "2 mg", "0-0-1", "Short-term; 2-week supply maximum at discharge"],
  ["Tab. Baclofen 20 mg OR Tab. Naltima (Naltrexone) 50 mg OR Tab. Disulfiram 250 mg", "As chosen by psychiatrist", "1-0-0 / 1-0-0 / 1-0-0", "Choose one deterrent/anticraving agent. Disulfiram: see consent requirement below."],
  ["Tab. Acamprosate 333 mg", "> 65 kg / < 65 kg", "2-2-2 or 1-1-2", "Continue minimum 6 months post-discharge"],
  ["Tab. Topiramate 50 mg", "50 mg", "1-0-1", "Continue minimum 3 months"],
  ["Thiamine 100 mg", "100 mg", "1-0-0", "Continue 3 months"],
  ["B-Plex / Multivitamin", "1 tab", "1-0-0", "Continue 3 months"],
];

const MONITORING_ROWS = [
  ["Vitals (BP, HR, Temp, SpO₂)", "q4h", "q8h", "OD (or per clinical need)"],
  ["CIWA-Ar Scoring", "q4h", "q8h; daily from Day 10", "Weekly (monitoring for protracted withdrawal)"],
  ["Blood Sugar", "BD (if diabetic or on steroids)", "OD", "PRN"],
  ["LFT / RFT", "Baseline (Day 1)", "Day 7 if baseline abnormal", "Day 21 if on Naltrexone / hepatic risk"],
  ["Serum Electrolytes", "Day 1 + Day 3 if abnormal", "Day 7", "PRN"],
  ["Urine Drug Screen", "Day 1 (baseline)", "Day 7 if clinically suspected", "PRN"],
  ["Neurological Observations", "q4h if seizure history", "OD", "PRN"],
];

const KPI_ROWS = [
  ["CIWA-Ar documented as per protocol", "≥ 95% compliance", "Monthly"],
  ["Thiamine administered in ALL alcohol detox cases", "100%", "Monthly"],
  ["12-day taper completion rate (no premature stop)", "≥ 90%", "Monthly"],
  ["High-risk CIWA escalation documented within 1 hour", "100%", "Monthly"],
  ["Hepatic protocol activated within 2 hours of trigger", "100%", "Quarterly"],
  ["ICU transfer due to detox complication — trend", "Declining trend", "Quarterly"],
  ["Relapse within 30 days post-discharge", "< 25%", "Quarterly"],
];

const CDZ_COLS = [
  { label: "Day", width: "12%", center: true },
  { label: "Morning (tabs)", width: "18%", center: true },
  { label: "Afternoon (tabs)", width: "18%", center: true },
  { label: "Evening (tabs)", width: "18%", center: true },
  { label: "Night (tabs)", width: "18%", center: true },
  { label: "Daily Total", center: true },
];

const Cl05PAlcoholPharmacological = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-05-P"
        title="Pharmacological Protocol — Alcohol Withdrawal & De-Addiction Management"
        icdLine="ICD-11: 6C40–6C41 | DSM-5-TR: F10 | Protocol Code: CL-05-P v1.0"
        org="jagrutii"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.5rem" }}>
        This protocol governs inpatient alcohol withdrawal management for all admitted patients at JRCPL. The standard detox period has been extended to 12 days to allow for safer tapering, management of protracted withdrawal symptoms, and better clinical monitoring prior to transitioning to the post-withdrawal maintenance phase.
      </p>
      <p style={{ margin: "0 0 0.75rem" }}>
        It incorporates Standard Adult dosing, Elderly adjustments (age ≥ 60 years), and Lab-Deviation Adjustments (parameters &gt; 3× ULN). All dose modifications must be documented in clinical notes with rationale clearly stated.
      </p>

      {/* 2. ADMISSION ASSESSMENT */}
      <ModuleHeader>2. Admission Assessment</ModuleHeader>

      <SectionTitle>2.1 Intoxicated State on Arrival</SectionTitle>
      <Table
        cols={[{ label: "Assessment Item", width: "28%" }, { label: "Action" }]}
        rows={INTOXICATED_ROWS}
      />

      <SectionTitle>2.2 Mandatory Baseline Investigations</SectionTitle>
      <Table
        cols={[
          { label: "Investigation", width: "28%" },
          { label: "Purpose", width: "34%" },
          { label: "Alert Threshold" },
        ]}
        rows={BASELINE_INV_ROWS}
      />
      <WarningBox>
        Flag any value &gt; 3× Upper Limit of Normal immediately. Results must be reviewed BEFORE initiating or continuing benzodiazepine therapy.
      </WarningBox>

      {/* 3. WITHDRAWAL MANAGEMENT */}
      <ModuleHeader>3. Withdrawal Management — Days 0–12 (Extended 12-Day Detox)</ModuleHeader>

      <SectionTitle>3.1 Fixed Dose Protocol — Chlordiazepoxide (CDZ)</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Unit = 1 tablet Chlordiazepoxide 10 mg</p>

      <p style={{ margin: "0 0 0.35rem", fontWeight: "600", color: "#1e2d5a" }}>Standard Adult Protocol (Days 1–12)</p>
      <Table cols={CDZ_COLS} rows={CDZ_STANDARD_ROWS} />
      <CalloutBox>
        SOS Dose: CDZ 10 mg (1 tab) PO every 6 hours PRN if CIWA-Ar &gt; 10. Maximum SOS = 4 tabs/day. Re-assess hourly after SOS dose.
      </CalloutBox>

      <p style={{ margin: "0.75rem 0 0.35rem", fontWeight: "600", color: "#1e2d5a" }}>Elderly Protocol — Age ≥ 60 Years (Days 1–12)</p>
      <Table cols={CDZ_COLS} rows={CDZ_ELDERLY_ROWS} />
      <CalloutBox>
        Elderly: Use short-acting benzodiazepines (Lorazepam/Oxazepam) if severe hepatic impairment. Avoid Diazepam in age ≥ 70. Monitor for excessive sedation, falls risk, and paradoxical agitation.
      </CalloutBox>

      <SectionTitle>3.2 CIWA-Ar Guided PRN Protocol</SectionTitle>
      <Table
        cols={[
          { label: "CIWA-Ar Score", width: "16%", center: true },
          { label: "Severity", width: "14%", center: true },
          { label: "Management" },
        ]}
        rows={CIWA_ROWS}
      />
      <WarningBox>
        CIWA-Ar must be documented q4h (Days 1–5), q8h (Days 6–10), daily (Days 11–12). Any CIWA ≥ 15 triggers mandatory psychiatrist notification within 1 hour.
      </WarningBox>

      <SectionTitle>3.3 Antiepileptic Medicines</SectionTitle>
      <Table
        cols={[
          { label: "Option", width: "9%", center: true },
          { label: "Drug", width: "26%" },
          { label: "Dose", width: "10%", center: true },
          { label: "Duration", width: "28%" },
          { label: "Remarks" },
        ]}
        rows={ANTIEPILEPTIC_ROWS}
      />

      <SectionTitle>3.4 General / Supportive Medicines (Days 1–12)</SectionTitle>
      <Table
        cols={[
          { label: "Drug", width: "26%" },
          { label: "Dose / Route", width: "24%" },
          { label: "Duration", width: "18%" },
          { label: "Remarks" },
        ]}
        rows={SUPPORTIVE_ROWS}
      />

      {/* 4. HEPATIC ENCEPHALOPATHY */}
      <ModuleHeader>4. Hepatic Encephalopathy Management</ModuleHeader>
      <WarningBox>
        Trigger: Persistent delirium AND elevated serum ammonia. Activate hepatic protocol — inform senior psychiatrist immediately.
      </WarningBox>
      <Table
        cols={[
          { label: "Drug", width: "26%" },
          { label: "Dose", width: "14%", center: true },
          { label: "Frequency", width: "22%", center: true },
          { label: "Mechanism" },
        ]}
        rows={HEPATIC_ENC_ROWS}
      />

      {/* 5. POST-WITHDRAWAL MAINTENANCE */}
      <ModuleHeader>5. Post-Withdrawal Maintenance — Days 13–45</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        Following completion of the 12-day detox taper, patients transition to the maintenance phase focused on craving reduction, relapse prevention, and psychiatric stabilisation.
      </p>
      <Table
        cols={[
          { label: "Drug", width: "26%" },
          { label: "Dose", width: "18%" },
          { label: "Frequency / Timing", width: "18%" },
          { label: "Notes" },
        ]}
        rows={MAINTENANCE_ROWS}
      />
      <CalloutBox>
        Naltrexone: Confirm no opioid use for minimum 7–10 days. Administer naloxone challenge if opioid use suspected. Contraindicated: LFTs &gt; 3× ULN, acute hepatitis.
      </CalloutBox>

      {/* 6. DISCHARGE PRESCRIPTION */}
      <ModuleHeader>6. Discharge Prescription</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem", fontStyle: "italic" }}>
        Discharge medications are individualised by the treating psychiatrist. The table below outlines the standard formulary options.
      </p>
      <Table
        cols={[
          { label: "Drug", width: "30%" },
          { label: "Dose", width: "16%" },
          { label: "Frequency", width: "14%", center: true },
          { label: "Notes" },
        ]}
        rows={DISCHARGE_RX_ROWS}
      />
      <WarningBox>
        DISULFIRAM — Written informed consent required. Sobriety ≥ 48 hours before initiation. Counsel patients and family about food, cosmetics, and medicinal products containing alcohol. Contraindicated in: severe hepatic disease, cardiac disease, psychosis, poor compliance.
      </WarningBox>

      {/* 7. MONITORING SCHEDULE */}
      <ModuleHeader>7. Monitoring Schedule</ModuleHeader>
      <Table
        cols={[
          { label: "Parameter", width: "24%" },
          { label: "Days 1–5 (Acute Detox)", width: "22%" },
          { label: "Days 6–12 (Extended Detox)", width: "24%" },
          { label: "Days 13–45 (Maintenance)" },
        ]}
        rows={MONITORING_ROWS}
      />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[
          { label: "KPI" },
          { label: "Target", width: "22%", center: true },
          { label: "Review Frequency", width: "14%", center: true },
        ]}
        rows={KPI_ROWS}
      />

      {/* 9. APPROVAL */}
      <ProtocolApprovalNew docCode="CL-05-P" docTitle="Pharmacological Protocol — Alcohol Withdrawal & De-Addiction Management" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl05PAlcoholPharmacological;
