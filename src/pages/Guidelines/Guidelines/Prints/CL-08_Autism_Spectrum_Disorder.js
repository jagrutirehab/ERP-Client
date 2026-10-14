import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, Table, CalloutBox,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-08"],
  ["Title", "Autism Spectrum Disorder — Assessment & Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "Children, Adolescents & Adults — OPD, IPD & Rehabilitation Services"],
  ["Rating Scales", "M-CHAT-R/F, ISAA, CARS, ADOS-2, Adaptive Behaviour Assessment"],
  ["Regulatory Basis", "MHCA 2017; RPWD Act 2016; NABH Standards"],
  ["Replaces", "Jagrutii_Autism_Clinical_Protocol_SOP.pdf"],
];

const DSM_ROWS = [
  ["Deficits in social-emotional reciprocity", "Stereotyped/repetitive motor movements or speech"],
  ["Deficits in non-verbal communicative behaviours (eye contact, gestures)", "Insistence on sameness; inflexible routines"],
  ["Deficits in developing/maintaining relationships", "Highly restricted, fixated interests"],
  ["—", "Hyper- or hypo-reactivity to sensory input"],
];

const TOOL_ROWS = [
  ["M-CHAT-R/F", "Toddlers 16–30 months", "Early ASD screening in primary care / OPD"],
  ["ISAA (Indian Scale for Assessment of Autism)", "Children ≥ 2 years", "Severity grading; commonly used in Indian clinical settings"],
  ["CARS (Childhood Autism Rating Scale)", "Children ≥ 2 years", "Severity classification: mild / moderate / severe"],
  ["ADOS-2 (Autism Diagnostic Observation Schedule)", "All ages", "Gold-standard structured observation for diagnosis"],
  ["Cognitive Assessment (IQ testing)", "All", "Intellectual functioning; adaptive behaviour"],
  ["Speech & Language Evaluation", "Children — mandatory", "Communication profile; therapy planning"],
];

const INTERVENTION_ROWS = [
  ["EIBI (Early Intensive Behavioural Intervention)", "Young children ≤ 5 years", "ABA-based; structured teaching; naturalistic developmental strategies", "20–40 hrs/week"],
  ["ABA-informed Strategies", "All ages", "Functional Behaviour Assessment; reinforcement-based teaching; skill acquisition", "Individualised"],
  ["Speech & Language Therapy", "When communication delay present", "AAC if non-verbal; social communication training; pragmatic language", "3–5 sessions/week"],
  ["Occupational Therapy", "Sensory processing difficulties", "Sensory integration; fine motor; ADL training", "2–3 sessions/week"],
  ["Social Skills Training", "Children / adolescents", "Group format; role-play; peer interaction scripts; PEERS programme", "Weekly group"],
  ["Special Education", "School-age children", "IEP (Individualized Education Programme); inclusive education support", "Daily"],
];

const PHARMA_ROWS = [
  ["Irritability / Aggression", "Risperidone (FDA-approved for ASD)", "0.25–0.5 mg OD", "Monitor weight, metabolic profile; lowest effective dose"],
  ["Hyperactivity / Inattention (ADHD comorbidity)", "Methylphenidate", "5 mg OD/BD", "Response rate lower in ASD; monitor for worsening stereotypy"],
  ["Sleep Onset Difficulty", "Melatonin", "0.5–3 mg nocte", "First-line; safe; adjust dose based on response"],
  ["Anxiety (comorbid)", "Sertraline or Fluoxetine", "12.5–25 mg OD", "Monitor for behavioural activation; low dose; slow titration"],
];

const FAMILY_ROWS = [
  ["Diagnosis Disclosure", "Explain ASD diagnosis; address guilt and grief; give realistic prognosis; resources", "At diagnosis"],
  ["Parent Management Training", "ABA techniques at home; reinforcement strategies; managing meltdowns", "Monthly × 3 months"],
  ["Education & School Navigation", "RPWD Act 2016 rights; IEP process; school communication", "As needed"],
  ["Transition Planning (adolescents)", "Vocational training; adult services; supported living options; guardianship", "Annually from age 14"],
  ["Caregiver Wellbeing", "Burnout assessment; respite options; peer support groups; sibling needs", "Every 6 months"],
];

