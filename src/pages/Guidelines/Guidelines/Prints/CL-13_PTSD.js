import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-13"],
  ["Title", "PTSD & Complex PTSD — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL Centres — All Clinical Verticals — IPD & OPD"],
  ["Rating Scales", "PCL-5; IES-R; PHQ-9; GAD-7; C-SSRS; ITQ (Complex PTSD)"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NICE NG116; ISTSS Guidelines 2019"],
  ["Replaces", "Newly developed standalone protocol"],
];

const DIAG_ROWS = [
  ["Trauma type", "Single or multiple traumatic events", "Prolonged, repeated, or multiple traumas (childhood abuse, domestic violence, torture, captivity)"],
  ["Core PTSD symptoms", "Re-experiencing; avoidance; hyperarousal — all three required", "Same three clusters required PLUS"],
  ["Additional features", "—", "Affect dysregulation; negative self-concept ('I am worthless'); disturbances in relationships"],
  ["Functional impact", "Significant impairment in social/occupational", "Often pervasive — identity, relationships, emotion regulation all affected"],
  ["Treatment", "Trauma-focused therapy (TF-CBT, EMDR)", "Phase-based: stabilisation first, THEN trauma work"],
  ["ICD-11 Code", "6B40", "6B41"],
];

const DSM_ROWS = [
  ["A — Traumatic event", "Exposure to actual/threatened death, serious injury, or sexual violence (direct, witnessed, learning of event, repeated exposure)"],
  ["B — Intrusion (≥ 1)", "Flashbacks; nightmares; intrusive memories; intense/prolonged distress at trauma cues; physiological reactions to cues"],
  ["C — Avoidance (≥ 1)", "Avoidance of distressing memories, thoughts, feelings; avoidance of external reminders (people, places, conversations)"],
  ["D — Negative cognitions/mood (≥ 2)", "Amnesia; negative beliefs; distorted blame; persistent negative emotional state; diminished interest; feeling detached; inability to feel positive"],
  ["E — Hyperarousal (≥ 2)", "Irritability; reckless behaviour; hypervigilance; exaggerated startle; concentration difficulty; sleep disturbance"],
  ["F — Duration", "Symptoms > 1 month"],
  ["G — Impairment", "Clinically significant distress or functional impairment"],
];

const SCALE_ROWS = [
  ["PCL-5 (PTSD Checklist for DSM-5)", "20-item self-report; maps onto DSM-5 PTSD criteria; 0–80", "≥ 31–33 = probable PTSD", "Patient"],
  ["IES-R (Impact of Event Scale-Revised)", "22-item self-report; intrusion, avoidance, hyperarousal", "≥ 33 = probable PTSD; ≥ 37 = warrants clinical attention", "Patient"],
  ["ITQ (International Trauma Questionnaire)", "ICD-11 aligned; distinguishes PTSD from Complex PTSD", "Separate PTSD and Disturbances in Self-Organisation scores", "Patient"],
  ["PHQ-9", "Comorbid depression (very common in PTSD)", "≥ 10 = significant depression", "Patient"],
  ["GAD-7", "Comorbid anxiety", "≥ 8 = anxiety present", "Patient"],
  ["C-SSRS", "Suicide risk — PTSD significantly elevates suicide risk", "Any ideation with intent: immediate review", "Clinician"],
  ["AUDIT / DAST-10", "Substance use comorbidity (extremely common in PTSD)", "AUDIT > 8; any DAST positive", "Patient"],
];

const PHASE_ROWS = [
  ["Phase 1 — Safety & Stabilisation", "Establish safety; symptom management; build therapeutic alliance", "Weeks 1–4 (longer for Complex PTSD)", "Psychoeducation; grounding techniques; affect regulation; distress tolerance; safety planning; crisis management"],
  ["Phase 2 — Trauma Processing", "Evidence-based trauma-focused therapy", "Weeks 4–16 (individual variation)", "TF-CBT or EMDR (first-line); trauma narrative; cognitive processing; EMDR bilateral stimulation"],
  ["Phase 3 — Integration & Reconnection", "Meaning-making; reconnection with life; identity rebuilding", "Months 4–12+", "Grief work; identity exploration; relationships; vocational rehabilitation; relapse prevention"],
];

const STABILISE_ROWS = [
  ["Grounding (5-4-3-2-1)", "Sensory anchoring to present moment; names 5 things seen, 4 heard, 3 felt, 2 smelled, 1 tasted", "Flashbacks; dissociation; overwhelming emotions"],
  ["Container exercise", "Imagining putting overwhelming memories/feelings into a secure container until ready to process", "Intrusive memories between sessions"],
  ["Safe/calm place visualisation", "Detailed sensory imagery of a personally safe, peaceful place; paired with slow breathing", "Hyperarousal; nightmares; sleep onset"],
  ["TIPP (DBT)", "Temperature (cold water); Intense exercise; Paced breathing; Progressive relaxation", "Acute distress; dissociation; urge to self-harm"],
  ["Window of Tolerance work", "Identify hyper- and hypo-arousal states; pendulation; return to optimal zone", "Emotion dysregulation in Complex PTSD"],
  ["Breathing retraining", "4-7-8 breathing; paced breathing 4 in, 6 out; reduces autonomic arousal", "Hyperarousal; panic symptoms; intrusion"],
];

