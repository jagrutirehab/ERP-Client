import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-19"],
  ["Title", "Intellectual Disability & Neurodevelopmental Disorders — Assessment & Management Protocol"],
  ["Version", "1.0 (New — May 2026)"],
  ["Effective Date", "01 June 2026"],
  ["Review Date", "31 May 2027"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Amar Shinde, Founder & Clinical Director"],
  ["Applicable To", "Children, Adolescents & Adults with Intellectual Disability / Neurodevelopmental Conditions — All JRCPL Centres"],
  ["Rating Scales", "Vineland-3, VSMS, CARS-2, Conners, VABS, SRS-2, GAS, ABC, PAS-ADD"],
  ["Regulatory Basis", "MHCA 2017; RPWD Act 2016; RCI Act 1992; POCSO 2012 (minors); Rights of Persons with Disabilities Rules 2017"],
  ["Cross-Reference", "CL-07 (ADHD), CL-08 (ASD), CL-18 (Geriatric ID ageing)"],
];

const DIAG_ROWS = [
  ["Mild", "50–70", "F70", "Abstract reasoning limited; concrete thinking", "Immature social interactions; gullibility", "Self-care independent; needs support for complex tasks", "Intermittent"],
  ["Moderate", "35–49", "F71", "Basic literacy/numeracy possible", "Significant differences from peers", "Some self-care; needs support for daily living", "Limited"],
  ["Severe", "20–34", "F72", "Minimal symbolic language", "Limited verbal interaction", "Needs support for all ADL; not independent living", "Extensive"],
  ["Profound", "< 20", "F73", "Sensorimotor functioning", "Very limited", "Fully dependent; 24-hour supervision required", "Pervasive"],
];

const ASSESS_TOOLS_ROWS = [
  ["Vineland Adaptive Behaviour Scales-3 (Vineland-3)", "Communication; Daily Living; Socialisation; Motor — gold standard", "0–90 years", "Psychologist"],
  ["Malin's Intelligence Scale (MISIC / WISC-IV India)", "Full-scale IQ; verbal; performance — Indian standardised", "5–15 years", "Psychologist"],
  ["Seguin Form Board / Raven's CPM", "Non-verbal intelligence — language-independent", "3–12 years", "Psychologist"],
  ["Binet-Kamat Test", "Mental age estimation — widely used in Indian settings", "All ages", "Psychologist"],
  ["Social Maturity Scale (SMS / Vineland Social Maturity)", "Social quotient; adaptive behaviour", "0–30 years", "Psychologist"],
];

const COMORBIDITY_ROWS = [
  ["Depression", "~25%", "Look for behavioural equivalents: increased self-injury, withdrawal, appetite change, sleep change — not verbal report", "SSRI at low dose; CBT adapted; carer education"],
  ["Anxiety disorders", "~20%", "Behavioural: agitation, avoidance, stereotypies as anxiety markers; observe context of behaviour", "CBT; environmental modification; SSRI"],
  ["ADHD", "~30%", "Standard ADHD criteria apply if cognitive level is appropriate; observe attention and activity across settings", "Methylphenidate; atomoxetine; see CL-07"],
  ["ASD (co-occurring)", "~30–35% of ID cases", "ASD diagnosis made on social communication and restricted/repetitive behaviours — separate from ID level", "Comprehensive ASD + ID plan; see CL-08"],
  ["Psychosis", "~3%", "Rule out delirium, postictal state, medication toxicity first; diagnostic overshadowing risk", "Low-dose antipsychotic; reduce stimulation"],
  ["Epilepsy", "~25%", "EEG baseline; neurology review; behaviour changes may be postictal rather than psychiatric", "Antiepileptic; liaise with neurology"],
];

const MEDICAL_ROWS = [
  ["Genetic / aetiological", "Karyotype (Down syndrome); FISH; chromosomal microarray if indicated; TORCH screen in children", "Identify syndrome-specific comorbidities; genetic counselling for family"],
  ["Neurological", "EEG; neuroimaging (MRI brain) if focal signs or regression", "Epilepsy; structural cause identification"],
  ["Hearing", "Pure tone audiometry; OAE; BERA (infants)", "Undetected hearing loss worsens communication and behaviour"],
  ["Vision", "Ophthalmology referral; visual acuity assessment", "Undetected visual impairment contributes to behavioural difficulties"],
  ["Thyroid", "TSH — especially in Down syndrome (high thyroid disease prevalence)", "Treat hypothyroidism; improves cognition and behaviour"],
  ["Lead levels", "Blood lead if environmental exposure suspected", "Lead toxicity impairs cognition; treat if elevated"],
  ["Nutritional", "CBC; vitamin B12; vitamin D; ferritin; folate", "Anaemia; vitamin deficiency — treat underlying cause"],
];

