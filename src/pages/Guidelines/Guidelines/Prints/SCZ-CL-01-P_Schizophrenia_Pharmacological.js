import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApprovalNew, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "SCZ-CL-01-P"],
  ["Title", "Pharmacological Protocol — Schizophrenia Spectrum Disorders, 90-Day Programme"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Programme Duration", "90 Days — Acute Stabilisation (D1–15) · Consolidation (D16–45) · Maintenance Prep (D46–90)"],
  ["Diagnoses Covered", "Schizophrenia (6A20), Schizoaffective Disorder (6A21), Schizophreniform (6A22), Delusional Disorder (6A24), Acute & Transient Psychotic Disorder (6A23)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Regulatory Basis", "MHCA 2017 · NABH COP · WHO Schizophrenia Treatment Guidelines 2023"],
];

const CLINICAL_ASSESSMENT_ROWS = [
  ["Psychiatric diagnosis", "ICD-11 clinical interview; mental state examination (MSE)", "Day 1", "Psychiatrist"],
  ["Psychosis severity", "PANSS (Positive and Negative Syndrome Scale)", "Day 1", "Psychiatrist / Psychologist"],
  ["Clinical global severity", "CGIS (Clinical Global Impression — Severity)", "Day 1", "Psychiatrist"],
  ["Suicide / self-harm risk", "Columbia Suicide Severity Rating Scale (C-SSRS)", "Day 1", "Psychiatrist"],
  ["Violence / aggression risk", "STAMP / HCR-20 brief screen", "Day 1", "Psychiatrist"],
  ["Cognitive function", "MoCA / RBANS Brief", "Day 3", "Psychologist"],
  ["Social / functional", "GAF (Global Assessment of Functioning)", "Day 3", "Psychologist / MSW"],
  ["Insight & medication attitude", "ITAQ (Insight and Treatment Attitudes Questionnaire)", "Day 3–5", "Psychologist"],
  ["Involuntary movements (baseline)", "AIMS (Abnormal Involuntary Movement Scale)", "Day 1", "Psychiatrist"],
  ["Substance use comorbidity", "AUDIT, ASSIST", "Day 2–3", "Psychologist"],
  ["Trauma history", "ACE (Adverse Childhood Experiences)", "Day 5", "Psychologist"],
  ["Family history & social history", "Structured clinical interview + MSW assessment", "Day 2–4", "MSW"],
  ["Neurological examination", "Full cranial nerve exam; extrapyramidal screen", "Day 1", "Psychiatrist"],
  ["Quality of life", "S-QoL 18 (Schizophrenia Quality of Life)", "Day 5", "Psychologist"],
];

const BASELINE_INV_ROWS = [
  ["CBC", "Baseline; agranulocytosis screen (Clozapine)", "WBC < 3.5 × 10⁹/L — do NOT initiate Clozapine"],
  ["LFT", "Hepatotoxicity; drug metabolism", "> 3× ULN — review drug choice"],
  ["RFT + Serum Electrolytes", "Renal clearance; paliperidone dosing; QTc risk", "Creatinine > 1.5 mg/dL; Na < 130 mEq/L"],
  ["Fasting glucose + lipid profile", "Metabolic baseline before any antipsychotic", "FBG > 100 mg/dL; TG > 150 mg/dL — lifestyle plan"],
  ["HbA1c", "Diabetes screening (antipsychotic metabolic risk)", "HbA1c > 6.5% → endocrinology referral"],
  ["Thyroid function (TSH, T4)", "Rule out thyroid-mediated psychosis", "Abnormal → endocrinology; adjust differential diagnosis"],
  ["Serum Prolactin", "Baseline before prolactin-elevating antipsychotics", "> 2× ULN at baseline → document; recheck at Day 30"],
  ["Vitamin B12 + Folate + Iron studies", "Nutritional deficiency-related cognitive symptoms", "Low → supplement; recheck at Day 30"],
  ["ECG (12-lead)", "QTc baseline before QTc-prolonging antipsychotics", "QTc > 450 ms → cardiology review before antipsychotic"],
  ["Urine Drug Screen", "Substance-induced psychosis differentiation", "Positive → revise formulation; co-manage SUD"],
  ["CT / MRI Brain", "First episode psychosis — rule out organic cause", "Space-occupying lesion / stroke → neurology"],
  ["EEG", "Rule out encephalitis, epilepsy-related psychosis", "Abnormal → neurology"],
  ["HIV, VDRL (syphilis), TB screen", "Infective causes of psychosis", "Positive → ID / infectious disease referral"],
  ["Urine pregnancy test (females)", "Contraindication / safety mapping for pharmacotherapy", "Positive → OB-GYN co-management; revise antipsychotic"],
  ["Serum Copper + Caeruloplasmin", "Rule out Wilson's disease (especially young first-episode)", "Abnormal → hepatology / neurology"],
];

