import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApprovalNew, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "CL-05-C"],
  ["Title", "Counselling & Psychosocial Programme — Alcohol De-Addiction, 12-Day Detox Phase + 33-Day Therapeutic Phase | 45 Days Total"],
  ["Version", "1.0 (Effective 1 June 2026)"],
  ["Diagnoses Covered", "Alcohol Use Disorder (ICD-11: 6C40–6C41)"],
  ["Clinical Phases", "P1: Comprehensive Assessment (D1–3) · P2: Medical Detoxification (D4–12) · P3: Stabilisation & Intensive Therapy (D13–25) · P4: Advanced Rehabilitation (D26–35) · P5: Relapse Prevention & Discharge Preparation (D36–45)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Regulatory Basis", "MHCA 2017 · NABH COP"],
];

const MODALITIES_ROWS = [
  ["Motivational Enhancement Therapy", "MET", "P1–P3", "Individual 45–60 min", "4 sessions (D7, D11, D16, D20)"],
  ["Cognitive Behavioural Therapy", "CBT", "P2–P4", "Individual + Group", "3× / week (individual); daily group"],
  ["Mindfulness-Based Relapse Prevention", "MBRP", "P3–P5", "Group 45 min", "3× / week from Day 23"],
  ["12-Step Facilitation (AA-informed)", "12SF", "P2–P5", "Group 60 min", "Weekly in-house AA meeting"],
  ["Family Systems Therapy", "FST", "P1–P5", "Family session 60 min", "9 sessions across 45 days"],
  ["Marlatt & Gordon Relapse Prevention", "MGRP", "P3–P5", "Individual + Group", "Intensive P5 (D36–D45)"],
  ["Narrative Therapy", "NT", "P3", "Individual 45 min", "1 session (D25)"],
  ["Dialectical Behaviour Therapy (skills only)", "DBT", "P3", "Group 45 min", "Emotion regulation module (D17)"],
  ["Occupational Therapy", "OT", "P3–P5", "Group / Individual", "Daily structured activity"],
  ["Psychoeducation", "PSE", "P1–P5", "Group 30–45 min", "Daily in group or ward session"],
];

const MDT_ROLES_ROWS = [
  ["Treating Psychiatrist", "Case formulation; psychiatric review; psychoeducation sessions on medical topics; weekly MDT; discharge summary"],
  ["Clinical Psychologist", "MET, CBT, MBRP, Narrative Therapy, MGRP; individual sessions 3× / week; group facilitation; psychological testing"],
  ["Medical Social Worker", "Social history; family sessions (all 9); community linkage; discharge planning; MSW group sessions"],
  ["Nursing Staff", "Daily group co-facilitation; morning check-in group; observation notes; medication group psychoeducation"],
  ["Occupational Therapist", "Vocational rehabilitation; activity scheduling; daily structured programme; life-skills groups"],
  ["Yoga Instructor", "Daily morning yoga/pranayama; MBRP body-scan sessions in coordination with psychologist"],
];

const DAILY_ROUTINE_ROWS = [
  ["06:00–06:15", "Wake-up · Vitals", "Nursing", "Nursing check"],
  ["06:15–07:00", "Yoga / pranayama / morning walk", "Yoga instructor", "Mandatory for P3–P5"],
  ["07:00–07:30", "Personal hygiene · morning meds", "Nursing (MAR)", ""],
  ["07:30–08:00", "Breakfast", "Self", ""],
  ["08:00–08:45", "Morning process group (check-in)", "Psychologist / MSW", "Daily intentions, mood score, gratitude"],
  ["09:00–10:00", "Individual therapy (3× / week) OR CBT group (other days)", "Psychologist", "See day-by-day schedule"],
  ["10:00–10:15", "Tea break", "Self", ""],
  ["10:15–11:15", "Psychoeducation / topic group", "Psychologist / Dr / MSW", "Rotating topic; see phase schedule"],
  ["11:15–12:00", "Occupational therapy / art therapy", "OT", "Structured activity"],
  ["12:00–12:30", "Lunch + midday medications", "Nursing", ""],
  ["12:30–14:00", "Rest hour", "Self", "Mandatory quiet time"],
  ["14:00–15:00", "Relapse prevention group OR 12-Step (alternate days)", "Psychologist / MSW", ""],
  ["15:00–15:30", "Free time / journalling", "Self", "Recovery literature available"],
  ["15:30–16:30", "Physical exercise / sport", "OT-supervised", ""],
  ["16:30–17:00", "Family visiting (scheduled days)", "MSW", ""],
  ["17:00–18:00", "MBRP / mindfulness (3× / week)", "Psychologist", "Body scan, urge surfing, sitting meditation"],
  ["18:00–19:00", "Dinner", "Self", ""],
  ["19:00–20:00", "Evening reflection group", "MSW / peer leader", "Gratitude, check-out, serenity prayer"],
  ["20:00–20:30", "Evening meds · nursing check", "Nursing", ""],
  ["20:30–22:00", "Personal time / journalling", "Self", ""],
  ["22:00", "Lights out", "Nursing night round", ""],
];

