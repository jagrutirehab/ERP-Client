import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-07"],
  ["Title", "ADHD — Assessment & Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "Children, Adolescents & Adults — OPD, IPD & Rehabilitation Settings"],
  ["Rating Scales", "Vanderbilt, Conners, ASRS (adults), Cognitive Assessment"],
  ["Regulatory Basis", "MHCA 2017; NABH Standards"],
  ["Replaces", "Jagrutii_ADHD_Clinical_Protocol_SOP.pdf"],
];

const DIAG_ROWS = [
  ["Inattention (≥ 6 symptoms, children; ≥ 5, adults)", "Fails to attend to details; difficulty sustaining attention; doesn't listen; fails to finish tasks; difficulty organising; avoids sustained mental effort; loses things; easily distracted; forgetful"],
  ["Hyperactivity / Impulsivity (≥ 6 symptoms, children; ≥ 5, adults)", "Fidgets; leaves seat; runs/climbs inappropriately; can't play quietly; 'on the go'; talks excessively; blurts answers; difficulty waiting; interrupts"],
  ["Duration & Setting", "Symptoms present ≥ 6 months; evident before age 12; present in ≥ 2 settings; significant impairment"],
];

const SCALE_ROWS = [
  ["Vanderbilt ADHD Scale", "Children 6–12", "Parent and teacher ratings; ADHD + comorbidity screening"],
  ["Conners Rating Scale", "Children & adolescents", "Validated ADHD severity; multiple rater versions"],
  ["ASRS (Adult ADHD Self-Report Scale)", "Adults ≥ 18", "Self-report ADHD screening and severity"],
  ["Cognitive Assessment / IQ Testing", "When learning difficulty present", "Academic functioning; processing speed; working memory"],
];

const PHARMA_ROWS = [
  ["Stimulant (First-line)", "Methylphenidate IR", "5–10 mg OD/BD", "20–60 mg/day (children); up to 80 mg (adults)", "Avoid in cardiac disease, anxiety, tics; monitor appetite, sleep, BP, pulse"],
  ["Stimulant", "Methylphenidate ER (Concerta / Ritalin LA)", "18–36 mg OD", "36–72 mg OD", "Preferred for school/work hours coverage; less rebound"],
  ["Non-Stimulant", "Atomoxetine", "0.5 mg/kg OD", "1.2–1.4 mg/kg/day", "Useful when stimulants contraindicated; full effect at 4–6 weeks; monitor mood"],
  ["Non-Stimulant", "Guanfacine ER", "1 mg OD", "1–4 mg OD", "For tics + ADHD; hyperactivity/impulsivity dominant; monitor BP"],
  ["Non-Stimulant", "Clonidine", "0.05 mg OD nocte", "0.1–0.3 mg/day", "Useful for sleep problems + ADHD; monitor BP; taper on discontinuation"],
];

const PSYCHOSOCIAL_ROWS = [
  ["Psychoeducation", "Patient + caregivers (mandatory)", "Nature of ADHD; brain differences; medication rationale; realistic expectations", "1–2 sessions at diagnosis"],
  ["Behaviour Therapy", "Children (first-line before meds if mild)", "Token economy; time-out; structured routines; immediate rewards", "Weekly × 12–16 sessions"],
  ["Parent Management Training", "Parents of children with ADHD", "Positive reinforcement; consistency; ignoring minor misbehaviour", "Group programme × 8–10 sessions"],
  ["CBT — Executive Function", "Adolescents / Adults", "Time management; organisation; task initiation; planning; procrastination", "Weekly × 12 sessions"],
  ["School / Workplace Accommodations", "All ages", "Extended time; preferential seating; written instructions; breaks", "Written recommendation to school/employer"],
];

const MONITOR_ROWS = [
  ["Rating scale (Vanderbilt / ASRS)", "Every 8–12 weeks", "No improvement → reassess diagnosis and dose"],
  ["Weight & height (children)", "Monthly", "Weight loss > 5% → nutrition review; consider drug holiday"],
  ["Blood Pressure & Pulse", "Monthly during titration; then 3-monthly", "BP > 95th percentile → reduce dose; cardiology if persistent"],
  ["Sleep assessment", "Every visit", "Insomnia → adjust timing; evening dose avoidance"],
  ["Appetite & food intake", "Every visit", "Anorexia → calorie-dense foods; meds after meals"],
  ["Medication holiday", "Summer / long breaks (children)", "Review need to continue; reassess on return to school"],
];

