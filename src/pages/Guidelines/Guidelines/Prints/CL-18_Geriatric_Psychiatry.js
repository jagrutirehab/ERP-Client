import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-18"],
  ["Title", "Geriatric Psychiatry — Comprehensive Assessment & Management Protocol"],
  ["Version", "1.0 (New — May 2026)"],
  ["Effective Date", "01 June 2026"],
  ["Review Date", "31 May 2027"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Amar Shinde, Founder & Clinical Director"],
  ["Applicable To", "All patients ≥ 60 years across Psychiatric, Elderly Care & De-Addiction Verticals — All 18 JRCPL Centres"],
  ["Rating Scales", "MMSE, MoCA, GDS-15, HAM-A, C-SSRS, Barthel Index, Morse Fall Scale, CAMS, NPI"],
  ["Regulatory Basis", "MHCA 2017; RPWD Act 2016; NABH Standards; MCI Guidelines; WHO ICOPE Framework"],
  ["Cross-Reference", "CL-03 (Depression), CL-04 (Anxiety), CL-09 (Insomnia/Dementia), SE-01 (Suicide Risk), SE-03 (Restraint)"],
];

const COGNITIVE_ROWS = [
  ["MoCA (Montreal Cognitive Assessment)", "Sensitive screening for MCI and dementia", "< 26: cognitive impairment likely", "Psychologist / MO"],
  ["MMSE (Mini-Mental State Exam)", "Global cognitive staging; simpler administration", "< 24: impairment likely", "Nurse / Psychologist"],
  ["Clock Drawing Test", "Visuospatial; executive function", "Abnormal = executive dysfunction", "Psychologist"],
  ["Digit Span Forward & Backward", "Working memory; attention", "FDS < 5; BDS < 3: impaired", "Psychologist"],
  ["ACE-III (Addenbrooke's)", "Detailed cognitive profiling — 5 domains", "< 82/100: impairment", "Psychologist (30 min)"],
];

const MOOD_ROWS = [
  ["GDS-15 (Geriatric Depression Scale)", "Depression screening; avoids somatic overlap", "≥ 5: significant depression"],
  ["HAM-A", "Anxiety severity — clinician-rated", "≥ 18: moderate-severe anxiety"],
  ["C-SSRS", "Suicide risk — mandatory every assessment", "Any ideation with plan: immediate review"],
  ["NPI (Neuropsychiatric Inventory)", "12-domain BPSD assessment in dementia", "Any domain score ≥ 4: clinical significance"],
  ["CAMS (Cornell Agitation Measurement Scale)", "Agitation severity in dementia", "Score ≥ 7: intervention required"],
];

const FUNCTIONAL_ROWS = [
  ["ADL (Basic)", "Barthel Index (0–100)", "< 60: Occupational therapy referral; supervised ADL programme"],
  ["ADL (Instrumental)", "Lawton IADL Scale (0–8)", "< 6: Social worker; community support assessment"],
  ["Fall Risk", "Morse Fall Scale", "≥ 45 (high risk): Non-slip footwear; bed rails; supervised ambulation; physio referral"],
  ["Nutritional Status", "MNA-SF (Mini Nutritional Assessment)", "Score ≤ 11: Dietitian referral; high-protein supplementation"],
  ["Pain", "Numeric Rating Scale or PAINAD (non-verbal)", "NRS ≥ 4: Analgesic review; liaise with physician"],
  ["Swallowing", "Bedside SLST screening", "Any concern: Speech & language therapy; IDDSI diet modification"],
  ["Mobility", "TUG (Timed Up and Go Test)", "> 12 seconds: Physiotherapy; falls intervention programme"],
];