const PHASE1_ROWS = [
  ["Day 1", "Assessment & Orientation", "Psychiatric evaluation + AUDIT, CAGE, MoCA", "Ward orientation; welcome group", "Family arrival briefing (MSW)", "Baseline assessment complete"],
  ["Day 2", "History & Engagement", "Drinking history timeline; PHQ-9, GAD-7, SDS", "Psychoeducation: 'What is alcohol use disorder?'", "Social history (MSW — FAM-F-001)", "Diagnosis formulated"],
  ["Day 3", "Formulation & Goals", "URICA — Stage of change; motivation interview (intro)", "Expectations group: 'Why am I here?'", "MSW family assessment complete", "MDT case conference; treatment plan signed"],
];

const PHASE2_ROWS = [
  ["Day 4", "Managing Withdrawal", "Bedside MET (brief) — sustain engagement during detox", "Psychoeducation: withdrawal symptoms & safety", "Family psychoeducation (MSW) — what to expect", "Patient stable; engaged despite withdrawal"],
  ["Day 5", "Understanding Craving", "Craving awareness — Penn Craving Scale (baseline)", "Group: 'What triggers my drinking?'", "Family session 1: codependency basics", "Craving identified; baseline score recorded"],
  ["Day 6", "Body & Brain", "Brief CBT intro — thoughts-feelings-behaviour model", "Psychoeducation: alcohol and the brain (neurobiology)", "—", "Cognitive model understood"],
  ["Day 7", "Emotional Awareness", "MET Session 1 — exploring ambivalence", "Group: 'Emotions and alcohol' (anger, shame, guilt)", "MSW follow-up; family concerns addressed", "Ambivalence expressed; change talk elicited"],
  ["Day 8", "Liver & Body Damage", "Medical psychoeducation (by Dr) — physical consequences", "Group: 'My health report card'", "—", "Awareness of health consequences"],
  ["Day 9", "Sleep & Routine", "Sleep hygiene counselling", "Mindfulness — body scan (30 min)", "—", "Sleep routine established"],
  ["Day 10", "Social Consequences", "Social history review — work/family/legal impact", "Group: 'What has alcohol cost me?'", "Family session 2: impact on family", "Social consequences acknowledged"],
  ["Day 11", "Readiness for Change", "MET Session 2 — decisional balance (pros/cons of change)", "Group: 'Reasons to change' — vision exercise", "—", "Ambivalence reduced; readiness increased"],
  ["Day 12", "Detox Completion", "End-of-detox review; relapse risk screen", "Group: 'Celebrating 12 days sober' — milestone check-in", "Brief family update (MSW)", "12-day detox complete; transition to therapy phase"],
];