const KPI_ROWS = [
  ["Rating scales documented at baseline and each review", "100%", "Monthly"],
  ["Psychoeducation completed at diagnosis visit", "100%", "Monthly"],
  ["BP and weight monitored monthly during stimulant therapy", "≥ 95%", "Monthly"],
  ["Academic / occupational functioning assessed", "≥ 90%", "Quarterly"],
];

const Cl07ADHD = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-07"
        title="ADHD — Attention Deficit Hyperactivity Disorder"
        icdLine="ICD-11: 6A05 | DSM-5-TR: F90 | Psychiatric & Child & Adolescent Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To ensure standardized, evidence-based assessment and management of ADHD across JRCPL units, focusing on accurate diagnosis, functional improvement, rational pharmacotherapy, and structured psychosocial care.
      </p>

      {/* 2. DIAGNOSTIC PROTOCOL */}
      <ModuleHeader>2. Diagnostic Protocol</ModuleHeader>
      <BulletList items={[
        "Comprehensive developmental and psychiatric history including school/work functioning",
        "Collateral information from parents/teachers/spouse whenever available",
        "Diagnosis based on ICD-11 / DSM-5-TR criteria",
        "Screen for comorbidities: learning disorder, ODD, anxiety, depression, substance use",
      ]} />
      <SectionTitle>Diagnostic Criteria (DSM-5-TR)</SectionTitle>
      <Table
        cols={[{ label: "Domain", width: "35%" }, { label: "Criteria" }]}
        rows={DIAG_ROWS}
      />

      {/* 3. PSYCHODIAGNOSTIC PROTOCOL */}
      <ModuleHeader>3. Psychodiagnostic Protocol</ModuleHeader>
      <Table
        cols={[{ label: "Scale", width: "30%" }, { label: "Age Group", width: "25%" }, { label: "Purpose" }]}
        rows={SCALE_ROWS}
      />
      <BulletList items={[
        "Neuropsychological testing in complex or medico-legal cases",
        "Repeat rating scales every 8–12 weeks to monitor response",
      ]} />

      {/* 4. PHARMACOLOGICAL PROTOCOL */}
      <ModuleHeader>4. Pharmacological Protocol</ModuleHeader>
      <SectionTitle>General Principles</SectionTitle>
      <BulletList items={[
        "Multimodal treatment approach — medication alone is never sufficient",
        "Start low, titrate gradually; monitor response and side effects at each visit",
      ]} />
      <Table
        cols={[
          { label: "Drug Class", width: "18%" },
          { label: "Agent", width: "22%" },
          { label: "Starting Dose", width: "15%" },
          { label: "Target Dose", width: "18%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />

      {/* 5. PSYCHOSOCIAL PROTOCOL */}
      <ModuleHeader>5. Psychosocial Protocol</ModuleHeader>
      <Table
        cols={[
          { label: "Intervention", width: "22%" },
          { label: "Target Group", width: "22%" },
          { label: "Content", width: "32%" },
          { label: "Frequency" },
        ]}
        rows={PSYCHOSOCIAL_ROWS}
      />

      {/* 6. MONITORING PROTOCOL */}
      <ModuleHeader>6. Monitoring Protocol</ModuleHeader>
      <Table
        cols={[{ label: "Parameter", width: "28%" }, { label: "Frequency", width: "28%" }, { label: "Action if Abnormal" }]}
        rows={MONITOR_ROWS}
      />

      {/* 7. REHABILITATION & FUNCTIONAL GOALS */}
      <ModuleHeader>7. Rehabilitation &amp; Functional Goals</ModuleHeader>
      <BulletList items={[
        "Study skills and time-management training",
        "Social skills and impulse control modules",
        "Digital hygiene guidance — screen time limits",
        "Family counselling and caregiver burden assessment",
        "Vocational guidance for adolescents and adults",
      ]} />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "14%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-07" docTitle="ADHD — Attention Deficit Hyperactivity Disorder" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl07ADHD;
