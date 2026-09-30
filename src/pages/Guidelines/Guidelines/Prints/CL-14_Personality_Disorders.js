import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-14"],
  ["Title", "Personality Disorders — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL Centres — Particular Emphasis on BPD, ASPD, NPD"],
  ["Rating Scales", "ZAN-BPD; PHQ-9; C-SSRS; PCL-5 (if trauma comorbid)"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NICE NG62 (BPD); NICE NG69 (ASPD)"],
  ["Replaces", "Newly developed standalone protocol"],
];

const ICD_ROWS = [
  ["Personality Disorder — Mild (6D10.0)", "Various cluster B, C", "Affects ≤ 2 areas of functioning; interpersonal, self-related"],
  ["Personality Disorder — Moderate (6D10.1)", "BPD, ASPD, NPD, histrionic", "Affects multiple areas; significant distress; pervasive"],
  ["Personality Disorder — Severe (6D10.2)", "Severe BPD", "Affects all areas of functioning; serious harm to self or others"],
  ["Borderline Pattern Qualifier (6D11.5)", "BPD / EUPD", "Emotional dysregulation; impulsivity; unstable relationships; self-harm; identity disturbance; fear of abandonment"],
  ["Dissocial Pattern Qualifier (6D11.3)", "ASPD", "Callousness; disregard for others; deceitfulness; irresponsibility; lack of remorse"],
];

const BPD_CRITERIA_ROWS = [
  ["1", "Frantic efforts to avoid real or imagined abandonment"],
  ["2", "Pattern of unstable and intense interpersonal relationships (idealisation/devaluation)"],
  ["3", "Identity disturbance: markedly and persistently unstable self-image or sense of self"],
  ["4", "Impulsivity in ≥ 2 areas (spending, sex, substance use, reckless driving, binge eating)"],
  ["5", "Recurrent suicidal behaviour, gestures, threats, or self-mutilating behaviour"],
  ["6", "Affective instability due to marked reactivity of mood (episodes lasting hours; rarely days)"],
  ["7", "Chronic feelings of emptiness"],
  ["8", "Inappropriate, intense anger or difficulty controlling anger"],
  ["9", "Transient, stress-related paranoid ideation or severe dissociative symptoms"],
];

const PHARMA_ROWS = [
  ["Affective instability / mood swings", "Mood stabiliser: Lamotrigine", "25 mg OD → 100–200 mg OD", "Best evidence for BPD mood; slow titration mandatory"],
  ["Affective instability", "Mood stabiliser: Valproate", "250 mg BD → 500–1000 mg/day", "Useful for impulsivity + mood; avoid in women of reproductive age"],
  ["Impulsivity / aggression", "Atypical antipsychotic: Aripiprazole", "5–15 mg OD", "Reduces impulsivity; weight-neutral"],
  ["Transient psychotic symptoms", "Low-dose antipsychotic: Quetiapine", "25–100 mg BD/nocte", "Transient use; review every 3 months"],
  ["Self-harm / suicidal crises", "SSRI (for comorbid depression)", "Standard SSRI dosing", "Adjunct — SSRIs NOT first-line for BPD core symptoms"],
  ["Sleep disturbance", "Melatonin OR low-dose quetiapine", "2–5 mg nocte / 25 mg nocte", "Avoid chronic benzodiazepines in BPD — dependency risk"],
];

const DBT_ROWS = [
  ["Mindfulness", "Observe, describe, participate; non-judgmentally; one-mindfully; effectively — the foundation of all DBT", "Weekly group + individual"],
  ["Distress Tolerance", "TIPP; ACCEPTS; self-soothe; improve the moment; pros/cons; radical acceptance; crisis survival without making things worse", "Weekly group"],
  ["Emotion Regulation", "Identify and label emotions; reduce vulnerability (PLEASE); opposite action; check the facts; problem solving", "Weekly group"],
  ["Interpersonal Effectiveness", "DEAR MAN (ask for what you want); GIVE (keep the relationship); FAST (maintain self-respect)", "Weekly group"],
  ["Individual therapy", "Skills generalisation; chain analysis of problem behaviours; commitment; relationship with therapist", "Weekly 60 min individual"],
  ["Phone coaching", "Skills coaching during crises between sessions — not to vent or process", "As needed; within agreed limits"],
];

const CRISIS_ROWS = [
  ["Self-harm (non-suicidal)", "Functional assessment: what function does SH serve? Emotion regulation? Communication? Punishment?", "DBT chain analysis; skills coaching; wound care; no reward/punishment response; matter-of-fact approach"],
  ["Suicidal ideation (passive)", "C-SSRS; identify function; distinguish from suicidal intent", "Safety planning; skills; increased contact; outpatient monitoring; do NOT automatically hospitalise — may reinforce"],
  ["Active suicidal crisis with plan/intent", "C-SSRS; immediate risk assessment; inpatient if unable to maintain safety", "Inpatient admission; 24-hr observation; crisis plan; family notification"],
  ["Parasuicide / overdose", "Medical assessment; risk assessment post-medically cleared", "Medical stabilisation; psychiatric review; no punitive response; chain analysis when calm"],
];