const ANTIPSYCHOTIC_ROWS = [
  ["Risperidone", "FGA/SGA", "2–6 mg/day", "1–0–1 or 0–0–1", "EPS, prolactin ↑, weight gain", "EPS risk; preferred in resource-limited settings"],
  ["Olanzapine", "SGA", "10–20 mg/day", "0–0–1", "Weight gain, metabolic syndrome, sedation", "Most sedating SGA; useful in agitation + insomnia"],
  ["Quetiapine", "SGA", "300–800 mg/day", "BD or 0–0–1", "Sedation, metabolic, orthostasis", "Good for comorbid anxiety/mood symptoms"],
  ["Amisulpride", "SGA", "400–800 mg/day", "BD", "QTc ↑, prolactin ↑ (strong)", "Particularly effective for negative symptoms"],
  ["Aripiprazole", "SGA-DPA", "10–30 mg/day", "1–0–0", "Akathisia, insomnia, nausea", "Low metabolic burden; useful in metabolically vulnerable"],
  ["Clozapine", "SGA", "200–450 mg/day", "BD or TDS", "Agranulocytosis — mandatory WBC monitoring; metabolic, hypersalivation, seizure", "Treatment-resistant schizophrenia only; REMS/monitoring programme mandatory"],
  ["Paliperidone ER", "SGA", "6–12 mg/day", "1–0–0", "EPS, prolactin ↑, QTc", "Renal excretion — dose reduce in renal impairment"],
  ["Haloperidol", "FGA", "5–20 mg/day", "BD or TDS", "EPS, tardive dyskinesia, NMS risk", "Reserve for acute agitation; IM available; avoid long-term monotherapy if SGA available"],
];

const TITRATION_ROWS = [
  ["Days 1–3", "Acute stabilisation", "Begin at lowest effective dose. Prioritise safety and de-escalation. IM antipsychotic if acute agitation (Haloperidol 5 mg IM + Promethazine 25 mg IM PRN)."],
  ["Days 4–7", "Dose optimisation (I)", "Titrate upward every 2–3 days per clinical response and tolerability. PANSS/CGIS at Day 7 to guide titration direction."],
  ["Days 8–14", "Dose optimisation (II)", "Reach target therapeutic dose range. Begin anticholinergic cover if EPS emerges. ECG if QTc concern."],
  ["Days 15–30", "Stabilisation plateau", "Hold at therapeutic dose; reassess at Day 30 PANSS. Consider LAI initiation at Day 21–30 if compliance concern."],
  ["Days 31–60", "Consolidation", "Dose adjustment as needed per PANSS trend. If inadequate response (< 20% PANSS improvement by Day 45), consider augmentation or switch."],
  ["Days 61–90", "Maintenance & planning", "Establish maintenance dose. If LAI initiated, titrate depot and taper oral by Day 75. Finalise discharge prescription. Discuss depot vs oral preference."],
];