const INVESTIGATIONS_ROWS = [
  ["TSH, T3, T4", "Thyroid disease common; mimics depression/dementia", "Treat thyroid; reassess cognition and mood after 3 months"],
  ["Vitamin B12 & Folic Acid", "Deficiency causes cognitive decline and depression", "Supplement; recheck at 3 months"],
  ["Serum Vitamin D", "Deficiency linked to depression, falls, osteoporosis", "Supplement if < 50 nmol/L"],
  ["CBC", "Anaemia — fatigue; depression overlap", "Treat underlying cause"],
  ["RFT + eGFR", "Reduced renal clearance affects all drug dosing", "Dose-adjust ALL medications for eGFR"],
  ["LFT", "Hepatic metabolism reduced in elderly", "Dose-adjust hepatically metabolised drugs"],
  ["Fasting Glucose + HbA1c", "Diabetes common; metabolic monitoring for meds", "Diabetic management; avoid hypoglycaemic medications"],
  ["Serum Electrolytes", "Hyponatraemia (SIADH from SSRIs); hypokalaemia", "Correct before and during pharmacotherapy; monitor closely on SSRIs"],
  ["ECG", "QTc prolongation risk with antipsychotics", "QTc > 450 ms: Avoid QTc-prolonging agents; cardiology review"],
  ["Urinalysis + MSU", "UTI — most common reversible cause of delirium in elderly", "Treat before attributing confusion to psychiatric cause"],
];

const PK_ROWS = [
  ["Reduced hepatic blood flow", "Slower first-pass metabolism; higher bioavailability of oral drugs", "Reduce starting dose by 25–50%; titrate slowly"],
  ["Reduced renal clearance", "Drug accumulation; lithium, gabapentin, pregabalin, memantine", "Dose-adjust per eGFR; monitor renal function 3-monthly on lithium"],
  ["Reduced plasma albumin", "More free (active) drug for protein-bound agents", "Lower target doses; monitor clinical effect closely"],
  ["Increased body fat ratio", "Lipophilic drugs (diazepam, haloperidol) accumulate", "Avoid long-acting benzodiazepines; prefer short-acting agents if essential"],
  ["Reduced CNS reserve", "Higher sensitivity to sedating, anticholinergic, dopaminergic effects", "Any sedation/confusion: reduce dose immediately"],
];

const BEERS_ROWS = [
  ["Long-acting benzodiazepines (diazepam, clonazepam)", "Falls; cognitive impairment; paradoxical agitation", "AVOID — use lorazepam or oxazepam SHORT TERM only if essential"],
  ["Tricyclic antidepressants (amitriptyline, imipramine)", "Anticholinergic; cardiac; hypotension; falls", "AVOID — use SSRI or mirtazapine instead"],
  ["First-generation antipsychotics (haloperidol, chlorpromazine)", "EPS; QTc; tardive dyskinesia", "AVOID for BPSD — use only for acute intoxication/emergency; lowest dose"],
  ["Anticholinergic antihistamines (promethazine, chlorphenamine)", "Delirium; urinary retention; cognitive impairment", "AVOID — use non-anticholinergic alternatives"],
  ["Z-drugs (zolpidem, zopiclone) as long-term hypnotics", "Falls; cognitive impairment; rebound insomnia", "AVOID chronic use — use melatonin or CBT-I instead"],
  ["NSAIDs (diclofenac, ibuprofen) chronically", "GI bleed; renal impairment; fluid retention; hypertension", "AVOID — use paracetamol ± gastroprotection"],
];

const LLD_FEATURES_ROWS = [
  ["Cognitive complaints", "Memory concerns prominent; pseudodementia — depression mimicking dementia; improves with treatment"],
  ["Somatic emphasis", "Patients present with physical complaints; deny low mood; higher risk of missed diagnosis"],
  ["Vascular contribution", "Post-stroke depression; vascular depression (white matter changes on MRI); less response to psychotherapy"],
  ["Suicide risk", "HIGHEST suicide rate of any age group globally; older males at extreme risk; means are more lethal"],
  ["Psychotic features", "Nihilistic delusions (belief internal organs have rotted); hypochondriacal delusions more common than in younger patients"],
  ["Anhedonia dominant", "Prominent loss of pleasure; may not report sadness; look for withdrawal from activities, social isolation"],
];

