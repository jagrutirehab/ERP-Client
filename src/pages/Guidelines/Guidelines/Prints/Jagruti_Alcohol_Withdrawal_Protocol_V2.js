import React, { forwardRef, Fragment } from "react";
import {
  SectionHeader, SubTitle, BulletList, NumberedList,
  DataTable, ControlTable, WarningBox, AlertBox, CalloutBox,
  NAVY, GOLD, AMBER, RED,
} from "./SEComponents";


const JagrutiiAlcoholWithdrawalProtocolV2 = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      {/* ── HEADER ── */}
      <div className={`${props.heading} mb-4`}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1.3rem", letterSpacing: "0.04em" }}>
            JAGRUTI REHABILITATION CENTRE
          </div>
          <div style={{ color: AMBER, fontStyle: "italic", fontSize: "0.95rem", marginTop: "2px" }}>
            De-Addiction &amp; Psychiatric Care Unit
          </div>
          <div style={{ color: "#777", fontSize: "0.8rem", marginTop: "2px" }}>
            29/2B/1 Zagade Wasti, Manjari Farm, Hadapsar, Pune 412307
          </div>
          <div style={{ background: NAVY, color: "#fff", fontWeight: "bold", fontSize: "1.05rem", padding: "8px 14px", marginTop: "10px", letterSpacing: "0.03em" }}>
            ALCOHOL WITHDRAWAL MANAGEMENT PROTOCOL — VERSION 2.0
          </div>
        </div>
      </div>

      <ControlTable rows={[
        ["Protocol No.", "JRC/DA/AWP/002"],
        ["Effective Date", "April 2026"],
        ["Reviewed By", "Dr. Amar – Clinical Director"],
        ["Next Review", "April 2027"],
        ["Applicable Units", "De-Addiction / IPD / ICU Step-Down"],
      ]} />

      <AlertBox title="⚠ SCOPE &amp; APPLICABILITY">
        <BulletList items={[
          "This protocol governs inpatient alcohol withdrawal management for all admitted patients at Jagruti Rehabilitation Centre.",
          "It incorporates standard adult dosing, ELDERLY adjustments (age ≥ 60 years), and LAB-DEVIATION ADJUSTMENTS (parameters > 3× ULN).",
          "All dose modifications must be documented in the clinical notes with the rationale clearly stated.",
          "The treating psychiatrist retains final clinical authority over dose adjustments beyond the ranges specified herein.",
        ]} />
      </AlertBox>

      {/* ── SECTION I ── */}
      <SectionHeader>SECTION I: ADMISSION ASSESSMENT</SectionHeader>

      <SubTitle>A. Intoxicated State on Arrival</SubTitle>
      <BulletList items={[
        "Assess orientation: Time / Place / Person",
        "Record vitals: Temperature, Pulse, Respiration, BP, Blood Sugar Level",
        "Examine for signs of head injury (scalp lacerations, GCS, pupils)",
        "Inj. SERENACE (Haloperidol) 1 amp IM — SOS for acute agitation",
      ]} />

      <SubTitle>B. Withdrawal State on Arrival (or from Day 2)</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Proceed immediately to fixed-dose withdrawal protocol outlined in Section II.</p>

      <AlertBox title="MANDATORY BASELINE INVESTIGATIONS (all admissions)">
        <p style={{ margin: "0 0 0.5rem" }}>CBC | LFT (AST, ALT, ALP, Bilirubin, Albumin) | RFT (Creatinine, BUN, eGFR) | Serum Electrolytes (Na⁺, K⁺, Mg²⁺)</p>
        <p style={{ margin: "0 0 0.5rem" }}>RBS / HbA1c | Serum Ammonia | Coagulation (PT/INR) | ECG | Chest X-Ray | Urine Routine</p>
        <BulletList items={[
          "⚡ Flag any value > 3× Upper Limit of Normal (ULN) immediately to the treating physician.",
          "Results must be reviewed before initiating or continuing benzodiazepine therapy.",
        ]} />
      </AlertBox>

      {/* ── SECTION II ── */}
      <SectionHeader>SECTION II: WITHDRAWAL MANAGEMENT — DAYS 0–10 (Standard Adult)</SectionHeader>

      <SubTitle>1. Fixed Dose Protocol — Chlordiazepoxide (CDZ)</SubTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Unit = 1 tablet of Chlordiazepoxide 10 mg</p>

      <DataTable
        cols={[
          { label: "Day", width: "8%" },
          { label: "Morning" },
          { label: "Evening" },
          { label: "Night" },
          { label: "Daily Total (tabs)" },
        ]}
        rows={[
          ["1", "4", "4", "6", "14"],
          ["2", "3", "4", "6", "13"],
          ["3", "3", "3", "5", "11"],
          ["4", "2", "3", "5", "10"],
          ["5", "2", "2", "4", "8"],
          ["6", "1", "2", "4", "7"],
          ["7", "1", "1", "3", "5"],
          ["8", "0", "1", "3", "4"],
          ["9", "0", "0", "2", "2"],
          ["10", "0", "0", "2", "2"],
        ]}
      />

      <AlertBox>
        <p style={{ margin: 0 }}>SOS dose: CDZ 10 mg (1 tab) PO every 6 hours PRN if CIWA-Ar &gt; 10. Maximum SOS = 4 tabs/day. Re-assess hourly after SOS dose.</p>
      </AlertBox>

      <SubTitle>2. Antiepileptic Medicines</SubTitle>
      <DataTable
        cols={[
          { label: "Option" },
          { label: "Drug" },
          { label: "Duration" },
          { label: "Dosing" },
        ]}
        rows={[
          ["A", "Tab. Levetiracetam 500 mg", "Days 1–5", "1–0–1 → then 250 mg BD × 5 days → STOP"],
          ["B", "Tab. Carbamazepine 200 mg", "Days 1–10", "0–0–1 → STOP"],
        ]}
      />

      <SubTitle>3. General Medicines</SubTitle>
      <DataTable
        cols={[
          { label: "#" },
          { label: "Drug" },
          { label: "Duration" },
          { label: "Dose / Route" },
        ]}
        rows={[
          ["A", "Thiamine / Safepeg IV", "Day 1 only (IV), then 15 days oral", "Inj. Thiamine 100 mg in 500 mL DNS slow IV 1-0-1 OR Inj. Safepeg (A+B) in 500 mL DNS STAT 1-0-0. Then: Tab. Safepeg 300 mg 1-0-0 or Tab. Thiamine 100 mg 1-0-1"],
          ["B", "B-Plex / Levogen", "30 days", "1–0–0"],
          ["C", "Antacids (Tab/IV PAN 40 + Emset)", "As required", "PRN — for nausea/vomiting/GI symptoms"],
          ["D", "Tab. Amlodipine 5 mg", "SOS (if BP > 140/90 mmHg)", "STAT then review — escalate if persistent"],
        ]}
      />

      <SubTitle>4. Liver Dysfunction Management</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Tab. Udiliv 300 mg — 1–0–1 (throughout admission as indicated)</p>

      <SubTitle>5. Hepatic Encephalopathy Management</SubTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Trigger: Persistent delirium AND Serum Ammonia elevated</p>
      <DataTable
        cols={[
          { label: "Drug" },
          { label: "Dose" },
          { label: "Frequency" },
        ]}
        rows={[
          ["Tab. Udiliv 300 mg", "300 mg", "1–0–1"],
          ["Tab. Rifagut 550 mg", "550 mg", "1–0–1"],
          ["Tab/Sachet Lornit 500 mg", "500 mg", "1–0–1"],
          ["Syp. Duphalac 30 mL", "30 mL", "1–0–1 (or enema if no stools)"],
        ]}
      />

      <SubTitle>6. Portal Hypertension Management</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Tab. Aldactone 25 mg — 1–0–1</p>
      <p style={{ margin: "0 0 0.5rem" }}>Tab. Inderal 10 mg — 1–0–1</p>

      {/* ── SECTION III ── */}
      <SectionHeader>SECTION III: POST-WITHDRAWAL MAINTENANCE — DAYS 10–45</SectionHeader>

      <DataTable
        cols={[
          { label: "Drug" },
          { label: "Dose" },
          { label: "Frequency / Remarks" },
        ]}
        rows={[
          ["Tab. Acamprosate 333 mg", "> 65 kg: 333×2 / < 65 kg: 333×1", "2-2-2 (>65 kg) or 1-1-2 (<65 kg)"],
          ["Tab. Topiramate 50 mg", "50 mg", "1–0–1"],
          ["Tab. Lopez/Ativan 2 mg", "2 mg", "0–0–1 (short-term; taper early)"],
          ["Tab. Baclofen 20 mg", "20 mg", "1–0–1"],
          ["Tab. B-Plex", "Standard", "1–0–1"],
        ]}
      />

      {/* ── SECTION IV ── */}
      <SectionHeader>SECTION IV: DISCHARGE PRESCRIPTION</SectionHeader>

      <DataTable
        cols={[
          { label: "Drug" },
          { label: "Dose" },
          { label: "Frequency" },
        ]}
        rows={[
          ["Tab. Lopez/Ativan 2 mg", "2 mg", "0–0–1"],
          ["Tab. Benfica Forte", "Standard", "1–0–0"],
          ["Tab. Baclofen 20 mg OR Naltima 50 mg OR Disulfiram 250 mg (after consent)", "As chosen", "1–0–0"],
          ["Tab. Acamprosate 333 mg", "> 65 kg / < 65 kg", "2-2-2 (>65 kg) or 1-1-2 (<65 kg)"],
          ["Tab. Topiramate 50 mg", "50 mg", "1–0–1"],
          ["Other medications as per clinical need", "—", "As directed"],
        ]}
      />

      <AlertBox>
        <p style={{ margin: 0 }}>Disulfiram: Obtain written informed consent. Ensure sobriety for ≥ 48 hours before initiation. Contraindicated in severe hepatic disease, cardiac disease, psychosis.</p>
      </AlertBox>

      {/* ── SECTION V ── */}
      <SectionHeader>SECTION V: DOSE ADJUSTMENTS — ELDERLY PATIENTS (Age ≥ 60 Years)</SectionHeader>

      <WarningBox title="RATIONALE FOR ELDERLY DOSE REDUCTION">
        <BulletList items={[
          "Pharmacokinetic changes: Reduced hepatic CYP450 activity → slower benzodiazepine metabolism → prolonged half-life & drug accumulation.",
          "Pharmacodynamic sensitivity: Increased GABA-receptor sensitivity → exaggerated CNS depression, confusion, and paradoxical excitation.",
          "Comorbidity burden: Higher prevalence of hepatic, renal, and cardiac disease in this cohort.",
          "Fall risk: Sedation and ataxia markedly increase fall and fracture risk; mandatory fall-prevention protocol.",
          "Cognitive vulnerability: Pre-existing cognitive reserve reduction increases delirium risk; avoid over-sedation.",
        ]} />
      </WarningBox>

      <SubTitle>A. Chlordiazepoxide — Elderly Fixed-Dose Table</SubTitle>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Reduce ALL doses by 50% from standard adult protocol. Prefer Lorazepam (Ativan) if severe hepatic impairment.</p>

      <DataTable
        cols={[
          { label: "Day", width: "8%" },
          { label: "Morning" },
          { label: "Evening" },
          { label: "Night" },
          { label: "Daily Total (tabs)" },
        ]}
        rows={[
          ["1", "2", "2", "3", "7"],
          ["2", "2", "2", "3", "7"],
          ["3", "1", "2", "3", "6"],
          ["4", "1", "1", "2", "4"],
          ["5", "1", "1", "2", "4"],
          ["6", "1", "1", "2", "4"],
          ["7", "0", "1", "1", "2"],
          ["8", "0", "0", "1", "1"],
          ["9", "0", "0", "1", "1"],
          ["10", "0", "0", "0", "0 (Monitor 48h post-taper)"],
        ]}
      />

      <AlertBox>
        <p style={{ margin: 0 }}>SOS dose for elderly: CDZ 10 mg (1 tab) PO every 8 hours PRN if CIWA-Ar &gt; 10. MAXIMUM 2 SOS tabs/day. Reassess every 2 hours after SOS. Consider Lorazepam 0.5 mg IM as alternative SOS.</p>
      </AlertBox>

      <AlertBox title="CONSIDER LORAZEPAM SUBSTITUTION (Elderly with Hepatic Impairment)">
        <BulletList items={[
          "Lorazepam (Ativan) is preferred over Chlordiazepoxide in elderly patients with hepatic dysfunction as it undergoes direct glucuronidation (not CYP oxidation) and has no active metabolites.",
          "Conversion: CDZ 25 mg ≈ Lorazepam 1 mg. Lorazepam starting dose: 0.5–1 mg every 6 hours, titrate by CIWA-Ar score.",
          "Taper over 5–7 days. Monitor respiratory rate and sedation score (Ramsay) with every dose.",
        ]} />
      </AlertBox>

      <SubTitle>B. Antiepileptics — Elderly Adjustments</SubTitle>
      <DataTable
        cols={[
          { label: "Drug" },
          { label: "Standard Dose" },
          { label: "Elderly Dose (≥ 60 yr)" },
          { label: "Notes" },
        ]}
        rows={[
          ["Levetiracetam", "500 mg BD × 5d → 250 mg BD × 5d", "250 mg BD × 5d → 250 mg OD × 5d → STOP", "Reduce if eGFR < 60; avoid if eGFR < 30"],
          ["Carbamazepine", "200 mg ON × 10d", "100 mg ON × 10d (HALF dose)", "HIGH fall risk; monitor ECG & Na⁺; avoid if hyponatraemia"],
        ]}
      />

      <SubTitle>C. General Medicines — Elderly Specific</SubTitle>
      <BulletList items={[
        "Thiamine: SAME dose — critical neuroprotection; no reduction needed.",
        "Antihypertensives: Amlodipine 2.5 mg (HALF adult dose) for BP > 150/95 in elderly; re-assess within 30 min.",
        "Antacids: Pantoprazole 20 mg OD (reduce to OD from BD) — renal/hepatic caution.",
        "Baclofen: Start 10 mg OD (not BD); increase cautiously; HIGH fall risk.",
        "Acamprosate: No change if eGFR > 30; reduce to 333 mg BD if eGFR 30–60; AVOID if eGFR < 30.",
        "Topiramate: Start 25 mg OD; increase to 25 mg BD after 1 week if tolerated.",
        <>Disulfiram: <span style={{ color: RED, fontWeight: "bold" }}>AVOID in patients aged ≥ 60 with cardiac disease, neuropathy, or cognitive impairment.</span></>,
      ]} />

      <SubTitle>D. Mandatory Monitoring — Elderly</SubTitle>
      <DataTable
        cols={[
          { label: "Parameter" },
          { label: "Frequency" },
          { label: "Action Threshold" },
        ]}
        rows={[
          ["Vitals (BP, HR, RR, SpO2, Temp)", "Every 4 hours (Days 1–5)", "SBP < 90 or > 160: alert physician"],
          ["CIWA-Ar Score", "Every 6 hours (Days 1–7)", "Score > 10: SOS dose; > 15: senior review"],
          ["Sedation (Ramsay Scale)", "Every 4 hours", "Score ≥ 4: withhold next dose; review"],
          ["Serum Electrolytes (Na⁺, K⁺, Mg²⁺)", "Day 1, 3, 7", "Na⁺ < 130: hold Carbamazepine; treat hyponatraemia"],
          ["Fall Risk Assessment (Morse Scale)", "On admission, Day 3, Day 7", "High risk: bed rails, non-slip footwear, carer alert"],
          ["LFT / RFT", "Day 1 baseline + Day 5", "See Section VI if > 3× ULN"],
        ]}
      />

      {/* ── SECTION VI ── */}
      <SectionHeader>SECTION VI: DOSE ADJUSTMENTS — LAB DEVIATIONS &gt; 3× ULN</SectionHeader>

      <AlertBox title="REFERENCE — UPPER LIMIT OF NORMAL VALUES">
        <p style={{ margin: "0 0 0.5rem" }}>AST (SGOT): 40 IU/L | ALT (SGPT): 40 IU/L | ALP: 120 IU/L | Total Bilirubin: 1.2 mg/dL</p>
        <p style={{ margin: "0 0 0.5rem" }}>Serum Creatinine: 1.2 mg/dL | BUN: 20 mg/dL | Serum Ammonia: 35 µmol/L</p>
        <p style={{ margin: "0 0 0.5rem" }}>3× ULN means: AST/ALT &gt; 120 IU/L | Bilirubin &gt; 3.6 mg/dL | Creatinine &gt; 3.6 mg/dL | Ammonia &gt; 105 µmol/L</p>
        <p style={{ margin: 0 }}>ACTION: Any single lab value &gt; 3× ULN must be flagged and documented. Trigger immediate protocol adjustment below.</p>
      </AlertBox>

      <SubTitle>A. Liver Function — AST/ALT &gt; 3× ULN (&gt; 120 IU/L)</SubTitle>
      <DataTable
        cols={[
          { label: "Severity" },
          { label: "AST / ALT Range" },
          { label: "CDZ Dose Adjustment" },
          { label: "Additional Actions" },
        ]}
        rows={[
          ["Mild", "3–5× ULN (120–200 IU/L)", "Reduce by 25%", "Increase LFT monitoring to every 48 h; add Udiliv 300 mg BD"],
          ["Moderate", "5–10× ULN (200–400 IU/L)", "Reduce by 50% OR Switch to Lorazepam", "AVOID Carbamazepine. Lorazepam 0.5–1 mg every 6 h preferred. GI consult. Daily LFT."],
          ["Severe", "> 10× ULN (> 400 IU/L)", "STOP CDZ — Use Lorazepam ONLY", "Senior Physician / Hepatologist STAT. ICU review. Full hepatic protocol. Hold Carbamazepine & Topiramate."],
        ]}
      />

      <AlertBox>
        <p style={{ margin: 0 }}>Lorazepam is the benzodiazepine of choice in hepatic impairment — direct glucuronidation, no active metabolites, consistent kinetics. Conversion: CDZ 25 mg ≈ Lorazepam 1 mg.</p>
      </AlertBox>

      <SubTitle>B. Serum Bilirubin &gt; 3× ULN (&gt; 3.6 mg/dL)</SubTitle>
      <BulletList items={[
        "DISCONTINUE Chlordiazepoxide. Switch to Lorazepam 0.5–1 mg every 6–8 hours.",
        "HOLD Carbamazepine (hepatotoxic; increases bilirubin further).",
        "Initiate full Hepatic Encephalopathy Protocol (Rifagut + Lornit + Duphalac).",
        "Hepatology / Gastroenterology consultation mandatory within 24 hours.",
        "Monitor Coagulation (PT/INR) — hold Disulfiram if INR > 1.5.",
      ]} />

      <SubTitle>C. Renal Function — Creatinine &gt; 3× ULN (&gt; 3.6 mg/dL) / eGFR &lt; 30</SubTitle>
      <DataTable
        cols={[
          { label: "Drug" },
          { label: "eGFR Threshold" },
          { label: "Adjustment" },
        ]}
        rows={[
          ["Levetiracetam", "eGFR 30–60", "Reduce dose by 50%: 250 mg OD × 5d → 125 mg OD × 5d → STOP"],
          ["Levetiracetam", "eGFR < 30", "AVOID. Use Carbamazepine 100 mg ON as alternative (with LFT monitoring)"],
          ["Acamprosate", "eGFR 30–60", "333 mg BD (reduce from standard TDS)"],
          ["Acamprosate", "eGFR < 30", "CONTRAINDICATED — discontinue"],
          ["Chlordiazepoxide", "Any CKD", "No dose change required (hepatically metabolized). Monitor CNS effects."],
          ["Naltima (Naltrexone)", "eGFR < 30", "USE WITH CAUTION — reduce to 25 mg OD. Avoid if severe renal failure."],
        ]}
      />

      <SubTitle>D. Serum Ammonia &gt; 3× ULN (&gt; 105 µmol/L)</SubTitle>
      <BulletList items={[
        "IMMEDIATELY activate Hepatic Encephalopathy Management Protocol (Section II, Point 5).",
        "Limit dietary protein temporarily (0.5–1 g/kg/day) — involve dietitian.",
        "Ensure bowel movement: Duphalac 30 mL BD–TDS or lactulose enema.",
        "Add Rifagut 550 mg BD + Lornit 500 mg BD if not already prescribed.",
        "Avoid ALL sedating medications (CDZ, BZDs) until ammonia normalizes and encephalopathy grade is assessed.",
        "Reassess ammonia at 24 h, 48 h, and 72 h. If no improvement or grade ≥ 2 encephalopathy: transfer to ICU.",
      ]} />

      <SubTitle>E. Electrolyte Deviations &gt; 3× ULN</SubTitle>
      <DataTable
        cols={[
          { label: "Electrolyte" },
          { label: "Deviation" },
          { label: "Protocol Modification" },
        ]}
        rows={[
          ["Sodium (Na⁺)", "< 120 mEq/L (critical)", "HOLD Carbamazepine (SIADH risk). Correct hyponatraemia before/concurrent with CDZ taper. Neurology consult."],
          ["Potassium (K⁺)", "< 2.5 mEq/L", "IV K⁺ replacement before antiepileptic loading. Hold Inderal (Propranolol) if K⁺ < 3.0."],
          ["Magnesium (Mg²⁺)", "< 0.5 mmol/L", "IV MgSO4 replacement. Low Mg²⁺ lowers seizure threshold — escalate antiepileptic cover."],
        ]}
      />

      {/* ── SECTION VII ── */}
      <SectionHeader>SECTION VII: QUICK REFERENCE MATRIX — COMBINED ADJUSTMENTS</SectionHeader>

      <DataTable
        cols={[
          { label: "Clinical Scenario" },
          { label: "CDZ Action" },
          { label: "Antiepileptic Action" },
          { label: "Priority" },
        ]}
        rows={[
          ["Standard Adult (< 60 yr, normal labs)", "Full standard table", "Standard dose", "Routine"],
          ["Age ≥ 60 yr, normal labs", "50% reduction table", "Levetiracetam 250 mg BD | Carbamazepine 100 mg ON", "High"],
          ["Age < 60, LFT 3–5× ULN", "Reduce by 25%", "Avoid CBZ; continue LEV", "Urgent"],
          ["Age < 60, LFT 5–10× ULN", "Reduce 50% OR switch to Lorazepam", "STOP CBZ; reduce LEV", "Urgent"],
          ["Age < 60, LFT > 10× ULN", "STOP CDZ → Lorazepam only", "STOP CBZ & LEV; ICU review", "EMERGENCY"],
          ["Age ≥ 60, LFT > 3× ULN", "STOP CDZ → Lorazepam (low dose)", "STOP CBZ; LEV 125 mg OD", "EMERGENCY"],
          ["Any age, Creatinine > 3× ULN", "No change (hepatic metabolism)", "STOP LEV; CBZ 100 mg ON", "High"],
          ["Any age, Ammonia > 3× ULN", "HOLD all BZDs until grade assessed", "HOLD sedating agents", "EMERGENCY"],
        ]}
      />

      {/* ── SECTION VIII ── */}
      <SectionHeader>SECTION VIII: TRANSFER CRITERIA — WHEN TO REFER TO HIGHER CENTRE</SectionHeader>

      <AlertBox title="INSTITUTIONAL CONTEXT — JAGRUTI REHABILITATION CENTRE">
        <BulletList items={[
          "Jagruti Rehabilitation Centre does not have a Critical Care / ICU setup.",
          "This facility is equipped for psychiatric de-addiction care, step-down monitoring, and managed medical withdrawal.",
          "When clinical complexity exceeds our safe management capacity, IMMEDIATE transfer to a tertiary hospital with ICU/HDU capability is MANDATORY.",
          "Do NOT delay transfer in an attempt to manage at facility level. Patient safety is the absolute priority.",
          "Preferred transfer destinations: Ruby Hall Clinic | KEM Hospital | Sassoon General Hospital | Jehangir Hospital, Pune.",
        ]} />
      </AlertBox>

      <CalloutBox title="CORE TRANSFER RULE">
        <p style={{ margin: 0 }}>Transfer IMMEDIATELY if TWO or more organ systems are involved — OR — if ANY single criterion below is met.</p>
      </CalloutBox>

      <SubTitle>A. Renal System — TRANSFER if ANY of the following:</SubTitle>
      <DataTable
        cols={[
          { label: "#" },
          { label: "Parameter" },
          { label: "Transfer Threshold" },
          { label: "Rationale" },
        ]}
        rows={[
          ["1", "Serum Creatinine", "> 3x ULN (> 3.6 mg/dL)", "Acute kidney injury; CDZ/LEV dose adjustment insufficient; dialysis risk"],
          ["2", "eGFR", "< 30 mL/min/1.73m²", "Severe CKD/AKI — drug accumulation risk; requires nephrology input"],
          ["3", "Urine Output", "< 0.5 mL/kg/hr for > 6 hours", "AKI/pre-renal failure; IV fluid management beyond facility capacity"],
          ["4", "BUN", "> 3x ULN (> 60 mg/dL)", "Uraemia — altered sensorium risk; complex fluid management needed"],
        ]}
      />

      <SubTitle>B. Electrolyte Disturbances — TRANSFER if ANY of the following:</SubTitle>
      <DataTable
        cols={[
          { label: "#" },
          { label: "Electrolyte" },
          { label: "Transfer Threshold" },
          { label: "Rationale" },
        ]}
        rows={[
          ["1", "Serum Sodium (Na+)", "< 120 mEq/L OR > 155 mEq/L", "Severe hypo/hypernatraemia — seizure risk, cerebral oedema; IV correction requires ICU monitoring"],
          ["2", "Serum Potassium (K+)", "< 2.5 mEq/L OR > 6.0 mEq/L", "Cardiac arrhythmia risk — requires ECG monitoring and IV K+ correction under cardiac monitoring"],
          ["3", "Serum Magnesium (Mg2+)", "< 0.4 mmol/L", "Severe hypomagnesaemia — refractory seizures; IV MgSO4 infusion with cardiac monitoring needed"],
          ["4", "Serum Phosphate", "< 0.5 mmol/L (severe)", "Refeeding syndrome risk — encephalopathy, cardiac failure; ICU management required"],
          ["5", "Any 2 electrolytes simultaneously abnormal", "Any combination of above", "Multi-electrolyte disturbance — IV correction monitoring beyond facility scope"],
        ]}
      />

      <SubTitle>C. Respiratory / Chest Infection — TRANSFER if ANY of the following:</SubTitle>
      <DataTable
        cols={[
          { label: "#" },
          { label: "Sign / Parameter" },
          { label: "Transfer Threshold" },
          { label: "Rationale" },
        ]}
        rows={[
          ["1", "SpO2 (oxygen saturation)", "< 92% on room air", "Hypoxaemia — oxygen therapy and potential ventilatory support beyond facility capacity"],
          ["2", "Respiratory Rate", "> 25 breaths/min at rest", "Respiratory distress — aspiration pneumonia or acute pneumonia with sepsis risk"],
          ["3", "Fever + productive cough + crackles", "Temp > 38.5°C + respiratory signs", "Aspiration/community-acquired pneumonia — IV antibiotics + culture needed"],
          ["4", "Altered sensorium + respiratory signs", "GCS drop + RR > 20 + SpO2 < 95%", "Aspiration risk during withdrawal seizure or delirium; airway protection required"],
          ["5", "Known COPD / Asthma exacerbation", "Any acute decompensation", "Respiratory management beyond facility scope; transfer even if mild decompensation"],
        ]}
      />

      <SubTitle>D. Two or More Organ Systems — IMMEDIATE TRANSFER</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Even if each system individually appears manageable, TWO or more systems crosses the safe threshold for Jagruti.</p>
      <DataTable
        cols={[
          { label: "System Combination" },
          { label: "Transfer Decision" },
        ]}
        rows={[
          ["Renal impairment + Hepatic failure", "TRANSFER IMMEDIATELY"],
          ["Renal impairment + Electrolyte disturbance", "TRANSFER IMMEDIATELY"],
          ["Chest infection + Hepatic encephalopathy", "TRANSFER IMMEDIATELY"],
          ["Electrolyte disturbance + Respiratory compromise", "TRANSFER IMMEDIATELY"],
          ["Chest infection + Renal impairment", "TRANSFER IMMEDIATELY"],
          ["Any system + Haemodynamic instability (SBP < 90)", "TRANSFER IMMEDIATELY"],
          ["Any system + GCS < 13 (altered sensorium)", "TRANSFER IMMEDIATELY"],
          ["Refractory seizures (> 2 episodes, no BZD response)", "TRANSFER IMMEDIATELY (single system warrants transfer)"],
        ]}
      />

      <SubTitle>E. Transfer Process — Step-by-Step</SubTitle>
      <DataTable
        cols={[
          { label: "Step" },
          { label: "Responsible" },
          { label: "Action" },
        ]}
        rows={[
          ["1", "Duty Nurse", "Identify trigger criteria. Alert duty doctor IMMEDIATELY. Note exact time."],
          ["2", "Duty Doctor", "Confirm transfer. Stabilise: IV access, O2 if SpO2 < 92%, document last vitals + GCS."],
          ["3", "Duty Doctor", "Call receiving hospital ER. Verbal handover: diagnosis, withdrawal day, medications, vitals, transfer trigger."],
          ["4", "Clinical Director", "Inform Dr. Amar (Clinical Director). Final sign-off on transfer summary."],
          ["5", "Nursing Staff", "Prepare Transfer Summary Document: diagnosis, medications, CIWA-Ar, vitals trend, all labs, reason for transfer."],
          ["6", "Nursing Staff", "Inform patient family/guardian. Written consent for transfer. Document family contact number."],
          ["7", "Doctor + Nurse (escort)", "Transfer via ambulance with monitoring. Carry: IV access, O2 cylinder, Inj. Lorazepam 2 mg IM for breakthrough seizure, transfer documents."],
          ["8", "Clinical Director", "Document in transfer register. Debrief team within 24 hours. Quality audit: was transfer preventable?"],
        ]}
      />

      <AlertBox title="TRANSFER SUMMARY DOCUMENT — MANDATORY INCLUSIONS">
        <BulletList items={[
          "Patient name, age, admission date, diagnosis (ICD-10), withdrawal day at time of transfer",
          "Full medication list: drug, dose, last given time",
          "Vitals trend (last 24 hours), last CIWA-Ar score, GCS at time of transfer",
          "All laboratory results with dates and reference ranges",
          "Trigger criteria met (specify which organ system/s involved)",
          "Brief clinical narrative: course of admission, seizures, delirium episodes",
          "Referring doctor name, signature, contact number | Jagruti stamp and letterhead",
        ]} />
      </AlertBox>

      <AlertBox>
        <p style={{ margin: 0 }}>POST-TRANSFER: Once medically stabilised at the receiving facility, Jagruti may receive the patient back for de-addiction rehabilitation under a formal re-admission protocol with updated medical clearance.</p>
      </AlertBox>

      {/* ── SECTION IX ── */}
      <SectionHeader>SECTION IX: DOCUMENTATION, ESCALATION &amp; GOVERNANCE</SectionHeader>

      <SubTitle>Mandatory Documentation</SubTitle>
      <BulletList items={[
        "CIWA-Ar score at every nursing assessment (minimum every 6 hours Days 1–7).",
        "Any dose modification must be recorded in the clinical notes with: date, time, parameter triggering change, new dose, and clinician signature.",
        "Lab deviations > 3× ULN must trigger a 'Medication Deviation Alert' form filed in the patient's record.",
        "Elderly patients (≥ 60): Ramsay Sedation Score and Morse Fall Risk Score documented every 8 hours.",
      ]} />

      <SubTitle>Escalation Pathway</SubTitle>
      <BulletList items={[
        "CIWA-Ar > 15 or any seizure: Immediate senior psychiatrist / physician review.",
        "LFT > 10× ULN or Bilirubin > 3× ULN: Gastroenterology / Hepatology consult within 4 hours.",
        "Serum Ammonia > 3× ULN with altered sensorium: ICU / HDU transfer consideration.",
        "Elderly patient with Ramsay Score ≥ 4: Withhold sedatives; STAT senior review.",
        "Fall event: Incident report + review of all sedating medications within 2 hours.",
      ]} />

      {/* ── APPROVAL & VERSION HISTORY ── */}
      <SectionHeader>APPROVAL &amp; VERSION HISTORY</SectionHeader>

      <DataTable
        cols={[
          { label: "Version" },
          { label: "Date" },
          { label: "Revised By" },
          { label: "Summary of Changes" },
        ]}
        rows={[
          ["1.0", "January 2024", "Dr. Amar", "Initial protocol"],
          ["2.0", "April 2026", "Dr. Amar (Clinical Director)", "Added Section V: Elderly (≥ 60 yr) dose adjustments; Section VI: Lab deviation (>3× ULN) adjustments; Section VII: Combined quick-reference matrix; Section VIII: Governance"],
        ]}
      />

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `2px solid ${NAVY}`, paddingTop: "0.75rem", marginTop: "1.5rem", textAlign: "center" }}>
        <p style={{ margin: "0 0 0.25rem", color: NAVY, fontWeight: "bold" }}>
          Jagruti Rehabilitation Centre | 29/2B/1 Zagade Wasti, Manjari Farm, Hadapsar, Pune 412307
        </p>
        <p style={{ margin: "0 0 0.25rem" }}>
          Tel: 9325595407 / 9371425026 | jagrutirehabpune@gmail.com | www.jagrutirehab.org
        </p>
        <p style={{ margin: 0, fontStyle: "italic", color: "#555", fontSize: "0.8rem" }}>
          Confidential – For Clinical Use Only | Ver. 2.0 | Rev. April 2026
        </p>
      </div>

    </div>
  </Fragment>
));

export default JagrutiiAlcoholWithdrawalProtocolV2;