const AGITATION_ROWS = [
  ["Mild–moderate agitation (oral)", "Tab. Lorazepam 1–2 mg OR Tab. Olanzapine 5–10 mg", "PO", "q4–6h PRN", "10 mg Lorazepam; 30 mg Olanzapine", "Oral preferred if patient cooperative"],
  ["Moderate agitation (IM)", "Inj. Haloperidol 5 mg + Inj. Promethazine 25 mg", "IM", "q4–6h PRN", "Haloperidol 20 mg", "Promethazine reduces EPS and adds sedation"],
  ["Severe agitation (IM)", "Inj. Olanzapine 10 mg IM OR Inj. Ziprasidone 10–20 mg IM", "IM", "q2–4h PRN", "Olanzapine 30 mg", "DO NOT combine IM olanzapine + benzodiazepine IM — respiratory arrest risk"],
  ["Refractory agitation", "Inj. Droperidol 5–10 mg IM (if available) OR Inj. Ketamine 1–2 mg/kg IM (anaesthesia-supervised)", "IM", "Single dose", "Per protocol", "Senior psychiatrist + medical officer presence required"],
];

const LAI_ROWS = [
  ["Risperidone LAI (Risperdal Consta)", "25–50 mg IM", "Every 2 weeks", "Continue oral for 3 weeks after first injection", "Preferred LAI for non-treatment-resistant; initiate by Day 30 if oral compliance poor"],
  ["Paliperidone Palmitate (Invega Sustenna)", "75–150 mg IM", "Monthly (after 2 loading doses)", "Day 1 and Day 8 loading doses", "Once-monthly; superior compliance; can overlap with oral if needed"],
  ["Aripiprazole Monohydrate (Abilify Maintena)", "400 mg IM", "Monthly", "Continue oral aripiprazole 10–20 mg × 14 days", "Low metabolic risk depot; akathisia monitoring"],
  ["Haloperidol Decanoate", "50–200 mg IM", "Every 4 weeks", "Oral haloperidol overlap 1 month", "FGA depot; reserve if SGA LAI unavailable or failed"],
  ["Zuclopenthixol Decanoate", "200–500 mg IM", "Every 2–4 weeks", "Test dose 100 mg; observe 5–7 days", "FGA; cost-effective in resource-limited settings"],
];

const CLOZAPINE_ROWS = [
  ["Day 1 (initiation)", "12.5–25 mg OD at night", "WBC + ANC baseline mandatory before any clozapine dose"],
  ["Days 2–4", "25–50 mg nocte", "Monitor for hypotension, sedation, hypersalivation"],
  ["Days 5–7", "75–100 mg nocte or BD", "WBC Day 7"],
  ["Days 8–14", "100–200 mg BD", "Titrate every 3–4 days; sedation guide"],
  ["Days 15–30", "200–350 mg BD-TDS", "WBC weekly for 18 weeks; fasting glucose weekly"],
  ["Days 31–60", "Optimal therapeutic dose 200–450 mg/day", "Weekly WBC; target serum clozapine 350–600 ng/mL"],
  ["Days 61–90", "Maintenance dose", "WBC weekly (first 18 weeks); fortnightly thereafter; document REMS"],
];