const MONITOR_ROWS = [
  ["Communication & social interaction", "Every 3–6 months", "Speech therapist report; CARS/ISAA rescoring"],
  ["Adaptive functioning", "Every 6–12 months", "Vineland Adaptive Behaviour Scales"],
  ["Medication side effects", "Monthly (if on medication)", "Weight, metabolic panel, EPS monitoring"],
  ["Family stress and coping", "Every 6 months", "PSI (Parenting Stress Index); clinical interview"],
  ["School / vocational progress", "Annually", "Teacher report; work supervisor feedback"],
];

const KPI_ROWS = [
  ["Developmental assessment completed within 2 visits", "≥ 95%", "Quarterly"],
  ["Therapy (speech/OT/ABA) initiated within 4 weeks of diagnosis", "≥ 90%", "Quarterly"],
  ["Parent training programme completed", "≥ 80%", "6-Monthly"],
  ["Medication review every 3 months if on pharmacotherapy", "100%", "Quarterly"],
];

const Cl08AutismSpectrumDisorder = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-08"
        title="Autism Spectrum Disorder (ASD)"
        icdLine="ICD-11: 6A02 | DSM-5-TR: F84.0 | Child & Adolescent / Psychiatric Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To ensure standardized, early identification and evidence-based management of ASD across JRCPL units, focusing on developmental assessment, structured behavioral intervention, family training, and functional rehabilitation.
      </p>

      {/* 2. DIAGNOSTIC PROTOCOL */}
      <ModuleHeader>2. Diagnostic Protocol</ModuleHeader>
      <SectionTitle>2.1 History &amp; Developmental Assessment</SectionTitle>
      <BulletList items={[
        "Detailed developmental history: language milestones, social reciprocity, repetitive behaviours",
        "Collateral information from parents and school — mandatory in paediatric cases",
        "Diagnosis based on ICD-11 / DSM-5-TR criteria",
        "Screen for comorbidities: ADHD, intellectual disability, epilepsy, anxiety, sleep disorders",
      ]} />

      <SectionTitle>2.2 DSM-5-TR Diagnostic Criteria Summary</SectionTitle>
      <Table
        cols={[
          { label: "Domain A — Social Communication Deficits" },
          { label: "Domain B — Restricted / Repetitive Behaviours" },
        ]}
        rows={DSM_ROWS}
      />
      <p style={{ margin: "0 0 0.75rem", fontStyle: "italic", fontSize: "0.88rem", color: "#555" }}>
        All criteria: Symptoms present early (may not manifest until social demands exceed capacity); cause significant impairment; not better explained by intellectual disability alone.
      </p>

      {/* 3. PSYCHODIAGNOSTIC PROTOCOL */}
      <ModuleHeader>3. Psychodiagnostic Protocol</ModuleHeader>
      <Table
        cols={[{ label: "Tool", width: "32%" }, { label: "Age Group", width: "22%" }, { label: "Purpose" }]}
        rows={TOOL_ROWS}
      />
      <BulletList items={["Repeat functional assessment every 6–12 months"]} />

      {/* 4. TREATMENT PROTOCOL */}
      <ModuleHeader>4. Treatment Protocol — Core Interventions</ModuleHeader>
      <CalloutBox>
        Core management is <strong>BEHAVIOURAL</strong> and <strong>DEVELOPMENTAL</strong> intervention. Medications are for <strong>TARGET SYMPTOMS ONLY</strong>.
      </CalloutBox>
      <Table
        cols={[
          { label: "Intervention", width: "25%" },
          { label: "Target Group", width: "22%" },
          { label: "Approach", width: "35%" },
          { label: "Intensity" },
        ]}
        rows={INTERVENTION_ROWS}
      />

      <SectionTitle>Pharmacotherapy for Target Symptoms</SectionTitle>
      <Table
        cols={[
          { label: "Target Symptom", width: "28%" },
          { label: "Drug", width: "26%" },
          { label: "Starting Dose", width: "16%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />

      {/* 5. FAMILY COUNSELLING */}
      <ModuleHeader>5. Family Counselling</ModuleHeader>
      <Table
        cols={[{ label: "Session", width: "25%" }, { label: "Content", width: "50%" }, { label: "Timing" }]}
        rows={FAMILY_ROWS}
      />

      {/* 6. MONITORING & REVIEW */}
      <ModuleHeader>6. Monitoring &amp; Review</ModuleHeader>
      <Table
        cols={[{ label: "Parameter", width: "28%" }, { label: "Frequency", width: "25%" }, { label: "Method" }]}
        rows={MONITOR_ROWS}
      />

      {/* 7. KPIs */}
      <ModuleHeader>7. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "14%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-08" docTitle="Autism Spectrum Disorder (ASD)" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl08AutismSpectrumDisorder;
