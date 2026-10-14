import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-16"],
  ["Title", "Cannabis & Poly-substance Use Disorder — Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL De-Addiction & Psychiatric Units"],
  ["Rating Scales", "DAST-10; AUDIT; DUDIT; CUDIT; COWS; CIWA-Ar; PHQ-9; PANSS (if psychosis)"],
  ["Regulatory Basis", "MHCA 2017; NDPS Act 1985; NABH COP; WHO mhGAP"],
  ["Replaces", "CC-03 Detox SOP (cannabis and poly-substance sections expanded as standalone CL-16)"],
];

const CUDIT_ROWS = [
  ["0–7", "Low risk", "Brief psychoeducation; advise moderation or cessation"],
  ["8–12", "Moderate risk", "Brief intervention; motivational enhancement; assess dependence features"],
  ["≥ 13", "High risk / Dependence", "Full assessment; structured withdrawal management; residential rehabilitation"],
];

const CANNABIS_WD_ROWS = [
  ["Irritability / anger", "24–48 hrs", "Days 2–4", "1–2 weeks", "Behavioural techniques; clonidine 0.1 mg TDS PRN"],
  ["Anxiety", "24–48 hrs", "Days 2–4", "1–2 weeks", "CBT; hydroxyzine 25 mg TDS PRN"],
  ["Insomnia", "24–48 hrs", "Days 3–5", "2–3 weeks", "Melatonin 5 mg nocte; sleep hygiene; hydroxyzine"],
  ["Decreased appetite", "24–48 hrs", "Days 2–4", "1 week", "Nutritional support; small frequent meals"],
  ["Restlessness", "24 hrs", "Days 2–3", "1 week", "Exercise; mindfulness; PRN hydroxyzine"],
  ["Depression", "48–72 hrs", "Days 3–7", "2–4 weeks", "Monitor PHQ-9; if persistent > 4 weeks: consider SSRI"],
  ["Craving", "Immediate", "Peaks Days 2–5", "Months", "MET; CBT coping; avoid high-risk environments"],
];

const CANNABIS_PSYCHOSIS_ROWS = [
  ["Acute cannabis intoxication with psychosis", "Observation; reassurance; safe quiet environment; olanzapine 5–10 mg PO/IM if severe agitation; resolves in hours–days with cessation"],
  ["Cannabis-induced psychotic disorder", "Antipsychotic (olanzapine 10 mg or risperidone 2–4 mg); abstinence mandatory; PANSS monitoring; treat for minimum 3–6 months"],
  ["Cannabis use + Schizophrenia", "Integrated dual-diagnosis treatment; clozapine has evidence for both schizophrenia + SUD reduction; abstinence from cannabis significantly improves schizophrenia outcomes"],
];

const BZD_RISK_ROWS = [
  ["Long-term use > 3 months at high dose", "Slow taper over months; never abrupt cessation"],
  ["History of BZD withdrawal seizures", "Inpatient detox mandatory; anticonvulsant cover"],
  ["Concurrent alcohol use", "Increased seizure risk; alcohol detox and BZD taper simultaneously under physician supervision"],
  ["Elderly patient", "Diazepam conversion preferred; slower taper; fall risk"],
];

const BZD_EQUIV_ROWS = [
  ["Alprazolam (Xanax)", "0.5 mg", "Short — high withdrawal risk"],
  ["Clonazepam", "0.5 mg", "Long — less severe withdrawal"],
  ["Lorazepam (Ativan)", "1 mg", "Intermediate"],
  ["Nitrazepam", "5 mg", "Long"],
  ["Triazolam", "0.25 mg", "Ultra-short — very high risk"],
];

const STIMULANT_WD_ROWS = [
  ["Crash", "Hours to 3 days", "Intense craving; dysphoria; fatigue; hypersomnia; hyperphagia", "Supportive: rest; nutrition; monitoring; no pharmacotherapy proven effective"],
  ["Withdrawal", "1–4 weeks", "Anhedonia; depression; fatigue; prolonged sleep; reduced motivation", "PHQ-9 monitoring; SSRI if depression persists > 2 weeks; activity scheduling"],
  ["Extinction", "Weeks–months", "Episodic cravings triggered by cues", "CBT cue exposure; MET; NA/CA group attendance"],
];

