import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-10"],
  ["Title", "Trichotillomania (TTM) & BFRBs — Treatment Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL Centres — Inpatient, Day Care & Outpatient Settings"],
  ["Rating Scales", "MGH-HPS, NIMH-TSS, Milwaukee Inventory, PHQ-9, GAD-7, Y-BOCS"],
  ["Regulatory Basis", "MHCA 2017; NABH Standards"],
  ["Replaces", "JRCPL_TTM_Protocol (Google Doc, JRCPL-CP-PSY-007)"],
];

const CRITERIA_ROWS = [
  ["A", "Recurrent pulling of one's hair, resulting in hair loss"],
  ["B", "Repeated attempts to decrease or stop hair pulling"],
  ["C", "Pulling causes clinically significant distress or impairment in social, occupational, or other areas"],
  ["D", "Not attributable to a substance or another medical condition (e.g., alopecia areata)"],
  ["E", "Not better explained by another mental disorder (e.g., body dysmorphic disorder)"],
];

const SUBTYPE_ROWS = [
  ["Automatic (non-focused)", "Pulling outside conscious awareness; during sedentary activities", "Awareness training; stimulus control; barrier tools"],
  ["Focused (intentional)", "Deliberate pulling in response to urge, tension, anxiety, or specific hair texture", "Urge management; cognitive restructuring; ACT"],
  ["Mixed (most common)", "Both automatic and focused pulling coexist", "Comprehensive Behavioural Treatment (ComB)"],
];

const SCALE_ROWS = [
  ["MGH Hair Pulling Scale (MGH-HPS)", "7-item self-report; urge intensity, frequency, distress — gold standard", "Patient (self-report)"],
  ["NIMH-TSS", "Clinician-rated; hair loss extent, pulling time, distress, interference", "Psychiatrist / Psychologist"],
  ["BFRB Functional Assessment (Milwaukee Inventory)", "Identifies automatic vs. focused pulling; maps behaviour function", "Clinical Psychologist"],
  ["PHQ-9 / GAD-7", "Screen for comorbid depression and anxiety", "Patient (self-report)"],
  ["Y-BOCS (or OCI-R)", "Screen for comorbid OCD", "Clinical Psychologist"],
  ["ADHD-RS / ASRS", "Screen for ADHD (frequent comorbidity)", "Clinical Psychologist"],
];

const THERAPY_ROWS = [
  ["HRT (Habit Reversal Training)", "Awareness training; competing response (grip fist, clench hand when urge arises); social support", "Grade A — First-line", "8–12 sessions"],
  ["ComB (Comprehensive Behavioural Treatment)", "Targets specific pulling functions (sensory, motor, cognitive, affective, place); individualised stimulus control", "Grade A — Preferred", "10–16 sessions"],
  ["ACT (Acceptance & Commitment Therapy)", "Urge surfing; defusion from urge-related cognitions; values-based living", "Grade B", "8–12 sessions"],
  ["CBT", "Cognitive restructuring; emotion regulation; pulling consequence analysis", "Grade B", "8–12 sessions"],
];

const PHARMA_ROWS = [
  ["N-Acetylcysteine (NAC)", "600 mg BD", "1200–2400 mg/day", "First-line adjunct; glutamate modulator; good evidence; GI side effects (take with food)"],
  ["Clomipramine (TCA)", "25 mg OD", "100–250 mg/day", "Strongest pharmacological evidence; monitor ECG and anticholinergic side effects"],
  ["Olanzapine", "2.5 mg OD", "5–10 mg/day", "Useful for severe/refractory TTM; weight and metabolic monitoring"],
  ["SSRI (e.g., Fluoxetine)", "10–20 mg OD", "20–60 mg OD", "Modest evidence; useful for comorbid anxiety/depression"],
];

const KPI_ROWS = [
  ["MGH-HPS scored at intake and discharge", "100%", "Monthly"],
  ["HRT/ComB initiated within 2 weeks of diagnosis", "≥ 90%", "Monthly"],
  ["Medical workup (trichophagia screen) done when indicated", "100%", "Quarterly"],
  ["MGH-HPS improvement ≥ 50% at 3 months", "≥ 70% of patients", "Quarterly"],
];

