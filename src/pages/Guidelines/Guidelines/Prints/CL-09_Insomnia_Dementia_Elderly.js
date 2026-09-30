import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-09"],
  ["Title", "Insomnia & Behavioural Symptoms in Elderly and Dementia"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All Geriatric & Elder Care Units; Dementia Patients Across All JRCPL Centres"],
  ["Core Principle", "Sleep stabilization first. Behavioural control with MINIMUM antipsychotic exposure"],
  ["Regulatory Basis", "MHCA 2017; NABH Standards"],
  ["Replaces", "SOP_Insomnia_Dementia.docx + Jagruti_Geriatric_Insomnia_Dementia_SOP.pdf"],
];

const PHILOSOPHY_ROWS = [
  ["Ensure the lowest possible antipsychotic burden", "Chronic benzodiazepine dependence"],
  ["Avoid chronic benzodiazepine dependence", "High-dose antipsychotic sedation"],
  ["Treat hyperarousal; do not suppress cognition", "Using quetiapine as 'sleeping pill' without indication"],
  ["Address mood and neurodegeneration simultaneously", "Sedating without ruling out/treating depression"],
  ["Preserve patient dignity and cognition", "Poly-antipsychotic use or PRN stacking"],
];

const PHENOTYPE_ROWS = [
  ["Pure Insomnia", "Difficulty initiating or maintaining sleep; no daytime behavioural disturbance", "Sleep hygiene; melatonin; orexin antagonist"],
  ["Sundowning", "Late afternoon / evening confusion, agitation, wandering", "Light therapy (morning); structured evening routine; calcium-magnesium"],
  ["Nocturnal Agitation", "Agitation during night hours only; may involve vocalisation", "Pain/infection check; melatonin; low-dose quetiapine if needed"],
  ["Psychosis-driven Agitation", "Paranoia, hallucinations, delusions driving behaviour", "Low-dose antipsychotic; evaluate for delirium vs dementia vs late-onset psychosis"],
  ["Depression-related Early Awakening", "Waking 2–3 hrs early; hopelessness; low appetite; psychomotor slowing", "SSRI (low dose, slow titration); behavioural activation"],
  ["Anxiety Hyperarousal", "Excessive worry; muscle tension; autonomic symptoms at night", "CBT-I; SSRI; avoid benzodiazepines long-term"],
];

const PHARMA_ROWS = [
  ["1 — Preferred", "Melatonin (prolonged-release)", "2–5 mg nocte", "Circadian dysregulation; dementia sleep reversal", "First-line; safe; minimal cognitive impact"],
  ["1 — Preferred", "Lemborexant (orexin antagonist)", "5–10 mg nocte", "Sleep maintenance insomnia; low fall risk", "Preferred over BZDs; cognitive preservation"],
  ["2 — Mood-targeted", "SSRI e.g. Escitalopram 5 mg", "5 mg OD", "Depression/anxiety driving insomnia", "Slow titration; monitor hyponatraemia"],
  ["2 — Mood-targeted", "Mirtazapine", "7.5–15 mg nocte", "Insomnia + depression + poor appetite", "Monitor metabolic parameters; avoid > 30 mg elderly"],
  ["3 — Anti-dementia", "Donepezil (Aricept)", "5–10 mg OD", "Dementia — reduces BPSD; improves day/night orientation", "Evening dosing may worsen nightmares; try morning dose"],
  ["3 — Anti-dementia", "Memantine", "5 mg OD → 10–20 mg/day", "Moderate–severe dementia; agitation reduction", "Monitor for dizziness; useful adjunct to donepezil"],
  ["4 — Adjunct", "Trazodone", "25–50 mg nocte", "Sleep maintenance; less anticholinergic than TCAs", "Monitor orthostatic hypotension; fall risk"],
  ["5 — Last Resort", "Risperidone", "0.25–0.5 mg OD/BD", "Clear psychosis or severe aggression endangering safety", "Short-term; review every 2–4 weeks; taper when stable"],
  ["5 — Last Resort", "Quetiapine", "12.5–50 mg nocte", "As above; more sedating", "NOT first-line; NOT a sleeping pill alone"],
];

