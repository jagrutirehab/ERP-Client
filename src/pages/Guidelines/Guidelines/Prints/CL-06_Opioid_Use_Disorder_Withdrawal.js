import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-06"],
  ["Title", "Opioid Use Disorder & Withdrawal Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "De-Addiction IPD / All JRCPL Centres"],
  ["Rating Scales", "COWS (Clinical Opiate Withdrawal Scale)"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NDPS Act 1985; Narcotic Drugs & Psychotropic Substances Act"],
];

const DIAG_COLS = [
  { label: "Condition", width: "30%" },
  { label: "ICD-11", width: "20%" },
  { label: "DSM-5-TR", width: "15%" },
  { label: "Key Features" },
];

const DIAG_ROWS = [
  ["Opioid Dependence", "6C43.2", "F11.20", "Compulsive use, tolerance, withdrawal on cessation"],
  ["Opioid Intoxication", "6C43.0", "F11.120", "Miosis, CNS/respiratory depression, euphoria"],
  ["Opioid Withdrawal", "6C43.3", "F11.23", "Autonomic arousal, GI distress, myalgia, insomnia"],
  ["Opioid-Induced Mood Disorder", "6C43.7x", "F11.94", "Depressive or anxious episodes in context of OUD"],
];

const HISTORY_COLS = [
  { label: "Domain", width: "25%" },
  { label: "Assessment Content" },
];

const HISTORY_ROWS = [
  ["Substance History", "Primary opioid; route of use (oral, smoked, IV, intranasal); daily dose; duration; last use; concurrent substances"],
  ["Withdrawal History", "Previous withdrawals; seizures; severe episodes; hospitalisation for withdrawal"],
  ["Treatment History", "Prior detoxification attempts; OST history (Buprenorphine / Methadone); relapse pattern"],
  ["Medical History", "HIV status; Hepatitis B/C; TB; liver disease; cardiac arrhythmia; chronic pain syndromes; pregnancy"],
  ["Psychiatric History", "Comorbid depression, anxiety, PTSD, psychosis; current suicidal ideation (C-SSRS)"],
  ["Social & Legal History", "NDPS Act implications; court orders; family support; employment; housing stability"],
];

const COWS_COLS = [
  { label: "Symptom", width: "22%" },
  { label: "0 Points", width: "18%" },
  { label: "1 Point", width: "18%" },
  { label: "2 Points", width: "18%" },
  { label: "4 Points", width: "12%" },
  { label: "5 Points (max)", width: "12%" },
];

const COWS_ROWS = [
  ["Resting Pulse Rate", "≤ 80 bpm", "81–100 bpm", "101–120 bpm", "≥ 121 bpm", "—"],
  ["Sweating (Diaphoresis)", "No sweating", "Subjective only; not observed", "Flushed / damp on forehead", "Beads of sweat on brow or face", "Drenching sweats"],
  ["Restlessness (observed)", "Able to sit still", "Reports difficulty sitting still", "—", "Frequent shifting / unable to stay seated", "Unable to sit still ≥ 10 s"],
  ["Pupil Size", "Normal / constricted to light", "Possibly larger than normal", "Moderately dilated", "—", "Maximally dilated (≥ 5 mm); no reaction"],
  ["Bone / Joint Aches", "Not present", "Mild diffuse aches", "Patient reports severe joint/bone aches", "—", "—"],
  ["Runny Nose / Tearing", "Not present", "Nasal stuffiness / eyes moist", "Nose running / tearing", "—", "Nose constantly running / tears streaming"],
  ["GI Upset (last 30 min)", "No GI symptoms", "Stomach cramps", "Nausea or loose stools", "Vomiting or diarrhoea", "Multiple vomiting / diarrhoea episodes"],
  ["Tremor (observation)", "No tremor", "Tremor felt but not observed", "Slight tremor observable", "—", "Gross tremor / muscle twitching"],
  ["Yawning (observation)", "No yawning", "≤ 1 yawn", "≤ 3 yawns", "≥ 4 yawns / observation", "—"],
  ["Anxiety / Irritability", "None", "Patient reports increasing irritability / anxiety", "Visibly irritable / anxious", "—", "Patient so irritable / anxious that participation is difficult"],
  ["Gooseflesh Skin", "Skin is smooth", "—", "—", "Piloerection of skin can be felt or hairs standing up on arms", "Prominent piloerection"],
];

const COWS_SEVERITY_COLS = [
  { label: "COWS Score", width: "22%", center: true },
  { label: "Severity", width: "25%", center: true },
  { label: "Management" },
];

const COWS_SEVERITY_ROWS = [
  ["5 – 12", "Mild Withdrawal", "Commence Buprenorphine induction; monitor every 4 hrs; adjunct comfort medications as needed"],
  ["13 – 24", "Moderate Withdrawal", "Buprenorphine induction 2–4 mg; re-assess COWS in 1 hr; nursing observations every 2 hrs"],
  ["25 – 36", "Moderately Severe", "Buprenorphine 4–8 mg sublingual; physician review immediately; IV access; cardiac monitoring"],
  ["≥ 37", "Severe Withdrawal", "ESCALATE — Medical Officer + Psychiatrist immediately; consider ICU step-down; IV fluids; continuous monitoring"],
];

const INVEST_ROWS = [
  ["CBC", "Baseline haematology; infection screen", "WBC < 3.0 or > 15.0 × 10⁹/L — flag immediately"],
  ["LFT (AST, ALT, ALP, Bilirubin)", "Liver function; Buprenorphine hepatotoxicity risk", "Any value > 3× ULN — dose-reduce / physician review"],
  ["RFT (Creatinine, BUN, eGFR)", "Renal clearance", "Creatinine > 1.5 mg/dL — adjust dosing"],
  ["HIV (ELISA / Western Blot)", "Mandatory — IV drug use risk", "Reactive → HIV counsellor + ART referral within 24 hrs"],
  ["Hepatitis B Surface Antigen", "HBV screening", "Positive → gastroenterologist referral"],
  ["Anti-HCV (Hepatitis C)", "HCV screening in IV users", "Positive → gastroenterology / hepatology referral"],
  ["Serum Electrolytes (Na⁺, K⁺, Mg²⁺)", "Electrolyte correction", "Na < 130 mEq/L; K < 3.0 mEq/L — correct before proceeding"],
  ["RBS / HbA1c", "Glucose status", "RBS > 200 mg/dL → treat"],
  ["ECG", "QTc baseline (Methadone risk)", "QTc > 450 ms → cardiology alert; avoid Methadone"],
  ["Urine Drug Screen (UDS)", "Confirm opioid use; polydrug screen", "Positive polydrug → modify protocol accordingly"],
  ["Pregnancy Test (females)", "Rule out pregnancy before protocol", "Positive → Obstetrics consult; switch to pregnancy protocol"],
  ["Sputum AFB / Chest X-Ray", "TB screen (HIV co-infection risk)", "Positive → Pulmonologist referral; DOTS initiation"],
];

const INTOX_ROWS = [
  ["Step 1", "Ensure airway patency", "Position patient; jaw thrust if needed"],
  ["Step 2", "Administer Inj. Naloxone 0.4–2 mg IV/IM", "Repeat every 2–3 min up to 10 mg; titrate to respiratory rate > 12/min"],
  ["Step 3", "Monitor vitals every 10 min", "O₂ saturation, RR, BP, GCS"],
  ["Step 4", "Establish IV access", "Infuse normal saline / DNS 1L over 2–4 hrs"],
  ["Step 5", "Contact Medical Officer + Psychiatrist immediately", "Document time of escalation; complete incident form"],
  ["Step 6", "DO NOT initiate Buprenorphine / Methadone", "Only after full recovery from intoxication episode"],
  ["Step 7", "Transfer to ICU if GCS < 12 or RR < 10/min", "Organise ambulance if JRCPL ICU unavailable"],
  ["Step 8", "Document full event in clinical notes within 2 hrs", "Sentinel event → Clinical Director notified within 2 hrs"],
];

const INDUCTION_CRITERIA_ROWS = [
  ["COWS ≥ 8 at time of induction", "Patient must be in objective withdrawal — NOT actively intoxicated"],
  ["Last opioid use ≥ 12 hours ago (short-acting)", "Heroin, Tramadol, Codeine — minimum 12-hr gap"],
  ["Last opioid use ≥ 36–72 hours ago (long-acting)", "Methadone, sustained-release opioids — minimum 36–72 hr gap"],
  ["No acute respiratory depression", "RR > 12/min; O₂ saturation > 94%"],
  ["Informed consent obtained", "Explain risks of precipitated withdrawal; document consent"],
];

const TITRATION_ROWS = [
  ["Day 1", "2–4 mg SL", "Administer first dose in clinic under observation; COWS re-assessed at 1 hr; additional 2 mg if COWS > 8 (max 8 mg/day)"],
  ["Day 2", "4–8 mg SL", "Divide in 2 doses (morning / evening); titrate based on COWS"],
  ["Days 3–5", "8–12 mg SL", "Stabilisation phase; reduce COWS to < 4 before increasing"],
  ["Days 6–10", "12–16 mg SL (max 24 mg)", "Maintenance titration; taper if short-term detox planned"],
  ["Days 11–30", "Individualised taper or OST maintenance", "Taper 1–2 mg per week OR continue on OST per clinical decision"],
];

const ADJUNCT_ROWS = [
  ["Tab. Clonidine 0.1 mg", "Autonomic symptoms (sweating, tachycardia, hypertension)", "0.1 mg TDS PRN; monitor BP before each dose — hold if SBP < 90 mmHg"],
  ["Tab. Loperamide 2 mg", "Diarrhoea", "2 mg after each loose stool; max 16 mg/day"],
  ["Tab. Metoclopramide 10 mg", "Nausea / vomiting", "10 mg TDS PRN; max 30 mg/day"],
  ["Tab. Ibuprofen 400 mg (with PAN 40)", "Myalgia, bone/joint pain", "400 mg TDS with meals; avoid if renal impairment"],
  ["Tab. Hydroxyzine 25 mg / Tab. Promethazine 25 mg", "Insomnia, anxiety, restlessness", "25–50 mg at night PRN"],
  ["Thiamine 100 mg IV / oral", "Nutritional deficiency (polydrug users)", "IV Day 1; then oral 100 mg 1–0–1 × 15 days"],
  ["Oral Rehydration Solution (ORS)", "Dehydration from vomiting / diarrhoea", "Minimum 2L/day; IV fluids if cannot tolerate oral"],
];

const OST_RATIONALE_ROWS = [
  ["Buprenorphine-Naloxone (Suboxone)", "Partial µ-opioid agonist; precipitates withdrawal if injected — abuse deterrent", "First-line OST at JRCPL; 3–6 month minimum course"],
  ["Buprenorphine Monoproduct", "Partial µ-opioid agonist without Naloxone", "Used in pregnancy; supervised administration only"],
  ["Naltrexone (extended-release or oral)", "Full µ-opioid antagonist; blocks euphoria", "Post-detox relapse prevention; NDPS Act compliant; not for active withdrawal"],
];

const OST_DOSING_ROWS = [
  ["Induction", "2–8 mg", "Once or divided", "Supervised — JRCPL clinic", "Days 1–3"],
  ["Stabilisation", "8–16 mg", "Once daily (morning)", "Supervised — JRCPL clinic", "Days 4–30"],
  ["Maintenance", "8–24 mg", "Once daily", "Supervised or take-home (after 30 days stable)", "3–12 months"],
  ["Taper / Cessation", "Reduce 1–2 mg / 2 weeks", "Once daily", "JRCPL + community follow-up", "Individualised"],
];

const OST_MONITORING_ROWS = [
  ["COWS", "Weekly (induction) → monthly (maintenance)", "Document score in clinical notes each visit"],
  ["Urine Drug Screen (UDS)", "Random — minimum 2× per month", "Positive non-prescribed opioid → clinical review + counselling"],
  ["LFT", "Baseline → week 4 → monthly", "Buprenorphine hepatotoxicity monitoring"],
  ["Medication Adherence", "Each dispensing visit", "Pill count / sublingual observation if unsupervised"],
  ["Psychosocial progress", "Monthly MSW + psychology review", "Document in case notes; update treatment plan"],
];

const PREGNANCY_ROWS = [
  ["Preferred Agent", "Buprenorphine monoproduct (avoid Naloxone)", "FDA Category C; considered safer than unmanaged withdrawal in pregnancy"],
  ["Dose", "Individualised; minimum effective dose", "Neonatal Opioid Withdrawal Syndrome (NOWS) risk proportional to dose — minimise but do not abruptly stop"],
  ["Multidisciplinary", "Obstetrics + Psychiatry + Paediatrics", "Paediatric alert at delivery for NOWS monitoring"],
  ["Contraindicated", "Rapid detoxification; Naltrexone", "Risk of preterm labour, foetal distress"],
];

const PSYCH_ROWS = [
  ["Motivational Enhancement Therapy (MET)", "Individual; sessions 1–4; weeks 1–3", "Builds intrinsic motivation; addresses ambivalence", "IA"],
  ["Cognitive Behavioural Therapy (CBT)", "Individual / group; 12–16 sessions", "Craving management; cognitive restructuring; relapse triggers", "IA"],
  ["Contingency Management (CM)", "Throughout admission", "Reward-based reinforcement of drug-free behaviour", "IA"],
  ["12-Step Facilitation (NA)", "Group; weekly ongoing", "Narcotics Anonymous; peer support; sustained abstinence", "IB"],
  ["Family Therapy / Psychoeducation", "Family sessions × 3 (admission, mid, pre-discharge)", "Reduce enabling behaviour; build family recovery capital", "IIA"],
  ["Mindfulness-Based Relapse Prevention (MBRP)", "Group; 8 sessions (from week 2)", "Awareness of cravings without acting; reduces relapse rates", "IIA"],
];

const RELAPSE_ROWS = [
  ["Trigger Mapping", "Patient-identified high-risk situations, persons, places, emotions"],
  ["Coping Skills Plan", "At least 3 coping strategies per high-risk trigger (distraction, urge-surfing, social support)"],
  ["Medication Plan", "Naltrexone OR continued Buprenorphine-Naloxone — patient preference + clinical decision"],
  ["Support Network", "Named responsible family member; NA sponsor; JRCPL aftercare contact number"],
  ["Emergency Plan", "Patient has written plan: what to do on craving / relapse; 24-hr JRCPL helpline number"],
  ["Aftercare Schedule", "Outpatient follow-up dates confirmed before discharge (Month 1, 2, 3, 6, 12)"],
];

const DISCHARGE_ROWS = [
  ["COWS ≤ 4 for ≥ 48 consecutive hours", "Documented in clinical notes"],
  ["Stable on OST or naltrexone if applicable", "Dose confirmed; dispensing pharmacy identified"],
  ["No active medical emergency", "HIV / HCV / TB — treatment plan in place and initiated"],
  ["Discharge prescription written and counselled", "Patient + caregiver understand medication schedule"],
  ["Relapse prevention plan completed and signed", "Copy given to patient; copy filed in case notes"],
  ["Outpatient follow-up appointments confirmed", "Month 1, 2, 3, 6, 12 — dates given in writing"],
  ["NDPS Act documentation complete", "All notifications and registers up to date"],
];

const NDPS_ROWS = [
  ["Buprenorphine / Naltrexone prescription", "Only registered medical practitioners (Form III) under NDPS Rules 1985"],
  ["Patient Register", "Separate narcotic register maintained; inspectable by Narcotic Control Bureau (NCB)"],
  ["Quantity dispensed", "Maximum 30-day supply; no refills without clinic attendance"],
  ["Accidental / suspected diversion", "Document and report to NCB within 24 hrs; incident form filed"],
  ["Patient confidentiality", "HIV / Hepatitis / Drug use — MHCA 2017 Section 23 applies"],
];

const FOLLOWUP_ROWS = [
  ["Outpatient Review (Psychiatrist)", "Week 2, Week 4", "Monthly", "Every 3 months"],
  ["Urine Drug Screen (random)", "2× per month", "Monthly", "Quarterly"],
  ["LFT / RFT monitoring", "Week 4", "Month 2, 4, 6", "6-monthly"],
  ["HIV / HCV (if positive)", "Monthly ART clinic (HIV)", "Per specialist plan", "Per specialist plan"],
  ["Psychology / Counselling", "Weekly sessions", "Fortnightly", "Monthly"],
  ["NA / Support Group", "Weekly (encouraged)", "Weekly", "Weekly"],
  ["MSW / Family Review", "Month 1", "Month 3, 6", "Annual"],
];

const KPI_ROWS = [
  ["COWS documented at admission and each assessment", "≥ 95%", "Monthly"],
  ["Buprenorphine induction within 24 hrs of admission (COWS ≥ 8)", "100%", "Monthly"],
  ["HIV / HCV / Hepatitis B screen completed on all admissions", "100%", "Monthly"],
  ["Naloxone available on ward at all times", "100%", "Weekly audit"],
  ["OST continuation at 3-month follow-up", "≥ 60%", "Quarterly"],
  ["Relapse prevention plan documented at discharge", "100%", "Monthly"],
  ["NDPS Act register up to date and inspectable", "100%", "Monthly"],
  ["Opioid overdose mortality (in-patient)", "0 preventable deaths", "Quarterly"],
  ["30-day unplanned re-admission rate", "< 20%", "Quarterly"],
  ["NA / support group referral at discharge", "≥ 80%", "Monthly"],
];

const Cl06OpioidUseDisorderWithdrawal = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-06"
        title="Opioid Use Disorder &amp; Withdrawal"
        icdLine="ICD-11: 6C43 | DSM-5-TR: F11 | De-Addiction Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol governs inpatient and outpatient management of Opioid Use Disorder (OUD) and opioid withdrawal at JRCPL. It covers assessment (COWS), acute withdrawal management, Buprenorphine induction and Opioid Substitution Therapy (OST), emergency management of intoxication/overdose, special populations (pregnancy, HIV, chronic pain), and NDPS Act 1985 compliance requirements. All prescribing of controlled substances must comply with the Narcotic Drugs and Psychotropic Substances Act 1985 and JRCPL narcotics register protocol.
      </p>
      <BulletList items={[
        "Applies to: All patients admitted to JRCPL De-Addiction Vertical with opioid use disorder as primary or secondary diagnosis",
        "Controlled substances: Buprenorphine, Naltrexone — prescribed on Form III by registered medical practitioners only",
        "Primary opioids in scope: Heroin, Pharmaceutical opioids (Tramadol, Codeine, Morphine, Oxycodone), Synthetic opioids (Fentanyl analogues)",
      ]} />

      {/* 2. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>2. DIAGNOSTIC CLASSIFICATION</ModuleHeader>
      <Table cols={DIAG_COLS} rows={DIAG_ROWS} />

      {/* 3. ADMISSION ASSESSMENT */}
      <ModuleHeader>3. ADMISSION ASSESSMENT</ModuleHeader>
      <SectionTitle>3.1 Clinical History</SectionTitle>
      <Table cols={HISTORY_COLS} rows={HISTORY_ROWS} />

      <SectionTitle>3.2 COWS — Clinical Opiate Withdrawal Scale</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
        Assess COWS at admission, every 4 hours during active withdrawal, and at each clinical review. Score each item — total determines severity and management pathway.
      </p>
      <Table cols={COWS_COLS} rows={COWS_ROWS} />
      <p style={{ margin: "0.5rem 0", fontWeight: "bold", fontSize: "0.9rem" }}>
        COWS Severity &amp; Management Pathway
      </p>
      <Table cols={COWS_SEVERITY_COLS} rows={COWS_SEVERITY_ROWS} />
      <WarningBox>DO NOT initiate Buprenorphine if COWS &lt; 8 or if the patient is actively intoxicated. Precipitated withdrawal is severe and distressing — ensure adequate time since last opioid use before induction.</WarningBox>

      <SectionTitle>3.3 Mandatory Baseline Investigations</SectionTitle>
      <Table
        cols={[{ label: "Investigation", width: "30%" }, { label: "Purpose", width: "32%" }, { label: "Alert Threshold" }]}
        rows={INVEST_ROWS}
      />

      {/* 4. OPIOID INTOXICATION EMERGENCY */}
      <ModuleHeader>4. OPIOID INTOXICATION / OVERDOSE EMERGENCY PROTOCOL</ModuleHeader>
      <WarningBox>LIFE-THREATENING EMERGENCY: Opioid overdose presents with miosis, unconsciousness, and respiratory depression (RR &lt; 12/min). Activate emergency protocol IMMEDIATELY.</WarningBox>
      <Table
        cols={[{ label: "Step", width: "8%", center: true }, { label: "Action", width: "40%" }, { label: "Notes" }]}
        rows={INTOX_ROWS}
      />

      {/* 5. OPIOID WITHDRAWAL MANAGEMENT */}
      <ModuleHeader>5. OPIOID WITHDRAWAL MANAGEMENT</ModuleHeader>
      <SectionTitle>5.1 Buprenorphine Induction — Eligibility Criteria</SectionTitle>
      <Table
        cols={[{ label: "Criterion", width: "45%" }, { label: "Rationale / Minimum Standard" }]}
        rows={INDUCTION_CRITERIA_ROWS}
      />

      <SectionTitle>5.2 Buprenorphine Dose Titration Schedule</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
        All doses sublingual (SL). Use Buprenorphine-Naloxone (Suboxone) unless pregnancy — then use Buprenorphine monoproduct.
      </p>
      <Table
        cols={[{ label: "Day(s)", width: "15%" }, { label: "Dose", width: "18%" }, { label: "Notes" }]}
        rows={TITRATION_ROWS}
      />
      <WarningBox>Maximum daily dose: 24 mg. Doses above 16 mg require senior psychiatrist review. Document each dose in the NDPS narcotics register.</WarningBox>

      <SectionTitle>5.3 Adjunct Symptom-Specific Medications</SectionTitle>
      <Table
        cols={[{ label: "Drug", width: "30%" }, { label: "Target Symptom", width: "28%" }, { label: "Dosing / Notes" }]}
        rows={ADJUNCT_ROWS}
      />

      <SectionTitle>5.4 Clonidine-Only Alternative (if Buprenorphine unavailable)</SectionTitle>
      <BulletList items={[
        "Tab. Clonidine 0.1–0.2 mg every 6 hours (max 0.8–1.2 mg/day) — titrate to withdrawal symptoms",
        "Hold dose if systolic BP < 90 mmHg; nurse must check BP before every dose",
        "Use only if Buprenorphine is genuinely contraindicated or unavailable — Buprenorphine is PREFERRED",
        "Clonidine does NOT prevent seizures — add Clonazepam 0.5–1 mg TDS if seizure risk is high",
        "Taper Clonidine over 3–5 days once withdrawal stabilised; do not stop abruptly",
      ]} />

      {/* 6. OPIOID SUBSTITUTION THERAPY (OST) */}
      <ModuleHeader>6. OPIOID SUBSTITUTION THERAPY (OST)</ModuleHeader>
      <SectionTitle>6.1 OST Rationale &amp; JRCPL Pathway</SectionTitle>
      <Table
        cols={[{ label: "OST Approach", width: "35%" }, { label: "Mechanism", width: "32%" }, { label: "JRCPL Pathway" }]}
        rows={OST_RATIONALE_ROWS}
      />
      <CalloutBox>
        OST is evidence-based harm reduction and reduces opioid overdose mortality, HIV transmission, and criminal activity. It is not "substituting one drug for another" — it is a medical treatment for a chronic brain disorder. Staff must use non-stigmatising language at all times.
      </CalloutBox>

      <SectionTitle>6.2 Buprenorphine-Naloxone Dosing — OST Programme</SectionTitle>
      <Table
        cols={[
          { label: "Phase", width: "20%" },
          { label: "Dose Range", width: "18%" },
          { label: "Frequency", width: "15%" },
          { label: "Setting", width: "25%" },
          { label: "Duration" },
        ]}
        rows={OST_DOSING_ROWS}
      />

      <SectionTitle>6.3 OST Monitoring Requirements</SectionTitle>
      <Table
        cols={[{ label: "Parameter", width: "25%" }, { label: "Frequency", width: "32%" }, { label: "Action on Concern" }]}
        rows={OST_MONITORING_ROWS}
      />

      {/* 7. SPECIAL POPULATIONS */}
      <ModuleHeader>7. SPECIAL POPULATIONS</ModuleHeader>
      <SectionTitle>7.1 Pregnancy</SectionTitle>
      <WarningBox>Abrupt opioid withdrawal in pregnancy carries risk of foetal distress, preterm labour, and intrauterine death. Detoxification without OST in pregnancy is NOT recommended.</WarningBox>
      <Table
        cols={[{ label: "Consideration", width: "25%" }, { label: "Standard", width: "38%" }, { label: "Rationale" }]}
        rows={PREGNANCY_ROWS}
      />

      <SectionTitle>7.2 HIV Co-infection</SectionTitle>
      <BulletList items={[
        "OST (Buprenorphine) reduces HIV transmission by eliminating IV drug use — prioritise OST enrolment",
        "ART should not be interrupted — coordinate with treating physician for ART initiation/continuation",
        "Drug interactions: Rifampicin (TB treatment) reduces Buprenorphine levels by 50–70% — increase Buprenorphine dose accordingly",
        "Ritonavir (antiretroviral) increases Buprenorphine levels — reduce Buprenorphine dose and monitor for sedation",
        "Refer to HIV counsellor within 24 hrs of positive test; partner notification counselling to be offered",
      ]} />

      <SectionTitle>7.3 Chronic Pain Comorbidity</SectionTitle>
      <BulletList items={[
        "Buprenorphine at analgesic doses (0.2–0.4 mg SL TDS) may provide partial pain relief alongside OUD treatment",
        "Avoid NSAIDS in patients with renal impairment — use Paracetamol 500–1000 mg TDS as first-line",
        "Non-pharmacological pain management: physiotherapy, TENS, heat therapy — involve rehabilitation team",
        "Opioid analgesics other than Buprenorphine are contraindicated during OUD treatment — document refusal in notes",
      ]} />

      <SectionTitle>7.4 Tramadol Dependence (Special Consideration)</SectionTitle>
      <BulletList items={[
        "Tramadol has both opioid and serotonergic mechanisms — COWS may under-represent withdrawal severity",
        "Serotonin syndrome risk: avoid Tramadol + SSRI/SNRI co-administration — review all psychotropics",
        "Tramadol withdrawal may include atypical features: confusion, anxiety, perceptual disturbances",
        "Standard Buprenorphine induction protocol applies — COWS ≥ 8, gap ≥ 12 hrs from last Tramadol dose",
        "Monitor for seizures — Tramadol lowers seizure threshold; consider prophylactic Levetiracetam 250 mg BD × 7 days",
      ]} />

      {/* 8. PSYCHOLOGICAL INTERVENTIONS */}
      <ModuleHeader>8. PSYCHOLOGICAL INTERVENTIONS</ModuleHeader>
      <Table
        cols={[
          { label: "Intervention", width: "28%" },
          { label: "Format / Sessions", width: "25%" },
          { label: "Focus", width: "30%" },
          { label: "Evidence", width: "8%", center: true },
        ]}
        rows={PSYCH_ROWS}
      />

      {/* 9. RELAPSE PREVENTION PLAN */}
      <ModuleHeader>9. RELAPSE PREVENTION PLAN</ModuleHeader>
      <Table
        cols={[{ label: "Component", width: "28%" }, { label: "Content" }]}
        rows={RELAPSE_ROWS}
      />

      {/* 10. DISCHARGE CRITERIA */}
      <ModuleHeader>10. DISCHARGE CRITERIA</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "55%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />

      {/* 11. NDPS ACT 1985 COMPLIANCE */}
      <ModuleHeader>11. NDPS ACT 1985 COMPLIANCE</ModuleHeader>
      <Table
        cols={[{ label: "Requirement", width: "42%" }, { label: "Standard" }]}
        rows={NDPS_ROWS}
      />

      {/* 12. FOLLOW-UP SCHEDULE */}
      <ModuleHeader>12. POST-DISCHARGE FOLLOW-UP SCHEDULE</ModuleHeader>
      <Table
        cols={[
          { label: "Component", width: "28%" },
          { label: "Month 1", width: "18%" },
          { label: "Months 2–6", width: "18%" },
          { label: "After 6 Months" },
        ]}
        rows={FOLLOWUP_ROWS}
      />

      {/* 13. KPIs */}
      <ModuleHeader>13. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "16%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-06" docTitle="Opioid Use Disorder & Withdrawal" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl06OpioidUseDisorderWithdrawal;