const Cl10TrichotillomaniaBFRBs = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-10"
        title="Trichotillomania &amp; Body-Focused Repetitive Behaviours"
        icdLine="ICD-11: 6B25 | DSM-5-TR: F63.3 | OCD-Related Disorders"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. OVERVIEW */}
      <SectionTitle>1. Overview &amp; Diagnostic Framework</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        Trichotillomania (Hair Pulling Disorder) is a body-focused repetitive behaviour (BFRB) classified under OCD-Related Disorders (DSM-5: F63.3 / ICD-11: 6B25). It is characterised by recurrent compulsive pulling of hair from scalp, eyebrows, eyelashes, or other sites, resulting in hair loss and clinically significant distress or impairment.
      </p>
      <SectionTitle>DSM-5 Diagnostic Criteria (All 5 must be met)</SectionTitle>
      <Table
        cols={[{ label: "Criterion", width: "14%", center: true }, { label: "Description" }]}
        rows={CRITERIA_ROWS}
      />

      {/* 2. CLINICAL SUBTYPES */}
      <ModuleHeader>2. Clinical Subtypes</ModuleHeader>
      <Table
        cols={[{ label: "Subtype", width: "22%" }, { label: "Characteristics", width: "40%" }, { label: "Primary Treatment Focus" }]}
        rows={SUBTYPE_ROWS}
      />

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Assessment Protocol</ModuleHeader>
      <Table
        cols={[{ label: "Scale", width: "30%" }, { label: "Purpose", width: "42%" }, { label: "Administered By" }]}
        rows={SCALE_ROWS}
      />
      <SectionTitle>Medical Workup</SectionTitle>
      <BulletList items={[
        "Dermatology referral: trichoscopy or scalp biopsy if alopecia diagnosis uncertain (rule out alopecia areata, tinea capitis)",
        "GI evaluation: if trichophagia confirmed — abdominal X-ray or ultrasound to rule out trichobezoar (present in ~20% of cases)",
      ]} />

      {/* 4. TREATMENT */}
      <ModuleHeader>4. Treatment Protocol</ModuleHeader>
      <SectionTitle>4.1 First-Line: Behavioural Therapies</SectionTitle>
      <Table
        cols={[
          { label: "Therapy", width: "25%" },
          { label: "Approach", width: "40%" },
          { label: "Evidence Level", width: "18%" },
          { label: "Duration" },
        ]}
        rows={THERAPY_ROWS}
      />

      <SectionTitle>4.2 Pharmacotherapy</SectionTitle>
      <Table
        cols={[
          { label: "Drug", width: "25%" },
          { label: "Starting Dose", width: "16%" },
          { label: "Target Dose", width: "18%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />

      {/* 5. PSYCHOEDUCATION */}
      <ModuleHeader>5. Psychoeducation &amp; Self-Help Tools</ModuleHeader>
      <BulletList items={[
        "Barrier tools: wearing gloves, hats, bandannas, finger covers to reduce pulling access",
        "Habit tracking journal: log time, place, mood, trigger, and consequence of each episode",
        "Fidget alternatives: stress balls, smooth stones, textured rings to replace pulling sensation",
        "TLC Foundation for BFRBs resources and peer support (international evidence-based community)",
        "Trichophagia education: risks of ingesting hair; nutritional impact; trichobezoar complications",
      ]} />

      {/* 6. DISCHARGE & FOLLOW-UP */}
      <ModuleHeader>6. Discharge &amp; Follow-Up</ModuleHeader>
      <BulletList items={[
        "MGH-HPS score reduced ≥ 50% from baseline",
        "Patient can identify triggers, urges, and apply competing response independently",
        "Family / support person educated on TTM and coached NOT to nag or draw attention",
        "Self-monitoring plan established",
        "Follow-up every 2–4 weeks initially; then monthly",
      ]} />

      {/* 7. KPIs */}
      <ModuleHeader>7. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "20%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-10" docTitle="Trichotillomania & Body-Focused Repetitive Behaviours" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl10TrichotillomaniaBFRBs;