const MONITOR_ROWS = [
  ["Fall Risk Scale (inpatients)", "Weekly", "High risk → environmental modifications; physiotherapy; slow titration"],
  ["Cognitive Review (MoCA or MMSE)", "Monthly", "Decline > 3 points → medication review; neurology referral if rapid"],
  ["Behaviour Charting", "Daily (nursing staff)", "Escalation in agitation → phenotype reassessment; consider cause"],
  ["Metabolic Panel (if on antipsychotic)", "Quarterly", "Weight gain / dysglycaemia → dose reduction; dietary consult"],
  ["Medication Review Board", "Every 30–60 days", "Attempt antipsychotic taper once behaviour stabilises ≥ 4 weeks"],
  ["Electrolytes (if on SSRI)", "At 2 weeks, then monthly initially", "Na < 130 mEq/L → review SSRI; consider dose reduction or switch"],
];

const KPI_ROWS = [
  ["Non-pharmacological protocol completed before first antipsychotic", "100%", "Monthly"],
  ["Pre-antipsychotic dementia checklist documented", "100%", "Monthly"],
  ["Fall-risk assessment weekly for inpatients", "≥ 95%", "Monthly"],
  ["Antipsychotic taper attempted within 3 months of stability", "≥ 80%", "Quarterly"],
  ["Cognitive assessment at admission and 6-monthly", "≥ 95%", "Quarterly"],
];

const Cl09InsomniaDementiaElderly = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-09"
        title="Insomnia &amp; Behavioural Symptoms in Elderly / Dementia"
        icdLine="ICD-11: 7A00–7A2Z / 6D80–6D82 | Geriatric & Elder Care Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. CORE PRINCIPLE */}
      <SectionTitle>1. Core Principle &amp; Philosophy</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>
        Sleep stabilization first. Behavioural control with minimum antipsychotic exposure. Lowest possible pharmacological burden while preserving cognition, dignity, and safety.
      </p>
      <Table
        cols={[{ label: "Core Commitment" }, { label: "Prohibited Practices" }]}
        rows={PHILOSOPHY_ROWS}
      />

      {/* 2. STEPWISE ASSESSMENT */}
      <ModuleHeader>2. Stepwise Assessment &amp; Non-Pharmacological Protocol</ModuleHeader>
      <SectionTitle>Step 1: Phenotype the Problem</SectionTitle>
      <Table
        cols={[{ label: "Phenotype", width: "22%" }, { label: "Key Features", width: "38%" }, { label: "Primary Intervention Focus" }]}
        rows={PHENOTYPE_ROWS}
      />

      <SectionTitle>Step 2: Mandatory First-Line Non-Pharmacological</SectionTitle>
      <BulletList items={[
        "Enforce a fixed sleep schedule — same bedtime and wake time daily",
        "Ensure morning sunlight exposure (30 min) for circadian regulation",
        "Reduce daytime naps to < 30 min before 2 PM",
        "Avoid evening overstimulation — limit TV, visitors, noise after 7 PM",
        "Provide caregiver psychoeducation on sleep hygiene",
        "Screen for physical discomfort: pain, urinary issues, constipation, infection",
      ]} />

      {/* 3. DEMENTIA CHECKLIST */}
      <ModuleHeader>3. Special Dementia Protocol — Pre-Antipsychotic Checklist</ModuleHeader>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>
        Before considering ANY antipsychotic addition, the following checklist MUST be completed:
      </p>
      <BulletList items={[
        "Check for PAIN — administer validated pain scale (PAINAD for non-verbal patients)",
        "Check for INFECTION — urine, chest, skin",
        "Check for CONSTIPATION — bowel chart review",
        "Check for URINARY RETENTION — bladder scan if indicated",
        "Correct the patient's circadian rhythm — light therapy, structured schedule",
        "Optimise anti-dementia medication — cholinesterase inhibitor or memantine dose review",
        "Trial sleep-targeted therapy — melatonin, orexin antagonist, trazodone",
      ]} />
      <WarningBox>Only after ALL these steps are exhausted should low-dose antipsychotics be considered.</WarningBox>

      {/* 4. PHARMACOLOGICAL HIERARCHY */}
      <ModuleHeader>4. Rational Pharmacological Hierarchy</ModuleHeader>
      <Table
        cols={[
          { label: "Tier", width: "18%" },
          { label: "Agent", width: "22%" },
          { label: "Dose", width: "16%" },
          { label: "Indication", width: "24%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />

      {/* 5. MONITORING */}
      <ModuleHeader>5. Monitoring Framework</ModuleHeader>
      <Table
        cols={[{ label: "Monitoring Parameter", width: "30%" }, { label: "Frequency", width: "22%" }, { label: "Alert / Action" }]}
        rows={MONITOR_ROWS}
      />

      {/* 6. KPIs */}
      <ModuleHeader>6. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "14%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-09" docTitle="Insomnia & Behavioural Symptoms in Elderly / Dementia" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl09InsomniaDementiaElderly;