const PHASE3_ROWS = [
  ["Day 13", "CBT Module 1", "Functional analysis of drinking — antecedents, behaviour, consequences (ABC model)", "CBT group: 'My drinking patterns'", "—", "Drinking function mapped"],
  ["Day 14", "CBT Module 2", "Cognitive distortions about alcohol — identifying thinking errors", "CBT group: 'Thought challenging'", "Family session 3: communication skills intro", "3 cognitive distortions identified"],
  ["Day 15", "CBT Module 3", "Behavioural coping strategies — delay, distraction, drink-refusal", "Group: 'Coping without alcohol'", "—", "3 coping strategies practised"],
  ["Day 16", "MET Session 3", "Values clarification — who am I without alcohol?", "Group: 'My values and my drinking'", "—", "Values-behaviour discrepancy identified"],
  ["Day 17", "Anger & Emotions", "Anger management — triggers, escalation cycle, de-escalation", "Group: Emotion regulation (DBT-informed)", "—", "Anger management plan drafted"],
  ["Day 18", "12-Step Facilitation", "Step 1–3 individual review with therapist", "Group: AA Step 1 facilitation (We admitted we were powerless)", "—", "Step 1 completed"],
  ["Day 19", "Trauma-Informed Review", "Assess trauma history (ACE screen); trauma-informed CBT if indicated", "Group: 'Stories of resilience'", "MSW: social reintegration planning starts", "Trauma identified or ruled out"],
  ["Day 20", "MET Session 4", "Change plan — specific, measurable goals for sobriety", "Group: Goal-setting workshop", "Family session 4: shared goals for recovery", "Written change plan completed"],
  ["Day 21", "Mid-Programme Review", "PHQ-9, GAD-7, URICA re-assessment; review formulation", "Group: 'Halfway there — how am I doing?'", "MDT review with family present (optional)", "Updated formulation; medication review"],
  ["Day 22", "Relapse Awareness", "Relapse warning signs — emotional, cognitive, behavioural", "Group: 'Early warning signs' — personal list", "—", "Personal warning sign list created"],
  ["Day 23", "MBRP Session 1", "Mindfulness-Based Relapse Prevention: urge surfing technique", "MBRP group: guided urge surfing", "—", "Urge surfing practised × 2"],
  ["Day 24", "Assertiveness", "Assertiveness and drink-refusal role play (I-statements)", "Group: Assertiveness training — role play", "—", "Drink-refusal script rehearsed"],
  ["Day 25", "Narrative Therapy", "Sober identity — rewriting the story", "Group: 'Letter to my future self'", "Family session 5: sharing progress letter", "Positive identity narrative started"],
];

const PHASE4_ROWS = [
  ["Day 26", "High-Risk Situations", "CBT Module 4: mapping personal high-risk situations (HALT, parties, stress)", "Group: 'My top 5 high-risk situations'", "—", "HRS map completed"],
  ["Day 27", "Coping Plans", "Coping plan for each high-risk situation (written)", "Group: 'My coping toolbox'", "—", "Individualised coping plan written"],
  ["Day 28", "12-Step Steps 4–6", "Steps 4–6 with therapist (moral inventory, shortcomings)", "Group: AA Step 4 facilitation", "—", "Step 4 inventory started"],
  ["Day 29", "Grief & Loss", "Grief work — losses due to alcohol (relationships, career, health)", "Group: 'What I have lost' — grief processing", "—", "Grief acknowledged and contextualised"],
  ["Day 30", "Family Systems", "Family roles in addiction — enabling, boundaries, codependency", "Group: 'My family and alcohol'", "Family session 6: joint family + patient session", "Enabling behaviours identified; boundaries set"],
  ["Day 31", "Vocational Rehabilitation", "Vocational goals; return-to-work / study planning (with MSW + OT)", "Group: Life skills — financial management, daily routine", "MSW: discharge housing/work plan", "Vocational reintegration plan drafted"],
  ["Day 32", "Behavioural Activation", "Activity scheduling — meaningful non-drinking activities", "Group: 'Building a sober life' — hobby and activity list", "—", "Weekly activity schedule created"],
  ["Day 33", "MBRP Session 2", "Mindfulness: acceptance of cravings without acting on them", "Group: MBRP — sitting with discomfort", "—", "Acceptance skill practised"],
  ["Day 34", "Spirituality & Meaning", "Meaning-making in sobriety — purpose, values, spirituality", "Group: Spirituality and recovery (non-religious option available)", "—", "Personal meaning statement written"],
  ["Day 35", "Peer Support", "Introduction to peer mentorship — sponsorship model", "AA meeting (in-house); Step 7–9 overview", "Family session 7: family roles in aftercare", "Sponsor/peer support identified"],
];

