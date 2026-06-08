import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-12"],
  ["Title", "Obsessive-Compulsive Disorder — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL Centres — IPD, Day Programme, OPD"],
  ["Rating Scales", "Y-BOCS / CY-BOCS; OCI-R; BDI-II; C-SSRS"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NICE NG59; IPS Guidelines"],
  ["Replaces", "Newly developed standalone protocol"],
];

const SYMPTOM_ROWS = [
  ["Contamination / Cleaning", "Germs, dirt, illness, bodily secretions", "Washing hands, cleaning surfaces, avoiding objects"],
  ["Symmetry / Ordering", "Things not 'just right'; asymmetry", "Arranging, ordering, touching, counting, repeating"],
  ["Forbidden Thoughts", "Harm, sexual, religious, blasphemous intrusions", "Mental neutralising, prayer, reassurance-seeking, avoidance"],
  ["Harm / Checking", "Fear of causing harm by omission; doubt", "Checking locks, gas, appliances; checking others' safety"],
  ["Hoarding", "Difficulty discarding; fear of losing something important", "Collecting, inability to discard; cluttered living"],
  ["Somatic", "Illness preoccupation; body dysmorphic features", "Body checking, mirror gazing, reassurance-seeking"],
];

const SCALE_ROWS = [
  ["Y-BOCS (Yale-Brown Obsessive Compulsive Scale)", "Gold-standard 10-item clinician-rated; separate O and C subscales; 0–40", "Mild 8–15; Moderate 16–23; Severe 24–31; Extreme ≥ 32", "Admission; every 2 weeks; discharge"],
  ["CY-BOCS", "Children's version of Y-BOCS (age < 18)", "Same thresholds as Y-BOCS", "As above"],
  ["OCI-R (OCD Inventory-Revised)", "18-item self-report; 6 subscales; identifies symptom dimensions", "≥ 21 = probable OCD", "Admission; monthly"],
  ["C-SSRS", "Suicide risk — OCD carries elevated risk", "Any ideation with plan: immediate review", "Every clinical contact"],
];

const ASSESS_ROWS = [
  ["Symptom profile", "Full Y-BOCS symptom checklist — all 15 symptom categories rated; duration; triggers; insight level (good/fair/poor/absent/delusional)"],
  ["Avoidance mapping", "List all situations, objects, people, and activities avoided due to OCD; quantify impact on ADL, work, relationships"],
  ["Accommodation mapping", "Family accommodation of rituals (buying cleaning products, giving reassurance, participating in rituals) — interview family separately"],
  ["Insight assessment", "Overvalued ideation vs delusional OCD — different treatment implications; BABS scale if poor insight"],
  ["Comorbidities", "Depression (BDI-II / PHQ-9); anxiety (GAD-7); Tourette/tic disorders; BDD; hoarding disorder; eating disorder; substance use; ADHD; autism"],
  ["Medical rule-out", "PANDAS/PANS in children (streptococcal history; abrupt onset; choreiform movements); neurological exam; consider MRI if atypical"],
  ["Suicide risk", "OCD associated with suicidal ideation in 25–50% of patients — C-SSRS mandatory at every contact"],
];

const SSRI_ROWS = [
  ["Fluoxetine", "10–20 mg OD", "40–80 mg OD", "80 mg", "Long half-life (useful in low adherence); activating — may worsen anxiety initially"],
  ["Fluvoxamine", "50 mg OD", "150–300 mg/day", "300 mg", "Divided doses BD; significant drug interactions (CYP1A2); effective for OCD"],
  ["Clomipramine (TCA)", "25 mg nocte", "100–250 mg/day", "300 mg", "Most effective single agent for OCD; reserve for SSRI failure; ECG mandatory; anticholinergic side effects; lethal in overdose"],
  ["Escitalopram", "5–10 mg OD", "20–40 mg OD", "40 mg", "Off-label at > 20 mg; ECG monitoring if > 20 mg (QTc)"],
  ["Sertraline", "25–50 mg OD", "100–200 mg OD", "200 mg", "First-line; best tolerability; start low; titrate every 4 weeks"],
];

const AUGMENT_ROWS = [
  ["Antipsychotic augmentation (first choice)", "Risperidone", "0.5–3 mg/day", "Grade A", "Most evidence for OCD augmentation; add to SSRI if partial response"],
  ["Antipsychotic augmentation", "Aripiprazole", "5–15 mg/day", "Grade A", "Weight-neutral; useful if metabolic concern"],
  ["Antipsychotic augmentation", "Quetiapine", "50–200 mg/day", "Grade B", "Sedating; useful for comorbid insomnia/anxiety"],
  ["Glutamate modulation", "N-Acetylcysteine (NAC)", "1200–2400 mg/day", "Grade B", "Adjunct; modest evidence; safe; GI side effects"],
  ["ECT", "Modified ECT", "Standard protocol", "Grade C", "Reserved for severe, treatment-resistant OCD with suicidality or catatonia; not primary treatment"],
  ["Deep Brain Stimulation", "Anterior limb of internal capsule", "Specialist centre", "Experimental", "Refer to tertiary centre for truly refractory OCD"],
];