const LLD_PHARMA_ROWS = [
  ["Escitalopram (SSRI)", "5 mg OD", "10–20 mg OD", "First-line; minimal drug interactions; QTc monitoring > 10 mg; monitor hyponatraemia at 2 weeks"],
  ["Sertraline (SSRI)", "12.5–25 mg OD", "50–150 mg OD", "Well-tolerated; safest in cardiac disease; titrate slowly"],
  ["Mirtazapine (NaSSA)", "7.5–15 mg nocte", "15–30 mg nocte", "Useful for insomnia + poor appetite + depression; weight gain; sedation; no anticholinergic"],
  ["Venlafaxine XR", "37.5 mg OD", "75–150 mg OD", "Second-line; monitor BP; discontinuation syndrome — taper carefully"],
  ["Bupropion", "75 mg OD", "150–300 mg/day", "Activating; useful in apathetic/low-energy depression; lowers seizure threshold — avoid if seizure history"],
  ["ECT", "—", "—", "Highly effective in elderly; consider earlier for psychotic depression, severe food/fluid refusal, or high suicide risk; anaesthesia clearance mandatory"],
];

const ANXIETY_ROWS = [
  ["Common presentations", "GAD most common; health anxiety (IAD) very frequent; phobias (falling, going out, driving after fall); PTSD from life events"],
  ["Somatic overlap", "Anxiety symptoms overlap with cardiac/respiratory/endocrine disease — thorough medical exclusion essential"],
  ["Benzodiazepine risk", "Falls; cognitive impairment; dependence — BZDs CONTRAINDICATED as routine anxiolytics in elderly"],
  ["First-line treatment", "CBT adapted for older adults (slower pace; larger print; memory aids; shorter sessions); SSRI"],
  ["Pharmacotherapy", "Same agents as late-life depression at geriatric doses; buspirone 5–15 mg TDS for GAD (no sedation; no falls)"],
];

const PINCHME_ROWS = [
  ["P", "Pain", "PAINAD scale; analgesic review; check for fractures, constipation, urinary retention"],
  ["I", "Infection", "Full septic screen: CBC, CRP, blood culture, urine C&S, CXR; empirical antibiotics if sepsis suspected"],
  ["N", "Nutrition", "Blood glucose; electrolytes (Na, K, Ca, Mg); thiamine; dehydration assessment"],
  ["C", "Constipation", "Bowel chart review; abdominal examination; rectal examination if needed; lactulose/enema"],
  ["H", "Hydration", "Skin turgor; mucous membranes; fluid balance; IV fluids if inadequate oral intake"],
  ["M", "Medication", "Review ALL medications — recent additions, anticholinergics, opioids, sedatives, steroids, digoxin toxicity"],
  ["E", "Environment", "Unfamiliar environment; sensory deprivation (glasses, hearing aids missing); reorientation; familiar faces"],
];

const BPSD_ASSESS_ROWS = [
  ["Agitation", "Verbal/physical aggression; restlessness; pacing", "De-escalation; reduce stimulation; familiar music; structured routine"],
  ["Psychosis", "Paranoid delusions; hallucinations; misidentification", "Reality orientation; not confronting delusions; reassurance; Safewards"],
  ["Depression in DEM", "Tearfulness; withdrawal; appetite loss; crying at night", "Meaningful activities; pet therapy; music; CBT adapted; antidepressant if severe"],
  ["Anxiety in DEM", "Shadowing caregiver; repetitive questioning; sundowning", "Structured environment; predictable routine; reassurance; morning light"],
  ["Sleep disturbance", "Day-night reversal; nocturnal wandering; sundowning", "Sleep hygiene; morning light; reduce daytime naps; melatonin"],
  ["Apathy", "Loss of motivation; blunted affect; reduced engagement", "Structured activity; social engagement; occupational therapy"],
];

const BPSD_PHARMA_ROWS = [
  ["1", "First always: Non-pharmacological measures", "—", "—", "NPI score at 2 weeks; review triggers"],
  ["2", "Anti-dementia optimisation", "Donepezil or Memantine", "See CL-09", "Cognition; ADL; caregiver report"],
  ["3", "Depression prominent", "Sertraline", "25–50 mg OD — start low; titrate", "GDS-15 monthly; hyponatraemia check"],
  ["4", "Anxiety / agitation without psychosis", "Lorazepam PRN", "0.5 mg — short-term only", "Sedation; falls; use minimum needed"],
  ["5", "Psychosis / severe agitation endangering safety", "Risperidone", "0.25–0.5 mg OD/BD; max 1 mg/day", "Weekly; taper within 3 months; cerebrovascular risk"],
  ["6", "Refractory — specialist review", "Clozapine (rarely) or ECT", "Specialist decision", "Full monitoring; MDT review"],
];

