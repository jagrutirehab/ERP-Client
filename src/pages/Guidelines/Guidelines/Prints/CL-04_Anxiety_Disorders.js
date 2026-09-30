import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-04"],
  ["Title", "Anxiety Disorders — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "GAD, Panic Disorder, Social Anxiety, Specific Phobia, Agoraphobia, Mixed Anxiety-Depression — All JRCPL Centres"],
  ["Rating Scales", "GAD-7, PDSS, LSAS, HAM-A, C-SSRS, PHQ-9"],
  ["Regulatory Basis", "MHCA 2017; NABH COP 3, 5; IPS Clinical Practice Guidelines; NICE NG94"],
  ["Replaces", "JRCPL/CP/DA/007 (Anxiety sections extracted and expanded as standalone CL-04)"],
];

const Cl04AnxietyDisorders = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-04"
        title="Anxiety Disorders"
        icdLine="ICD-11: 6B00–6B0Z | DSM-5-TR: F40–F41 | Psychiatric Care Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a standardised, evidence-based clinical pathway for the assessment, pharmacological management, psychological treatment, and relapse prevention of all Anxiety Disorder presentations across all JRCPL centres — ensuring consistent, safe, and outcome-driven care aligned with ICD-11, MHCA 2017, NABH COP, and NICE NG94 standards.
      </p>

      {/* 2. SCOPE */}
      <SectionTitle>2. Scope</SectionTitle>
      <BulletList items={[
        "All inpatients and outpatients presenting with primary anxiety disorders",
        "All clinical staff: psychiatrists, psychologists, medical officers, nursing staff",
        "Applicable diagnostic categories: GAD, Panic Disorder, Social Anxiety Disorder (Social Phobia), Specific Phobia, Agoraphobia, Mixed Anxiety-Depression",
        "Excludes OCD and PTSD — refer JRCPL-CL-XX (OCD SOP) and JRCPL-CL-XX (PTSD SOP) respectively",
      ]} />

      {/* 3. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>3. DIAGNOSTIC CLASSIFICATION</ModuleHeader>
      <Table
        cols={[{ label: "Diagnosis", width: "25%" }, { label: "ICD-11 Code", width: "10%" }, { label: "DSM-5-TR Code", width: "12%" }, { label: "Core Feature" }]}
        rows={[
          ["Generalised Anxiety Disorder", "6B00", "F41.1", "Excessive, uncontrollable worry ≥ 6 months across multiple domains; 3+ somatic symptoms"],
          ["Panic Disorder", "6B01", "F41.0", "Recurrent unexpected panic attacks + persistent concern about further attacks or avoidance"],
          ["Agoraphobia", "6B02", "F40.00", "Marked fear of open spaces, public transport, queues — leads to avoidance"],
          ["Social Anxiety Disorder", "6B04", "F40.10", "Marked fear of social situations involving scrutiny; fear of acting embarrassingly"],
          ["Specific Phobia", "6B03", "F40.2X", "Marked, disproportionate fear of specific object/situation — animals, blood, heights, flying"],
          ["Mixed Anxiety-Depression", "6B0Z", "F41.8", "Subsyndromal symptoms of both anxiety and depression; neither meets full criteria alone"],
        ]}
      />

      {/* 4. DIAGNOSTIC PROTOCOL */}
      <ModuleHeader>4. DIAGNOSTIC PROTOCOL</ModuleHeader>
      <SectionTitle>4.1 Mandatory Screening Battery (within 24 hours of admission)</SectionTitle>
      <Table
        cols={[{ label: "Scale", width: "25%" }, { label: "Disorder", width: "20%" }, { label: "Administered By", width: "20%" }, { label: "Alert Threshold" }]}
        rows={[
          ["GAD-7", "Generalised Anxiety", "Nurse / Psychologist", "≥ 8 = anxiety present; ≥ 15 = severe"],
          ["PDSS (Panic Disorder Severity Scale)", "Panic Disorder", "Psychologist", "Score ≥ 7 = clinically significant panic"],
          ["LSAS (Liebowitz Social Anxiety Scale)", "Social Anxiety", "Psychologist / Psychiatrist", "≥ 60 = moderate–severe SAD"],
          ["HAM-A (Hamilton Anxiety Rating Scale)", "All anxiety disorders", "Clinician-rated", "≥ 18 = moderate; ≥ 25 = severe"],
          ["PHQ-9", "Comorbid depression screen", "Nurse / Psychologist", "≥ 10 = significant depressive comorbidity"],
          ["C-SSRS", "Suicide risk", "Nurse / Psychiatrist", "Any ideation with plan/intent: immediate review"],
        ]}
      />
      <SectionTitle>4.2 Medical Rule-Out Investigations</SectionTitle>
      <Table
        cols={[{ label: "Investigation", width: "22%" }, { label: "Rule Out", width: "35%" }, { label: "Action if Abnormal" }]}
        rows={[
          ["TSH, T3, T4", "Hyperthyroidism (mimics anxiety); hypothyroidism", "Endocrinology referral; treat thyroid before labelling primary anxiety"],
          ["Fasting Blood Sugar / HbA1c", "Hypoglycaemia (mimics panic); diabetes-related anxiety", "Correct glucose; reassess anxiety after stabilisation"],
          ["ECG", "Cardiac arrhythmia (mimics panic); pre-treatment baseline", "Cardiology referral; avoid QTc-prolonging agents if QTc > 450 ms"],
          ["CBC", "Anaemia-related fatigue / anxiety", "Treat underlying cause"],
          ["Serum Calcium", "Hyperparathyroidism (somatic anxiety symptoms)", "Parathyroid evaluation"],
          ["Urine drug screen", "Stimulant-induced or withdrawal-induced anxiety", "Integrate de-addiction protocol as indicated"],
        ]}
      />
      <SectionTitle>4.3 Differential Diagnosis Checklist</SectionTitle>
      <Table
        cols={[{ label: "Condition to Exclude", width: "30%" }, { label: "Key Distinguishing Feature" }]}
        rows={[
          ["Hyperthyroidism", "Tremor, weight loss, heat intolerance, elevated T3/T4; anxiety resolves with thyroid treatment"],
          ["Cardiac arrhythmia / palpitations", "ECG changes; cardiologist assessment; anxiety secondary to cardiac symptom awareness"],
          ["PTSD", "Identifiable trauma; re-experiencing, avoidance, hyperarousal cluster — refer PTSD protocol"],
          ["OCD", "Obsessions + compulsions; ego-dystonic intrusive thoughts — refer OCD protocol"],
          ["Substance-induced anxiety disorder", "Temporal relationship to substance use or withdrawal; urine drug screen positive"],
          ["Adjustment Disorder with anxious mood", "Identifiable stressor; onset within 3 months; does not meet full anxiety disorder criteria"],
          ["Somatic Symptom Disorder", "Excessive preoccupation with physical symptoms; disproportionate anxiety about health"],
        ]}
      />

      {/* 5. GAD */}
      <ModuleHeader>5. GENERALISED ANXIETY DISORDER (GAD) — MANAGEMENT PROTOCOL</ModuleHeader>
      <SectionTitle>5.1 Diagnostic Criteria Summary (ICD-11: 6B00)</SectionTitle>
      <BulletList items={[
        "Excessive anxiety and worry about multiple events or activities, most days for ≥ 6 months",
        "Difficulty controlling the worry",
        "≥ 3 of: restlessness, fatigue, difficulty concentrating, irritability, muscle tension, sleep disturbance",
        "Significant distress or functional impairment; not attributable to substance or medical condition",
      ]} />
      <SectionTitle>5.2 Severity Classification</SectionTitle>
      <Table
        cols={[{ label: "Severity", width: "15%" }, { label: "GAD-7 Score", width: "15%", center: true }, { label: "HAM-A Score", width: "15%", center: true }, { label: "Management Setting" }]}
        rows={[
          ["Mild", "5–9", "8–13", "OPD; psychotherapy first-line; medication if no response at 6 weeks"],
          ["Moderate", "10–14", "14–17", "OPD / Day programme; combined CBT + SSRI"],
          ["Severe", "≥ 15", "≥ 18", "IPD if significant functional impairment; combined treatment; daily review"],
        ]}
      />
      <SectionTitle>5.3 Pharmacotherapy — GAD</SectionTitle>
      <Table
        cols={[{ label: "Agent", width: "22%" }, { label: "Starting Dose", width: "18%" }, { label: "Target Dose", width: "18%" }, { label: "Key Notes" }]}
        rows={[
          ["Escitalopram (SSRI)", "5–10 mg OD", "10–20 mg OD", "First-line; start low to avoid initial anxiogenic activation; full effect at 4–6 weeks"],
          ["Sertraline (SSRI)", "25–50 mg OD", "50–200 mg OD", "Well-tolerated; preferred if cardiac comorbidity; good evidence for GAD"],
          ["Duloxetine (SNRI)", "30 mg OD", "60–120 mg/day", "First-line alternative; evidence for GAD + comorbid pain; monitor BP"],
          ["Venlafaxine XR (SNRI)", "37.5 mg OD", "75–225 mg OD", "Strong evidence for GAD; discontinuation syndrome — taper slowly"],
          ["Pregabalin", "75 mg BD", "150–600 mg/day", "Rapid onset (1–2 weeks); useful in severe GAD; monitor for dizziness, sedation; abuse potential"],
          ["Buspirone", "5 mg TDS", "15–30 mg/day in 3 doses", "Non-sedating; no dependence; delayed onset (2–4 weeks); preferred if BZD dependence risk"],
          ["Lorazepam / Clonazepam", "0.5–1 mg TDS (PRN)", "Max 2 weeks", "Short-term bridge only — NOT long-term treatment for GAD; taper before discontinuing; document rationale for every PRN"],
        ]}
      />
      <WarningBox>⚠ Benzodiazepines are NOT a long-term treatment for GAD. Each PRN dose must have a documented clinical indication. Maximum duration without specialist review: 2 weeks. Never prescribe for &gt; 4 weeks without documented CAPA.</WarningBox>
      <SectionTitle>5.4 Psychological Interventions — GAD</SectionTitle>
      <Table
        cols={[{ label: "Intervention", width: "25%" }, { label: "Content", width: "40%" }, { label: "Frequency", width: "22%" }, { label: "Evidence", width: "8%", center: true }]}
        rows={[
          ["CBT (Core — First-line)", "Worry identification; cognitive restructuring; worry postponement; behavioural experiments; relaxation training", "Weekly × 12–16 sessions (60 min)", "Grade A"],
          ["Worry Management Protocol", "Worry time scheduling (20 min/day); productive vs unproductive worry distinction; uncertainty tolerance training", "Integrated into CBT sessions", "Grade A"],
          ["Progressive Muscle Relaxation (PMR)", "Systematic tension-release of 16 muscle groups; daily practice; reduces autonomic arousal", "Daily home practice; taught in session 1", "Grade B"],
          ["Mindfulness-Based CBT (MBCT)", "Non-judgmental awareness of worry thoughts; detached observation; decentring techniques", "8-week structured programme", "Grade B"],
          ["Applied Relaxation", "Cue-controlled relaxation; quick-release technique for use in anxiety-provoking situations", "Weekly × 12 sessions", "Grade B"],
          ["Psychoeducation (mandatory all)", "Worry vs problem-solving; anxiety physiology; fight-flight-freeze response; vicious cycle of anxiety", "Session 1 — all patients", "Grade A"],
        ]}
      />

      {/* 6. PANIC DISORDER */}
      <ModuleHeader>6. PANIC DISORDER — MANAGEMENT PROTOCOL</ModuleHeader>
      <SectionTitle>6.1 Diagnostic Criteria Summary (ICD-11: 6B01)</SectionTitle>
      <BulletList items={[
        "Recurrent unexpected panic attacks: sudden surge of intense fear peaking within minutes",
        "≥ 4 of: palpitations, sweating, trembling, shortness of breath, choking, chest pain, nausea, dizziness, chills/hot flushes, paraesthesia, derealisation, fear of losing control, fear of dying",
        "≥ 1 month of persistent concern about further attacks OR significant maladaptive behaviour change",
        "Not attributable to substance or medical condition; cardiac cause excluded",
      ]} />
      <SectionTitle>6.2 Panic Attack Management — Acute</SectionTitle>
      <Table
        cols={[{ label: "Step", width: "6%", center: true }, { label: "Action", width: "55%" }, { label: "Rationale" }]}
        rows={[
          ["1", "Reassure patient: 'You are safe. This is a panic attack. It will pass within 10 minutes.'", "Break the catastrophic interpretation cycle"],
          ["2", "Paced breathing: Inhale 4 seconds, hold 2, exhale 6 seconds; repeat × 5", "Correct hyperventilation; reduce CO₂-driven symptoms"],
          ["3", "Grounding — 5-4-3-2-1: Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste", "Redirect attention from somatic symptoms to environment"],
          ["4", "If not resolving in 15 minutes: Lorazepam 0.5–1 mg sublingual or oral PRN — with documented indication", "Pharmacological support for refractory acute panic"],
          ["5", "Post-attack debrief: Explore thoughts during attack; correct catastrophic cognitions", "Psychoeducation; prevent anticipatory anxiety consolidation"],
        ]}
      />
      <SectionTitle>6.3 Pharmacotherapy — Panic Disorder</SectionTitle>
      <Table
        cols={[{ label: "Agent", width: "22%" }, { label: "Starting Dose", width: "18%" }, { label: "Target Dose", width: "18%" }, { label: "Key Notes" }]}
        rows={[
          ["Escitalopram (SSRI)", "5 mg OD", "10–20 mg OD", "Start at 5 mg — higher starting doses worsen panic initially; titrate up after 1 week"],
          ["Sertraline (SSRI)", "12.5–25 mg OD", "50–200 mg OD", "Titrate slowly; full antipanic effect at 4–6 weeks"],
          ["Clonazepam (adjunct)", "0.25 mg BD", "0.5–2 mg/day", "Bridge during SSRI initiation; maximum 4–6 weeks; taper before discontinuing"],
          ["Venlafaxine XR (SNRI)", "37.5 mg OD", "75–225 mg OD", "Alternative to SSRI; FDA-approved for panic disorder; avoid abrupt discontinuation"],
          ["Imipramine (TCA)", "10–25 mg nocte", "75–200 mg nocte", "Effective but reserve for SSRI/SNRI failure; ECG mandatory; lethal in overdose — use caution"],
        ]}
      />
      <SectionTitle>6.4 CBT for Panic Disorder — Clark's Model</SectionTitle>
      <Table
        cols={[{ label: "CBT Component", width: "25%" }, { label: "Content" }, { label: "Sessions", width: "15%" }]}
        rows={[
          ["Psychoeducation", "Panic physiology; fight-flight response; safety behaviours explanation; vicious panic cycle", "Sessions 1–2"],
          ["Breathing Retraining", "Paced breathing; hyperventilation explanation; capnography feedback if available", "Sessions 2–3"],
          ["Cognitive Restructuring", "Catastrophic misinterpretation of bodily sensations; probability estimation; pie charts; decatastrophising", "Sessions 3–6"],
          ["Interoceptive Exposure", "Deliberately induce feared sensations (spinning, breath-holding, exercise) to build tolerance; ladder approach", "Sessions 6–10"],
          ["Situational Exposure", "Graduated exposure to avoided situations; hierarchy (0–100 SUDS); weekly homework", "Sessions 8–14"],
          ["Relapse Prevention", "Early warning signs; self-monitoring; continued exposure homework; booster sessions plan", "Sessions 14–16"],
        ]}
      />

      {/* 7. SOCIAL ANXIETY */}
      <ModuleHeader>7. SOCIAL ANXIETY DISORDER — MANAGEMENT PROTOCOL</ModuleHeader>
      <SectionTitle>7.1 Diagnostic Criteria Summary (ICD-11: 6B04)</SectionTitle>
      <BulletList items={[
        "Marked and disproportionate fear or anxiety about social situations involving scrutiny by others",
        "Fear of acting in a way that will be negatively evaluated (embarrassing, humiliating, or offensive)",
        "Social situations consistently provoke fear or anxiety; avoided or endured with intense distress",
        "Duration ≥ several months; significant functional impairment",
      ]} />
      <SectionTitle>7.2 Severity Assessment — LSAS</SectionTitle>
      <Table
        cols={[{ label: "LSAS Score", width: "15%", center: true }, { label: "Severity", width: "20%" }, { label: "Management Approach" }]}
        rows={[
          ["< 30", "Mild", "OPD; CBT with exposure; medication if no response at 8 weeks"],
          ["30–59", "Moderate", "Combined CBT + SSRI; OPD or day programme"],
          ["60–89", "Marked", "Combined treatment; consider group CBT; SSRI at therapeutic dose; IPD if impairment severe"],
          ["≥ 90", "Severe/Generalised", "IPD; combined treatment; SSRI at optimal dose; augmentation if needed; vocational impact addressed"],
        ]}
      />
      <SectionTitle>7.3 Pharmacotherapy — Social Anxiety Disorder</SectionTitle>
      <Table
        cols={[{ label: "Agent", width: "22%" }, { label: "Starting Dose", width: "18%" }, { label: "Target Dose", width: "18%" }, { label: "Key Notes" }]}
        rows={[
          ["Sertraline (SSRI)", "25 mg OD", "50–200 mg OD", "First-line; strong evidence; full effect at 8–12 weeks for SAD"],
          ["Escitalopram (SSRI)", "5–10 mg OD", "10–20 mg OD", "Well-tolerated; good evidence for generalised SAD"],
          ["Venlafaxine XR", "37.5 mg OD", "75–225 mg OD", "FDA-approved for SAD; alternative to SSRI; monitor BP"],
          ["Pregabalin", "75 mg BD", "150–600 mg/day", "Second-line; useful if performance anxiety prominent; rapid onset"],
          ["Propranolol (PRN)", "10–20 mg", "PRN only", "For situational performance anxiety; NOT for generalised SAD; taken 30–60 min before event"],
        ]}
      />
      <SectionTitle>7.4 CBT for Social Anxiety — Clark &amp; Wells Model</SectionTitle>
      <Table
        cols={[{ label: "CBT Component", width: "25%" }, { label: "Content" }, { label: "Sessions", width: "15%" }]}
        rows={[
          ["Psychoeducation", "The Clark-Wells model — self-focused attention; safety behaviours; maintaining cycles", "Sessions 1–2"],
          ["Attention Retraining", "Shifting attention from self-monitoring to external environment; video feedback", "Sessions 2–4"],
          ["Safety Behaviour Elimination", "Identify and drop safety behaviours (e.g. avoiding eye contact, overpreparing, holding cup with both hands)", "Sessions 3–6"],
          ["Cognitive Restructuring", "Pre-event processing; post-event rumination; probability vs awfulness; survey methods", "Sessions 4–8"],
          ["Behavioural Experiments", "Test feared predictions without safety behaviours; in-session role-plays; real-world exposure", "Sessions 6–12"],
        ]}
      />

      {/* 8. COMORBIDITY */}
      <ModuleHeader>8. COMORBIDITY MANAGEMENT</ModuleHeader>
      <Table
        cols={[{ label: "Comorbidity", width: "25%" }, { label: "Clinical Implication", width: "35%" }, { label: "Management Adjustment" }]}
        rows={[
          ["Anxiety + Major Depression", "Treat depression first if severe; SSRIs treat both simultaneously", "Combined SSRI + CBT; monitor both PHQ-9 and GAD-7"],
          ["Anxiety + Substance Use Disorder", "Substance often used to self-medicate anxiety; withdrawal can mimic/worsen anxiety", "Integrated treatment; stabilise substance use first; avoid BZDs if alcohol SUD"],
          ["Anxiety + Medical illness (cardiac/thyroid)", "Medical cause must be treated; anxiety may persist post-treatment", "Liaison psychiatry; collaborative care with treating physician"],
          ["Anxiety + OCD", "Co-occurring — both may need ERP for OCD; SSRIs treat both; Y-BOCS + GAD-7", "Follow OCD protocol (JRCPL-CL-12) as primary if OCD is dominant"],
          ["Anxiety + ADHD", "Anxiety may mask ADHD; stimulants may worsen anxiety; sequencing treatment", "Treat more impairing condition first; SSRIs + non-stimulant if both significant"],
          ["Anxiety + PTSD", "Trauma exploration may worsen anxiety — careful sequencing essential", "Follow PTSD protocol (JRCPL-CL-13); stabilisation before trauma work"],
        ]}
      />

      {/* 9. MONITORING */}
      <ModuleHeader>9. MONITORING PROTOCOL</ModuleHeader>
      <Table
        cols={[{ label: "Phase", width: "20%" }, { label: "Frequency", width: "16%" }, { label: "Assessment", width: "28%" }, { label: "Action Threshold" }]}
        rows={[
          ["Initiation (0–2 wks)", "Every 1–2 weeks", "GAD-7 / HAM-A; C-SSRS; side effects", "Activation syndrome (agitation, restlessness): reduce dose; reassess"],
          ["Response (2–8 wks)", "Every 2 weeks", "GAD-7; PHQ-9; functional status; adherence", "< 25% GAD-7 reduction at 4 weeks: review dose or switch"],
          ["Remission (8–24 wks)", "Monthly", "GAD-7; relapse warning signs; ADL", "GAD-7 < 5 = remission; continue therapy for minimum 6–12 months"],
          ["Maintenance (> 6 mo)", "Every 3 months", "GAD-7; social / occupational functioning", "Recurrence: reinitiate full treatment; review lifestyle factors"],
          ["Side effect checks", "Every review", "SSRI side effects: nausea, sexual, weight; BZD: dependence, sedation", "Intolerable side effects: switch agent; document rationale"],
        ]}
      />

      {/* 10. PSYCHOTHERAPY DELIVERY */}
      <ModuleHeader>10. PSYCHOTHERAPY DELIVERY STANDARDS</ModuleHeader>
      <Table
        cols={[{ label: "Standard", width: "30%" }, { label: "Requirement" }]}
        rows={[
          ["Session Frequency — Inpatients", "Minimum 2 individual CBT sessions per week; minimum 3 group anxiety management sessions per week"],
          ["Session Frequency — OPD", "1 individual CBT session per week; group sessions as available"],
          ["Session Duration", "Individual: 50–60 minutes; Group: 90 minutes"],
          ["CBT Homework", "Assigned at every session; reviewed at the next; documented in EMR session note"],
          ["Session Documentation", "SOAP format note in EMR within 24 hours: Subjective, Objective, Assessment, Plan"],
          ["Family Psychoeducation", "Minimum 1 family session within 2 weeks of admission; monthly thereafter"],
          ["Therapist Competency", "CBT delivered by Clinical Psychologist trained in anxiety disorders; supervisor review monthly"],
          ["Progress Measurement", "GAD-7 / PDSS / LSAS scored fortnightly; graphed in EMR; shared with patient (collaborative empiricism)"],
        ]}
      />

      {/* 11. SAFETY */}
      <ModuleHeader>11. SAFETY MONITORING</ModuleHeader>
      <BulletList items={[
        "C-SSRS administered at admission and at every clinical review — anxiety disorders carry elevated suicide risk",
        "PHQ-9 item 9 > 0: Activate Suicide Risk Prevention SOP (SE-01) immediately",
        "Enhanced observation during first 72 hours of any new antidepressant initiation",
        "GAD-7 ≥ 15 with suicidal ideation: Immediate inpatient level of care",
        "Activation syndrome monitoring — first 2 weeks of SSRI: increased agitation, restlessness, impulsivity",
        "Benzodiazepine dependence screening at every review: AUDIT-BZ or clinical assessment; escalate if dependence developing",
      ]} />

      {/* 12. DISCHARGE CRITERIA */}
      <ModuleHeader>12. DISCHARGE CRITERIA</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "22%" }, { label: "Standard" }]}
        rows={[
          ["GAD-7 Score", "< 8 (mild range) maintained for minimum 5 consecutive days"],
          ["C-SSRS", "No active suicidal ideation at discharge — documented"],
          ["Functional Status", "Patient able to manage basic ADL; anxiety not preventing self-care"],
          ["Medication", "Tolerating SSRI/SNRI; dose optimised; 30-day prescription dispensed"],
          ["Psychotherapy", "CBT skills taught and practised; relapse prevention plan documented"],
          ["Family Education", "Family educated on anxiety, medication, warning signs, crisis response"],
          ["Follow-Up", "OPD appointment within 7 days; psychologist follow-up confirmed"],
        ]}
      />

      {/* 13. RELAPSE PREVENTION */}
      <ModuleHeader>13. RELAPSE PREVENTION PLAN</ModuleHeader>
      <Table
        cols={[{ label: "Component", width: "25%" }, { label: "Content" }]}
        rows={[
          ["Personal trigger list", "Patient-identified: work stress, interpersonal conflict, sleep deprivation, caffeine, specific social situations"],
          ["Early warning signs", "Patient-specific: first signs that anxiety is returning (sleep change, muscle tension, worry escalation, avoidance restart)"],
          ["Self-help toolkit", "Breathing exercises; PMR audio; worry postponement diary; grounding techniques; thought records"],
          ["Action plan", "Step 1: apply self-help tools; Step 2: contact treating psychologist; Step 3: contact psychiatrist if panic escalating; Step 4: crisis contacts if suicidal ideation"],
          ["Medication adherence plan", "Written medication schedule; what to do if a dose is missed; do not stop SSRI abruptly; report side effects"],
          ["Emergency contacts", "Treating psychiatrist; JRCPL 24-hour helpline; Vandrevala Foundation: 1860-2662-345; iCall: 9152987821"],
        ]}
      />

      {/* 14. KPIs */}
      <ModuleHeader>14. KEY PERFORMANCE INDICATORS (KPIs)</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "15%", center: true }, { label: "Review", width: "12%", center: true }]}
        rows={[
          ["GAD-7 administered within 24 hours of admission", "100%", "Monthly"],
          ["C-SSRS administered at admission and every review", "100%", "Monthly"],
          ["Medical rule-out investigations completed", "≥ 95%", "Monthly"],
          ["CBT initiated within 48 hours of admission", "≥ 95%", "Monthly"],
          ["CBT sessions ≥ 2/week for inpatients", "≥ 90%", "Monthly"],
          ["Family psychoeducation session within 2 weeks of admission", "≥ 90%", "Monthly"],
          ["GAD-7 reduction ≥ 50% at discharge", "≥ 70% of patients", "Monthly"],
          ["Discharge follow-up appointment within 7 days", "≥ 80%", "Monthly"],
          ["Benzodiazepine use > 4 weeks documented with clinical rationale", "100%", "Monthly"],
          ["Readmission within 3 months", "< 10%", "Quarterly"],
        ]}
      />

      <ProtocolApproval docCode="CL-04" docTitle="Anxiety Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl04AnxietyDisorders;
