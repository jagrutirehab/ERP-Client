import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-02"],
  ["Title", "Bipolar Spectrum Disorders — Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "Bipolar I, Bipolar II, Cyclothymia, Schizoaffective Disorder (Bipolar Type)"],
  ["Rating Scales", "YMRS, HAM-D / MADRS, CGI-BP, GAF / FAST"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 21, 23); NABH COP 3, 5; IPS Guidelines 2022"],
  ["Replaces", "JRC-BP-001 v2.0"],
];

const Cl02BipolarSpectrumDisorders = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-02"
        title="Bipolar Spectrum Disorders"
        icdLine="ICD-11: 6A60–6A62 | DSM-5-TR: F31 | Psychiatric Care Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <div style={{ marginBottom: "1rem" }}>
        <SectionTitle>1. Purpose</SectionTitle>
        <p style={{ margin: 0 }}>
          To establish a standardised, evidence-based clinical pathway for Bipolar Spectrum Disorders ensuring: early stabilisation; safe monitored pharmacotherapy with defined serum level targets; integrated psychological interventions; patient and family education; and sustained relapse prevention.
        </p>
      </div>

      {/* 2. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>2. DIAGNOSTIC CLASSIFICATION</ModuleHeader>
      <Table
        cols={[{ label: "Diagnosis", width: "28%" }, { label: "Core Features" }, { label: "ICD-11 Code", width: "15%" }]}
        rows={[
          ["Bipolar I Disorder", "At least one manic episode (≥7 days or requiring hospitalisation)", "6A60"],
          ["Bipolar II Disorder", "At least one hypomanic + one major depressive episode; no full mania", "6A61"],
          ["Cyclothymia", "Chronic instability ≥ 2 years; threshold not met for BD I/II", "6A62"],
          ["Schizoaffective — Bipolar Type", "Concurrent mood + psychotic symptoms; mood dominant", "6A21"],
          ["Rapid Cycling", "≥4 mood episodes in 12 months", "Multiple scale peaks across records"],
          ["Euthymia / Maintenance", "Clinically stable; functioning restored", "YMRS < 7; HAM-D < 7"],
        ]}
      />

      {/* 3. ADMISSION & INITIAL ASSESSMENT */}
      <ModuleHeader>3. ADMISSION &amp; INITIAL ASSESSMENT</ModuleHeader>
      <SectionTitle>3.1 Clinical Assessment (within 4 hours of admission)</SectionTitle>
      <Table
        cols={[{ label: "Assessment Domain", width: "28%" }, { label: "Specific Elements" }]}
        rows={[
          ["Chief Complaint & HPI", "Episode onset, duration, triggers (sleep, substance, stress, non-compliance), severity trajectory"],
          ["Past Psychiatric History", "Previous episodes, hospitalisations, treatment response, medication history"],
          ["Suicide & Risk Assessment", "C-SSRS at admission; aggression, sexual risk behaviour in mania; AUDIT, DAST-10"],
          ["MSE", "Appearance, speech (rate/pressure), mood, affect, thought content, perception, insight, judgement"],
          ["Physical Examination", "Neurological, cardiovascular, thyroid, metabolic; height, weight, BMI, waist circumference"],
          ["Informed Consent & Capacity", "Per MHCA 2017 Sec. 21; capacity assessment documented; NR identified"],
        ]}
      />
      <SectionTitle>3.2 Baseline Investigations</SectionTitle>
      <Table
        cols={[{ label: "Investigation", width: "22%" }, { label: "Clinical Rationale", width: "35%" }, { label: "Alert Threshold" }]}
        rows={[
          ["CBC / FBC", "Valproate cytopenias; lithium leukocytosis", "WBC < 3.0 or > 15.0 × 10⁹/L; Platelets < 100"],
          ["LFT", "Valproate hepatotoxicity baseline", "ALT/AST > 3× ULN"],
          ["RFT + Electrolytes", "Lithium renal clearance; hyponatraemia", "Creatinine > 1.5 mg/dL; Na < 130 mEq/L"],
          ["TSH", "Lithium-induced hypothyroidism", "TSH > 10 mIU/L or < 0.1 mIU/L"],
          ["Serum Lithium Level", "Therapeutic range; toxicity assessment", "Acute mania: 0.8–1.2 mmol/L; Toxic: > 1.5 mmol/L"],
          ["Serum Valproate", "Confirm therapeutic range", "Therapeutic: 50–100 μg/mL"],
          ["ECG", "QTc prolongation risk", "QTc > 450 ms (men); > 470 ms (women)"],
          ["Pregnancy Test (females)", "Valproate/lithium/CBZ teratogenicity", "Positive → immediate obstetric consultation"],
        ]}
      />

      {/* 4. EPISODE PHASE IDENTIFICATION */}
      <ModuleHeader>4. EPISODE PHASE IDENTIFICATION</ModuleHeader>
      <Table
        cols={[{ label: "Phase", width: "22%" }, { label: "Clinical Criteria" }, { label: "Rating Scale Threshold", width: "28%" }]}
        rows={[
          ["Acute Mania", "Elevated/irritable mood, decreased sleep, grandiosity, pressured speech; ≥7 days", "YMRS ≥ 20"],
          ["Hypomania", "As mania but less severe; no marked impairment; 4–6 days", "YMRS 12–19"],
          ["Acute Depression", "Depressed mood, anhedonia, sleep/appetite change; ≥2 weeks", "HAM-D ≥ 17 / MADRS ≥ 20"],
          ["Mixed Episode", "Simultaneous manic + depressive features; high suicide risk", "YMRS ≥ 12 + HAM-D ≥ 8 simultaneously"],
        ]}
      />

      {/* 5. PHARMACOLOGICAL MANAGEMENT */}
      <ModuleHeader>5. PHARMACOLOGICAL MANAGEMENT</ModuleHeader>
      <SectionTitle>5.1 Acute Mania / Mixed Episode</SectionTitle>
      <Table
        cols={[{ label: "Agent", width: "20%" }, { label: "Starting Dose", width: "22%" }, { label: "Target Dose", width: "28%" }, { label: "Key Notes" }]}
        rows={[
          ["Lithium Carbonate", "300 mg TDS", "900–1800 mg/day; serum 0.8–1.2 mmol/L", "Check level 12 hrs post-dose; reduce in elderly/renal impairment"],
          ["Sodium Valproate", "500 mg BD (or 20 mg/kg loading)", "1000–2000 mg/day; level 50–100 μg/mL", "Avoid in pregnancy; LFT at baseline and 1 month"],
          ["Olanzapine", "10 mg nocte", "10–20 mg/day", "Effective for mania + psychosis; metabolic monitoring"],
          ["Quetiapine", "50 mg TDS (acute)", "600–800 mg/day", "Effective for mania/mixed; sedation useful for sleep"],
          ["Aripiprazole", "10–15 mg OD", "15–30 mg/day", "Weight-neutral; IM 5.25–15 mg for agitation"],
          ["Lorazepam (adjunct)", "1–2 mg TDS/PRN", "Max 4–6 mg/day", "Short-term only; max 2 weeks; not a mood stabiliser"],
        ]}
      />
      <SectionTitle>5.2 Bipolar Depression</SectionTitle>
      <WarningBox>⚠ Antidepressant monotherapy WITHOUT a mood stabiliser is CONTRAINDICATED — risk of inducing mania, mixed episode, or rapid cycling.</WarningBox>
      <Table
        cols={[{ label: "Agent", width: "22%" }, { label: "Starting Dose", width: "22%" }, { label: "Target Dose", width: "22%" }, { label: "Key Notes" }]}
        rows={[
          ["Quetiapine", "50 mg nocte", "300 mg/day", "First-line; FDA-approved for bipolar depression"],
          ["Lamotrigine", "25 mg OD (weeks 1–2)", "100–200 mg/day over 6–8 weeks", "SLOW TITRATION MANDATORY to prevent SJS"],
          ["Lurasidone", "20 mg nocte (with food)", "60–80 mg/day", "Evidence-based; weight-neutral; take with ≥350 cal meal"],
          ["SSRI (under mood stabiliser)", "Escitalopram 5–10 mg OD", "Up to 20 mg", "Only with adequate mood stabiliser; document rationale"],
        ]}
      />
      <SectionTitle>5.3 Lithium Toxicity Alert</SectionTitle>
      <Table
        cols={[{ label: "Level (mmol/L)", width: "22%" }, { label: "Clinical Signs" }, { label: "Action", width: "30%" }]}
        rows={[
          ["1.5–2.0 (Mild)", "Coarse tremor, nausea, diarrhoea, thirst, polyuria", "Withhold dose; recheck level; clinical review"],
          ["2.0–2.5 (Moderate)", "Ataxia, dysarthria, drowsiness, confusion, ECG changes", "Withhold; IV fluids; cardiology alert"],
          ["> 2.5 (Severe — EMERGENCY)", "Seizures, coma, cardiovascular collapse, renal failure", "EMERGENCY: IV fluids; ICU; haemodialysis if required"],
        ]}
      />

      {/* 6. PSYCHOLOGICAL INTERVENTIONS */}
      <ModuleHeader>6. PSYCHOLOGICAL INTERVENTIONS</ModuleHeader>
      <SectionTitle>Phase A — Acute (Weeks 1–4)</SectionTitle>
      <Table
        cols={[{ label: "Intervention", width: "28%" }, { label: "Content" }, { label: "Frequency", width: "22%" }]}
        rows={[
          ["Psychoeducation (individual)", "Nature of bipolar; current episode; medication purpose; what to expect", "Daily, 20–30 min"],
          ["Safety Planning (SE-01)", "C-SSRS + 6-step Stanley-Brown safety plan for suicidal ideation", "Within 24 hrs of ideation"],
          ["Sleep & Circadian Work", "Sleep hygiene; structured sleep-wake schedule; light regulation", "Daily review"],
          ["Family Psychoeducation", "Nature of illness; what to do and not do; medication side effects", "Within first week"],
        ]}
      />
      <SectionTitle>Phase B — Recovery (Weeks 5–12)</SectionTitle>
      <Table
        cols={[{ label: "Intervention", width: "28%" }, { label: "Content" }, { label: "Frequency", width: "22%" }]}
        rows={[
          ["CBT", "Cognitive distortions (grandiosity/hopelessness); thought challenging; activity scheduling", "Weekly, 50 min"],
          ["Relapse Prevention Training", "Personal warning signs checklist; mood diary; triggers; action plan", "Fortnightly"],
          ["Family Counselling", "Communication training; expressed emotion reduction; carer burden assessment", "Monthly + PRN"],
          ["Group Psychoeducation", "Peer learning; normalisation; symptom recognition in others", "Weekly group if available"],
        ]}
      />

      {/* 7. DISCHARGE CRITERIA */}
      <ModuleHeader>7. DISCHARGE CRITERIA</ModuleHeader>
      <BulletList items={[
        "YMRS ≤ 12 (manic episode) OR HAM-D ≤ 12 (depressive episode)",
        "No active suicidal ideation or credible plan (C-SSRS ideation category 1 or below)",
        "Oral medications tolerated without significant side effects",
        "Patient understands diagnosis, medications, and early warning signs",
        "Family / NR counselled and able to provide post-discharge support",
        "Follow-up appointment booked (within 7 days for high-risk; 14 days for moderate-risk)",
        "Relapse Prevention Plan (RPP-F-001) completed, signed, copy given to patient and NR",
        "Discharge Summary completed with medication list, monitoring plan, and follow-up schedule",
      ]} />

      {/* 8. QUALITY INDICATORS */}
      <ModuleHeader>8. QUALITY INDICATORS (KPIs)</ModuleHeader>
      <Table
        cols={[{ label: "Indicator" }, { label: "Target", width: "15%", center: true }, { label: "Review", width: "15%", center: true }]}
        rows={[
          ["YMRS and HAM-D documented at admission and discharge", "100%", "Monthly"],
          ["Drug monitoring investigations completed per schedule", "100%", "Monthly"],
          ["Relapse Prevention Plan completed before discharge", "100%", "Monthly"],
          ["Family psychoeducation session conducted during admission", "100%", "Monthly"],
          ["Follow-up attendance within 7 days of discharge", "≥ 80%", "Monthly"],
          ["Rehospitalisation within 6 months", "< 15%", "Quarterly"],
          ["Family satisfaction score", "≥ 85%", "Quarterly"],
        ]}
      />

      <ProtocolApproval docCode="CL-02" docTitle="Bipolar Spectrum Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl02BipolarSpectrumDisorders;