const ADJUNCTIVE_ROWS = [
  ["Mood symptoms / bipolar-type features", "Lithium 300 mg OR Valproate 500 mg", "BD-TDS (Lithium); BD (Valproate)", "Monitor serum levels (Lithium 0.6–0.8 mEq/L); LFT/CBC (Valproate)"],
  ["Persistent agitation / hostility", "Lorazepam 1–2 mg OR Promethazine 25 mg", "PRN oral / IM", "Short-term only; de-escalation preferred; avoid long-term BDZ in schizophrenia"],
  ["Extrapyramidal symptoms (EPS)", "Trihexyphenidyl 2–4 mg OR Benztropine 1–2 mg", "BD", "Anti-EPS; only if EPS present — do not use prophylactically routinely"],
  ["Akathisia", "Propranolol 10–20 mg OR Clonazepam 0.5 mg", "BD PRN", "Propranolol preferred; reassess antipsychotic dose first"],
  ["Insomnia", "Mirtazapine 15 mg OR Promethazine 25 mg", "0–0–1", "Avoid BDZ as long-term sleep aids; address sleep hygiene simultaneously"],
  ["Negative symptom augmentation", "Aripiprazole 5–15 mg add-on (if on another SGA)", "1–0–0", "Evidence-based augmentation for persistent negative symptoms"],
  ["Comorbid depression (post-psychotic)", "SSRI — Sertraline 50 mg OR Escitalopram 10 mg", "1–0–0", "Start Day 21 onwards only; rule out depressive symptoms from negative symptoms"],
  ["Comorbid OCD (antipsychotic-induced)", "Fluvoxamine 50–100 mg OR Sertraline 50 mg", "BD", "Clozapine particularly associated with OCD; reduce clozapine if possible first"],
  ["Treatment-resistant positive symptoms", "Clozapine (initiation requires senior psychiatrist sanction)", "Titrate per protocol", "Trial after two antipsychotic failures of adequate dose and duration"],
  ["NMS (Neuroleptic Malignant Syndrome)", "STOP ALL ANTIPSYCHOTICS — Dantrolene / Bromocriptine", "ICU protocol", "Emergency. Hyperpyrexia + rigidity + autonomic instability + ↑CPK = NMS. ICU transfer."],
];

const METABOLIC_ROWS = [
  ["Olanzapine", "HIGH", "HIGH", "HIGH", "MODERATE", "Intensive monitoring from Day 1; dietary counselling mandatory"],
  ["Quetiapine", "MODERATE", "HIGH", "MODERATE", "LOW", "Fasting glucose monthly; lipid panel quarterly"],
  ["Clozapine", "HIGH", "HIGH", "HIGH", "HIGH", "Weekly FBG first month; monthly thereafter; dietician referral"],
  ["Risperidone", "LOW", "MODERATE", "MODERATE", "HIGH", "Prolactin-related: monitor for sexual dysfunction, bone density concern"],
  ["Aripiprazole", "LOW", "LOW", "LOW", "MODERATE", "Preferred in metabolically vulnerable; akathisia monitoring"],
  ["Amisulpride", "LOW", "LOW", "LOW", "HIGH", "QTc monitoring; prolactin monitoring; ECG at baseline + Day 30"],
  ["Paliperidone", "LOW", "MODERATE", "MODERATE", "HIGH", "Renal dose adjustment required"],
  ["Haloperidol", "LOW", "LOW", "LOW", "HIGH", "EPS + AIMS monitoring; TD risk with long-term use"],
];

const MONITORING_ROWS = [
  ["Vitals (BP, HR, Temp, Weight)", "Daily (Days 1–7)", "3×/week (Days 8–30)", "Weekly (Days 31–90)"],
  ["Fasting glucose + lipids", "Day 1 (baseline)", "Day 30", "Day 60, Day 90"],
  ["Weight + BMI + waist circumference", "Day 1", "Monthly", "Day 30, 60, 90"],
  ["ECG (QTc monitoring)", "Day 1", "Day 14 (if QTc concern)", "Day 45, Day 90 or any drug change"],
  ["LFT", "Day 1", "Day 30 (if abnormal)", "Day 60, Day 90"],
  ["RFT + electrolytes", "Day 1", "Day 30", "Day 60 if Lithium or renal concern"],
  ["CBC", "Day 1", "Weekly if Clozapine", "Monthly (Clozapine); quarterly (others)"],
  ["Serum Lithium level", "—", "Day 5–7 after start", "Every 3 months; after any dose change"],
  ["Serum Valproate level", "—", "Day 7 after start", "Every 3 months"],
  ["Prolactin level", "Day 1", "Day 30", "Day 90 (if symptoms of hyperprolactinaemia)"],
  ["AIMS (tardive dyskinesia)", "Day 1 (baseline)", "Day 45", "Day 90; then 6-monthly"],
  ["PANSS assessment", "Day 1", "Day 30", "Day 60, Day 90"],
  ["CGIS (Clinical Global Impression)", "Day 1 (baseline)", "Day 14, Day 30", "Monthly"],
  ["Cognitive screen (MoCA / RBANS)", "Day 3", "Day 45", "Day 90"],
];

