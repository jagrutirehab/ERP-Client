import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-15"],
  ["Title", "Eating Disorders — Clinical Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All JRCPL Centres — IPD Medical-Psychiatric Interface"],
  ["Rating Scales", "EDE-Q; SCOFF; BMI; Malnutrition Risk; PHQ-9; C-SSRS"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NICE NG69; MARSIPAN Guidelines (Medical Risk)"],
  ["Replaces", "Newly developed standalone protocol"],
];

const DIAG_ROWS = [
  ["Anorexia Nervosa — Restricting", "6B80.0", "Low weight (BMI < 17.5); intense fear of gaining weight; distorted body image; restriction of intake", "High — electrolytes, cardiac, bone, renal"],
  ["Anorexia Nervosa — Binge-Purge", "6B80.1", "Low weight with episodes of binging and/or purging (vomiting, laxatives)", "Very High — electrolytes; cardiac arrhythmia"],
  ["Bulimia Nervosa", "6B81", "Recurrent binge eating + compensatory behaviours (purging, fasting, exercise); normal/near-normal weight", "Moderate — electrolytes; dental; oesophageal"],
  ["Binge Eating Disorder", "6B82", "Recurrent binges without compensatory behaviours; marked distress", "Lower — metabolic; obesity-related"],
  ["ARFID", "6B83", "Food avoidance not driven by body image; sensory sensitivity, fear of choking, lack of interest", "Moderate — malnutrition; growth faltering"],
];

const MARSIPAN_ROWS = [
  ["BMI", "< 14 kg/m²", "Urgent inpatient admission; medical stabilisation before psychiatric focus"],
  ["Heart rate", "< 40 bpm OR > 120 bpm", "Cardiac monitoring; physician review; consider cardiac unit transfer"],
  ["Blood pressure", "Systolic < 80 mmHg OR orthostatic drop > 20 mmHg", "IV fluids; supine rest; cardiac monitoring"],
  ["Potassium (K⁺)", "< 3.0 mEq/L", "Oral or IV replacement; ECG; cardiac monitoring"],
  ["Phosphate", "< 0.5 mmol/L", "High refeeding syndrome risk — phosphate IV supplement before calories increased"],
  ["Sodium (Na⁺)", "< 130 mEq/L", "Physician review; careful fluid management"],
  ["QTc on ECG", "≥ 450 ms", "Cardiac review; correct electrolytes; avoid QTc-prolonging medications"],
  ["Muscle power", "Unable to rise from squat unaided", "Severe muscle wasting; physiotherapy; cautious refeeding"],
  ["Core temperature", "< 35°C", "Hypothermia — warming; medical emergency"],
];

const REFEED_ROWS = [
  ["≥ 15", "1000–1200 kcal/day", "Increase by 200 kcal every 2–3 days", "Daily × first week"],
  ["14–14.9", "800–1000 kcal/day", "Increase by 100–200 kcal every 2–3 days", "Daily × first 2 weeks"],
  ["< 14", "500–800 kcal/day", "Increase by 100 kcal every 2–3 days MAXIMUM", "Daily — correct before increasing calories"],
];

const NUTRI_ROWS = [
  ["Medical stabilisation", "500–1200 kcal (BMI-dependent)", "Not the immediate goal — electrolyte correction first", "Daily electrolytes, ECG, vitals; dietitian daily review"],
  ["Controlled refeeding", "Increase to 1500–2000 kcal", "0.5 kg/week (IPD target)", "Electrolytes 3× weekly; weight 3× weekly; no patient access to scales"],
  ["Full nutritional rehabilitation", "2000–3000 kcal (normalisation)", "0.5–1 kg/week", "Weekly electrolytes; weight 2× weekly; meal support"],
  ["Target weight", "Based on IBW calculation and menstrual/hormonal restoration", "Patient-specific collaborative weight range", "Monthly BMI; DEXA scan if osteoporosis risk"],
];

const PSYCH_ROWS = [
  ["Cognitive Behavioural Therapy — Enhanced (CBT-E)", "Bulimia Nervosa; BED; AN (weight restored)", "Grade A", "20 sessions individual; structured protocol"],
  ["MANTRA (Maudsley Anorexia Nervosa Treatment for Adults)", "Anorexia Nervosa", "Grade A", "20 individual sessions; disorder-specific for AN"],
  ["Family-Based Treatment (FBT / Maudsley Method)", "Adolescent AN (< 18 years)", "Grade A (adolescents)", "3-phase family treatment; parents take charge of eating in Phase 1"],
  ["Dialectical Behaviour Therapy (DBT)", "BN with impulsivity; BPD comorbid", "Grade B", "Standard DBT; emotion regulation focus"],
  ["Motivational Enhancement Therapy", "AN with poor motivation (common)", "Grade B", "4 sessions; explore ambivalence; build motivation to change"],
];

const PHARMA_ROWS = [
  ["Fluoxetine", "Bulimia Nervosa", "60 mg OD", "Grade A (FDA approved for BN)", "Higher dose than depression; reduces binge-purge frequency"],
  ["Topiramate", "BN; BED", "25 mg OD → 100–200 mg/day", "Grade B", "Reduces binge frequency; weight-neutral; cognitive side effects"],
  ["Lisdexamfetamine", "BED", "30 mg OD → 50–70 mg OD", "Grade A (FDA approved for BED)", "Reduces binge frequency; stimulant — monitor BP, pulse; NDPS rules"],
  ["SSRIs", "Comorbid depression in all ED", "Standard SSRI dosing", "Grade B", "Adjunct; not primary treatment for AN — weight restoration is primary"],
  ["Olanzapine", "Anorexia Nervosa", "2.5–10 mg nocte", "Grade B", "Reduces anxiety around eating; weight gain side effect is therapeutic; ECG monitoring"],
];

