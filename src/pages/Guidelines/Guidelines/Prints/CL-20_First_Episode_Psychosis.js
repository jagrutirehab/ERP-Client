import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApprovalNew, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-20"],
  ["Title", "First-Episode Psychosis — Early Detection, Assessment & Management Protocol"],
  ["Version", "1.0 (New — May 2026)"],
  ["Effective Date", "01 June 2026"],
  ["Review Date", "31 May 2027"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Amar Shinde, Founder & Clinical Director"],
  ["Applicable To", "All patients presenting with a first episode of psychotic illness — All JRCPL Centres; All Age Groups"],
  ["Rating Scales", "PANSS, BPRS, CAARMS, SAPS, SANS, CGI-SCH, C-SSRS, GAF, Calgary Depression Scale"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 21, 23); NABH COP; IPS Guidelines; APA Guidelines; WHO Mental Health Action Plan 2013–2030"],
  ["Cross-Reference", "CL-01 (Schizophrenia), CL-02 (Bipolar), CL-03 (Depression), SE-01 (Suicide), SE-02 (Violence), SE-03 (Restraint)"],
];

const RATIONALE_ROWS = [
  ["Minimal effective dose", "FEP patients are antipsychotic-naive — high sensitivity to EPS and metabolic effects; use lowest effective dose"],
  ["Intensive psychosocial care", "Medication alone is insufficient for full recovery — family, psychology, and social support are equally essential"],
  ["Duration of Untreated Psychosis (DUP)", "Every week of DUP worsens prognosis; faster treatment initiation = better long-term outcome"],
  ["Avoid diagnostic foreclosure", "FEP diagnosis should be provisional; reassess at 6 months — it may be bipolar, substance-induced, or brief psychotic disorder"],
  ["Recovery orientation", "Full functional recovery is the goal — not just symptom suppression; education, employment, relationships must be prioritised"],
];

const DIAG_ROWS = [
  ["Schizophrenia", "6A20", "≥ 2 of: delusions/hallucinations/disorganised thinking/negative sx; ≥ 1 month", "Most common FEP diagnosis; refer CL-01 after confirmation"],
  ["Schizophreniform Disorder", "6A21", "As schizophrenia but 1–6 months duration", "Common FEP presentation — may evolve into schizophrenia or remit"],
  ["Brief Psychotic Disorder", "6A23", "< 1 month; often stress-precipitated; full recovery expected", "Best prognosis FEP; short course, full recovery in most"],
  ["Schizoaffective Disorder", "6A21", "Concurrent psychosis + significant mood episode", "Diagnosis requires longitudinal assessment; avoid labelling at FEP"],
  ["Bipolar with Psychotic Features", "6A60", "Mania/depression + psychosis; family history", "Common FEP differential; mood stabiliser is key treatment addition"],
  ["Substance-Induced Psychosis", "6C40–6C4Z", "Temporal relation to substance; resolves on abstinence", "Must exclude before primary psychosis label; urine drug screen mandatory"],
  ["Medical / Organic Psychosis", "Various", "Delirium; CNS disease; metabolic; autoimmune", "Exclude with investigations before psychiatric diagnosis"],
  ["Ultra-High Risk (UHR / Prodrome)", "—", "Attenuated psychotic symptoms; does not yet meet psychosis threshold", "Intervention before onset — Early Intervention programme"],
];

const MEDICAL_EXCL_ROWS = [
  ["CNS", "MRI brain (preferred) or CT head; EEG", "Tumour; epilepsy; encephalitis; demyelination; vascular lesion"],
  ["Autoimmune", "Anti-NMDA-R antibodies; ANA; anti-dsDNA; ESR; CRP", "Anti-NMDA receptor encephalitis (presents as FEP); autoimmune encephalitis"],
  ["Metabolic", "Thyroid (TSH); glucose; electrolytes; calcium; ammonia", "Thyrotoxicosis; hypoglycaemia; hyponatraemia; hepatic encephalopathy"],
  ["Infectious", "HIV; syphilis (VDRL/TPHA); Hepatitis B/C; TB screen", "HIV-associated neurocognitive disorder; neurosyphilis; CNS TB"],
  ["Toxic / Drug-induced", "Urine drug screen; blood alcohol; medication review", "Stimulant psychosis; cannabis-induced; steroid psychosis; anti-TB drug psychosis"],
  ["Nutritional", "Vitamin B12; folate; vitamin D", "B12 deficiency — can present as psychosis with megaloblastic changes"],
  ["Wilson's disease", "Serum ceruloplasmin; 24-hr urine copper; slit-lamp", "Wilson's — onset 5–35 years; psychiatric features precede neurological"],
];