const TFCBT_ROWS = [
  ["Trauma narrative construction", "Detailed written or verbal account of traumatic event(s); gradual approach; full trauma memory accessed", "Sessions 4–8"],
  ["Hot spot identification", "Most distressing moments within trauma memory — highest SUDS; identified for focused processing", "Sessions 6–8"],
  ["Cognitive restructuring", "Trauma-related beliefs ('It was my fault'; 'I am permanently damaged'; 'The world is entirely unsafe') — challenged with Socratic questioning", "Sessions 8–12"],
  ["In vivo exposure", "Graduated exposure to avoided trauma reminders (places, people, sounds) — not to trauma itself", "Sessions 10–14"],
  ["Relapse prevention", "Managing future trauma reminders; booster sessions plan; self-compassion work", "Sessions 14–16"],
];

const EMDR_ROWS = [
  ["Phase 1–2: History & Preparation", "Full trauma history; treatment targets identified; stabilisation resources installed (safe place; container)"],
  ["Phase 3: Assessment", "Target memory accessed; NC (negative cognition) and PC (positive cognition) identified; SUDS and VoC rated"],
  ["Phase 4: Desensitisation", "Bilateral stimulation (eye movements, taps, tones) while holding target memory; process until SUDS = 0"],
  ["Phase 5–6: Installation & Body Scan", "PC strengthened; VoC = 7; body scan for residual tension"],
  ["Phase 7–8: Closure & Reassessment", "Container if incomplete processing; weekly re-evaluation; progress through all targets"],
];

const PHARMA_ROWS = [
  ["Sertraline (SSRI)", "25 mg OD", "50–200 mg OD", "Grade A (FDA approved)", "First-line; treats PTSD, comorbid depression and anxiety simultaneously"],
  ["Paroxetine (SSRI)", "10 mg OD", "20–40 mg OD", "Grade A (FDA approved)", "Effective but significant discontinuation syndrome; not preferred"],
  ["Venlafaxine XR (SNRI)", "37.5 mg OD", "150–300 mg OD", "Grade B", "Alternative to SSRI; good evidence for PTSD"],
  ["Prazosin", "1 mg nocte", "3–15 mg nocte", "Grade B", "Alpha-1 blocker; specifically for PTSD nightmares; monitor BP lying/standing"],
  ["Quetiapine (adjunct)", "25–50 mg nocte", "50–200 mg nocte", "Grade C", "For severe hyperarousal, insomnia, or psychotic features; second-line"],
  ["Benzodiazepines", "Avoid", "Avoid", "Contraindicated", "No evidence for PTSD core symptoms; risk of worsening dissociation and dependence; only very short-term for acute crisis"],
];

const DISCHARGE_ROWS = [
  ["PCL-5 score", "≥ 20-point reduction from baseline (clinically significant change)"],
  ["Safety", "No active suicidal ideation; safety plan in place and understood"],
  ["Stabilisation skills", "Patient independently uses ≥ 3 grounding/stabilisation techniques"],
  ["Trauma therapy", "Phase 2 initiated if appropriate; or clear plan for Phase 2 in OPD"],
  ["Comorbidities", "Depression and anxiety addressed; substance use plan in place"],
  ["Follow-up", "OPD within 7 days; trauma therapist continuity confirmed"],
];

const KPI_ROWS = [
  ["PCL-5 scored at admission and discharge", "100%", "Monthly"],
  ["Safety planning completed for all patients", "100%", "Monthly"],
  ["C-SSRS at every clinical contact", "100%", "Monthly"],
  ["Phase 1 stabilisation completed before trauma processing", "100%", "Monthly"],
  ["EMDR/TF-CBT delivered by trained therapist only", "100%", "Quarterly"],
  ["PCL-5 reduction ≥ 20 at discharge", "≥ 60% of patients", "Quarterly"],
];