const DISCHARGE_ROWS = [
  ["Medical stability", "Electrolytes normal; cardiac monitoring discontinued; BMI ≥ 14 (minimum safe discharge)"],
  ["Weight", "Consistent 0.5 kg/week gain for ≥ 2 weeks; or BMI target agreed with patient"],
  ["Eating", "Able to eat all meal plan items without acute distress; no purging for ≥ 1 week (BN)"],
  ["Psychological", "EDE-Q reduction; engaged in therapy; understanding of ED thoughts"],
  ["Family", "Family trained in meal support; no accommodation of restriction"],
  ["Medical follow-up", "Gastroenterology/endocrinology if indicated; monthly weight; dietitian OPD"],
];

const KPI_ROWS = [
  ["Medical risk assessment (MARSIPAN criteria) within 4 hours of admission", "100%", "Monthly"],
  ["Electrolytes checked daily during refeeding first 2 weeks", "100%", "Monthly"],
  ["C-SSRS at every contact (eating disorders carry high SI risk)", "100%", "Monthly"],
  ["Dietitian assessment within 24 hours", "100%", "Monthly"],
  ["Weight gain ≥ 0.5 kg/week in IPD", "≥ 80% of patients", "Monthly"],
  ["Refeeding syndrome — zero preventable cases", "0", "Monthly"],
];

const Cl15EatingDisorders = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-15"
        title="Eating Disorders"
        icdLine="ICD-11: 6B80–6B82 | DSM-5-TR: F50 | Psychiatric & Medical Interface Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        Eating disorders carry the highest mortality of all psychiatric conditions. This protocol establishes a structured, medically safe, and compassionate framework for the assessment, nutritional rehabilitation, psychological treatment, and medical monitoring of Anorexia Nervosa, Bulimia Nervosa, and Binge Eating Disorder at JRCPL.
      </p>

      {/* 2. DIAGNOSTIC CLASSIFICATION */}
      <ModuleHeader>2. Diagnostic Classification</ModuleHeader>
      <Table
        cols={[
          { label: "Disorder", width: "22%" },
          { label: "ICD-11", width: "10%", center: true },
          { label: "Core Features", width: "44%" },
          { label: "Medical Risk" },
        ]}
        rows={DIAG_ROWS}
      />

      {/* 3. MARSIPAN */}
      <ModuleHeader>3. Medical Risk Assessment — MARSIPAN</ModuleHeader>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>
        Medical risk stratification is MANDATORY before initiating treatment. Eating disorders require physician or internist involvement from Day 1.
      </p>
      <Table
        cols={[{ label: "Parameter", width: "18%" }, { label: "High Risk Threshold", width: "30%" }, { label: "Action" }]}
        rows={MARSIPAN_ROWS}
      />

      {/* 4. REFEEDING */}
      <ModuleHeader>4. Refeeding Protocol</ModuleHeader>
      <WarningBox>Refeeding Syndrome (RFS): Life-threatening electrolyte shifts (hypophosphataemia, hypomagnesaemia, hypokalaemia) upon nutritional rehabilitation in severely malnourished patients. JRCPL follows NICE refeeding guidelines.</WarningBox>
      <Table
        cols={[
          { label: "BMI", width: "12%", center: true },
          { label: "Starting Calories", width: "22%" },
          { label: "Increase Rate", width: "30%" },
          { label: "Phosphate Monitoring" },
        ]}
        rows={REFEED_ROWS}
      />
      <SectionTitle>Mandatory Supplements During Refeeding</SectionTitle>
      <BulletList items={[
        "Pabrinex / Thiamine 100 mg BD orally — before starting ANY calories; continue for 10 days",
        "Oral phosphate supplement: Phosphate-Sandoz or equivalent — if phosphate < 0.6 mmol/L; IV if < 0.3 mmol/L",
        "Potassium and magnesium correction before increasing caloric intake",
        "Multivitamin daily throughout refeeding and nutritional rehabilitation",
      ]} />

      {/* 5. NUTRITIONAL REHABILITATION */}
      <ModuleHeader>5. Nutritional Rehabilitation</ModuleHeader>
      <Table
        cols={[
          { label: "Phase", width: "20%" },
          { label: "Calories", width: "22%" },
          { label: "Weight Gain Target", width: "24%" },
          { label: "Monitoring" },
        ]}
        rows={NUTRI_ROWS}
      />

      {/* 6. PSYCHOLOGICAL TREATMENT */}
      <ModuleHeader>6. Psychological Treatment</ModuleHeader>
      <Table
        cols={[
          { label: "Therapy", width: "28%" },
          { label: "Disorder", width: "24%" },
          { label: "Evidence", width: "14%", center: true },
          { label: "Format" },
        ]}
        rows={PSYCH_ROWS}
      />

      {/* 7. PHARMACOTHERAPY */}
      <ModuleHeader>7. Pharmacotherapy</ModuleHeader>
      <Table
        cols={[
          { label: "Drug", width: "16%" },
          { label: "Disorder", width: "18%" },
          { label: "Dose", width: "18%" },
          { label: "Evidence", width: "16%" },
          { label: "Notes" },
        ]}
        rows={PHARMA_ROWS}
      />
      <WarningBox>AVOID Bupropion in bulimia nervosa — significantly lowers seizure threshold; contraindicated. AVOID Metformin as primary treatment for AN.</WarningBox>

      {/* 8. DISCHARGE & KPIs */}
      <ModuleHeader>8. Discharge Criteria &amp; KPIs</ModuleHeader>
      <Table
        cols={[{ label: "Criterion", width: "20%" }, { label: "Standard" }]}
        rows={DISCHARGE_ROWS}
      />
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "18%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-15" docTitle="Eating Disorders" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl15EatingDisorders;