const ASSESS_ROWS = [
  ["Full Psychiatric History", "Onset, duration, triggers, family hx, substance use, developmental hx", "Consultant Psychiatrist"],
  ["Mental Status Examination (MSE)", "Comprehensive; all domains — essential baseline", "Consultant Psychiatrist"],
  ["PANSS (Positive & Negative Syndrome Scale)", "Symptom severity (30 items; 7-point scale); positive, negative, general", "Psychiatrist / Trained Psychologist"],
  ["BPRS (Brief Psychiatric Rating Scale)", "Rapid severity measure; 18 items", "Psychiatrist / Psychologist"],
  ["CGI-SCH (Clinical Global Impression — SCH)", "Global severity and improvement rating", "Psychiatrist"],
  ["GAF (Global Assessment of Functioning)", "Psychosocial and occupational functioning baseline", "Psychiatrist"],
  ["C-SSRS (Columbia Suicide Severity Rating Scale)", "Suicide risk — mandatory at admission and every review", "Nurse / Psychiatrist"],
  ["Calgary Depression Scale for Schizophrenia", "Depressive symptoms distinct from negative symptoms in FEP", "Psychologist / Psychiatrist"],
  ["CAARMS (Comprehensive Assessment of At-Risk Mental State)", "UHR / Prodrome assessment if sub-threshold features", "Psychologist (trained)"],
  ["Cognitive Assessment (BRIEF-P or MoCA)", "Baseline cognitive profile; guide psychosocial planning", "Psychologist"],
];

const DUP_ROWS = [
  ["Prodrome onset", "First attenuated symptoms before full psychosis threshold", "Longer prodrome associated with more severe illness course"],
  ["Full psychosis onset", "First episode meeting criteria for psychosis", "DUP = time from full psychosis to treatment initiation"],
  ["DUP measurement", "Weeks from full psychosis onset to first adequate antipsychotic dose", "Every additional week of DUP associated with worse outcomes"],
  ["DUP target at JRCPL", "< 2 weeks from first JRCPL contact to treatment initiation", "Document DUP in days at admission; track as quality indicator"],
];

const AP_DOSE_ROWS = [
  ["Risperidone", "0.5–1 mg OD", "2–4 mg/day", "Excellent evidence; generic available; multiple forms", "EPS at > 4 mg; prolactin elevation; weight gain"],
  ["Aripiprazole", "5 mg OD", "10–15 mg/day", "Weight-neutral; akathisia manageable; activating", "Akathisia can worsen anxiety; start low"],
  ["Olanzapine", "2.5–5 mg nocte", "7.5–15 mg/day", "Highly effective; good for agitation; sleep", "Significant weight gain; metabolic syndrome; FEP very sensitive"],
  ["Quetiapine", "25–50 mg BD", "300–600 mg/day", "Low EPS; useful if depression/insomnia comorbid; no prolactin", "Metabolic; sedation; orthostatic hypotension"],
  ["Amisulpride", "100–200 mg OD", "200–400 mg/day", "Excellent negative symptom evidence; low weight gain", "Prolactin elevation; EPS at high dose; renal clearance"],
  ["Clozapine", "Not first-line FEP", "Reserved for TRS", "—", "Not for FEP unless treatment-resistant after 2+ adequate trials"],
];

const ADJUNCT_ROWS = [
  ["Acute agitation", "Lorazepam", "1–2 mg IM/oral", "Short-term bridge — max 4 weeks; taper as antipsychotic takes effect"],
  ["EPS (acute dystonia)", "Procyclidine or Benztropine", "2.5–5 mg oral/IM", "Treat acute; review need — do not prescribe prophylactically routinely"],
  ["Akathisia", "Propranolol", "10–40 mg BD", "Effective for subjective restlessness; monitor BP"],
  ["Insomnia", "Melatonin", "2–5 mg nocte", "First-line; safe; non-dependent"],
  ["Comorbid depression", "SSRI (Sertraline 50 mg)", "OD", "After 2 weeks if Calgary Depression Scale score elevated; monitor for activation"],
  ["Comorbid bipolar (mania)", "Lithium or Valproate", "Per CL-02", "Add mood stabiliser; see CL-02 for dosing and monitoring"],
];