const PHASE5_ROWS = [
  ["Day 36", "Relapse Prevention Plan", "Marlatt & Gordon RP model — complete personalised plan", "Group: 'My RP plan' — share and refine", "—", "Written RP plan completed"],
  ["Day 37", "Crisis Management", "Crisis management plan — what to do if I want to drink", "Group: Role play — crisis response", "—", "Crisis plan on paper; helplines listed"],
  ["Day 38", "Communication & Family", "Communication skills — family re-entry conversation practice", "Group: Assertive communication role play", "Family session 8: discharge planning joint", "Re-entry conversation practised"],
  ["Day 39", "Lifestyle Restructuring", "Daily structure planning post-discharge — routine, sleep, exercise", "Group: Designing a sober lifestyle", "MSW: community linkage — AA chapter, support groups", "Post-discharge daily schedule written"],
  ["Day 40", "Review of Gains", "Therapeutic review — what I have learnt (PHQ-9, GAD-7, PACS final)", "Group: 'My recovery story' — share progress", "—", "Final psychological assessments completed"],
  ["Day 41", "Discharge Paperwork", "Review Relapse Prevention Plan; sign together", "Group: 'Letters of commitment' read aloud", "MSW: discharge checklist with family", "All RP documents signed"],
  ["Day 42", "Final Family Session", "Family safety plan; roles post-discharge; emergency contacts", "Group: 'Gratitude and goodbyes' (near-discharge peers)", "Family session 9: final family meeting", "Family safety plan completed"],
  ["Day 43", "MDT Conference", "Final MDT review — confirm EP-01 criteria met; discharge summary", "Peer support group — last session", "MSW confirms follow-up booked (FU-1 to FU-5)", "DC Summary drafted"],
  ["Day 44", "Consolidation", "Review coping strategies; urge surfing refresher", "Group: Celebration of recovery — 44 days", "—", "Ready-for-discharge assessment passed"],
  ["Day 45", "DISCHARGE", "Discharge interview; feedback; aftercare plan signed", "Discharge group: 'The road ahead'", "Family present at discharge; Discharge Card given", "Discharge completed per DC-001 SOP set"],
];

const FAMILY_ROWS = [
  ["F1", "Day 1–2", "Family arrival briefing — admission process, rules, visiting", "MSW", "Family oriented to programme"],
  ["F2", "Day 5", "Psychoeducation: what is alcohol use disorder? Disease model", "MSW + Psychologist", "Family understands AUD"],
  ["F3", "Day 10", "Impact on family — emotional impact, co-dependence awareness", "MSW", "Family impact acknowledged"],
  ["F4", "Day 14", "Communication skills — talking to someone in recovery", "Psychologist", "Communication skills practised"],
  ["F5", "Day 20", "Shared goals for recovery — family vision exercise", "Psychologist + MSW", "Family-patient goals aligned"],
  ["F6", "Day 30", "Boundary-setting; enabling behaviours; family roles in addiction", "Psychologist", "Boundaries agreed and documented"],
  ["F7", "Day 35", "Peer support for family — Al-Anon introduction", "MSW", "Al-Anon / family support referral made"],
  ["F8", "Day 38", "Discharge planning — family responsibilities, crisis response", "MSW + Psychologist", "Family crisis plan completed"],
  ["F9", "Day 42", "Final family session — aftercare plan, helplines, commitment ceremony", "MDT", "Family discharge package handed over"],
];