const Cl13PTSD = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-13"
        title="Post-Traumatic Stress Disorder (PTSD)"
        icdLine="ICD-11: 6B40–6B41 | DSM-5-TR: F43.1 | Trauma & Stress-Related Disorders"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a standardised, trauma-informed, and evidence-based clinical pathway for the assessment, stabilisation, trauma-focused treatment, and recovery of patients with PTSD and Complex PTSD across all JRCPL centres — aligned with NICE NG116, ISTSS 2019 guidelines, and MHCA 2017.
      </p>

      {/* 2. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>2. Diagnostic Classification</ModuleHeader>
      <Table
        cols={[{ label: "Feature", width: "22%" }, { label: "PTSD (6B40 / F43.1)" }, { label: "Complex PTSD (6B41)" }]}
        rows={DIAG_ROWS}
      />

      <SectionTitle>2.1 DSM-5-TR Diagnostic Criteria Summary (PTSD)</SectionTitle>
      <Table
        cols={[{ label: "Criterion", width: "28%" }, { label: "Description" }]}
        rows={DSM_ROWS}
      />

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Assessment Protocol</ModuleHeader>
      <SectionTitle>3.1 Trauma-Informed Assessment Principles</SectionTitle>
      <BulletList items={[
        "Create safety first: private room; patient controls the session; no pressure to disclose trauma details",
        "Assess readiness and current stability before any trauma-focused work",
        "Trauma history taken sensitively: 'Have you ever experienced something very frightening or distressing?' — do not force disclosure",
        "Never re-traumatise during assessment — general enquiry, not detailed narrative",
      ]} />

      <SectionTitle>3.2 Rating Scales</SectionTitle>
      <Table
        cols={[{ label: "Scale", width: "28%" }, { label: "Purpose", width: "28%" }, { label: "Threshold", width: "22%" }, { label: "Administered By" }]}
        rows={SCALE_ROWS}
      />

      {/* 4. PHASE-BASED TREATMENT */}
      <ModuleHeader>4. Phase-Based Treatment Model (Trauma-Informed)</ModuleHeader>
      <Table
        cols={[{ label: "Phase", width: "22%" }, { label: "Focus", width: "24%" }, { label: "Duration", width: "20%" }, { label: "Content" }]}
        rows={PHASE_ROWS}
      />
      <WarningBox>Critical Rule: Do NOT proceed to trauma processing (Phase 2) until patient demonstrates capacity for affect regulation and has established safety. Premature trauma exposure can destabilise patients.</WarningBox>

      {/* 5. STABILISATION */}
      <ModuleHeader>5. Phase 1 — Stabilisation Techniques</ModuleHeader>
      <Table
        cols={[{ label: "Technique", width: "24%" }, { label: "Content", width: "46%" }, { label: "Indication" }]}
        rows={STABILISE_ROWS}
      />

      {/* 6. TRAUMA-FOCUSED THERAPIES */}
      <ModuleHeader>6. Phase 2 — Trauma-Focused Therapies</ModuleHeader>
      <SectionTitle>6.1 Trauma-Focused CBT (TF-CBT) — Grade A Evidence</SectionTitle>
      <Table
        cols={[{ label: "TF-CBT Component", width: "26%" }, { label: "Content", width: "56%" }, { label: "Sessions" }]}
        rows={TFCBT_ROWS}
      />

      <SectionTitle>6.2 EMDR (Eye Movement Desensitisation and Reprocessing) — Grade A Evidence</SectionTitle>
      <Table
        cols={[{ label: "EMDR Phase", width: "30%" }, { label: "Content" }]}
        rows={EMDR_ROWS}
      />
      <CalloutBox>
        EMDR must be delivered by a formally trained EMDR therapist (EMDR Association training). It is not a generic therapy technique.
      </CalloutBox>

      {/* 7. PHARMACOTHERAPY */}
      <ModuleHeader>7. Pharmacotherapy</ModuleHeader>
      <Table
        cols={[
          { label: "Agent", width: "20%" },
          { label: "Starting Dose", width: "14%" },
          { label: "Target Dose", width: "15%" },
          { label: "Evidence", width: "14%" },
          { label: "Key Notes" },
        ]}
        rows={PHARMA_ROWS}
      />

      {/* 8. SAFETY & CRISIS */}
      <ModuleHeader>8. Safety &amp; Crisis Management</ModuleHeader>
      <BulletList items={[
        "PTSD carries significant suicide risk — C-SSRS at EVERY clinical contact without exception",
        "Self-harm: DBT-based distress tolerance skills taught proactively in Phase 1",
        "Dissociative episodes: Grounding protocol initiated immediately; staff trained in trauma-informed response",
        "Substance use as coping: Integrated treatment approach — trauma and SUD addressed simultaneously, not sequentially",
        "Domestic violence / ongoing trauma: Safety planning is mandatory BEFORE any trauma processing; active abuse = Phase 1 only",
        "PTSD following sexual assault: Multi-agency coordination (POCSO if minor); forensic medical examination; SARC referral if available",
      ]} />

      {/* 9. DISCHARGE & KPIs */}
      <ModuleHeader>9. Discharge Criteria &amp; KPIs</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "22%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "20%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-13" docTitle="Post-Traumatic Stress Disorder (PTSD)" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl13PTSD;