const METABOLIC_ROWS = [
  ["Weight / BMI", "✓", "✓", "✓", "✓", "✓"],
  ["Waist circumference", "✓", "—", "✓", "✓", "✓"],
  ["Fasting blood sugar", "✓", "—", "✓", "✓", "✓"],
  ["HbA1c", "✓", "—", "—", "✓", "✓"],
  ["Fasting lipid profile", "✓", "—", "✓", "✓", "✓"],
  ["Blood pressure", "✓", "✓", "✓", "✓", "✓"],
  ["Prolactin", "✓", "—", "✓", "—", "✓"],
  ["ECG", "✓", "—", "—", "✓", "✓"],
  ["LFT + CBC", "✓", "—", "✓", "—", "✓"],
];

const PSYCH_PHASE_ROWS = [
  ["Acute / Stabilisation", "Weeks 1–4", "Psychoeducation (basic); supportive therapy; safety planning; family meeting; milieu therapy; structured routine", "Reduce distress; build therapeutic alliance; stabilise"],
  ["Early Recovery", "Months 2–3", "CBT for psychosis (CBTp) — cognitive model of psychosis; normalisation; understanding voices/beliefs; coping strategies", "Reduce distress from symptoms; improve insight"],
  ["Recovery / Consolidation", "Months 4–12", "Relapse prevention; social skills training; cognitive rehabilitation; vocational planning; family therapy", "Functional recovery; return to education/work; reduce relapse risk"],
  ["Maintenance", "> 12 months", "Long-term CBTp; IPSRT (if mood features); peer support; self-management programme", "Sustained recovery; prevent relapse; social integration"],
];

const CBTP_ROWS = [
  ["Engagement & Assessment", "Build therapeutic alliance; explore personal recovery goals; formulation of psychosis development", "Sessions 1–3"],
  ["Normalisation", "Psychosis on a continuum; voice hearing in general population; stress-vulnerability model", "Sessions 2–4"],
  ["ABC Model of Beliefs", "Situation → Belief → Emotional consequence; identify beliefs about voices/delusions", "Sessions 3–6"],
  ["Belief Modification", "Evidence-gathering; alternative explanations; reality testing; behavioural experiments", "Sessions 5–10"],
  ["Voice Work", "Relating differently to voices; AVATAR therapy; Acceptance and Commitment Therapy elements", "Sessions 8–12"],
  ["Negative Symptoms", "Behavioural activation; graded task assignment; social engagement scheduling", "Sessions 10–14"],
  ["Relapse Prevention", "Personal relapse signature; early warning signs plan; crisis card; social network mapping", "Sessions 14–16"],
];

const FAMILY_ROWS = [
  ["Session 1", "Understanding FEP — what is psychosis; onset; what causes it; stress-vulnerability model; dispel stigma", "Within first week"],
  ["Session 2", "Medication — why it works; what to expect; side effects; importance of adherence; what to do if refused", "Week 2"],
  ["Session 3", "Recognising early warning signs — patient-specific; prodromal checklist; when to call the team", "Week 3"],
  ["Session 4", "Communication skills — Expressed Emotion reduction; calm communication; avoiding criticism; setting boundaries without hostility", "Week 4"],
  ["Session 5", "Recovery and expectations — timeline; what full recovery means; education and work planning; hope", "Week 5"],
  ["Session 6", "Relapse prevention — family role in the crisis plan; emergency contacts; admission threshold", "Pre-discharge"],
  ["Ongoing", "Monthly family group; carer support group; quarterly family review with clinical team", "Post-discharge"],
];

const VOCATIONAL_ROWS = [
  ["Return to education (students)", "School/college liaison; accommodation plan; reduced load initially; psychologist support letter", "From month 2 if stable"],
  ["Return to work (employed)", "Occupational therapist functional assessment; graduated return; workplace disclosure decision support", "From month 3 if stable"],
  ["Vocational training (unemployed)", "Skills assessment; vocational counselling; NATS / ITI linkage; supported employment", "From month 6"],
  ["Academic counselling", "NIOS alternative if unable to return to mainstream; online learning options", "As needed from month 3"],
];

