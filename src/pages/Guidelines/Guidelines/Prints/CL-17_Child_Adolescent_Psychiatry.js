import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-17"],
  ["Title", "Child & Adolescent Psychiatry — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All children (< 12 years) and adolescents (12–17 years) — All JRCPL Centres"],
  ["Rating Scales", "CDRS-R; MASC-2; CY-BOCS; Vanderbilt; CGAS; Columbia Severity Scale (paediatric)"],
  ["Regulatory Basis", "MHCA 2017; POCSO Act 2012; JJ Act 2015; NABH Paediatric Standards; RPWD Act 2016"],
  ["Replaces", "Newly developed standalone protocol"],
];

const LEGAL_ROWS = [
  ["MHCA 2017 §87", "Minors may not be admitted as involuntary patients without guardian consent + MHRB oversight; special safeguards apply"],
  ["MHCA 2017 §88–89", "Parents/guardians are nominated representatives; but adolescent's evolving autonomy must be respected"],
  ["POCSO Act 2012", "Any sexual abuse disclosure by minor: MANDATORY report to police and SJPU within 24 hours — clinical staff have no discretion; failure to report is a criminal offence"],
  ["JJ Act 2015", "Children in conflict with law who present with mental illness: liaison with CWC and JJB; clinical opinion may be requested"],
  ["RPWD Act 2016", "Children with disabilities (autism, ID, CP): right to inclusive education; disability certificate facilitation is a JRCPL service obligation"],
];

const ASSESS_DOMAINS_ROWS = [
  ["Developmental history", "Pregnancy and perinatal; milestones (motor, language, social, adaptive); toilet training; school readiness; any regression"],
  ["School history", "Academic performance; attendance; relationships with peers and teachers; learning difficulties; special education"],
  ["Family history", "Parental mental illness; family dynamics; discipline style; conflicts; domestic violence; substance use in household"],
  ["Social history", "Peer relationships; social skills; bullying (perpetrator or victim); social media use; extracurricular activities"],
  ["Trauma history", "Abuse (physical, emotional, sexual, neglect); POCSO considerations; ACE score; developmental trauma"],
  ["Current presentation", "Symptom onset; duration; severity; functional impact across home, school, peer contexts"],
  ["Collateral", "Mandatory from parents/guardians; school report if available; previous medical/psychiatric records"],
];

const SCALES_ROWS = [
  ["CDRS-R (Children's Depression Rating Scale)", "6–12 years", "Depression", "Clinician"],
  ["MASC-2 (Multidimensional Anxiety Scale for Children)", "8–19 years", "Anxiety disorders", "Self-report"],
  ["CY-BOCS", "All ages", "OCD", "Clinician"],
  ["Vanderbilt ADHD Scale", "6–12 years", "ADHD", "Parent + teacher rating"],
  ["CGAS (Children's Global Assessment Scale)", "All ages", "Overall functioning", "Clinician"],
  ["Columbia Severity Scale (Paediatric)", "All ages", "Suicide risk", "Clinician"],
  ["ISAA / M-CHAT-R/F", "2–18 years", "Autism", "Clinician / parent"],
];

const DEPRESSION_ROWS = [
  ["Mood presentation", "Irritability more common than sadness", "Sadness; hopelessness; anhedonia (adult-like)"],
  ["Somatic", "Headaches; stomach aches; school refusal", "Physical complaints; fatigue; sleep changes"],
  ["Pharmacotherapy", "Fluoxetine (age ≥ 8): start 5–10 mg OD; only SSRI with evidence", "Fluoxetine or Sertraline; monitor for activation; suicidality monitoring weeks 1–4"],
  ["Psychotherapy", "Play therapy; family therapy; CBT adapted for age", "CBT; IPT-A (adolescents); family therapy"],
  ["Suicide risk", "Lower but serious; access to means assessment", "Higher; C-SSRS mandatory; no-self-harm agreement; family safety plan"],
];

const ANXIETY_ROWS = [
  ["Separation Anxiety", "Excessive distress when separated from attachment figure; school refusal", "CBT; graduated exposure; family therapy; SSRI if moderate-severe"],
  ["Social Anxiety", "Selective mutism in younger children; pervasive social avoidance in adolescents", "CBT with exposure; SSRI; school accommodation letter"],
  ["GAD", "Excessive worry about multiple topics; physical symptoms", "CBT; relaxation; SSRI if moderate-severe"],
  ["School Refusal", "Absence from school due to anxiety; multi-agency approach", "CBT; graded return; liaison with school; parental training"],
];

const CONDUCT_ROWS = [
  ["Assessment", "Rule out ADHD; learning disability; trauma; family dysfunction; substance use — all contributory and treatable"],
  ["Parent Management Training (PMT)", "Evidence-based primary intervention; Triple P or Webster-Stratton Incredible Years; reduces conduct problems significantly"],
  ["Multisystemic Therapy (MST)", "For severe conduct disorder in adolescents; community-based; family + school + peer systems"],
  ["Pharmacotherapy", "No primary medication; treat comorbid ADHD if present; risperidone for aggression if severe — last resort"],
  ["School liaison", "Behaviour support plan; IEP if learning difficulty; anti-bullying intervention"],
];