const FBA_ROWS = [
  ["1", "Define the behaviour", "Specific, observable, measurable: 'hits own head with palm' not 'self-injurious behaviour'"],
  ["2", "Antecedent analysis", "ABC chart: Antecedent → Behaviour → Consequence; what happens immediately before the behaviour?"],
  ["3", "Function identification", "Attention-seeking; escape/avoidance; access to preferred item/activity; sensory stimulation; communication of pain/discomfort"],
  ["4", "Motivational assessment", "MAS (Motivation Assessment Scale) or QABF (Questions About Behavioural Function)"],
  ["5", "Environment analysis", "Physical: noise, lighting, crowding, temperature; Social: preferred/non-preferred people; Schedule: transitions, unstructured time"],
  ["6", "PBS plan development", "Proactive strategies (prevent triggers); Teaching strategies (replacement behaviour); Reactive strategies (safe response to behaviour)"],
];

const PHARMA_ROWS = [
  ["1", "Treat underlying psychiatric comorbidity", "Per CL-03/04/07 as applicable", "Geriatric-equivalent dosing", "Always treat psychiatric cause first; behaviour often resolves"],
  ["2", "Irritability / aggression — ASD + ID", "Risperidone", "0.5–3 mg/day by weight", "FDA-approved for ASD irritability; metabolic monitoring"],
  ["3", "Self-injurious behaviour — serotonin hypothesis", "Fluoxetine or Sertraline", "Low dose; slow titration", "Evidence-based; monitor for activation"],
  ["4", "Hyperactivity / impulsivity (ADHD features)", "Methylphenidate", "0.3–0.5 mg/kg/day", "May have paradoxical response — monitor closely"],
  ["5", "Severe aggression refractory", "Valproate", "15–20 mg/kg/day", "Mood-stabilising effect; LFT; CBC monitoring"],
  ["6", "Acute agitation emergency", "Lorazepam 0.5–1 mg IM", "Single dose; observe", "Not for regular use; treat precipitant"],
];

const REHAB_ROWS = [
  ["Communication", "AAC: PECS, Makaton, LAMP, speech-generating devices", "Daily (school/therapy); 3–5 sessions/week", "Speech & Language Pathologist"],
  ["Adaptive Behaviour", "ADL training: dressing, eating, toileting, hygiene — task analysis; backward chaining", "Daily structured practice", "Occupational Therapist + Direct Care Staff"],
  ["Academic / Pre-academic", "Functional literacy; numeracy; life skills curriculum; special education", "Daily school programme", "Special Educator (RCI-licensed)"],
  ["Sensory Integration", "Proprioceptive, vestibular, tactile input programmes for sensory-seeking / sensory-avoidant profiles", "3 sessions/week", "Occupational Therapist"],
  ["Social Skills", "Structured social skills training; role-play; peer interaction; social stories", "Weekly group + daily reinforcement", "Psychologist + Special Educator"],
  ["Vocational Training", "Job sampling; supported employment; sheltered workshop; income-generating activities (18+ years)", "Age-appropriate from 14 years", "Vocational Rehabilitation Counsellor"],
  ["Physiotherapy", "Gross motor; tone management; mobility; co-ordination — especially moderate/severe ID", "3–5 sessions/week", "Physiotherapist"],
];

