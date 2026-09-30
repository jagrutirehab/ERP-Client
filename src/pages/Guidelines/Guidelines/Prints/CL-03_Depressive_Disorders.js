import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-03"],
  ["Title", "Depressive Disorders — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "MDD, Recurrent Depression, Depression with SUD, Late-life Depression, Rehabilitation Populations"],
  ["Rating Scales", "PHQ-9, HAM-D, MADRS, C-SSRS"],
  ["Regulatory Basis", "MHCA 2017; NABH COP 3, 5; IPS Guidelines"],
  ["Replaces", "Jagrutii_Depression_Clinical_Protocol_SOP.pdf + JRCPL/CP/DA/007"],
];

const Cl03DepressiveDisorders = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-03"
        title="Depressive Disorders"
        icdLine="ICD-11: 6A70–6A71 | DSM-5-TR: F32–F33 | Psychiatric Care Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <div style={{ marginBottom: "1rem" }}>
        <SectionTitle>1. Purpose</SectionTitle>
        <p style={{ margin: 0 }}>
          To ensure standardized, evidence-based and safe management of Depressive Disorders across all JRCPL units, focusing on accurate diagnosis, suicide risk reduction, rational pharmacotherapy, structured psychotherapy, and functional recovery.
        </p>
      </div>

      {/* 2. DIAGNOSTIC PROTOCOL */}
      <ModuleHeader>2. DIAGNOSTIC PROTOCOL</ModuleHeader>
      <SectionTitle>Severity Grading</SectionTitle>
      <Table
        cols={[{ label: "Severity", width: "25%" }, { label: "PHQ-9 Score", width: "15%", center: true }, { label: "HAM-D Score", width: "15%", center: true }, { label: "Clinical Features" }]}
        rows={[
          ["Mild", "5–9", "8–13", "Some symptoms; mild functional impact; insight preserved"],
          ["Moderate", "10–14", "14–18", "Multiple symptoms; moderate functional impairment"],
          ["Severe (without psychosis)", "15–19", "19–22", "Most symptoms; marked impairment; suicide risk elevated"],
          ["Severe (with psychosis)", "≥ 20", "≥ 23", "As above + mood-congruent delusions/hallucinations"],
        ]}
      />
      <BulletList items={[
        "Mandatory: Suicide risk assessment (C-SSRS) documented at ALL assessments",
        "Diagnosis based on ICD-11 / DSM-5-TR criteria with documented clinical judgment",
        "Psychological testing when indicated: BDI-II, MMPI-2, MoCA (elderly)",
      ]} />

      {/* 3. PHARMACOLOGICAL PROTOCOL */}
      <ModuleHeader>3. PHARMACOLOGICAL PROTOCOL</ModuleHeader>
      <SectionTitle>3.1 First-Line Treatment by Severity</SectionTitle>
      <Table
        cols={[{ label: "Severity", width: "20%" }, { label: "First-Line", width: "25%" }, { label: "Second-Line / Augmentation", width: "27%" }, { label: "Special Considerations" }]}
        rows={[
          ["Mild", "Psychotherapy alone (CBT, BA)", "SSRI if persistent > 4 weeks without improvement", "Lifestyle intervention; monitor every 2–4 weeks"],
          ["Moderate", "SSRI (Escitalopram 10 mg or Sertraline 50 mg)", "Increase dose; add mirtazapine; switch SSRI", "Review at 2 weeks; response at 4–6 weeks"],
          ["Severe (no psychosis)", "SSRI + low-dose antipsychotic if agitation/insomnia", "SNRI or TCA; ECT if no response ×2 trials", "Hospitalise; daily review; C-SSRS daily"],
          ["Severe (with psychosis)", "Antidepressant + antipsychotic combination", "ECT — high priority for psychotic depression", "Psychotic depression responds poorly to AD alone"],
        ]}
      />
      <SectionTitle>3.2 Antidepressant Guide</SectionTitle>
      <Table
        cols={[{ label: "Drug", width: "22%" }, { label: "Starting Dose", width: "18%" }, { label: "Target Dose", width: "18%" }, { label: "Key Notes" }]}
        rows={[
          ["Escitalopram (SSRI)", "10 mg OD", "10–20 mg OD", "Well-tolerated; preferred for elderly; QTc monitoring > 20 mg"],
          ["Sertraline (SSRI)", "25–50 mg OD", "50–200 mg OD", "Safest in cardiac disease; good evidence base"],
          ["Fluoxetine (SSRI)", "10–20 mg OD", "20–60 mg OD", "Long half-life; good for non-adherence-prone patients"],
          ["Venlafaxine (SNRI)", "37.5 mg BD", "75–225 mg/day", "Monitor BP; useful for pain comorbidity; discontinuation syndrome"],
          ["Mirtazapine (NaSSA)", "7.5–15 mg nocte", "15–45 mg nocte", "Sedating; stimulates appetite; useful in insomnia + weight loss"],
          ["Amitriptyline (TCA)", "10–25 mg nocte", "75–150 mg nocte", "Reserve for resistant cases; ECG monitoring; lethal in overdose"],
        ]}
      />
      <SectionTitle>3.3 ECT Indications</SectionTitle>
      <BulletList items={[
        "High suicide risk with treatment resistance",
        "Refusal to eat or drink threatening life",
        "Catatonia",
        "Severe psychotic depression",
        "Failure of ≥ 2 adequate antidepressant trials (Treatment-Resistant Depression — TRD)",
      ]} />

      {/* 4. PSYCHOTHERAPY PROTOCOL */}
      <ModuleHeader>4. PSYCHOTHERAPY PROTOCOL</ModuleHeader>
      <Table
        cols={[{ label: "Therapy", width: "25%" }, { label: "Indications", width: "28%" }, { label: "Frequency", width: "25%" }, { label: "Evidence Level", width: "12%", center: true }]}
        rows={[
          ["CBT (Cognitive Behavioural Therapy)", "All severities; core therapy", "Weekly (acute); fortnightly (maintenance)", "Grade A"],
          ["Behavioural Activation (BA)", "Mild–moderate depression; anhedonia dominant", "Weekly", "Grade A"],
          ["Interpersonal Therapy (IPT)", "Depression linked to relationship transitions/grief", "Weekly × 12–16 sessions", "Grade A"],
          ["Supportive Psychotherapy", "All patients; relationship base", "Every admission day", "Grade B"],
          ["Family Psychoeducation", "All inpatients; mandatory", "Weekly family session", "Grade A"],
          ["MBSR (Mindfulness-Based SR)", "Recurrent depression prevention", "Group programme, 8 weeks", "Grade B"],
        ]}
      />

      {/* 5. MONITORING PROTOCOL */}
      <ModuleHeader>5. MONITORING PROTOCOL</ModuleHeader>
      <Table
        cols={[{ label: "Phase", width: "22%" }, { label: "Frequency", width: "18%" }, { label: "Assessment", width: "28%" }, { label: "Action Threshold" }]}
        rows={[
          ["Acute (0–4 weeks)", "Every 1–2 weeks", "PHQ-9 / HAM-D; C-SSRS; side effects", "< 20% improvement at 4 weeks → reassess dose / switch"],
          ["Response (4–12 weeks)", "Every 2–4 weeks", "PHQ-9 / HAM-D; functional status", "Response = ≥50% reduction in rating scale score"],
          ["Remission (3–6 months)", "Monthly", "PHQ-9; relapse warning signs", "PHQ-9 < 5 = remission; continue AD for 6–12 months"],
          ["Maintenance (> 6 months)", "Every 3 months", "PHQ-9; social functioning; medication review", "Recurrent depression: 2+ years or lifelong treatment"],
        ]}
      />

      {/* 6. REHABILITATION PROTOCOL */}
      <ModuleHeader>6. REHABILITATION PROTOCOL</ModuleHeader>
      <BulletList items={[
        "Activity scheduling and social rhythm therapy",
        "Occupational and functional rehabilitation — graded task assignment",
        "Family reintegration and relapse prevention planning",
        "Sleep hygiene programme",
        "Exercise prescription: 30 min moderate aerobic activity × 3–5 days/week",
      ]} />

      {/* 7. DISCHARGE CRITERIA */}
      <ModuleHeader>7. DISCHARGE CRITERIA</ModuleHeader>
      <BulletList items={[
        "Suicide risk low; symptoms improved (PHQ-9 reduction ≥ 50%)",
        "Sleep stable; appetite recovered; functional improvement documented",
        "Family educated on relapse signs and crisis response",
        "Follow-up appointment confirmed within 7 days",
        "Medication plan and safety plan provided in writing",
      ]} />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "15%", center: true }, { label: "Review", width: "15%", center: true }]}
        rows={[
          ["C-SSRS documented at admission and each review", "100%", "Monthly"],
          ["PHQ-9 or HAM-D scored at admission and discharge", "100%", "Monthly"],
          ["Psychotherapy sessions: ≥ 2/week for inpatients", "≥ 95%", "Monthly"],
          ["Family psychoeducation session completed", "100%", "Monthly"],
          ["Discharge follow-up within 7 days", "≥ 80%", "Monthly"],
          ["Readmission within 3 months", "< 10%", "Quarterly"],
        ]}
      />

      <ProtocolApproval docCode="CL-03" docTitle="Depressive Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl03DepressiveDisorders;