const SUICIDE_ROWS = [
  ["Male sex ≥ 75 years", "Highest risk demographic globally — ALWAYS take suicidal ideation seriously regardless of stated reason"],
  ["Recent bereavement", "Loss of spouse; loss of peer group; social isolation — assess grief; distinguish from depression"],
  ["Chronic pain / medical illness", "Pain as precipitant; hopelessness about prognosis; assess comfort and palliation needs"],
  ["Recent major loss", "Retirement; loss of driving licence; functional independence; housing change — assess adjustment"],
  ["Past suicide attempt", "Strongest predictor of future attempt; elderly attempts are more lethal (more planning, more lethal means)"],
  ["Alcohol use", "Late-onset alcohol use disorder common in elderly; disinhibition; impulsivity — AUDIT-C at every admission"],
  ["Social isolation", "Living alone; reduced social network; no regular contact — social worker assessment mandatory"],
];

const CAREGIVER_ROWS = [
  ["Caregiver burden", "Zarit Burden Interview (ZBI)", "ZBI > 40: High burden; caregiver counselling; respite care referral; support group"],
  ["Caregiver mental health", "PHQ-9 + GAD-7 for caregiver", "Depressed/anxious caregiver: Referral to own treating physician; JRCPL OPD if needed"],
  ["Care capacity", "Clinical interview + home visit report", "Inadequate care capacity: Social worker; government elder care scheme; residential option"],
  ["Financial burden", "Social worker assessment", "Government schemes: NSAP; State geriatric pension; PMJAY eligibility"],
  ["Caregiver education", "Structured psychoeducation programme", "Delivered in family sessions: dementia progression; managing BPSD; legal planning; advance directives"],
];

const DISCHARGE_ROWS = [
  ["Cognitive status", "Baseline cognitive assessment documented; any significant decline workup initiated before discharge"],
  ["Medication", "Polypharmacy review completed — Beers Criteria applied; medications rationalised"],
  ["Fall risk", "Fall prevention plan in place; family educated; home hazard assessment recommended"],
  ["Nutrition", "Nutritional plan documented; supplements prescribed if needed"],
  ["Community support", "Home health aide arranged if needed; Day care centre referral; ASHA/ANM community follow-up"],
  ["Caregiver plan", "Caregiver educated; emergency contacts provided; respite plan discussed"],
  ["Follow-up", "Within 7 days; geriatric psychiatry OPD if available; tele-consultation if mobility limited"],
];

const KPI_ROWS = [
  ["CGA completed within 48 hours of admission", "100%", "Monthly"],
  ["MoCA or MMSE documented at admission and discharge", "100%", "Monthly"],
  ["Beers Criteria review completed and documented", "100%", "Monthly"],
  ["PINCH ME delirium checklist before any antipsychotic in elderly", "100%", "Monthly"],
  ["Morse Fall Scale at admission; fall prevention plan if high-risk", "100%", "Monthly"],
  ["Caregiver burden (ZBI) assessed during admission", "≥ 90%", "Monthly"],
  ["Serum sodium checked at 2 weeks after SSRI initiation", "100%", "Monthly"],
  ["Antipsychotic review and taper attempt at 3 months if on BPSD Rx", "≥ 85%", "Quarterly"],
  ["GDS-15 improvement ≥ 5 points at discharge", "≥ 70% of patients with depression", "Monthly"],
];