const ERP_ROWS = [
  ["Psychoeducation", "OCD as a brain disorder; not a character flaw; fight-flight system misfiring; how compulsions maintain obsessions (short-term relief, long-term reinforcement)", "Sessions 1–2"],
  ["Symptom hierarchy construction", "Patient and therapist collaboratively build a SUDS (0–100) hierarchy of feared situations and obsessional triggers; ranked from least to most distressing", "Sessions 2–3"],
  ["Imaginal exposure", "For triggers that cannot be replicated in session (harm obsessions, blasphemous thoughts) — scripted recordings; loop tape; written narratives", "Sessions 3–6"],
  ["In vivo exposure", "Graduated real-world contact with feared triggers — starting at 30–40 SUDS; patient stays with anxiety WITHOUT performing compulsion", "Sessions 4–16"],
  ["Response prevention", "Withholding the compulsive response during exposure; therapist coaches; no reassurance-giving by therapist; full blocking of all compulsion variants", "Throughout ERP"],
  ["Habituation monitoring", "SUDS rated at start, peak, and end of each exposure; graphed; patient learns anxiety naturally decreases without compulsions", "Every session"],
  ["Family involvement", "Psychoeducation for family on NOT providing accommodation; coach family in response prevention; family practice homework", "Sessions 6, 10, 16"],
  ["Relapse prevention", "Booster exposures plan; return of symptoms is normal; relapse plan; list of high-risk situations", "Final 2 sessions"],
];

const ERP_STD_ROWS = [
  ["Session frequency — IPD", "Minimum 5 ERP sessions per week (daily); intensive format optimal for IPD"],
  ["Session frequency — OPD", "Minimum 1 ERP session per week; daily homework mandatory"],
  ["Session duration", "60–90 minutes (exposure takes time; cannot be shortened)"],
  ["Homework", "In vivo exposures daily; SUDS diary; no reassurance-seeking between sessions"],
  ["Therapist competency", "Trained in OCD-specific ERP; supervision; not generic CBT therapist — ERP is a specialised competency"],
  ["Documentation", "Session note: hierarchy item attempted; starting SUDS; peak SUDS; end SUDS; response prevention status; homework set"],
];

const DISCHARGE_ROWS = [
  ["Y-BOCS Score", "≥ 35% reduction from baseline (treatment response); target < 16 (mild range)"],
  ["ERP skills", "Patient can self-initiate exposures; complete response prevention without therapist support"],
  ["Medication", "Tolerating and adherent to SSRI at therapeutic dose; 30-day prescription dispensed"],
  ["Insight", "Patient understands OCD model; can identify obsessions as OCD, not reality"],
  ["Family", "Family accommodation reduced; family able to support response prevention at home"],
  ["Follow-up", "OPD appointment within 7 days; Y-BOCS at every follow-up"],
];

const REVIEW_ROWS = [
  ["First OPD", "1 week post-discharge"],
  ["Regular reviews", "Monthly for 6 months; then 3-monthly"],
  ["Y-BOCS", "At every follow-up contact"],
  ["ERP booster", "Return of symptoms: intensive ERP booster sessions (4–6 sessions)"],
];

const KPI_ROWS = [
  ["Y-BOCS scored at admission and discharge", "100%", "Monthly"],
  ["ERP initiated within 48 hours of admission", "≥ 95%", "Monthly"],
  ["ERP sessions ≥ 5/week for inpatients", "≥ 90%", "Monthly"],
  ["C-SSRS at every clinical contact", "100%", "Monthly"],
  ["Family accommodation assessment completed", "100%", "Monthly"],
  ["Y-BOCS reduction ≥ 35% at discharge", "≥ 65% of patients", "Quarterly"],
  ["Clomipramine ECG documented before initiation", "100%", "Monthly"],
];