const LEGAL_ROWS = [
  ["RPWD Act 2016", "21 specified disabilities including intellectual disability; right to equal opportunity; non-discrimination; reasonable accommodation", "Disability certificate facilitation; UDID card; welfare schemes enrolment"],
  ["MHCA 2017", "Presumption of capacity; capacity assessment before treatment; supported decision-making; advance directives", "Capacity assessment documented for all treatment decisions; involve legal guardian"],
  ["RCI Act 1992", "Rehabilitation Council of India — regulates rehabilitation professionals; all therapists must be RCI-licensed", "Verify RCI registration of all therapists at JRCPL"],
  ["POCSO Act 2012", "Children with ID are at significantly higher risk of sexual abuse; mandatory reporting of any disclosure or suspicion", "All staff trained; any disclosure → mandatory FIR; CWC referral"],
  ["National Trust Act 1999", "Legal guardianship for adults with Autism, CP, MR, multiple disability — LGC at District Collector office", "Assist families to apply for legal guardianship; documentation support"],
];

const FAMILY_ROWS = [
  ["Session 1", "Understanding the diagnosis — ID severity; what it means for your child/family member; realistic expectations; grief normalisation", "At or within 1 week of diagnosis"],
  ["Session 2", "Behavioural strategies — positive reinforcement; ignoring minor behaviour; reward systems; structured routine at home", "Week 2"],
  ["Session 3", "Communication strategies — AAC introduction; responding to non-verbal communication; reducing frustration", "Week 3"],
  ["Session 4", "ADL training at home — how to teach step by step; task analysis; repetition; patience", "Week 4"],
  ["Session 5", "Legal rights and entitlements — RPWD Act; disability certificate; UDID; National Trust; government schemes", "Week 5 or pre-discharge"],
  ["Session 6", "Long-term planning — schooling options; adult services; residential options; guardianship; financial planning; caregiver succession", "Discharge + 1-month follow-up"],
  ["Ongoing", "Caregiver support group; peer networking; JRCPL parent helpline; quarterly review sessions", "Monthly"],
];

const KPI_ROWS = [
  ["Comprehensive assessment (cognitive + adaptive + medical) completed", "100%", "Monthly"],
  ["FBA completed before any pharmacological behaviour intervention", "100%", "Monthly"],
  ["RCI-licensed therapist delivering all rehabilitation sessions", "100%", "Monthly"],
  ["RPWD Act welfare scheme enrolment documented or initiated", "≥ 90%", "Quarterly"],
  ["Family training programme (6 sessions) completed during admission", "≥ 85%", "Monthly"],
  ["PAS-ADD comorbidity screen completed at admission", "100%", "Monthly"],
  ["POCSO mandatory reporting compliance if abuse disclosed", "100%", "Per event"],
];

