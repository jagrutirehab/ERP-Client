import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-05"],
  ["Title", "Alcohol Use Disorder & Withdrawal Management Protocol"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "De-Addiction IPD / ICU Step-Down / All JRCPL Centres"],
  ["Rating Scales", "CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol)"],
  ["Regulatory Basis", "MHCA 2017; NABH COP; NDPS Act 1985"],
  ["Replaces", "Jagruti AW Protocol V2 Final.docx (JRC/DA/AWP/002)"],
];

const CDZ_COLS = [
  { label: "Day", width: "10%", center: true },
  { label: "Morning", width: "20%", center: true },
  { label: "Evening", width: "20%", center: true },
  { label: "Night", width: "20%", center: true },
  { label: "Daily Total (tabs)", center: true },
];

const CDZ_STANDARD = [
  ["1","4","4","6","14"],["2","3","4","6","13"],["3","3","3","5","11"],
  ["4","2","3","5","10"],["5","2","2","4","8"],["6","1","2","4","7"],
  ["7","1","1","3","5"],["8","0","1","3","4"],["9","0","0","2","2"],["10","0","0","2","2"],
];

const CDZ_ELDERLY = [
  ["1","2","2","4","8"],["2","2","2","4","8"],["3","1","2","3","6"],
  ["4","1","2","3","6"],["5","1","1","3","5"],["6","1","1","2","4"],
  ["7","0","1","2","3"],["8","0","1","2","3"],["9","0","0","2","2"],["10","0","0","1","1"],
];

