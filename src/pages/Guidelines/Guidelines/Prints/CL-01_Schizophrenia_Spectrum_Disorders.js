import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-01"],
  ["Title", "Schizophrenia Spectrum Disorders — Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All 18 JRCPL Centres | All Psychiatric Units"],
  ["Compliance", "NABH | IPS | WHO | APA | MHCA 2017"],
  ["Replaces", "JRC-PSY-001 v1.0"],
];

const Cl01SchizophreniaProtocol = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-01"
        title="Schizophrenia Spectrum Disorders"
        icdLine="ICD-11: 6A20–6A2Z | DSM-5-TR: F20–F29 | Psychiatric Care Vertical"
      />

      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <div style={{ marginBottom: "1rem" }}>
        <SectionTitle>1. PURPOSE &amp; SCOPE</SectionTitle>
        <p style={{ margin: "0 0 0.5rem" }}>
          This protocol establishes standardized clinical procedures for the assessment, treatment, rehabilitation, and follow-up of patients with Schizophrenia Spectrum Disorders across all JRCPL facilities. It ensures uniformity, quality assurance, and patient safety, aligned with NABH, IPS, WHO, APA standards and MHCA 2017.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Applicable To:</strong> All psychiatrists, psychologists, social workers, nursing staff, and allied health professionals across all 18 JRCPL centres.
        </p>
      </div>

      {/* MODULE 1 */}
      <ModuleHeader>MODULE 1 | ADMISSION &amp; INITIAL ASSESSMENT</ModuleHeader>
      <SectionTitle>Assessment Steps</SectionTitle>
      <BulletList items={[
        "Intake Form (Psychiatrist / Psychologist / MSW): Chief complaints, duration, prior hospitalisations, detailed onset & progression, family and treatment history",
        "Screening Tools: PANSS (Positive and Negative Syndrome Scale), BPRS (Brief Psychiatric Rating Scale), CGI-S (Clinical Global Impression – Severity)",
        "Risk Assessment: Suicidality, aggression potential, self-neglect, absconding risk",
        "Physical & Neurological Examination: Rule out organic aetiology — neuro-infection, metabolic disorder, substance-induced psychosis",
        "Investigations: CBC, LFT, RFT, TSH, Fasting Glucose & Lipids, ECG; MRI Brain / EEG where clinically indicated",
        "Diagnosis Confirmation: ICD-11 / DSM-5-TR criteria confirmed and documented in clinical record",
      ]} />

      {/* MODULE 2 */}
      <ModuleHeader>MODULE 2 | TREATMENT PLANNING MEETING (MDT)</ModuleHeader>
      <Table
        cols={[{ label: "Role", width: "30%" }, { label: "Designation" }]}
        rows={[
          ["Lead Clinician", "Consultant Psychiatrist"],
          ["Psychology", "Clinical Psychologist / Counsellor"],
          ["Social Work", "Medical Social Worker (MSW)"],
          ["Nursing", "Nursing Head / Senior Nurse"],
          ["Family", "Primary Caregiver / Family Representative"],
        ]}
      />
      <SectionTitle>Meeting Outputs</SectionTitle>
      <BulletList items={[
        "Individualised Treatment Plan (ITP) with short-term and long-term goals",
        "Weekly MDT review schedule + Monthly psychiatrist progress review",
        "Documented informed consent for treatment and medications",
        "Family education and engagement plan",
      ]} />

      {/* MODULE 3 */}
      <ModuleHeader>MODULE 3 | PHARMACOLOGICAL MANAGEMENT</ModuleHeader>
      <SectionTitle>General Principles</SectionTitle>
      <BulletList items={[
        "Prefer typical + atypical antipsychotics initially, then shift to atypical drugs after stabilisation of acute symptoms: risperidone, olanzapine, amisulpride, aripiprazole, clozapine",
        "Start low, go slow — titrate dose based on clinical response and tolerability except emergencies",
        "Monitor for EPS (extrapyramidal symptoms) and metabolic syndrome",
        "Document all medication changes and obtain written informed consent",
      ]} />
      <SectionTitle>Monitoring Protocol</SectionTitle>
      <Table
        cols={[
          { label: "Parameter" },
          { label: "Baseline", width: "15%", center: true },
          { label: "Monthly", width: "15%", center: true },
          { label: "6-Monthly", width: "15%", center: true },
        ]}
        rows={[
          ["Weight / BMI", "✓", "✓", "✓"],
          ["Blood Pressure", "✓", "—", "✓"],
          ["Fasting Blood Sugar & Lipids", "✓", "—", "✓"],
          ["CBC (mandatory for Clozapine)", "✓", "✓", "—"],
          ["ECG", "✓", "—", "✓"],
        ]}
      />
      <SectionTitle>Special Considerations — Clozapine</SectionTitle>
      <BulletList items={[
        "Mandatory weekly CBC for first 6 months; fortnightly thereafter",
        "Monitor for agranulocytosis — ANC threshold: < 1500/mm³ requires dose hold",
        "Clozapine registry documentation as per institutional protocol",
      ]} />

      {/* MODULE 4 */}
      <ModuleHeader>MODULE 4 | PSYCHOSOCIAL INTERVENTIONS</ModuleHeader>
      <Table
        cols={[{ label: "Intervention", width: "28%" }, { label: "Focus Area &amp; Approach" }]}
        rows={[
          ["Psychoeducation", "Patient + family — illness understanding, medication adherence, relapse prevention"],
          ["CBT for Psychosis (CBTp)", "Delusion & hallucination management; cognitive restructuring"],
          ["Social Skills Training", "Role-play, assertiveness, communication, activities of daily living"],
          ["Occupational Therapy", "Daily activity scheduling, work readiness, vocational skills"],
          ["Family Therapy", "Expressed Emotion (EE) reduction; caregiver coping strategies"],
          ["Relapse Prevention Plan", "Early warning signs identification, adherence reminders, crisis contacts"],
        ]}
      />

      {/* MODULE 5 */}
      <ModuleHeader>MODULE 5 | NURSING CARE PROTOCOL</ModuleHeader>
      <SectionTitle>Daily Nursing Responsibilities</SectionTitle>
      <BulletList items={[
        "Maintain hygiene, nutrition, hydration, sleep schedule, and physical activity",
        "Observe and document psychotic symptoms, agitation episodes, and EPS signs",
        "Administer medications as per MAR (Medication Administration Record); document every dose",
        "Maintain daily behaviour chart and incident log",
      ]} />
      <SectionTitle>Emergency Protocols (Nursing Response)</SectionTitle>
      <BulletList items={[
        "Violence / Aggression: Activate verbal de-escalation → notify duty psychiatrist",
        "Absconding Risk: Initiate observation protocol; notify family and duty doctor immediately",
        "Self-Harm: Ensure immediate safety; call duty psychiatrist; initiate documentation",
        "Medication Refusal: Document; notify treating psychiatrist; do NOT force administer",
      ]} />

      {/* MODULE 6 */}
      <ModuleHeader>MODULE 6 | EMERGENCY MANAGEMENT</ModuleHeader>
      <Table
        cols={[{ label: "Situation", width: "28%" }, { label: "Immediate Management Protocol" }]}
        rows={[
          ["Aggression / Violence", "Verbal de-escalation → Seclusion (MHCA 2017 compliant) → IM antipsychotic ± benzodiazepine under psychiatrist order"],
          ["Acute Psychosis / Excitement", "IM Haloperidol + Promethazine OR IM Olanzapine — as per psychiatrist protocol"],
          ["Suicidal Attempt / Self-Harm", "Ensure physical safety → medical first aid → immediate psychiatric review → family notification"],
          ["NMS", "Discontinue offending antipsychotic → supportive care → IV fluids → transfer to medical ICU if required"],
          ["Clozapine Toxicity / Agranulocytosis", "Hold clozapine immediately → CBC STAT → haematology consultation → reverse isolation"],
        ]}
      />
      <WarningBox>⚠ All emergency interventions must be documented in real-time. De-briefing meeting to be held within 24 hours.</WarningBox>

      {/* MODULE 7 */}
      <ModuleHeader>MODULE 7 | DOCUMENTATION STANDARDS</ModuleHeader>
      <Table
        cols={[{ label: "Document / Entry", width: "35%" }, { label: "Frequency &amp; Responsible Party" }]}
        rows={[
          ["Doctor's Clinical Note", "Daily — Duty Psychiatrist / MO"],
          ["Nursing Progress Note", "Every shift — Senior Nurse"],
          ["MDT Summary Note", "Weekly — Lead Psychiatrist"],
          ["Psychiatrist Review", "Monthly — Consultant Psychiatrist"],
          ["PANSS / BPRS Tracking Chart", "Admission, 4-weekly, Discharge — Psychologist"],
          ["MAR (Medication Admin Record)", "Every dose — Nursing Staff"],
          ["Incident Report", "As needed (within 2 hours) — Duty Nurse / Doctor"],
          ["Discharge Summary", "At discharge — Treating Psychiatrist"],
          ["Family Feedback Form", "At discharge and follow-up — MSW"],
        ]}
      />

      {/* MODULE 8 */}
      <ModuleHeader>MODULE 8 | DISCHARGE &amp; FOLLOW-UP</ModuleHeader>
      <SectionTitle>Criteria for Discharge</SectionTitle>
      <BulletList items={[
        "Symptomatic stabilisation — PANSS improvement ≥ 20% from baseline",
        "Stable on oral medication with demonstrated adherence",
        "Family trained for home supervision and relapse recognition",
        "Relapse Prevention Plan documented and handed to family",
        "Psychiatrist written clearance for discharge",
      ]} />
      <Table
        cols={[{ label: "Follow-Up Visit", width: "28%" }, { label: "Timing &amp; Purpose" }]}
        rows={[
          ["1st Review", "1 week post-discharge — medication check, side effects, settling in"],
          ["2nd Review", "2 weeks post-discharge — adherence audit, psychoeducation refresh"],
          ["Subsequent Reviews", "Monthly for 6 months → Quarterly thereafter"],
          ["Crisis Protocol", "24-hour helpline number provided to family at discharge"],
        ]}
      />

      {/* MODULE 9 */}
      <ModuleHeader>MODULE 9 | REHABILITATION &amp; LONG-TERM CARE</ModuleHeader>
      <BulletList items={[
        "Step-down options: semi-independent living, supervised community housing, or family home with support",
        "Vocational rehabilitation modules: horticulture, housekeeping, clerical skills, computer basics",
        "Integration with community mental health outreach and peer support groups",
      ]} />
      <Table
        cols={[
          { label: "Assessment Tool", center: true },
          { label: "Purpose" },
          { label: "Frequency", width: "20%" },
          { label: "Responsible", width: "15%" },
        ]}
        rows={[
          ["WHO-DAS 2.0", "Disability & functioning", "Baseline & 6-monthly", "Psychologist"],
          ["SOFAS", "Social functioning", "Monthly during rehab", "Psychologist"],
          ["PANSS", "Symptom severity", "Every 4 weeks", "Psychiatrist"],
          ["CGI-I", "Global improvement", "Monthly", "Psychiatrist"],
        ]}
      />

      {/* MODULE 10 */}
      <ModuleHeader>MODULE 10 | QUALITY ASSURANCE &amp; KPIs</ModuleHeader>
      <Table
        cols={[
          { label: "KPI Indicator" },
          { label: "Target", width: "12%", center: true },
          { label: "Frequency", width: "13%", center: true },
          { label: "Responsible", width: "18%" },
        ]}
        rows={[
          ["Medication Adherence Rate", "> 90%", "Monthly", "Clinical Pharmacist"],
          ["Readmission within 6 months", "< 10%", "6-Monthly", "Quality Manager"],
          ["PANSS Score Improvement", "> 20%", "Quarterly", "Psychiatrist"],
          ["Family Satisfaction Score", "> 80%", "Quarterly", "MSW"],
          ["Documentation Compliance", "≥ 95%", "Monthly", "Centre Head"],
        ]}
      />

      <ProtocolApproval docCode="CL-01" docTitle="Schizophrenia Protocol" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl01SchizophreniaProtocol;