const RISK_ROWS = [
  ["Suicide risk", "Up to 10% lifetime risk in schizophrenia; highest in first year; command hallucinations; insight onset leading to hopelessness; depression comorbidity", "C-SSRS daily in acute phase; Calgary Depression Scale; SE-01 protocol; active safety planning"],
  ["Violence risk", "Acute psychosis with persecutory delusions; command hallucinations; agitation; substance comorbidity — risk is real but overestimated socially", "DASA-R assessment; SE-02 protocol; rapid treatment reduces risk significantly"],
  ["Self-neglect", "Inability to eat, drink, maintain hygiene due to disorganisation or negative symptoms", "Nursing ADL support; medication; family involvement; OT"],
];

const UHR_ROWS = [
  ["Attenuated Psychotic Symptoms", "Subthreshold delusions; subthreshold hallucinations; thought disorder — transient, brief, not fully formed", "CBTp; omega-3 fatty acids; avoid cannabis; monthly review; no antipsychotic unless transition to psychosis"],
  ["Brief Limited Intermittent Psychotic Symptoms (BLIPS)", "Full psychosis symptoms but < 1 week duration; spontaneous remission", "Close monitoring; family education; antipsychotic only if severe distress or dangerous"],
  ["Cognitive & Social Decline", "Significant drop in social or occupational functioning + schizotypal features or first-degree relative with psychosis", "Psychosocial support; CBT; address substance use; maintain connection"],
];

const DISCHARGE_ROWS = [
  ["PANSS positive score", "Reduction ≥ 30% from admission baseline; no active command hallucinations"],
  ["Behaviour", "No imminent risk to self or others; self-care maintained"],
  ["Medication", "Tolerating antipsychotic; dose optimised; adherence strategy in place; 30-day supply dispensed"],
  ["Insight", "Some acknowledgement of illness or treatment need (not required to be full; partial is sufficient)"],
  ["Family", "Family education completed; at least one session attended; emergency plan agreed"],
  ["Relapse signature", "Documented with patient and family — personalised early warning signs"],
  ["Follow-up", "Within 5 days of discharge; psychiatrist + psychologist appointments confirmed"],
  ["Community linkage", "CMHC / EIS (Early Intervention Service) referral if available; peer support; case manager assigned"],
];

const STEPDOWN_ROWS = [
  ["1", "Inpatient (IPD)", "Full team; 24-hour nursing", "Acute, high-risk, severely disorganised"],
  ["2", "Day Programme (Day Hospital)", "6 hours/day; 5 days/week", "Stabilised but needs intensive support; transition from IPD"],
  ["3", "Intensive OPD / Case Management", "Weekly psychiatrist + psychologist", "Largely stable; adherence being established"],
  ["4", "Standard OPD / Community follow-up", "Monthly or fortnightly", "Remission; maintained on medication; functioning"],
];

const DOC_ROWS = [
  ["DUP (Duration of Untreated Psychosis)", "At admission — days from onset to treatment", "Admitting Psychiatrist"],
  ["PANSS / BPRS", "Admission; every 2 weeks; discharge", "Psychiatrist / Psychologist"],
  ["C-SSRS", "Daily (acute); every review (recovery)", "Nurse / Psychiatrist"],
  ["CBTp session notes", "Within 24 hours of each session", "Psychologist"],
  ["Family session record", "After each session", "Psychologist / MSW"],
  ["Metabolic monitoring log", "Per schedule (Section 4.4)", "MO / Nurse"],
  ["Early Warning Signs plan", "Before discharge — co-developed with patient", "Psychologist + Patient"],
  ["Discharge summary", "Within 24 hours of discharge", "Treating Psychiatrist"],
];

const KPI_ROWS = [
  ["DUP documented at admission for every FEP patient", "100%", "Monthly"],
  ["PANSS scored at admission and discharge", "100%", "Monthly"],
  ["C-SSRS daily in acute phase; at every review in recovery", "100%", "Monthly"],
  ["Medical exclusion workup (MRI brain + full blood screen) completed", "100%", "Monthly"],
  ["CBTp commenced within 2 weeks of admission", "≥ 90%", "Monthly"],
  ["Family education programme completed (≥ 4 sessions)", "≥ 85%", "Monthly"],
  ["Metabolic monitoring at baseline and 3 months", "100%", "Monthly"],
  ["PANSS positive reduction ≥ 30% at discharge", "≥ 80% of patients", "Monthly"],
  ["Follow-up within 5 days of discharge", "≥ 85%", "Monthly"],
  ["Readmission within 3 months", "< 15%", "Quarterly"],
  ["Antipsychotic monotherapy maintained (no polypharmacy without MDT review)", "≥ 90%", "Monthly"],
];