const DISCHARGE_RX_ROWS = [
  ["Antipsychotic (oral) — as optimised during admission", "Individualised therapeutic dose", "Long-term (minimum 1–2 years first episode; 5+ years multiple episodes)"],
  ["OR Antipsychotic LAI — if initiated during admission", "As per LAI schedule (2-weekly/monthly)", "Confirm prescribing arrangement with receiving psychiatrist"],
  ["Anti-EPS agent (if required)", "Trihexyphenidyl 2 mg BD", "Review need at 3 months; taper if EPS resolved"],
  ["Mood stabiliser (if indicated)", "Lithium / Valproate as prescribed", "Continue with serum level monitoring OPD"],
  ["SSRI (if comorbid depression confirmed)", "As prescribed", "Review at 6-week OPD"],
  ["Nutritional supplement (if metabolic concern)", "Metformin 500 mg BD (if weight gain > 7% or glucose ↑)", "Endocrinology / GP co-management"],
];

const LAB_DEVIATION_ROWS = [
  ["QTc > 450 ms", "Avoid amisulpride, haloperidol, ziprasidone, high-dose any antipsychotic. Electrolyte correction. Cardiology consult. Consider aripiprazole or quetiapine lower dose."],
  ["LFT > 3× ULN", "Avoid hepatically metabolised drugs at standard dose. Clozapine — reduce dose by 30–50%. Olanzapine — reduce. Aripiprazole — use caution. Hepatology consult."],
  ["eGFR < 30", "Paliperidone: maximum 3 mg/day (primarily renal). Amisulpride: halve dose. Lithium: avoid or very closely monitor with levels every 2–3 days. Renal team review."],
  ["WBC < 3.5 × 10⁹/L", "Do NOT initiate Clozapine. If on Clozapine: STOP. Haematology referral. Use alternative antipsychotic."],
  ["Fasting glucose > 7.0 mmol/L (126 mg/dL)", "Endocrinology consult. Prefer aripiprazole or quetiapine low-dose. Avoid olanzapine, clozapine. Initiate Metformin if confirmed T2DM. Dietician."],
  ["Thyroid abnormality", "Correct thyroid before committing to antipsychotic dose. Lithium-associated hypothyroidism: T4 supplementation; continue Lithium if otherwise effective."],
  ["Pregnancy", "Preferred agents: haloperidol (best safety data), low-dose quetiapine, low-dose olanzapine. Avoid valproate (teratogenic — FDA cat D/X). Avoid clozapine (neonatal withdrawal, metabolic). OB-GYN co-management mandatory."],
  ["Hyperprolactinaemia (symptomatic)", "Switch to aripiprazole or quetiapine. If must continue prolactin-raising antipsychotic: add aripiprazole 5–15 mg as augment. Bone density screen if prolonged."],
  ["NMS (suspected)", "STOP ALL ANTIPSYCHOTICS IMMEDIATELY. Transfer to medical ward / ICU. Dantrolene 2.5 mg/kg IV q6h + Bromocriptine 2.5 mg TDS. Supportive care. Document; do not rechallenge with same antipsychotic."],
];

const KPI_ROWS = [
  ["PANSS documented at admission, Day 30, Day 60, Day 90", "100%", "Monthly"],
  ["Metabolic monitoring (weight, fasting glucose) at all 3 checkpoints", "100%", "Monthly"],
  ["AIMS documented at admission and Day 90", "100%", "Monthly"],
  ["Clozapine WBC protocol compliance (if initiated)", "100% weekly", "Monthly"],
  ["LAI initiated in compliance-concern patients by Day 30", "≥ 80%", "Quarterly"],
  ["ECG baseline and QTc within normal limits before QTc-prolonging agent", "100%", "Monthly"],
  ["30-day post-discharge antipsychotic continuation rate", "≥ 90%", "Quarterly"],
  ["Hospital readmission within 90 days post-discharge", "< 20%", "Quarterly"],
  ["CGIS improvement ≥ 2 points by Day 90", "≥ 75% of patients", "Quarterly"],
];