const OUTCOME_ROWS = [
  ["AUDIT (Alcohol Use Disorders Identification Test)", "Severity of alcohol use", "Day 1; Day 45", "Psychologist"],
  ["CAGE Questionnaire", "Rapid screening", "Day 1", "Psychologist"],
  ["Penn Alcohol Craving Scale (PACS)", "Craving severity", "Day 5, weekly (D12, 19, 26, 33, 40, 45)", "Psychologist"],
  ["PHQ-9 (Patient Health Questionnaire)", "Depression screening", "Day 3, Day 21, Day 45", "Psychologist"],
  ["GAD-7 (Generalised Anxiety Disorder)", "Anxiety screening", "Day 3, Day 21, Day 45", "Psychologist"],
  ["URICA (Stage of Change)", "Motivation assessment", "Day 3, Day 25, Day 44", "Psychologist"],
  ["MoCA / MMSE", "Cognitive screening", "Day 2; Day 30 if cognitive concern", "Psychologist"],
  ["SDS (Severity of Dependence Scale)", "Dependence severity", "Day 3", "Psychologist"],
  ["WHO-5 Wellbeing Index", "Subjective wellbeing", "Day 10, Day 30, Day 45", "Psychologist"],
  ["Therapist Session Rating Scale", "Therapeutic alliance", "After each individual session", "Patient (self-rated)"],
];

const DOCUMENTATION_ROWS = [
  ["Individual therapy session note", "Psychologist", "Within 24 hrs of session", "Case file"],
  ["Group session facilitation note", "Facilitator", "Same day", "Group register + case file"],
  ["Family session note", "MSW", "Within 24 hrs", "Case file + FAM-F"],
  ["Weekly MDT note", "All MDT", "Same day (Monday)", "Case file"],
  ["Psychological assessment summary", "Psychologist", "Within 48 hrs of completion", "Case file"],
  ["Mid-programme review note (Day 21)", "Psychologist + Psychiatrist", "Day 21", "Case file"],
  ["Relapse Prevention Plan (signed)", "Psychologist + Patient", "Day 36–41", "Case file + copy to patient"],
  ["Final psychological summary for DC", "Psychologist", "Day 43–44", "Part of DC Summary"],
];

const KPI_ROWS = [
  ["Individual therapy sessions completed per patient (vs planned)", "≥ 90% attendance", "Monthly"],
  ["Family programme — minimum 3 sessions per admission", "100% of admissions with family contact", "Monthly"],
  ["Relapse Prevention Plan completed before discharge", "100%", "Monthly"],
  ["PACS craving score — decrease from baseline to Day 45", "≥ 30% reduction", "Quarterly"],
  ["URICA stage — Preparation or Action by Day 45", "≥ 85% patients", "Quarterly"],
  ["PHQ-9 / GAD-7 — improvement from Day 3 to Day 45", "≥ 50% reduction", "Quarterly"],
  ["30-day post-discharge follow-up attendance", "≥ 70%", "Quarterly"],
];

const DAY_COLS = [
  { label: "Day", width: "7%" },
  { label: "Theme / Module", width: "14%" },
  { label: "Individual Therapy", width: "24%" },
  { label: "Group Session", width: "22%" },
  { label: "Family / MSW", width: "18%" },
  { label: "Outcome / Goal" },
];