const Cl20FirstEpisodePsychosis = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-20"
        title="First-Episode Psychosis (FEP)"
        icdLine="ICD-11: 6A20–6A2Z / 6A60 / 6A70 | Psychiatric Care Vertical — All JRCPL Centres"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose &amp; Rationale</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        The period of First-Episode Psychosis (FEP) is the most critical intervention window in psychotic illness. Early, high-quality, person-centred treatment in this phase can significantly alter long-term outcomes, reduce disability, and improve quality of life. Every week of untreated psychosis causes measurable harm. This protocol mandates rapid diagnosis, low-dose pharmacotherapy, intensive psychosocial intervention, and family engagement from Day 1.
      </p>
      <Table
        cols={[{ label: "Key Principle", width: "28%" }, { label: "Clinical Rationale" }]}
        rows={RATIONALE_ROWS}
      />

      {/* 2. DIAGNOSTIC FRAMEWORK */}
      <ModuleHeader>2. Diagnostic Framework &amp; Classification</ModuleHeader>
      <SectionTitle>2.1 Psychosis Spectrum Diagnoses — ICD-11 Classification</SectionTitle>
      <Table
        cols={[{ label: "Diagnosis", width: "22%" }, { label: "ICD-11", width: "10%", center: true }, { label: "Key Features", width: "34%" }, { label: "FEP Relevance" }]}
        rows={DIAG_ROWS}
      />

      <SectionTitle>2.2 Medical Causes to Exclude — Mandatory Workup</SectionTitle>
      <Table
        cols={[{ label: "Category", width: "16%" }, { label: "Investigation", width: "38%" }, { label: "Rule Out" }]}
        rows={MEDICAL_EXCL_ROWS}
      />

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Assessment Protocol</ModuleHeader>
      <SectionTitle>3.1 Mandatory Assessment Battery — Within 24 Hours of Admission</SectionTitle>
      <Table
        cols={[{ label: "Assessment", width: "36%" }, { label: "Purpose", width: "38%" }, { label: "Administered By" }]}
        rows={ASSESS_ROWS}
      />

      <SectionTitle>3.2 Duration of Untreated Psychosis (DUP) Assessment</SectionTitle>
      <Table
        cols={[{ label: "DUP Component", width: "22%" }, { label: "Definition", width: "40%" }, { label: "Why It Matters" }]}
        rows={DUP_ROWS}
      />

      {/* 4. PHARMACOLOGICAL */}
      <ModuleHeader>4. Pharmacological Management</ModuleHeader>
      <SectionTitle>4.1 Antipsychotic Selection — FEP Principles</SectionTitle>
      <BulletList items={[
        "Use the LOWEST effective dose — FEP patients have high antipsychotic sensitivity; standard doses cause unnecessary EPS",
        "Prefer atypical (second-generation) antipsychotics as first-line",
        "Avoid antipsychotic polypharmacy — monotherapy is standard in FEP",
        "Adequate trial: 6 weeks at therapeutic dose before declaring treatment failure",
        "Duration: Minimum 1–2 years after first episode; minimum 5 years after second episode",
      ]} />

      <SectionTitle>4.2 Antipsychotic Dose Guide — FEP</SectionTitle>
      <Table
        cols={[
          { label: "Agent", width: "15%" },
          { label: "FEP Starting Dose", width: "15%", center: true },
          { label: "FEP Target Dose", width: "15%", center: true },
          { label: "Advantages", width: "28%" },
          { label: "Cautions" },
        ]}
        rows={AP_DOSE_ROWS}
      />

      <SectionTitle>4.3 Adjunct Medications</SectionTitle>
      <Table
        cols={[{ label: "Indication", width: "22%" }, { label: "Agent", width: "22%" }, { label: "Dose", width: "16%", center: true }, { label: "Duration / Notes" }]}
        rows={ADJUNCT_ROWS}
      />

      <SectionTitle>4.4 Metabolic Monitoring Schedule — FEP</SectionTitle>
      <Table
        cols={[
          { label: "Parameter", width: "28%" },
          { label: "Baseline", width: "12%", center: true },
          { label: "Week 4", width: "11%", center: true },
          { label: "Month 3", width: "11%", center: true },
          { label: "Month 6", width: "11%", center: true },
          { label: "12-monthly", center: true },
        ]}
        rows={METABOLIC_ROWS}
      />
      <WarningBox>Weight gain &gt; 7% of baseline body weight: Dietary counselling; switch to weight-neutral antipsychotic (aripiprazole, amisulpride). FBS &gt; 126 mg/dL: Endocrinology referral.</WarningBox>

      {/* 5. PSYCHOLOGICAL */}
      <ModuleHeader>5. Psychological Interventions</ModuleHeader>
      <SectionTitle>5.1 Phase-Based Psychosocial Programme</SectionTitle>
      <Table
        cols={[{ label: "Phase", width: "20%" }, { label: "Duration", width: "14%" }, { label: "Key Interventions", width: "40%" }, { label: "Goal" }]}
        rows={PSYCH_PHASE_ROWS}
      />

      <SectionTitle>5.2 CBT for Psychosis (CBTp) — Key Components</SectionTitle>
      <Table
        cols={[{ label: "Component", width: "24%" }, { label: "Content", width: "58%" }, { label: "Sessions" }]}
        rows={CBTP_ROWS}
      />

      <SectionTitle>5.3 Family Intervention — Mandatory in FEP</SectionTitle>
      <Table
        cols={[{ label: "Session", width: "14%" }, { label: "Content", width: "60%" }, { label: "Timing" }]}
        rows={FAMILY_ROWS}
      />

      {/* 6. RECOVERY */}
      <ModuleHeader>6. Recovery-Oriented Care</ModuleHeader>
      <SectionTitle>6.1 Education &amp; Vocational Rehabilitation</SectionTitle>
      <Table
        cols={[{ label: "Goal", width: "26%" }, { label: "Intervention", width: "50%" }, { label: "Timeline" }]}
        rows={VOCATIONAL_ROWS}
      />

      <SectionTitle>6.2 Peer Support</SectionTitle>
      <BulletList items={[
        "Peer support worker involvement — a person with lived experience of psychosis who supports recovery",
        "Introduction to peer support group: iCall, Schizophrenia Awareness Association (SAA), Vandrevala Foundation groups",
        "JRCPL alumni network: Connecting current FEP patients with recovered peers (with consent)",
      ]} />

      {/* 7. RISK */}
      <ModuleHeader>7. Suicide &amp; Violence Risk in FEP</ModuleHeader>
      <Table
        cols={[{ label: "Risk", width: "14%" }, { label: "FEP-Specific Factors", width: "46%" }, { label: "Management" }]}
        rows={RISK_ROWS}
      />

      {/* 8. UHR */}
      <ModuleHeader>8. Ultra-High Risk (UHR) / Prodromal State</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        JRCPL will assess and manage patients referred with Ultra-High Risk (Prodromal) features — attenuated psychotic symptoms that do not yet meet full psychosis criteria. Early intervention at this stage may prevent transition to full psychosis.
      </p>
      <Table
        cols={[{ label: "UHR Criteria (CAARMS)", width: "28%" }, { label: "Features", width: "36%" }, { label: "JRCPL Management" }]}
        rows={UHR_ROWS}
      />

      {/* 9. DISCHARGE */}
      <ModuleHeader>9. Discharge Criteria &amp; Step-Down Care</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "22%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />
      <SectionTitle style={{ marginTop: "1rem" }}>Step-Down Care Options</SectionTitle>
      <Table
        cols={[{ label: "Step", width: "8%", center: true }, { label: "Setting", width: "26%" }, { label: "Intensity", width: "28%" }, { label: "Indication" }]}
        rows={STEPDOWN_ROWS}
      />

      {/* 10. DOCUMENTATION */}
      <ModuleHeader>10. Documentation Standards</ModuleHeader>
      <Table
        cols={[{ label: "Document", width: "34%" }, { label: "Frequency", width: "30%" }, { label: "Responsible" }]}
        rows={DOC_ROWS}
      />

      {/* 11. KPIs */}
      <ModuleHeader>11. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "16%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApprovalNew docCode="CL-20" docTitle="First-Episode Psychosis (FEP)" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl20FirstEpisodePsychosis;