const Cl18GeriatricPsychiatry = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-18"
        title="Geriatric Psychiatry"
        icdLine="ICD-11: 6D80–6E8Z | Elderly Care & Psychiatric Verticals — All JRCPL Centres"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.5rem" }}>
        To establish a comprehensive, dignity-centred, evidence-based clinical framework for the assessment and management of all psychiatric disorders presenting in older adults (age ≥ 60 years) at JRCPL — with specific adaptations for pharmacokinetic changes, polypharmacy risks, cognitive impairment, functional decline, and caregiver burden unique to the geriatric population.
      </p>
      <BulletList items={[
        "Covers: Late-onset depression, late-onset anxiety, BPSD, late-onset psychosis, delirium, alcohol use disorder in the elderly, adjustment disorder, grief reactions, and suicide risk in older adults",
        "Special emphasis: Minimum pharmacological burden; cognitive preservation; fall prevention; caregiver support; dignity in care",
        "All geriatric patients receive a Comprehensive Geriatric Assessment (CGA) within 48 hours of admission",
      ]} />

      {/* 2. CGA */}
      <ModuleHeader>2. Comprehensive Geriatric Assessment (CGA) — Mandatory Within 48 Hours</ModuleHeader>
      <SectionTitle>2.1 Cognitive Assessment</SectionTitle>
      <Table
        cols={[{ label: "Tool", width: "30%" }, { label: "Purpose", width: "28%" }, { label: "Threshold", width: "22%" }, { label: "Administered By" }]}
        rows={COGNITIVE_ROWS}
      />

      <SectionTitle>2.2 Mood &amp; Neuropsychiatric Assessment</SectionTitle>
      <Table
        cols={[{ label: "Tool", width: "34%" }, { label: "Purpose", width: "36%" }, { label: "Alert Threshold" }]}
        rows={MOOD_ROWS}
      />

      <SectionTitle>2.3 Functional &amp; Physical Assessment</SectionTitle>
      <Table
        cols={[{ label: "Domain", width: "20%" }, { label: "Tool", width: "28%" }, { label: "Action if Impaired" }]}
        rows={FUNCTIONAL_ROWS}
      />

      <SectionTitle>2.4 Baseline Medical Investigations — Geriatric</SectionTitle>
      <Table
        cols={[{ label: "Investigation", width: "24%" }, { label: "Rationale", width: "34%" }, { label: "Action if Abnormal" }]}
        rows={INVESTIGATIONS_ROWS}
      />

      {/* 3. PHARMACOLOGY */}
      <ModuleHeader>3. Geriatric Pharmacology — Core Principles</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        START LOW, GO SLOW, GO LOWER THAN YOU THINK. Age-related pharmacokinetic changes increase drug sensitivity, accumulation, and adverse effects in all elderly patients.
      </p>
      <Table
        cols={[{ label: "Pharmacokinetic Change", width: "24%" }, { label: "Clinical Implication", width: "38%" }, { label: "Practical Adjustment" }]}
        rows={PK_ROWS}
      />

      <SectionTitle>3.1 Beers Criteria — Medications to AVOID in Elderly</SectionTitle>
      <Table
        cols={[{ label: "Drug Class / Agent", width: "32%" }, { label: "Risk", width: "24%" }, { label: "JRCPL Guidance" }]}
        rows={BEERS_ROWS}
      />

      {/* 4. LATE-LIFE DEPRESSION */}
      <ModuleHeader>4. Late-Life Depression</ModuleHeader>
      <SectionTitle>4.1 Key Differences from Mid-Life Depression</SectionTitle>
      <Table
        cols={[{ label: "Feature", width: "24%" }, { label: "Late-Life Specific Presentation" }]}
        rows={LLD_FEATURES_ROWS}
      />

      <SectionTitle>4.2 Pharmacotherapy — Late-Life Depression</SectionTitle>
      <Table
        cols={[{ label: "Drug", width: "20%" }, { label: "Starting Dose", width: "16%" }, { label: "Target Dose", width: "16%" }, { label: "Notes" }]}
        rows={LLD_PHARMA_ROWS}
      />
      <WarningBox>Monitor serum sodium at 2 weeks and 1 month after starting SSRI in elderly — SIADH risk is significantly elevated in this age group. Stop SSRI if Na &lt; 130 mEq/L.</WarningBox>

      {/* 5. LATE-LIFE ANXIETY */}
      <ModuleHeader>5. Late-Life Anxiety</ModuleHeader>
      <Table
        cols={[{ label: "Feature", width: "24%" }, { label: "Late-Life Specific" }]}
        rows={ANXIETY_ROWS}
      />

      {/* 6. DELIRIUM */}
      <ModuleHeader>6. Delirium — Recognition &amp; Management</ModuleHeader>
      <WarningBox>Delirium is a MEDICAL EMERGENCY. Always suspect delirium in any elderly patient with acute confusion — even if they have a prior psychiatric diagnosis. NEVER attribute new acute confusion to psychiatric illness alone without excluding medical causes.</WarningBox>

      <SectionTitle>6.1 PINCH ME — Delirium Causes Checklist (Mandatory Before Any Psychotropic)</SectionTitle>
      <Table
        cols={[{ label: "", width: "5%", center: true }, { label: "Cause", width: "16%" }, { label: "Assessment / Action" }]}
        rows={PINCHME_ROWS}
      />

      <SectionTitle>6.2 Delirium Management Protocol</SectionTitle>
      <BulletList items={[
        "Non-pharmacological FIRST: Reorientation (clock, calendar, familiar objects); familiar faces; consistent nursing staff; glasses/hearing aids; reduce night-time disturbance; early mobilisation",
        "Treat underlying cause: This is the only cure — all medications are temporising measures only",
        "Haloperidol 0.25–0.5 mg oral/IM — lowest effective dose; reassess every 2 hours; maximum 2 mg/day elderly",
        "Quetiapine 12.5–25 mg oral — preferred if Parkinson's disease or Lewy body dementia (haloperidol contraindicated in DLB)",
        "Lorazepam 0.5 mg oral/IM — only for alcohol/BZD withdrawal delirium; AVOID for other delirium causes",
        "AVOID: High-dose antipsychotics; anticholinergics; long-acting BZDs — all worsen delirium",
      ]} />

      {/* 7. BPSD */}
      <ModuleHeader>7. Behavioural &amp; Psychological Symptoms of Dementia (BPSD)</ModuleHeader>
      <SectionTitle>7.1 BPSD Assessment</SectionTitle>
      <Table
        cols={[{ label: "BPSD Domain", width: "18%" }, { label: "Common Symptoms", width: "30%" }, { label: "First-line Non-pharmacological" }]}
        rows={BPSD_ASSESS_ROWS}
      />

      <SectionTitle>7.2 BPSD Pharmacotherapy — Stepped Approach</SectionTitle>
      <Table
        cols={[
          { label: "Step", width: "7%", center: true },
          { label: "Indication", width: "24%" },
          { label: "Agent", width: "18%" },
          { label: "Dose", width: "20%" },
          { label: "Monitoring" },
        ]}
        rows={BPSD_PHARMA_ROWS}
      />
      <WarningBox>All atypical antipsychotics carry a BLACK BOX WARNING for increased stroke risk and mortality in elderly patients with dementia-related psychosis. Use only after documented failure of non-pharmacological measures. Review and taper every 3 months.</WarningBox>

      {/* 8. SUICIDE */}
      <ModuleHeader>8. Suicide Risk in Older Adults</ModuleHeader>
      <Table
        cols={[{ label: "Risk Factor", width: "26%" }, { label: "Clinical Assessment" }]}
        rows={SUICIDE_ROWS}
      />
      <BulletList items={[
        "C-SSRS mandatory at every assessment — do NOT omit because patient is elderly or appears unlikely to act",
        "Means restriction: Family counselling on removal of firearms, excess medications, sharp objects from home environment",
        "Follow SE-01 (Suicide Risk Prevention SOP) for all observation levels and safety planning",
      ]} />

      {/* 9. CAREGIVER */}
      <ModuleHeader>9. Caregiver Assessment &amp; Support</ModuleHeader>
      <Table
        cols={[{ label: "Assessment", width: "22%" }, { label: "Tool / Method", width: "28%" }, { label: "Action" }]}
        rows={CAREGIVER_ROWS}
      />

      {/* 10. DISCHARGE */}
      <ModuleHeader>10. Discharge &amp; Community Linkage</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "20%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />

      {/* 11. KPIs */}
      <ModuleHeader>11. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "22%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-18" docTitle="Geriatric Psychiatry" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl18GeriatricPsychiatry;