const Cl05CAlcoholCounsellingProgramme = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-05-C"
        title="Counselling & Psychosocial Programme — Alcohol De-Addiction"
        icdLine="ICD-11: 6C40–6C41 | 12-Day Detox Phase + 33-Day Therapeutic Phase | 45 Days Total | 5 Clinical Phases"
        org="jagrutii"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol defines the structured psychosocial and counselling programme for all patients admitted to JRCPL's De-Addiction Vertical for Alcohol Use Disorder (ICD-11: 6C40–6C41). It maps therapeutic activities day-by-day across 5 clinical phases spanning 45 days, covering individual therapy, group programmes, family engagement, and outcome measures.
      </p>
      <CalloutBox>
        The Counselling Programme operates in parallel with the Pharmacological Protocol (CL-05-P). All therapeutic sessions must be documented in the case file within 24 hours. Session notes should include: attendance, patient engagement, content covered, clinical observations, and plan for next session.
      </CalloutBox>

      {/* 2. CORE THERAPEUTIC MODALITIES */}
      <ModuleHeader>2. Core Therapeutic Modalities</ModuleHeader>
      <Table
        cols={[
          { label: "Modality", width: "28%" },
          { label: "Abbr.", width: "8%", center: true },
          { label: "Phases", width: "10%", center: true },
          { label: "Format", width: "18%" },
          { label: "Frequency" },
        ]}
        rows={MODALITIES_ROWS}
      />

      {/* 3. MDT ROLES */}
      <ModuleHeader>3. MDT Roles in Counselling Programme</ModuleHeader>
      <Table
        cols={[{ label: "Role", width: "22%" }, { label: "Counselling Responsibilities" }]}
        rows={MDT_ROLES_ROWS}
      />

      {/* 4. STANDARD DAILY ROUTINE */}
      <ModuleHeader>4. Standard Daily Routine (Phase 3–5: Days 13–45)</ModuleHeader>
      <Table
        cols={[
          { label: "Time", width: "14%" },
          { label: "Activity", width: "36%" },
          { label: "Led By", width: "18%" },
          { label: "Notes" },
        ]}
        rows={DAILY_ROUTINE_ROWS}
      />

      {/* 5. DAY-BY-DAY SCHEDULE */}
      <ModuleHeader>5. Day-by-Day Counselling Schedule</ModuleHeader>

      <SectionTitle>Phase 1 — Comprehensive Assessment | Days 1–3</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE1_ROWS} />

      <SectionTitle>Phase 2 — Medical Detoxification (12-Day Extended) | Days 4–12</SectionTitle>
      <WarningBox>
        During active withdrawal (Days 4–8), therapy sessions are brief, bedside, and patient-tolerance dependent. Group sessions are psychoeducational only. No confrontational or deep-processing work during this phase.
      </WarningBox>
      <Table cols={DAY_COLS} rows={PHASE2_ROWS} />

      <SectionTitle>Phase 3 — Stabilisation &amp; Intensive Therapy | Days 13–25</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE3_ROWS} />

      <SectionTitle>Phase 4 — Advanced Rehabilitation | Days 26–35</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE4_ROWS} />

      <SectionTitle>Phase 5 — Relapse Prevention &amp; Discharge Preparation | Days 36–45</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE5_ROWS} />

      {/* 6. FAMILY PROGRAMME */}
      <ModuleHeader>6. Family Programme — 9 Session Overview</ModuleHeader>
      <Table
        cols={[
          { label: "Session", width: "9%", center: true },
          { label: "Day", width: "9%", center: true },
          { label: "Topic", width: "34%" },
          { label: "Led By", width: "16%" },
          { label: "Family Outcome" },
        ]}
        rows={FAMILY_ROWS}
      />

      {/* 7. OUTCOME MEASUREMENT SCHEDULE */}
      <ModuleHeader>7. Outcome Measurement Schedule</ModuleHeader>
      <Table
        cols={[
          { label: "Assessment Tool", width: "30%" },
          { label: "Purpose", width: "22%" },
          { label: "Administered At", width: "28%" },
          { label: "By" },
        ]}
        rows={OUTCOME_ROWS}
      />

      {/* 8. DOCUMENTATION REQUIREMENTS */}
      <ModuleHeader>8. Documentation Requirements</ModuleHeader>
      <Table
        cols={[
          { label: "Document", width: "30%" },
          { label: "Completed By", width: "20%" },
          { label: "Timeline", width: "20%" },
          { label: "Filed In" },
        ]}
        rows={DOCUMENTATION_ROWS}
      />

      {/* 9. KPIs */}
      <ModuleHeader>9. KPIs — Counselling Programme</ModuleHeader>
      <Table
        cols={[
          { label: "KPI" },
          { label: "Target", width: "28%", center: true },
          { label: "Review", width: "12%", center: true },
        ]}
        rows={KPI_ROWS}
      />

      {/* 10. APPROVAL */}
      <ProtocolApprovalNew docCode="CL-05-C" docTitle="Counselling & Psychosocial Programme — Alcohol De-Addiction" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl05CAlcoholCounsellingProgramme;