const STIMULANT_PSYCHOSIS_ROWS = [
  ["Acute intoxication psychosis", "Quiet room; reassurance; haloperidol 5 mg IM if severely agitated; usually resolves within 24–72 hours of abstinence"],
  ["Persistent stimulant psychosis", "Antipsychotic (risperidone or olanzapine); abstinence essential; may require 3–6 months of treatment"],
  ["Stimulant-induced mania", "Mood stabiliser (valproate); antipsychotic; medical monitoring; differentiate from primary bipolar"],
];

const POLY_ASSESS_ROWS = [
  ["Alcohol", "AUDIT + CIWA-Ar", "Prioritise alcohol detox — highest medical risk"],
  ["Opioids", "COWS + DAST-10", "Buprenorphine protocol (CL-06)"],
  ["Benzodiazepines", "CIWA-Bz (if available)", "Diazepam conversion taper"],
  ["Cannabis", "CUDIT-R", "Symptomatic management"],
  ["Stimulants", "DAST-10", "Supportive; crash management"],
  ["Tobacco", "Fagerström Test", "NRT (nicotine replacement); varenicline if medically appropriate"],
];

const PRIORITY_ROWS = [
  ["1st (most urgent)", "Alcohol OR Benzodiazepines", "Life-threatening withdrawal (seizures, DTs); must be managed first"],
  ["2nd", "Opioids", "Extremely uncomfortable withdrawal; high relapse risk; buprenorphine induction"],
  ["3rd", "Stimulants", "Withdrawal not medically dangerous; manage after above are stabilised"],
  ["4th", "Cannabis", "Least severe withdrawal; concurrent management possible"],
  ["Throughout", "Tobacco", "NRT initiated at admission; does not complicate other detox"],
];

const REHAB_ROWS = [
  ["MET (Motivational Enhancement Therapy)", "Stages of change; explore ambivalence; develop discrepancy; strengthen commitment", "4 individual sessions in first 2 weeks"],
  ["CBT for SUD", "Trigger identification; high-risk situations; coping; craving management; refusal skills", "Weekly × 12 sessions"],
  ["Group therapy", "Relapse prevention; peer support; psychoeducation; social skills", "5 sessions/week during IPD"],
  ["12-Step facilitation", "NA / AA introduction; step work; peer support; spiritual dimension optional", "Group 3× per week"],
  ["Family therapy", "Enabling behaviour; communication; boundary setting; Al-Anon referral", "Weekly family session"],
  ["Vocational counselling", "Employment; legal; financial rehabilitation", "As indicated"],
];

const KPI_ROWS = [
  ["DAST-10 / AUDIT / CUDIT documented at admission", "100%", "Monthly"],
  ["Medical risk stratification documented before detox initiation", "100%", "Monthly"],
  ["Prioritisation protocol documented for poly-substance patients", "100%", "Monthly"],
  ["MET sessions completed within first 2 weeks", "≥ 90%", "Monthly"],
  ["Cannabis-induced psychosis identified and antipsychotic initiated within 4 hours", "100%", "Monthly"],
  ["Abstinence at 3-month follow-up (any substance)", "≥ 40%", "Quarterly"],
];