const Cl05AlcoholUseDisorderWithdrawal = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-05"
        title="Alcohol Use Disorder &amp; Withdrawal"
        icdLine="ICD-11: 6C40–6C41 | DSM-5-TR: F10 | De-Addiction Vertical"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol governs inpatient alcohol withdrawal management for all admitted patients at JRCPL. It incorporates standard adult dosing, <strong>ELDERLY adjustments</strong> (age ≥ 60 years), and <strong>LAB-DEVIATION ADJUSTMENTS</strong> (parameters &gt; 3× ULN). All dose modifications must be documented in clinical notes with rationale clearly stated.
      </p>

      {/* 2. ADMISSION ASSESSMENT */}
      <ModuleHeader>2. ADMISSION ASSESSMENT</ModuleHeader>
      <SectionTitle>2.1 Intoxicated State on Arrival</SectionTitle>
      <BulletList items={[
        "Assess orientation: Time / Place / Person",
        "Record vitals: Temperature, Pulse, Respiration, BP, Blood Sugar Level",
        "Examine for signs of head injury (scalp lacerations, GCS, pupils)",
        "Inj. SERENACE (Haloperidol) 1 amp IM — SOS for acute agitation",
      ]} />
      <SectionTitle>2.2 Mandatory Baseline Investigations</SectionTitle>
      <Table
        cols={[{ label: "Investigation", width: "30%" }, { label: "Purpose", width: "35%" }, { label: "Alert Threshold" }]}
        rows={[
          ["CBC", "Baseline haematological status", "WBC < 3.0 or > 15.0 × 10⁹/L"],
          ["LFT (AST, ALT, ALP, Bilirubin, Albumin)", "Liver function; hepatotoxicity monitoring", "Any value > 3× ULN — flag immediately"],
          ["RFT (Creatinine, BUN, eGFR)", "Renal clearance for benzodiazepines", "Creatinine > 1.5 mg/dL"],
          ["Serum Electrolytes (Na⁺, K⁺, Mg²⁺)", "Electrolyte correction before benzodiazepines", "Na < 130 mEq/L; K < 3.0 mEq/L"],
          ["RBS / HbA1c", "Glucose status in alcohol use", "RBS > 200 mg/dL → treat"],
          ["Serum Ammonia", "Hepatic encephalopathy screening", "Elevated + delirium → hepatic protocol"],
          ["Coagulation (PT/INR)", "Bleeding risk; liver function", "INR > 1.5 → physician review"],
          ["ECG", "Cardiac monitoring; QTc baseline", "QTc > 450 ms → cardiology alert"],
        ]}
      />
      <WarningBox>Flag any value &gt; 3× Upper Limit of Normal immediately. Results must be reviewed BEFORE initiating or continuing benzodiazepine therapy.</WarningBox>

      {/* 3. WITHDRAWAL MANAGEMENT */}
      <ModuleHeader>3. WITHDRAWAL MANAGEMENT — DAYS 0–10 (Standard Adult)</ModuleHeader>
      <SectionTitle>3.1 Fixed Dose Protocol — Chlordiazepoxide (CDZ)</SectionTitle>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>Unit = 1 tablet Chlordiazepoxide 10 mg</p>
      <Table cols={CDZ_COLS} rows={CDZ_STANDARD} />
      <p style={{ margin: "0 0 0.75rem", fontWeight: "bold", fontSize: "0.9rem" }}>
        SOS dose: CDZ 10 mg (1 tab) PO every 6 hours PRN if CIWA-Ar &gt; 10. Maximum SOS = 4 tabs/day. Re-assess hourly after SOS dose.
      </p>
      <SectionTitle>3.2 Antiepileptic Medicines</SectionTitle>
      <Table
        cols={[{ label: "Option", width: "10%" }, { label: "Drug", width: "30%" }, { label: "Duration", width: "20%" }, { label: "Dosing" }]}
        rows={[
          ["A", "Tab. Levetiracetam 500 mg", "Days 1–5", "1–0–1 → then 250 mg BD × 5 days → STOP"],
          ["B", "Tab. Carbamazepine 200 mg", "Days 1–10", "0–0–1 → STOP"],
        ]}
      />
      <SectionTitle>3.3 General Medicines</SectionTitle>
      <Table
        cols={[{ label: "Drug", width: "30%" }, { label: "Duration", width: "30%" }, { label: "Dose / Route" }]}
        rows={[
          ["Thiamine / Safepeg IV", "Day 1 IV, then 15 days oral", "Inj. Thiamine 100 mg in 500 mL DNS slow IV; then Tab. Thiamine 100 mg 1-0-1"],
          ["B-Plex / Levogen", "30 days", "1–0–0"],
          ["Antacids (Tab/IV PAN 40 + Emset)", "As required", "PRN — for nausea/vomiting/GI symptoms"],
          ["Tab. Amlodipine 5 mg", "SOS (BP > 140/90 mmHg)", "STAT then review — escalate if persistent"],
          ["Tab. Udiliv 300 mg", "Throughout admission if indicated", "1–0–1 (Liver dysfunction management)"],
        ]}
      />

      {/* 4. HEPATIC ENCEPHALOPATHY */}
      <ModuleHeader>4. HEPATIC ENCEPHALOPATHY MANAGEMENT</ModuleHeader>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Trigger: Persistent delirium AND Serum Ammonia elevated</p>
      <Table
        cols={[{ label: "Drug", width: "40%" }, { label: "Dose", width: "20%" }, { label: "Frequency" }]}
        rows={[
          ["Tab. Udiliv 300 mg", "300 mg", "1–0–1"],
          ["Tab. Rifagut 550 mg", "550 mg", "1–0–1"],
          ["Tab/Sachet Lornit 500 mg", "500 mg", "1–0–1"],
          ["Syp. Duphalac 30 mL", "30 mL", "1–0–1 (or enema if no stools)"],
        ]}
      />

      {/* 5. POST-WITHDRAWAL MAINTENANCE */}
      <ModuleHeader>5. POST-WITHDRAWAL MAINTENANCE — DAYS 10–45</ModuleHeader>
      <Table
        cols={[{ label: "Drug", width: "35%" }, { label: "Dose", width: "28%" }, { label: "Frequency / Remarks" }]}
        rows={[
          ["Tab. Acamprosate 333 mg", "> 65 kg: 333×2; < 65 kg: 333×1", "2-2-2 (>65 kg) or 1-1-2 (<65 kg)"],
          ["Tab. Topiramate 50 mg", "50 mg", "1–0–1"],
          ["Tab. Lopez/Ativan 2 mg", "2 mg", "0–0–1 (short-term; taper early)"],
          ["Tab. Baclofen 20 mg", "20 mg", "1–0–1"],
        ]}
      />

      {/* 6. DISCHARGE PRESCRIPTION */}
      <ModuleHeader>6. DISCHARGE PRESCRIPTION</ModuleHeader>
      <Table
        cols={[{ label: "Drug", width: "45%" }, { label: "Dose", width: "22%" }, { label: "Frequency" }]}
        rows={[
          ["Tab. Lopez/Ativan 2 mg", "2 mg", "0–0–1"],
          ["Tab. Baclofen 20 mg OR Naltima 50 mg OR Disulfiram 250 mg (after consent)", "As chosen", "1–0–0"],
          ["Tab. Acamprosate 333 mg", "> 65 kg / < 65 kg", "2-2-2 (>65 kg) or 1-1-2 (<65 kg)"],
          ["Tab. Topiramate 50 mg", "50 mg", "1–0–1"],
        ]}
      />
      <WarningBox>Disulfiram: Obtain written informed consent. Ensure sobriety ≥ 48 hours before initiation. Contraindicated in severe hepatic disease, cardiac disease, psychosis.</WarningBox>

      {/* 7. ELDERLY ADJUSTMENTS */}
      <ModuleHeader>7. ELDERLY ADJUSTMENTS (Age ≥ 60 Years)</ModuleHeader>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>Unit = 1 tablet Chlordiazepoxide 10 mg</p>
      <Table cols={CDZ_COLS} rows={CDZ_ELDERLY} />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "18%", center: true }, { label: "Review", width: "15%", center: true }]}
        rows={[
          ["CIWA-Ar documented as per protocol", "≥ 95%", "Monthly"],
          ["Thiamine given in all alcohol detox cases", "100%", "Monthly"],
          ["High-risk escalation documented within 24 hrs", "100%", "Quarterly"],
          ["ICU transfer due to detox complication — declining trend", "Trending down", "Quarterly"],
        ]}
      />

      <ProtocolApproval docCode="CL-05" docTitle="Alcohol Use Disorder & Withdrawal" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl05AlcoholUseDisorderWithdrawal;