const Cl19IntellectualDisabilityNeurodevelopmental = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-19"
        title="Intellectual Disability & Neurodevelopmental Disorders"
        icdLine="ICD-11: 6A00–6A0Z | DSM-5-TR: F70–F79 | Child, Adolescent & Psychiatric Verticals"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.5rem" }}>
        To establish a standardised, rights-based, and evidence-informed protocol for the comprehensive assessment, management, rehabilitation, and legal safeguarding of individuals with Intellectual Disability (ID) and co-occurring neurodevelopmental conditions across all JRCPL centres — ensuring dignified care, functional maximisation, family empowerment, and full compliance with RPWD Act 2016 and MHCA 2017.
      </p>
      <BulletList items={[
        "Covers: Intellectual Disability (mild, moderate, severe, profound); Specific Learning Disorders; Communication Disorders; Motor Disorders; Global Developmental Delay; Comorbid ID + ASD; Comorbid ID + Epilepsy; Dual Diagnosis (ID + psychiatric disorder)",
        "Excludes ASD without ID (→ CL-08) and ADHD without ID (→ CL-07)",
      ]} />

      {/* 2. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>2. Diagnostic Classification</ModuleHeader>
      <Table
        cols={[
          { label: "Severity", width: "12%" },
          { label: "IQ Range", width: "10%", center: true },
          { label: "DSM-5-TR", width: "10%", center: true },
          { label: "Conceptual", width: "20%" },
          { label: "Social", width: "18%" },
          { label: "Practical", width: "18%" },
          { label: "Support Need" },
        ]}
        rows={DIAG_ROWS}
      />

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Comprehensive Assessment Protocol</ModuleHeader>
      <SectionTitle>3.1 Intellectual &amp; Adaptive Functioning Assessment</SectionTitle>
      <Table
        cols={[{ label: "Tool", width: "34%" }, { label: "Measures", width: "30%" }, { label: "Age Range", width: "14%", center: true }, { label: "Administered By" }]}
        rows={ASSESS_TOOLS_ROWS}
      />

      <SectionTitle>3.2 Psychiatric Comorbidity Assessment — PAS-ADD</SectionTitle>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        Psychiatric disorders are 3–4× more common in people with ID than the general population. Standard DSM/ICD criteria require adaptation for ID because verbal reporting is limited. Use PAS-ADD (Psychiatric Assessment Schedule for Adults with Developmental Disabilities).
      </p>
      <Table
        cols={[{ label: "Comorbidity", width: "18%" }, { label: "Prevalence in ID", width: "14%", center: true }, { label: "Diagnostic Adaptation", width: "36%" }, { label: "Management Principle" }]}
        rows={COMORBIDITY_ROWS}
      />

      <SectionTitle>3.3 Medical Assessment</SectionTitle>
      <Table
        cols={[{ label: "Domain", width: "18%" }, { label: "Assessment", width: "38%" }, { label: "Rationale" }]}
        rows={MEDICAL_ROWS}
      />

      {/* 4. BEHAVIOUR SUPPORT */}
      <ModuleHeader>4. Behaviour Support — Positive Behaviour Support (PBS)</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        Challenging behaviour is not deliberate — it is communication. Before any pharmacological intervention, a Functional Behaviour Assessment (FBA) must be completed to identify the function of the behaviour.
      </p>
      <SectionTitle>4.1 Functional Behaviour Assessment (FBA)</SectionTitle>
      <Table
        cols={[{ label: "Step", width: "7%", center: true }, { label: "Component", width: "24%" }, { label: "Content" }]}
        rows={FBA_ROWS}
      />

      <SectionTitle>4.2 Pharmacological Management of Challenging Behaviour — Stepped Approach</SectionTitle>
      <Table
        cols={[
          { label: "Step", width: "7%", center: true },
          { label: "Condition", width: "24%" },
          { label: "Agent", width: "18%" },
          { label: "Dose (ID-adjusted)", width: "18%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />
      <WarningBox>Diagnostic Overshadowing: Do not attribute all behaviour to 'their disability.' Always screen for pain, infection, constipation, medication side effects, or unmet sensory needs before attributing behaviour to the underlying condition.</WarningBox>

      {/* 5. REHABILITATION */}
      <ModuleHeader>5. Rehabilitation &amp; Habilitation Programme</ModuleHeader>
      <Table
        cols={[{ label: "Domain", width: "18%" }, { label: "Interventions", width: "40%" }, { label: "Frequency", width: "20%" }, { label: "Professional" }]}
        rows={REHAB_ROWS}
      />

      {/* 6. LEGAL FRAMEWORK */}
      <ModuleHeader>6. Legal Framework &amp; Rights</ModuleHeader>
      <Table
        cols={[{ label: "Legislation", width: "20%" }, { label: "Key Provision", width: "42%" }, { label: "JRCPL Application" }]}
        rows={LEGAL_ROWS}
      />

      {/* 7. FAMILY TRAINING */}
      <ModuleHeader>7. Family Training &amp; Empowerment</ModuleHeader>
      <Table
        cols={[{ label: "Session", width: "14%" }, { label: "Content", width: "58%" }, { label: "Timeline" }]}
        rows={FAMILY_ROWS}
      />

      {/* 8. DISCHARGE */}
      <ModuleHeader>8. Discharge &amp; Transition Planning</ModuleHeader>
      <BulletList items={[
        "All discharge plans are individual and family-centred — no standard discharge pathway applies",
        "Transition to adult services for adolescents ≥ 18 years: plan from age 16; document adult service linkage",
        "School placement: Regular school with support / inclusive education; special school; NIOS open schooling — document recommendation",
        "Welfare scheme enrolment: UDID card; NSAP; State disability pension; Indira Gandhi National Disability Pension Scheme",
        "Respite care: Link family to NIMH respite services / State-level respite programmes",
        "Follow-up: Every 3 months for children; every 6 months for stable adults; as needed for complex behaviour",
      ]} />

      {/* 9. KPIs */}
      <ModuleHeader>9. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "14%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-19" docTitle="Intellectual Disability & Neurodevelopmental Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl19IntellectualDisabilityNeurodevelopmental;