const Cl12OCD = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-12"
        title="Obsessive-Compulsive Disorder (OCD)"
        icdLine="ICD-11: 6B20 | DSM-5-TR: F42 | OCD & Related Disorders Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a standardised, evidence-based clinical pathway for the assessment, pharmacological treatment, ERP-based psychotherapy, and long-term management of OCD across all JRCPL centres — aligned with NICE NG59, IPS guidelines, and MHCA 2017.
      </p>

      {/* 2. DIAGNOSTIC FRAMEWORK */}
      <ModuleHeader>2. Diagnostic Framework</ModuleHeader>
      <SectionTitle>2.1 ICD-11 Diagnostic Criteria (6B20)</SectionTitle>
      <BulletList items={[
        "Presence of OBSESSIONS: recurrent, intrusive thoughts/images/impulses experienced as unwanted and ego-dystonic; patient attempts to ignore or neutralise them",
        "Presence of COMPULSIONS: repetitive behaviours or mental acts performed in response to obsessions or rigid rules; aimed at reducing distress or preventing a feared outcome",
        "Obsessions and/or compulsions are time-consuming (> 1 hour/day) OR cause clinically significant distress or functional impairment",
        "Not better explained by substance use, medical condition, or another mental disorder",
      ]} />

      <SectionTitle>2.2 OCD Symptom Dimensions</SectionTitle>
      <Table
        cols={[{ label: "Dimension", width: "22%" }, { label: "Obsessional Theme", width: "36%" }, { label: "Common Compulsions" }]}
        rows={SYMPTOM_ROWS}
      />

      <SectionTitle>2.3 Rating Scales</SectionTitle>
      <Table
        cols={[{ label: "Scale", width: "28%" }, { label: "Purpose", width: "28%" }, { label: "Severity Threshold", width: "22%" }, { label: "Timing" }]}
        rows={SCALE_ROWS}
      />

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Assessment Protocol</ModuleHeader>
      <Table
        cols={[{ label: "Assessment Domain", width: "22%" }, { label: "Content" }]}
        rows={ASSESS_ROWS}
      />

      {/* 4. PHARMACOTHERAPY */}
      <ModuleHeader>4. Pharmacotherapy</ModuleHeader>
      <SectionTitle>4.1 First-Line: SSRIs (Higher Doses Required than Depression)</SectionTitle>
      <Table
        cols={[
          { label: "Agent", width: "18%" },
          { label: "Starting Dose", width: "15%" },
          { label: "Target OCD Dose", width: "18%" },
          { label: "Max Dose", width: "12%" },
          { label: "Key Notes" },
        ]}
        rows={SSRI_ROWS}
      />
      <WarningBox>OCD requires higher SSRI doses and longer trial duration than depression. Minimum adequate trial = therapeutic dose for 12 weeks before declaring inadequate response.</WarningBox>

      <SectionTitle>4.2 Augmentation Strategies (Treatment-Resistant OCD)</SectionTitle>
      <Table
        cols={[
          { label: "Strategy", width: "26%" },
          { label: "Agent", width: "18%" },
          { label: "Dose", width: "14%" },
          { label: "Evidence", width: "12%" },
          { label: "Notes" },
        ]}
        rows={AUGMENT_ROWS}
      />

      {/* 5. PSYCHOLOGICAL TREATMENT */}
      <ModuleHeader>5. Psychological Treatment — ERP</ModuleHeader>
      <SectionTitle>5.1 Exposure and Response Prevention (ERP) — First-Line Psychotherapy</SectionTitle>
      <CalloutBox>
        ERP is the gold-standard psychological treatment for OCD. <strong>Grade A evidence.</strong> It should be initiated alongside or before pharmacotherapy wherever possible. ERP delivered by a trained clinical psychologist.
      </CalloutBox>
      <Table
        cols={[{ label: "ERP Component", width: "22%" }, { label: "Content", width: "60%" }, { label: "Sessions" }]}
        rows={ERP_ROWS}
      />

      <SectionTitle>5.2 ERP Delivery Standards</SectionTitle>
      <Table
        cols={[{ label: "Standard", width: "30%" }, { label: "Requirement" }]}
        rows={ERP_STD_ROWS}
      />

      {/* 6. SPECIAL CLINICAL SITUATIONS */}
      <ModuleHeader>6. Special Clinical Situations</ModuleHeader>
      <SectionTitle>6.1 Paediatric OCD (CY-BOCS)</SectionTitle>
      <BulletList items={[
        "ERP first-line for mild-moderate OCD in children — medication may not be required",
        "Sertraline preferred SSRI in children (age ≥ 6); start at 12.5–25 mg OD",
        "Clomipramine: age ≥ 10 only; ECG mandatory; baseline weight",
        "PANDAS/PANS work-up if sudden onset in child: ASO titre, anti-DNase B, throat culture",
        "Parent involvement in ERP is essential — parents coached to withdraw accommodation",
      ]} />

      <SectionTitle>6.2 OCD with Poor Insight / Overvalued Ideation</SectionTitle>
      <BulletList items={[
        "Poor insight (patient believes obsessions are true) — do NOT challenge beliefs directly; use motivational interviewing to build engagement",
        "Delusional OCD (patient convinced with certainty): antipsychotic augmentation early; modified ERP",
        "BDD-like presentation: refer to BDD-specific protocol or tertiary OCD service",
      ]} />

      <SectionTitle>6.3 Treatment-Resistant OCD</SectionTitle>
      <BulletList items={[
        "Defined: failure of ≥ 2 adequate SSRI trials (12 weeks at maximum tolerated dose) + clomipramine trial + adequate ERP",
        "Augmentation with antipsychotic; switch to IV clomipramine (specialist centres)",
        "Deep Brain Stimulation referral: at least 5 years of severe OCD; failure of all treatments; tertiary centre only",
      ]} />

      {/* 7. DISCHARGE & FOLLOW-UP */}
      <ModuleHeader>7. Discharge Criteria &amp; Follow-Up</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "20%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />
      <Table
        cols={[{ label: "Review", width: "22%" }, { label: "Timing" }]}
        rows={REVIEW_ROWS}
      />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "20%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-12" docTitle="Obsessive-Compulsive Disorder (OCD)" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl12OCD;