const Cl16CannabisPolysubstance = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-16"
        title="Cannabis & Poly-substance Use Disorder"
        icdLine="ICD-11: 6C40–6C4Z | DSM-5-TR: F12–F19 | De-Addiction Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To establish a standardised protocol for the assessment, medically managed withdrawal, and evidence-based rehabilitation of Cannabis Use Disorder and Poly-substance Use Disorder at JRCPL — aligned with WHO mhGAP, NDPS Act 1985, and MHCA 2017.
      </p>

      {/* 2. CANNABIS */}
      <ModuleHeader>2. Cannabis Use Disorder — Assessment &amp; Management</ModuleHeader>
      <SectionTitle>2.1 Cannabis Screening — CUDIT-R</SectionTitle>
      <Table
        cols={[{ label: "CUDIT-R Score", width: "18%", center: true }, { label: "Risk Level", width: "22%" }, { label: "Action" }]}
        rows={CUDIT_ROWS}
      />

      <SectionTitle>2.2 Cannabis Withdrawal Syndrome</SectionTitle>
      <Table
        cols={[
          { label: "Symptom", width: "18%" },
          { label: "Onset", width: "13%", center: true },
          { label: "Peak", width: "13%", center: true },
          { label: "Resolution", width: "13%", center: true },
          { label: "Management" },
        ]}
        rows={CANNABIS_WD_ROWS}
      />

      <SectionTitle>2.3 Cannabis-Induced Psychosis</SectionTitle>
      <Table
        cols={[{ label: "Feature", width: "28%" }, { label: "Management" }]}
        rows={CANNABIS_PSYCHOSIS_ROWS}
      />

      {/* 3. BENZODIAZEPINES */}
      <ModuleHeader>3. Benzodiazepine Dependence — Withdrawal Protocol</ModuleHeader>
      <SectionTitle>3.1 Risk Assessment</SectionTitle>
      <Table
        cols={[{ label: "High-Risk Feature", width: "35%" }, { label: "Action" }]}
        rows={BZD_RISK_ROWS}
      />

      <SectionTitle>3.2 Diazepam Equivalent Conversion &amp; Taper</SectionTitle>
      <Table
        cols={[{ label: "Benzodiazepine", width: "30%" }, { label: "Equivalent to Diazepam 10 mg", width: "30%", center: true }, { label: "Half-life" }]}
        rows={BZD_EQUIV_ROWS}
      />
      <BulletList items={[
        "Convert patient's current BZD to diazepam equivalent total daily dose",
        "Reduce diazepam by 10% of the original dose every 1–2 weeks",
        "Slower reduction if significant withdrawal symptoms at each step",
        "Never reduce faster than 25% per week; never abrupt cessation",
        "CIWA-Ar monitoring every 4 hours during acute taper phase",
      ]} />

      {/* 4. STIMULANTS */}
      <ModuleHeader>4. Stimulant Use Disorder (Cocaine / Amphetamines / Synthetic Cathinones)</ModuleHeader>
      <SectionTitle>4.1 Stimulant Withdrawal Management</SectionTitle>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        Stimulant withdrawal ('crash') is not medically dangerous but is psychologically severe — high relapse risk during crash phase.
      </p>
      <Table
        cols={[{ label: "Phase", width: "14%" }, { label: "Duration", width: "18%" }, { label: "Features", width: "28%" }, { label: "Management" }]}
        rows={STIMULANT_WD_ROWS}
      />

      <SectionTitle>4.2 Stimulant-Induced Psychosis</SectionTitle>
      <Table
        cols={[{ label: "Presentation", width: "28%" }, { label: "Management" }]}
        rows={STIMULANT_PSYCHOSIS_ROWS}
      />

      {/* 5. POLY-SUBSTANCE */}
      <ModuleHeader>5. Poly-substance Use Disorder</ModuleHeader>
      <SectionTitle>5.1 Assessment</SectionTitle>
      <Table
        cols={[{ label: "Substance", width: "18%" }, { label: "Tool", width: "24%" }, { label: "Action" }]}
        rows={POLY_ASSESS_ROWS}
      />

      <SectionTitle>5.2 Prioritisation When Multiple Substances Present</SectionTitle>
      <Table
        cols={[{ label: "Priority", width: "16%" }, { label: "Substance(s)", width: "26%" }, { label: "Rationale" }]}
        rows={PRIORITY_ROWS}
      />
      <WarningBox>Alcohol and benzodiazepine withdrawal must always be managed first — both can cause life-threatening seizures and delirium tremens. Never delay alcohol/BZD detox to address other substances.</WarningBox>

      {/* 6. REHABILITATION */}
      <ModuleHeader>6. Rehabilitation Programme</ModuleHeader>
      <Table
        cols={[{ label: "Component", width: "24%" }, { label: "Content", width: "52%" }, { label: "Frequency" }]}
        rows={REHAB_ROWS}
      />

      {/* 7. KPIs */}
      <ModuleHeader>7. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "16%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-16" docTitle="Cannabis & Poly-substance Use Disorder" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl16CannabisPolysubstance;
