import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "PS-CL-01-P"],
  ["Title", "Pharmacological Protocol — Polysubstance Use Disorder, 15-Day Detox & 90-Day Programme"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Detox Duration", "15 Days"],
  ["Total Programme", "90 Days (Detox + Maintenance + Discharge)"],
  ["Substances Covered", "Alcohol · Opioids · Cannabis · Stimulants (cocaine/amphetamines) · Sedatives/Hypnotics · Inhalants"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Regulatory Basis", "MHCA 2017 · NABH COP · NDPS Act 1985"],
];

const SUBSTANCE_PROFILE_ROWS = [
  ["Alcohol", "6C40–6C41", "AUDIT, CAGE, SADQ", "HIGH — seizures, DT", "6–24 hrs"],
  ["Opioids (heroin, tramadol, prescription)", "6C43", "COWS, SDS", "HIGH — severe dysphoria, pain", "6–24 hrs (short-acting); 36–48 hrs (long-acting)"],
  ["Benzodiazepines / Hypnotics", "6C44", "CIWA-B", "HIGH — seizures", "1–4 days (long-acting BDZ)"],
  ["Stimulants (cocaine, amphetamines)", "6C41", "BSDS, ASSIST", "MODERATE — crash, dysphoria", "Hours post-last use"],
  ["Cannabis", "6C42", "SDS, CUDIT-R", "LOW-MODERATE — irritability", "24–72 hrs"],
  ["Inhalants", "6C46", "ASSIST", "LOW — CNS depression", "Hours"],
  ["Nicotine (tobacco)", "6C4A", "FTND", "LOW-MODERATE — irritability", "Hours"],
];

const BASELINE_INVESTIGATIONS_ROWS = [
  ["CBC", "Haematological baseline; infection screen", "WBC < 3.0 or > 15.0 × 10⁹/L"],
  ["LFT (AST, ALT, ALP, GGT, Bilirubin, Albumin)", "Hepatotoxicity; liver disease", "Any value > 3× ULN — flag immediately"],
  ["RFT (Creatinine, BUN, eGFR)", "Renal clearance; Acamprosate dosing", "Creatinine > 1.5 mg/dL; eGFR < 30"],
  ["Serum Electrolytes (Na⁺, K⁺, Mg²⁺)", "Electrolyte correction before BDZ", "Na < 130; K < 3.0 mEq/L"],
  ["RBS / HbA1c", "Glucose; metabolic monitoring (antipsychotics)", "RBS > 200 → treat"],
  ["Serum Ammonia", "Hepatic encephalopathy (if alcohol + altered consciousness)", "Elevated + delirium → hepatic protocol"],
  ["Coagulation (PT/INR)", "Bleeding risk; liver synthetic function", "INR > 1.5 → physician review"],
  ["ECG", "QTc baseline (methadone, antipsychotics)", "QTc > 450 ms → cardiology alert"],
  ["Urine Drug Screen (UDS)", "Objective substance confirmation; polysubstance mapping", "Document all positives; re-test Day 7 if unclear"],
  ["Blood Alcohol Level (BAL)", "Quantify alcohol at admission", "BAL > 300 mg/dL → medical alert"],
  ["HIV, HBV, HCV screen", "Bloodborne infections (IVDU)", "Positive → infectious disease referral"],
  ["Hepatitis B surface Ag", "Active hepatitis screening", "Positive → hepatology referral"],
  ["Chest X-ray", "TB / pneumonia screen (inhalant / IVDU)", "Abnormal → respiratory review"],
  ["Serum B12, Folate, Thiamine", "Nutritional deficiencies", "Low → supplement immediately"],
  ["Urine pregnancy test (females of childbearing age)", "Contraindication mapping for pharmacotherapy", "Positive → OB-GYN consult; revise protocol"],
];

const CDZ_STANDARD_ROWS = [
  ["1", "4", "—", "4", "6", "14"],
  ["2", "4", "—", "4", "6", "14"],
  ["3", "3", "—", "4", "5", "12"],
  ["4", "3", "—", "3", "5", "11"],
  ["5", "2", "—", "3", "5", "10"],
  ["6", "2", "—", "3", "4", "9"],
  ["7", "2", "—", "2", "4", "8"],
  ["8", "1", "—", "2", "4", "7"],
  ["9", "1", "—", "2", "3", "6"],
  ["10", "1", "—", "1", "3", "5"],
  ["11", "1", "—", "1", "2", "4"],
  ["12", "0", "—", "1", "2", "3"],
  ["13", "0", "—", "0", "2", "2"],
  ["14", "0", "—", "0", "2", "2"],
  ["15", "0", "—", "0", "1", "1"],
];

const CDZ_ELDERLY_ROWS = [
  ["1", "2", "—", "2", "4", "8"],
  ["2", "2", "—", "2", "4", "8"],
  ["3", "2", "—", "2", "3", "7"],
  ["4", "1", "—", "2", "3", "6"],
  ["5", "1", "—", "2", "3", "6"],
  ["6", "1", "—", "1", "3", "5"],
  ["7", "1", "—", "1", "2", "4"],
  ["8", "1", "—", "1", "2", "4"],
  ["9", "0", "—", "1", "2", "3"],
  ["10", "0", "—", "1", "2", "3"],
  ["11", "0", "—", "0", "2", "2"],
  ["12", "0", "—", "0", "2", "2"],
  ["13", "0", "—", "0", "1", "1"],
  ["14", "0", "—", "0", "1", "1"],
  ["15", "0", "—", "0", "1", "1"],
];

const CIWA_ROWS = [
  ["< 8", "Mild", "Supportive care. No benzodiazepine required."],
  ["8–14", "Moderate", "PRN CDZ 10–20 mg oral. Re-assess in 1 hour."],
  ["15–19", "Severe", "Fixed schedule CDZ + PRN. Monitor q2h. Psychiatrist review."],
  ["≥ 20", "Critical", "Immediate senior review. IV benzodiazepine. ICU transfer assessment."],
];

const BUPE_TAPER_ROWS = [
  ["Day 1 (Induction)", "Score ≥ 8 on COWS", "2mg SL test dose; observe 1 hour; add 2–4 mg SL if COWS > 8", "Max 8 mg Day 1"],
  ["Day 2–3", "Titrate upward", "Increase by 2–4 mg SL to reach comfort dose", "Target 8–16 mg/day"],
  ["Day 4–7", "Stabilisation", "Fixed dose BD (e.g., 8 mg AM + 4 mg PM)", "Adjust per response"],
  ["Day 8–10", "Maintain / begin taper", "Hold stable dose or begin 10–20% taper", "Per MDT decision"],
  ["Day 11–13", "Taper", "Reduce by 2 mg every 2 days", "Monitor COWS daily"],
  ["Day 14–15", "Low-dose / stop", "Final dose 2 mg SL; discontinue or continue MAT", "MAT decision at MDT"],
];

const COWS_ROWS = [
  ["< 5", "Minimal", "No medication; supportive care; monitor q4h"],
  ["5–12", "Mild", "Symptomatic medications; Buprenorphine induction may proceed at COWS ≥ 8"],
  ["13–24", "Moderate", "Buprenorphine + symptomatic adjuncts; close monitoring"],
  ["25–36", "Moderately severe", "Buprenorphine dose review; consider IV fluids; senior psychiatrist review"],
  ["> 36", "Severe", "Urgent senior review; ICU step-up assessment; IV support"],
];

const OPIOID_ADJUNCT_ROWS = [
  ["Autonomic hyperactivity / hypertension", "Tab. Clonidine 0.1–0.3 mg", "BD-TDS PRN", "Days 1–7; taper"],
  ["Nausea / vomiting", "Tab. Ondansetron 4 mg", "PRN TDS", "Days 1–10 PRN"],
  ["Diarrhoea", "Tab. Loperamide 2–4 mg", "PRN QDS", "Days 1–7"],
  ["Muscle cramps / restless legs", "Tab. Baclofen 10 mg OR Quinine sulphate", "BD PRN", "Days 1–10"],
  ["Insomnia", "Tab. Trazodone 50–100 mg OR Mirtazapine 15 mg", "0-0-1", "Days 1–15"],
  ["Pain (myalgia)", "Tab. Paracetamol 500–1000 mg", "QDS PRN", "Avoid NSAIDs in hepatic risk"],
];

const STIMULANT_MGMT_ROWS = [
  ["Agitation / craving", "Tab. Quetiapine 25–100 mg", "PRN / 0-0-1", "Max 300 mg/day; sedation risk"],
  ["Insomnia", "Tab. Mirtazapine 15 mg", "0-0-1", "Sedating antidepressant; weight gain"],
  ["Depression / craving", "Tab. Bupropion SR 150 mg", "1-0-0 or 1-0-1", "Contraindicated in seizure history"],
  ["Cannabis-related anxiety", "Tab. Propranolol 10–20 mg", "BD PRN", "Monitor BP/HR"],
  ["Hyperarousal / anxiety", "Tab. Buspirone 10 mg", "BD-TDS", "Non-sedating; no abuse potential"],
  ["Psychosis (stimulant)", "Tab. Olanzapine 5–10 mg", "0-0-1 or BD", "Short-term; metabolic monitoring"],
  ["Sedative/hypnotic WD", "Phenobarbital taper (inpatient only)", "Per protocol", "Specialist supervision required"],
];

const SUPPORTIVE_MEDS_ROWS = [
  ["Inj. Thiamine 100 mg IV → Tab. Thiamine 100 mg oral", "IV Day 1 in 500 mL DNS; then 100 mg 1-0-1 oral", "IV Day 1; oral Days 2–30", "MANDATORY if alcohol component. Wernicke's prophylaxis."],
  ["Tab. B-Plex / Multivitamin", "1-0-0", "90 days", "Nutritional support; universal supplementation"],
  ["Tab. Magnesium 400 mg", "1-0-1", "Days 1–15", "Seizure threshold; hypomagnesaemia correction"],
  ["Tab. PAN 40 (Pantoprazole)", "1-0-0 before food", "PRN / admission", "GI protection"],
  ["Tab. Ondansetron 4 mg OR Metoclopramide 10 mg", "PRN TDS", "Days 1–10", "Antiemetic cover"],
  ["Tab. Udiliv 300 mg", "1-0-1", "If LFT elevated", "Hepatoprotective; UDCA"],
  ["IV Fluids (DNS / NS / RL)", "As clinically assessed", "Days 1–5 if needed", "Dehydration, poor oral intake"],
  ["Tab. Amlodipine 5 mg", "STAT if BP > 140/90", "PRN", "Hypertension during withdrawal"],
  ["Tab. Paracetamol 500–1000 mg", "PRN QDS", "Days 1–15 PRN", "Myalgia, headache; avoid NSAIDs if hepatic risk"],
];

const HEPATIC_ENC_ROWS = [
  ["Tab. Udiliv 300 mg", "300 mg", "1-0-1", "Hepatoprotective (UDCA)"],
  ["Tab. Rifagut 550 mg", "550 mg", "1-0-1", "Reduce ammonia-producing gut bacteria"],
  ["Tab./Sachet Lornit 500 mg", "500 mg", "1-0-1", "Ammonia scavenger (LOLA)"],
  ["Syp. Duphalac 30 mL", "30 mL", "1-0-1 (or enema if no stools)", "Lactulose — ammonia excretion"],
  ["Dietary restriction", "Protein 0.6–0.8 g/kg/day", "Daily", "Reduce ammonia substrate"],
];

const MONITORING_ROWS = [
  ["Vitals (BP, HR, Temp, SpO₂, RR)", "q4h", "q6h", "q8h / OD per clinical status"],
  ["CIWA-Ar (alcohol/BDZ component)", "q4h", "q8h", "Daily"],
  ["COWS (opioid component)", "q4h", "q8h", "Daily"],
  ["Blood glucose", "BD (if diabetic/steroid)", "OD", "PRN"],
  ["Urine Drug Screen", "Day 1 (baseline)", "Day 7 (confirm clearance)", "Day 14 (pre-discharge screen)"],
  ["Serum electrolytes", "Day 1 + Day 3 if abnormal", "Day 7", "PRN"],
  ["LFT / RFT", "Day 1", "Day 7 if abnormal", "Day 14 if on Naltrexone / hepatic risk"],
  ["ECG", "Day 1", "Day 5 if QTc concern", "PRN"],
  ["Neurological obs", "q4h if seizure history", "q8h", "Daily"],
  ["Sedation score (RASS)", "q4h (BDZ days 1–5)", "q8h", "OD"],
  ["Falls risk assessment", "Day 1", "Weekly", "At discharge"],
];

const MAINTENANCE_ROWS = [
  ["Opioid dependence", "Buprenorphine-Naloxone (Suboxone / Naltima-BNX)", "2–16 mg SL OD or BD", "MAT — continue minimum 6–12 months post-discharge"],
  ["Opioid (deterrent)", "Naltrexone (Naltima) 50 mg", "OD oral or monthly IM depot", "Only after full opioid detox ≥ 7–10 days; confirm with naloxone challenge"],
  ["Alcohol component", "Acamprosate 333 mg", "2-2-2 (>65 kg) / 1-1-2 (<65 kg)", "Glutamate modulation; start after abstinence confirmed"],
  ["Alcohol (deterrent)", "Disulfiram 250 mg (with consent)", "OD supervised", "Sobriety ≥ 48 hrs; signed consent; CI: severe hepatic/cardiac/psychosis"],
  ["Anticraving (opioid/stimulant)", "Baclofen 20 mg", "1-0-1", "GABA-B agonist; anticraving + antianxiety"],
  ["Anticraving (all SUD)", "Topiramate 50 mg", "1-0-1", "Broad anticraving; also reduces binge drinking"],
  ["Comorbid depression", "SSRI (Escitalopram 10 mg or Sertraline 50 mg)", "1-0-0", "Start once withdrawal settled (Day 7–10); review at 6 weeks"],
  ["Comorbid PTSD/anxiety", "Prazosin 1–5 mg", "0-0-1", "PTSD nightmares; start low, titrate"],
  ["Sleep (short-term)", "Mirtazapine 15–30 mg OR Trazodone 50–100 mg", "0-0-1", "Avoid benzodiazepines as maintenance; taper sleep aids by Day 45"],
  ["Thiamine / B-vitamins", "Thiamine 100 mg + B-Plex", "1-0-0 each", "Continue minimum 3 months; mandatory if alcohol component present"],
  ["Dual diagnosis — psychosis", "Olanzapine / Risperidone / Quetiapine", "As per psychiatrist", "Review at 4 weeks; rule out substance-induced vs primary psychosis"],
];

const DISCHARGE_RX_ROWS = [
  ["Buprenorphine-Naloxone OR Naltrexone 50 mg", "As maintained in programme", "MAT — follow MAT OPD protocol; minimum 6 months"],
  ["Acamprosate 333 mg", "2-2-2 or 1-1-2", "Minimum 6 months; paired with counselling"],
  ["Topiramate 50 mg", "1-0-1", "Minimum 3 months"],
  ["Baclofen 20 mg", "1-0-1", "Taper if asymptomatic at 3 months"],
  ["Antidepressant (if initiated)", "As prescribed", "Continue as per psychiatric plan"],
  ["Thiamine 100 mg + B-Plex", "1-0-0", "3 months"],
  ["Prazosin (if PTSD)", "0-0-1", "Continue with psychiatric review"],
];

const LAB_DEVIATION_ROWS = [
  ["LFT > 3× ULN (any value)", "Avoid Naltrexone. Reduce CDZ dose by 30%. Prefer short-acting BDZ (Lorazepam). Increase Udiliv. Hepatology consult."],
  ["eGFR < 30 mL/min/1.73m²", "Halve Acamprosate dose or avoid. Avoid long-acting BDZ. Adjust Baclofen. Renal team consult."],
  ["QTc > 450 ms (ECG)", "Avoid Methadone, Haloperidol, Citalopram. Cardiology consult before antipsychotic initiation. Electrolyte correction priority."],
  ["INR > 1.5", "Avoid NSAIDs. Vitamin K review. Reduce procedural risk. General physician review."],
  ["Pregnancy (positive UPT)", "Buprenorphine monoproduct (not Buprenorphine-Naloxone) for opioid dependence. Avoid Disulfiram, Naltrexone, Topiramate. OB-GYN co-management."],
  ["HIV positive", "ARV drug interaction check before ALL pharmacotherapy. ID physician co-management mandatory."],
  ["Seizure history", "Avoid Bupropion. Prefer Levetiracetam as antiepileptic prophylaxis. Lorazepam IM as rescue seizure medication."],
  ["Severe thrombocytopaenia (PLT < 50)", "Avoid IM injections. Avoid NSAIDs. Haematology review."],
];

const KPI_ROWS = [
  ["COWS/CIWA documented as per protocol", "≥ 95%", "Monthly"],
  ["Thiamine administered in all alcohol-component cases", "100%", "Monthly"],
  ["Buprenorphine induction at COWS ≥ 8 (no earlier)", "100%", "Monthly"],
  ["15-day detox taper completion rate", "≥ 90%", "Monthly"],
  ["Serious adverse event (seizure, overdose) rate", "Trending down", "Monthly"],
  ["MAT initiated before discharge (opioid cases)", "≥ 95%", "Quarterly"],
  ["Relapse within 30 days post-discharge", "< 30%", "Quarterly"],
  ["Dual-diagnosis psychiatric review within 72 hrs", "100%", "Quarterly"],
];

const PsCl01PPolysubstanceUseDisorder = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="PS-CL-01-P"
        title="Polysubstance Use Disorder (PSUD)"
        icdLine="ICD-11: 6C4E | DSM-5-TR: F19 | 15-Day Extended Detox + 75-Day Post-Withdrawal Maintenance | 90-Day Total Programme"
        org="jagrutii"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol governs the pharmacological management of adults admitted to JRCPL with Polysubstance Use Disorder (PSUD). PSUD is defined as the concurrent or sequential problematic use of two or more psychoactive substances, each meeting ICD-11 / DSM-5-TR diagnostic criteria for harmful use or dependence.
      </p>
      <p style={{ margin: "0 0 0.75rem" }}>
        The protocol covers a 15-day supervised detoxification phase followed by a 75-day post-withdrawal maintenance and relapse prevention phase. Pharmacotherapy decisions must be individualised based on substance profile, severity indices, comorbidities, and laboratory findings. All modifications to this protocol require documented clinical rationale in the case notes.
      </p>
      <WarningBox>
        NOTE: PSUD management requires substance-specific protocols running simultaneously. The treating psychiatrist must identify the PRIMARY substance (greatest dependence / withdrawal risk) and the SECONDARY substances, and sequence detoxification accordingly. This document provides the pharmacological framework; see PS-CL-01-C for the Counselling Protocol.
      </WarningBox>

      {/* 2. ADMISSION ASSESSMENT */}
      <ModuleHeader>2. Admission Assessment</ModuleHeader>

      <SectionTitle>2.1 Substance Use Profile — Mandatory Mapping</SectionTitle>
      <Table
        cols={[
          { label: "Substance Category", width: "22%" },
          { label: "ICD-11", width: "10%", center: true },
          { label: "Priority Scale", width: "16%" },
          { label: "Withdrawal Risk", width: "22%" },
          { label: "Onset of WD" },
        ]}
        rows={SUBSTANCE_PROFILE_ROWS}
      />
      <WarningBox>
        ⚠ ALCOHOL + BENZODIAZEPINE COMBINATION: Highest medical risk profile. Cross-tolerance requires careful dose calculation. CIWA-Ar q2h during first 48 hours. Both substances can cause life-threatening withdrawal seizures — manage simultaneously under intensive monitoring.
      </WarningBox>

      <SectionTitle>2.2 Mandatory Baseline Investigations</SectionTitle>
      <Table
        cols={[
          { label: "Investigation", width: "28%" },
          { label: "Purpose", width: "40%" },
          { label: "Alert Threshold" },
        ]}
        rows={BASELINE_INVESTIGATIONS_ROWS}
      />
      <WarningBox>
        ⚠ All values &gt; 3× ULN must be flagged BEFORE initiating or continuing benzodiazepine therapy. Results must be reviewed by the treating psychiatrist within 2 hours of availability. Urine Drug Screen positivity does not by itself constitute a diagnostic criterion — integrate with clinical history and validated scales.
      </WarningBox>

      {/* 3. DETOXIFICATION PHASE */}
      <ModuleHeader>3. Detoxification Phase — Days 1–15</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        The 15-day detox phase addresses the physiological dependence across all identified substances simultaneously, with substance-specific protocols running in parallel. The primary withdrawal risk substance governs the intensity of monitoring.
      </p>

      <SectionTitle>3.1 Alcohol / Sedative-Hypnotic / Benzodiazepine Component — Chlordiazepoxide (CDZ) Taper</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Unit = 1 tablet Chlordiazepoxide 10 mg</p>
      <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Standard Adult Protocol (Days 1–15)</p>
      <Table
        cols={[
          { label: "Day", width: "8%", center: true },
          { label: "Morning (CDZ 10mg tabs)", center: true },
          { label: "Afternoon", center: true },
          { label: "Evening", center: true },
          { label: "Night", center: true },
          { label: "Daily Total", center: true },
        ]}
        rows={CDZ_STANDARD_ROWS}
      />
      <WarningBox>
        SOS Dose: CDZ 10 mg (1 tab) PO every 6 hours PRN if CIWA-Ar &gt; 10. Maximum SOS = 4 tabs/day. Re-assess hourly after SOS dose. If polysubstance profile includes benzodiazepine dependence, increase baseline CDZ by 20–30% with senior psychiatrist approval.
      </WarningBox>

      <p style={{ margin: "0.75rem 0 0.5rem", fontWeight: 600 }}>Elderly Protocol — Age ≥ 60 Years (Days 1–15)</p>
      <Table
        cols={[
          { label: "Day", width: "8%", center: true },
          { label: "Morning (CDZ 10mg tabs)", center: true },
          { label: "Afternoon", center: true },
          { label: "Evening", center: true },
          { label: "Night", center: true },
          { label: "Daily Total", center: true },
        ]}
        rows={CDZ_ELDERLY_ROWS}
      />
      <WarningBox>
        Elderly: Prefer short-acting benzodiazepines (Lorazepam / Oxazepam) if severe hepatic impairment. Avoid Diazepam age ≥ 70. Monitor for excessive sedation, falls risk, and paradoxical agitation. Halve SOS doses.
      </WarningBox>

      <p style={{ margin: "0.75rem 0 0.5rem", fontWeight: 600 }}>CIWA-Ar Guided Management</p>
      <Table
        cols={[
          { label: "CIWA-Ar Score", width: "18%", center: true },
          { label: "Severity", width: "18%" },
          { label: "Action" },
        ]}
        rows={CIWA_ROWS}
      />

      <SectionTitle>3.2 Opioid Component — Buprenorphine-Naloxone (Suboxone) Induction &amp; Taper</SectionTitle>
      <WarningBox>
        CRITICAL: NEVER administer Buprenorphine-Naloxone until COWS ≥ 8 AND patient shows objective signs of opioid withdrawal. Precipitated withdrawal from premature induction causes severe suffering and treatment disengagement. Document COWS score at time of each dose.
      </WarningBox>
      <Table
        cols={[
          { label: "Day", width: "14%" },
          { label: "COWS Criterion", width: "20%" },
          { label: "Buprenorphine-Naloxone Dose", width: "34%" },
          { label: "Notes" },
        ]}
        rows={BUPE_TAPER_ROWS}
      />

      <p style={{ margin: "0.75rem 0 0.5rem", fontWeight: 600 }}>COWS Score Management</p>
      <Table
        cols={[
          { label: "COWS Score", width: "16%", center: true },
          { label: "Severity", width: "20%" },
          { label: "Management" },
        ]}
        rows={COWS_ROWS}
      />
      <WarningBox>
        MAT DECISION (Day 15): MDT must decide at Day 15 whether to (a) continue Buprenorphine-Naloxone as long-term MAT (minimum 6–12 months), (b) transition to Naltrexone after full opioid-free period of 7–10 days, or (c) complete abstinence approach with psychosocial support. Document decision with rationale in case notes.
      </WarningBox>

      <p style={{ margin: "0.75rem 0 0.5rem", fontWeight: 600 }}>Adjunctive Symptomatic Medications — Opioid Withdrawal</p>
      <Table
        cols={[
          { label: "Symptom", width: "24%" },
          { label: "Drug", width: "30%" },
          { label: "Dose", width: "16%" },
          { label: "Duration" },
        ]}
        rows={OPIOID_ADJUNCT_ROWS}
      />

      <SectionTitle>3.3 Stimulant / Cannabis / Inhalant Component — Symptomatic Management</SectionTitle>
      <WarningBox>
        There is no established pharmacological taper for stimulant (cocaine/amphetamine) or cannabis withdrawal. Management is symptomatic. Inhalant withdrawal is supportive. Key risks: post-stimulant dysphoria, severe craving, sleep disruption, and stimulant-induced psychosis.
      </WarningBox>
      <Table
        cols={[
          { label: "Target Symptom", width: "24%" },
          { label: "Drug", width: "28%" },
          { label: "Dose / Timing", width: "16%" },
          { label: "Notes" },
        ]}
        rows={STIMULANT_MGMT_ROWS}
      />
      <WarningBox>
        Cannabis Hyperemesis Syndrome (CHS): If present — haloperidol 5 mg IM PRN, IV fluids, topical capsaicin cream (abdomen). Hot shower compulsion is pathognomonic. Refer to general physician if severe.
      </WarningBox>

      <SectionTitle>3.4 General Supportive Medicines — All Components (Days 1–15)</SectionTitle>
      <Table
        cols={[
          { label: "Drug", width: "30%" },
          { label: "Dose / Route", width: "22%" },
          { label: "Duration", width: "16%" },
          { label: "Indication" },
        ]}
        rows={SUPPORTIVE_MEDS_ROWS}
      />

      <SectionTitle>3.5 Hepatic Encephalopathy Protocol</SectionTitle>
      <WarningBox>
        Trigger: Persistent delirium AND elevated serum ammonia. Activate immediately — notify senior psychiatrist within 30 minutes.
      </WarningBox>
      <Table
        cols={[
          { label: "Drug", width: "26%" },
          { label: "Dose", width: "16%", center: true },
          { label: "Frequency", width: "22%" },
          { label: "Mechanism" },
        ]}
        rows={HEPATIC_ENC_ROWS}
      />

      {/* 4. MONITORING SCHEDULE */}
      <ModuleHeader>4. Monitoring Schedule — Detox Phase (Days 1–15)</ModuleHeader>
      <Table
        cols={[
          { label: "Parameter", width: "28%" },
          { label: "Days 1–5 (Acute)", width: "20%", center: true },
          { label: "Days 6–10 (Active)", width: "20%", center: true },
          { label: "Days 11–15 (Extended)", center: true },
        ]}
        rows={MONITORING_ROWS}
      />

      {/* 5. POST-WITHDRAWAL MAINTENANCE */}
      <ModuleHeader>5. Post-Withdrawal Maintenance — Days 16–90</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        Following the 15-day detox, pharmacotherapy transitions to anticraving agents, MAT (where indicated), treatment of comorbid psychiatric conditions, and nutritional support. Substance-specific agents are selected based on the patient's primary and secondary substance profile.
      </p>
      <Table
        cols={[
          { label: "Substance / Indication", width: "22%" },
          { label: "Drug", width: "28%" },
          { label: "Dose", width: "18%" },
          { label: "Notes" },
        ]}
        rows={MAINTENANCE_ROWS}
      />
      <WarningBox>
        DUAL DIAGNOSIS ALERT: Screen all PSUD patients for comorbid psychiatric disorders at Day 3 and Day 21. Substance-induced vs primary disorders may not be distinguishable until 3–4 weeks of abstinence. Defer definitive psychiatric diagnosis until Day 21 assessment.
      </WarningBox>

      {/* 6. DISCHARGE PRESCRIPTION */}
      <ModuleHeader>6. Discharge Prescription (Day 90)</ModuleHeader>
      <Table
        cols={[
          { label: "Drug", width: "32%" },
          { label: "Dose", width: "20%" },
          { label: "Duration / Notes" },
        ]}
        rows={DISCHARGE_RX_ROWS}
      />
      <WarningBox>
        MAT patients (Buprenorphine-Naloxone): Prescribe 2-week supply at discharge. Link to JRCPL MAT OPD or designated OBOT (Office-Based Opioid Treatment) provider. Document prescriber, pharmacy, and dispensing frequency. Supervised dispensing daily for first 4 weeks if high relapse risk.
      </WarningBox>

      {/* 7. LAB-DEVIATION ADJUSTMENTS */}
      <ModuleHeader>7. Lab-Deviation Adjustments</ModuleHeader>
      <Table
        cols={[
          { label: "Lab Finding", width: "28%" },
          { label: "Protocol Adjustment" },
        ]}
        rows={LAB_DEVIATION_ROWS}
      />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[
          { label: "KPI" },
          { label: "Target", width: "18%", center: true },
          { label: "Review", width: "14%", center: true },
        ]}
        rows={KPI_ROWS}
      />

      {/* 9. APPROVAL */}
      <ProtocolApproval docCode="PS-CL-01-P" docTitle="Polysubstance Use Disorder — 15-Day Detox & 90-Day Programme" />
    </ProtocolWrapper>
  </Fragment>
));

export default PsCl01PPolysubstanceUseDisorder;