const PHARMA_ROWS = [
  ["Fluoxetine", "≥ 8 years", "Depression; OCD", "Only SSRI with robust RCT evidence in children; FDA-approved < 18 for OCD"],
  ["Sertraline", "≥ 6 years", "OCD; anxiety", "FDA-approved for OCD ≥ 6 years; off-label for anxiety"],
  ["Methylphenidate", "≥ 6 years", "ADHD", "Growth monitoring (height/weight monthly); cardiac screening before initiation; drug holiday in school breaks"],
  ["Atomoxetine", "≥ 6 years", "ADHD (stimulant-intolerant)", "Black box warning: suicidal ideation in first weeks — monitor closely"],
  ["Risperidone", "≥ 5 years", "ASD irritability; aggression (last resort)", "FDA-approved for ASD irritability in children; weight and metabolic monitoring"],
  ["Aripiprazole", "≥ 13 years", "Schizophrenia; Bipolar I (acute mania)", "FDA-approved for both in adolescents; monitor weight and akathisia"],
  ["Lithium", "≥ 12 years", "Bipolar disorder", "Weight-based dosing; renal and thyroid monitoring; serum levels weekly initially"],
];

const KPI_ROWS = [
  ["Developmental assessment completed within 48 hours of admission", "100%", "Monthly"],
  ["POCSO mandatory reporting within 24 hours of disclosure", "100%", "Per event"],
  ["Minors not admitted to adult wards", "100% (zero tolerance)", "Monthly"],
  ["Parent/guardian included in all treatment meetings", "≥ 95%", "Monthly"],
  ["CGAS scored at admission and discharge", "100%", "Monthly"],
  ["Psychotropic medication informed consent documented", "100%", "Monthly"],
  ["School liaison letter sent within 5 days of admission", "≥ 90%", "Monthly"],
];

const Cl17ChildAdolescentPsychiatry = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-17"
        title="Child & Adolescent Psychiatry"
        icdLine="ICD-11: 6A00–6A0Z / 6A20–6B9Z | Child & Adolescent Vertical — All JRCPL Centres"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a developmentally sensitive, family-centred, and legally compliant clinical framework for the assessment and management of psychiatric disorders in children (&lt; 12 years) and adolescents (12–17 years) at JRCPL — aligned with MHCA 2017, POCSO 2012, JJ Act 2015, and international child psychiatry standards.
      </p>

      {/* 2. LEGAL FRAMEWORK */}
      <ModuleHeader>2. Special Legal Framework</ModuleHeader>
      <Table
        cols={[{ label: "Legislation", width: "20%" }, { label: "Relevance to Child Psychiatry at JRCPL" }]}
        rows={LEGAL_ROWS}
      />
      <WarningBox>POCSO Act 2012: Any sexual abuse disclosure by a minor triggers a MANDATORY report to police and SJPU within 24 hours. Clinical staff have no discretion. Failure to report is a criminal offence under Section 21 POCSO.</WarningBox>

      {/* 3. ASSESSMENT */}
      <ModuleHeader>3. Assessment Framework</ModuleHeader>
      <SectionTitle>3.1 Developmental Assessment Domains</SectionTitle>
      <Table
        cols={[{ label: "Domain", width: "22%" }, { label: "Assessment Content" }]}
        rows={ASSESS_DOMAINS_ROWS}
      />

      <SectionTitle>3.2 Rating Scales by Age</SectionTitle>
      <Table
        cols={[{ label: "Scale", width: "38%" }, { label: "Age", width: "14%", center: true }, { label: "Disorder", width: "18%" }, { label: "Administered By" }]}
        rows={SCALES_ROWS}
      />

      {/* 4. PRESENTATIONS */}
      <ModuleHeader>4. Common Presentations &amp; Management</ModuleHeader>
      <SectionTitle>4.1 Paediatric Depression</SectionTitle>
      <Table
        cols={[{ label: "Feature", width: "20%" }, { label: "Children (< 12)" }, { label: "Adolescents (12–17)" }]}
        rows={DEPRESSION_ROWS}
      />

      <SectionTitle>4.2 Paediatric Anxiety</SectionTitle>
      <Table
        cols={[{ label: "Disorder", width: "20%" }, { label: "Clinical Feature", width: "42%" }, { label: "Treatment" }]}
        rows={ANXIETY_ROWS}
      />

      <SectionTitle>4.3 Conduct Disorder &amp; Oppositional Defiant Disorder</SectionTitle>
      <Table
        cols={[{ label: "Approach", width: "28%" }, { label: "Content" }]}
        rows={CONDUCT_ROWS}
      />

      {/* 5. INPATIENT STANDARDS */}
      <ModuleHeader>5. Inpatient Child &amp; Adolescent Unit Standards</ModuleHeader>
      <BulletList items={[
        "Age-appropriate environment: play materials, art supplies, educational materials, age-appropriate activities schedule",
        "School continuity: liaison with patient's school during admission; homework support",
        "Separation of children and adults: minors must NOT be admitted to general adult psychiatric wards",
        "Family involvement: parents/guardians included in all treatment meetings; overnight stay by parent for young children where clinically appropriate",
        "POCSO compliance: all staff trained in mandatory reporting obligations; POCSO poster displayed in ward; designated POCSO officer",
        "Safeguarding lead: Centre Manager is designated safeguarding lead; reports to Clinical Director",
      ]} />

      {/* 6. PSYCHOTROPIC PRESCRIBING */}
      <ModuleHeader>6. Psychotropic Prescribing in Minors</ModuleHeader>
      <Table
        cols={[
          { label: "Drug", width: "16%" },
          { label: "Min. Age", width: "13%", center: true },
          { label: "Indication", width: "22%" },
          { label: "Special Considerations" },
        ]}
        rows={PHARMA_ROWS}
      />
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.88rem" }}>
        Consent for medication in minors: Parent/guardian informed consent MANDATORY. For adolescents ≥ 16 with capacity: respect adolescent's decision alongside parental consent. Document capacity assessment.
      </p>

      {/* 7. KPIs */}
      <ModuleHeader>7. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "20%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-17" docTitle="Child & Adolescent Psychiatry" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl17ChildAdolescentPsychiatry;