const SczCl01PSchizophreniaPharmacological = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="SCZ-CL-01-P"
        title="Pharmacological Protocol — Schizophrenia Spectrum Disorders"
        icdLine="ICD-11: 6A20–6A25 | DSM-5-TR: F20–F29 | Acute Stabilisation + Consolidation + Maintenance Planning | 90-Day Programme"
        org="jagrutii"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol governs the pharmacological management of adults admitted to JRCPL's Psychiatric Care Vertical with Schizophrenia Spectrum Disorders (SSD). The 90-day programme is structured across three clinical phases: Acute Stabilisation (Days 1–15), Consolidation (Days 16–45), and Maintenance Planning (Days 46–90). All pharmacotherapy decisions must be individualised, documented with clinical rationale, and reviewed at each MDT checkpoint.
      </p>
      <CalloutBox>
        MHCA 2017 NOTE: Informed consent for antipsychotic medication (MED-CON-F-001) including specific consent for LAI and Clozapine must be obtained from the patient or their Nominated Representative/LAR. Capacity assessment (CL-01A / CAP-F-001) is mandatory if consent is in doubt. Emergency treatment under §94 MHCA 2017 requires contemporaneous documentation with the treating psychiatrist's signature.
      </CalloutBox>

      {/* 2. ADMISSION ASSESSMENT */}
      <ModuleHeader>2. Admission Assessment</ModuleHeader>

      <SectionTitle>2.1 Clinical &amp; Safety Assessment</SectionTitle>
      <Table
        cols={[
          { label: "Assessment Domain", width: "26%" },
          { label: "Tool / Method", width: "32%" },
          { label: "Timing", width: "12%", center: true },
          { label: "By" },
        ]}
        rows={CLINICAL_ASSESSMENT_ROWS}
      />

      <SectionTitle>2.2 Mandatory Baseline Investigations</SectionTitle>
      <Table
        cols={[
          { label: "Investigation", width: "26%" },
          { label: "Purpose", width: "36%" },
          { label: "Alert Threshold" },
        ]}
        rows={BASELINE_INV_ROWS}
      />
      <WarningBox>
        FIRST-EPISODE PSYCHOSIS WORKUP: All first-episode psychosis patients require CT/MRI brain, EEG, VDRL, HIV, autoimmune panel (ANA, anti-NMDAR antibodies if available), and thyroid screen BEFORE confirming a primary schizophrenia diagnosis. Organic causes must be systematically excluded.
      </WarningBox>

      {/* 3. ANTIPSYCHOTIC SELECTION */}
      <ModuleHeader>3. Antipsychotic Selection — First-Line Agents</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        Selection of antipsychotic is guided by symptom profile, prior treatment history, side-effect tolerance, metabolic risk, cardiac risk, and patient preference (documented in case notes). Second-generation antipsychotics (SGAs) are preferred for first-line treatment.
      </p>
      <Table
        cols={[
          { label: "Agent", width: "14%" },
          { label: "Class", width: "9%", center: true },
          { label: "Dose Range", width: "12%", center: true },
          { label: "Dosing", width: "13%", center: true },
          { label: "Key Side Effects", width: "26%" },
          { label: "Clinical Notes" },
        ]}
        rows={ANTIPSYCHOTIC_ROWS}
      />
      <CalloutBox>
        TREATMENT SELECTION DECISION TREE: (1) First episode, no prior history → Risperidone or Aripiprazole (metabolically favourable). (2) Dominant negative symptoms → Amisulpride or Aripiprazole. (3) Agitation + insomnia prominent → Olanzapine or Quetiapine. (4) High relapse risk / compliance concern → LAI from Day 21. (5) Two adequate antipsychotic trials failed → Clozapine. (6) Schizoaffective → Antipsychotic + Mood Stabiliser.
      </CalloutBox>
      <WarningBox>
        ANTIPSYCHOTIC SWITCHING: Never abruptly switch antipsychotics. Use a cross-taper method — gradually reduce outgoing drug over 2–4 weeks while titrating incoming drug. Document rationale for switch in case notes. Monitor for cholinergic rebound, withdrawal dyskinesia, and rebound psychosis.
      </WarningBox>

      {/* 4. DOSE TITRATION */}
      <ModuleHeader>4. Dose Titration Schedule — 90-Day Framework</ModuleHeader>
      <Table
        cols={[
          { label: "Phase", width: "13%", center: true },
          { label: "Period", width: "22%" },
          { label: "Protocol" },
        ]}
        rows={TITRATION_ROWS}
      />

      {/* 5. ACUTE AGITATION */}
      <ModuleHeader>5. Acute Agitation Management (Days 1–7)</ModuleHeader>
      <WarningBox>
        Use de-escalation techniques as first intervention (verbal, environmental, positioning). Pharmacological intervention only if de-escalation fails or patient poses imminent risk. Document all restraint and rapid tranquillisation episodes using RST-F-001 / SIL-F-001 forms.
      </WarningBox>
      <Table
        cols={[
          { label: "Scenario", width: "18%" },
          { label: "Drug", width: "28%" },
          { label: "Route", width: "7%", center: true },
          { label: "Interval", width: "11%", center: true },
          { label: "Max Daily", width: "14%" },
          { label: "Notes" },
        ]}
        rows={AGITATION_ROWS}
      />
      <WarningBox>
        DO NOT administer IM Olanzapine and IM/IV Benzodiazepine within 1 hour of each other — risk of fatal respiratory depression and cardiovascular collapse. Ensure resuscitation equipment available whenever rapid tranquillisation is used.
      </WarningBox>

      {/* 6. LAI */}
      <ModuleHeader>6. Long-Acting Injectable (LAI) Antipsychotics</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        LAI antipsychotics are recommended when there is: (a) known history of non-adherence, (b) multiple relapses secondary to non-compliance, (c) patient preference, or (d) inability to reliably supervise oral medication. Initiation should occur by Day 21–30 if clinically indicated. Separate written consent is required.
      </p>
      <Table
        cols={[
          { label: "LAI Agent", width: "24%" },
          { label: "Starting Dose", width: "13%", center: true },
          { label: "Frequency", width: "15%", center: true },
          { label: "Oral Overlap Required", width: "22%" },
          { label: "Notes" },
        ]}
        rows={LAI_ROWS}
      />
      <CalloutBox>
        LAI CONSENT: Separate informed consent (MED-CON-F-001 addendum) for LAI must be obtained. Documented discussion must include: mechanism, injection schedule, side effects, and what to do if a dose is missed. First LAI dose should ideally be given at least 1 week before planned discharge to allow monitoring of initial response.
      </CalloutBox>

      {/* 7. CLOZAPINE */}
      <ModuleHeader>7. Clozapine Protocol — Treatment-Resistant Schizophrenia</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem" }}>
        Clozapine is indicated only after documented failure of at least two adequate antipsychotic trials (adequate = therapeutic dose × 6 weeks each, with documented adherence). Must be sanctioned by the Clinical Director or Cluster Head Psychiatrist.
      </p>
      <WarningBox>
        CLOZAPINE HAEMATOLOGICAL RISK: Agranulocytosis occurs in ~1–2% of patients. MANDATORY: WBC + ANC before initiation; weekly WBC for 18 weeks; fortnightly for 1 year; monthly thereafter. STOP CLOZAPINE IMMEDIATELY if WBC &lt; 3.0 × 10⁹/L or ANC &lt; 1.5 × 10⁹/L. Document in REMS register.
      </WarningBox>
      <Table
        cols={[
          { label: "Period", width: "22%" },
          { label: "Dose", width: "30%" },
          { label: "Monitoring Note" },
        ]}
        rows={CLOZAPINE_ROWS}
      />
      <CalloutBox>
        Clozapine adverse effects requiring active management: (1) Hypersalivation — Hyoscine 0.3 mg SL nocte or Pirenzepine 25 mg BD. (2) Constipation — Lactulose 15 mL BD; dietary fibre. (3) Weight gain — Metformin 500 mg BD; dietician. (4) Seizure risk — Sodium Valproate 200–500 mg nocte at clozapine doses &gt; 600 mg. (5) Myocarditis (first 4 weeks) — troponin and ECG weekly for 4 weeks; stop and review if chest pain.
      </CalloutBox>

      {/* 8. ADJUNCTIVE */}
      <ModuleHeader>8. Adjunctive Medications</ModuleHeader>
      <Table
        cols={[
          { label: "Indication", width: "24%" },
          { label: "Drug(s)", width: "28%" },
          { label: "Dose / Schedule", width: "16%" },
          { label: "Notes" },
        ]}
        rows={ADJUNCTIVE_ROWS}
      />

      {/* 9. METABOLIC RISK */}
      <ModuleHeader>9. Metabolic Risk &amp; Monitoring by Antipsychotic</ModuleHeader>
      <Table
        cols={[
          { label: "Antipsychotic", width: "14%" },
          { label: "Weight Gain Risk", width: "12%", center: true },
          { label: "Glucose Risk", width: "11%", center: true },
          { label: "Lipid Risk", width: "10%", center: true },
          { label: "EPS / TD Risk", width: "11%", center: true },
          { label: "Action" },
        ]}
        rows={METABOLIC_ROWS}
      />
      <CalloutBox>
        METABOLIC INTERVENTION: For any patient with weight gain &gt; 7% of baseline OR fasting glucose &gt; 100 mg/dL: initiate Metformin 500 mg BD (after endocrinology / physician review), provide dietary counselling, structured exercise programme (OT), and reassess antipsychotic choice at MDT.
      </CalloutBox>

      {/* 10. MONITORING */}
      <ModuleHeader>10. Monitoring Schedule — 90 Days</ModuleHeader>
      <Table
        cols={[
          { label: "Parameter", width: "28%" },
          { label: "Phase 1 (Days 1–15)", width: "22%" },
          { label: "Phase 2 (Days 16–45)", width: "22%" },
          { label: "Phase 3 (Days 46–90)" },
        ]}
        rows={MONITORING_ROWS}
      />

      {/* 11. DISCHARGE RX */}
      <ModuleHeader>11. Discharge Prescription (Day 90)</ModuleHeader>
      <Table
        cols={[
          { label: "Drug", width: "32%" },
          { label: "Dose", width: "26%" },
          { label: "Duration / Notes" },
        ]}
        rows={DISCHARGE_RX_ROWS}
      />
      <CalloutBox>
        DISCHARGE MEDICATION COUNSELLING: Every patient and their family member / carer must receive verbal and written information on: (1) Name and purpose of each medication. (2) Dose and timing. (3) Common and serious side effects. (4) What to do if a dose is missed. (5) Importance of not stopping medication without psychiatric review. (6) JRCPL helpline: 9822207761 for medication queries. Document counselling in case notes.
      </CalloutBox>

      {/* 12. LAB DEVIATION */}
      <ModuleHeader>12. Lab-Deviation Protocol Adjustments</ModuleHeader>
      <Table
        cols={[
          { label: "Finding", width: "26%" },
          { label: "Required Adjustment" },
        ]}
        rows={LAB_DEVIATION_ROWS}
      />

      {/* 13. KPIs */}
      <ModuleHeader>13. KPIs</ModuleHeader>
      <Table
        cols={[
          { label: "KPI" },
          { label: "Target", width: "20%", center: true },
          { label: "Review", width: "12%", center: true },
        ]}
        rows={KPI_ROWS}
      />

      {/* 14. APPROVAL */}
      <ProtocolApprovalNew docCode="SCZ-CL-01-P" docTitle="Pharmacological Protocol — Schizophrenia Spectrum Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default SczCl01PSchizophreniaPharmacological;