const KPI_ROWS = [
  ["Personality disorder formulation documented within 72 hours of admission", "100%", "Monthly"],
  ["C-SSRS at every clinical contact", "100%", "Monthly"],
  ["DBT skills group offered to all BPD inpatients", "≥ 90%", "Monthly"],
  ["Violence risk assessment (HCR-20) for ASPD at admission", "100%", "Monthly"],
  ["Chain analysis documented for every self-harm episode", "100%", "Monthly"],
  ["Team reflective practice session monthly", "100%", "Monthly"],
];

const Cl14PersonalityDisorders = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-14"
        title="Personality Disorders"
        icdLine="ICD-11: 6D10–6D11 | DSM-5-TR: F60–F61 | Psychiatric Care Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a structured, evidence-based, and compassionate clinical framework for the assessment, crisis management, and evidence-based psychotherapy of personality disorders at JRCPL — with primary focus on Borderline Personality Disorder (BPD/EUPD) and Antisocial Personality Disorder (ASPD).
      </p>

      {/* 2. ICD-11 CLASSIFICATION */}
      <ModuleHeader>2. ICD-11 Classification</ModuleHeader>
      <Table
        cols={[{ label: "ICD-11", width: "30%" }, { label: "DSM-5 Equivalent", width: "22%" }, { label: "Core Feature" }]}
        rows={ICD_ROWS}
      />

      {/* 3. BPD PROTOCOL */}
      <ModuleHeader>3. Borderline Personality Disorder — Protocol</ModuleHeader>
      <SectionTitle>3.1 Diagnostic Criteria (DSM-5-TR — ≥ 5 of 9 criteria)</SectionTitle>
      <Table
        cols={[{ label: "Criterion", width: "12%", center: true }, { label: "Description" }]}
        rows={BPD_CRITERIA_ROWS}
      />

      <SectionTitle>3.2 Pharmacotherapy — BPD (Symptom-Targeted; No FDA-Approved Drug)</SectionTitle>
      <Table
        cols={[
          { label: "Target Symptom", width: "28%" },
          { label: "Agent", width: "25%" },
          { label: "Dose", width: "20%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />
      <WarningBox>Benzodiazepines are relatively contraindicated in BPD — high disinhibition risk, paradoxical agitation, and dependency. If used in acute crisis: short-term, time-limited, documented rationale at every prescription.</WarningBox>

      <SectionTitle>3.3 Dialectical Behaviour Therapy (DBT) — Gold Standard for BPD</SectionTitle>
      <Table
        cols={[{ label: "DBT Module", width: "22%" }, { label: "Core Skills", width: "58%" }, { label: "Format" }]}
        rows={DBT_ROWS}
      />
      <p style={{ margin: "0 0 0.75rem", fontStyle: "italic", fontSize: "0.88rem", color: "#555" }}>
        Full DBT programme: Weekly individual + weekly skills group + phone coaching + therapist consultation team. Standard course = 12 months.
      </p>

      <SectionTitle>3.4 Crisis Management — BPD Self-Harm / Suicidality</SectionTitle>
      <Table
        cols={[{ label: "Presentation", width: "22%" }, { label: "Assessment", width: "35%" }, { label: "Response" }]}
        rows={CRISIS_ROWS}
      />

      {/* 4. ASPD PROTOCOL */}
      <ModuleHeader>4. Antisocial Personality Disorder — Protocol</ModuleHeader>
      <SectionTitle>4.1 Clinical Approach</SectionTitle>
      <BulletList items={[
        "ASPD has limited response to standard pharmacotherapy; core features (callousness, remorselessness) are stable personality traits",
        "Treatment focus: target comorbidities (depression, anxiety, SUD, ADHD) which are more treatment-responsive",
        "CBT for ASPD: focus on social problem-solving, impulse control, consequence evaluation, victim empathy training",
        "Violence risk assessment mandatory: HCR-20 or structured professional judgement; document at admission and monthly",
        "Comorbid substance use: integrated dual-diagnosis treatment; motivational enhancement therapy",
        "Legal context: ASPD is a mental disorder under MHCA 2017; treatment can be offered but cannot be compelled for ASPD alone without co-occurring treatable condition",
      ]} />

      {/* 5. DOCUMENTATION & RISK */}
      <ModuleHeader>5. Documentation &amp; Risk</ModuleHeader>
      <BulletList items={[
        "Personality disorder is NOT a reason to withhold treatment or adopt a dismissive attitude — therapeutic nihilism is a clinical and ethical failure",
        "Risk formulation replaces static risk scores — dynamic, longitudinal, individualized",
        "Self-harm incidents documented as Level 1–3 incidents as per severity; always chain-analysed",
        "Team reflective practice mandatory — personality disorder work is emotionally demanding; burnout prevention is a governance responsibility",
      ]} />

      {/* 6. KPIs */}
      <ModuleHeader>6. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "14%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-14" docTitle="Personality Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl14PersonalityDisorders;
