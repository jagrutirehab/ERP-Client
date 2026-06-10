import React, { forwardRef, Fragment } from "react";
import {
  SectionHeader, SubTitle, BulletList, NumberedList,
  DataTable, ControlTable,
  NAVY,
} from "./SEComponents";

// ── DATA ──────────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  ["SOP Code", "CC-07"],
  ["Effective From", "15.02.2026"],
  ["Applies To", "Centres authorised to provide ECT services"],
  ["Approved By", "Dr. Amar Shinde – Founder & Clinical Director"],
  ["Review Cycle", "Annual"],
];

const KPI_ROWS = [
  ["Documented consent compliance", "%", "100%", "Monthly"],
  ["Anaesthesia presence compliance", "%", "100%", "Monthly"],
  ["Pre-ECT checklist completion", "%", "100%", "Monthly"],
  ["Serious ECT adverse events", "Count", "Zero preventable", "Quarterly"],
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Cc07EctGovernanceSOP = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`}>
        <div style={{ borderBottom: `3px solid ${NAVY}`, paddingBottom: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ color: NAVY, fontWeight: "bold", fontSize: "0.85rem", letterSpacing: "0.04em" }}>Jagruti Rehabilitation Centre</div>
          <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1.4rem", marginTop: "4px" }}>CC-07 — Electroconvulsive Therapy (ECT) Governance SOP</div>
        </div>
      </div>

      <ControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionHeader>1. Purpose</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>To ensure that Electroconvulsive Therapy (ECT) is administered safely, ethically, legally, and in compliance with:</p>
      <BulletList items={[
        "Mental Healthcare Act, 2017",
        "Applicable anaesthesia standards",
        "NABH Care of Patients (COP) standards",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>ECT is a controlled medical procedure and must not be administered informally.</p>

      {/* 2. SCOPE */}
      <SectionHeader>2. Scope</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Applies to:</p>
      <BulletList items={[
        "All centres where ECT is performed",
        "Psychiatrists authorised to administer ECT",
        "Anaesthetists involved",
        "Nursing and recovery staff",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>No centre may initiate ECT services without formal approval by the Clinical Director.</p>

      {/* 3. LEGAL COMPLIANCE */}
      <SectionHeader>3. Legal Compliance – MHCA Requirements</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>In accordance with MHCA 2017:</p>
      <BulletList items={[
        "ECT shall be administered only with anaesthesia and muscle relaxant",
        "Unmodified ECT is prohibited",
        "Capacity assessment must be documented",
        "In case of supported admission, nominee consent is mandatory",
        "ECT for minors requires statutory safeguards (if applicable)",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>All legal conditions must be met prior to procedure.</p>

      {/* 4. CLINICAL INDICATIONS */}
      <SectionHeader>4. Clinical Indications</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>ECT may be considered for:</p>
      <BulletList items={[
        "Severe major depressive disorder with suicidality",
        "Catatonia",
        "Treatment-resistant psychosis",
        "Severe mania",
        "Acute life-threatening psychiatric conditions",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Indication must be documented in EMR.</p>

      {/* 5. CONTRAINDICATIONS & RISK ASSESSMENT */}
      <SectionHeader>5. Contraindications &amp; Risk Assessment</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Pre-ECT evaluation must include:</p>
      <BulletList items={[
        "Cardiovascular assessment",
        "Neurological review",
        "Raised ICP exclusion",
        "Anaesthesia clearance",
        "ECG and relevant labs",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Risk-benefit discussion must be documented.</p>

      {/* 6. CONSENT & CAPACITY */}
      <SectionHeader>6. Consent &amp; Capacity</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Before ECT:</p>
      <NumberedList items={[
        "Capacity must be formally assessed and documented",
        "Written informed consent must be obtained",
      ]} />
      <p style={{ margin: "0 0 0.25rem" }}>3. If patient lacks capacity:</p>
      <BulletList items={[
        "Supported admission consent procedures must apply",
        "Nominated representative consent required",
      ]} />
      <p style={{ margin: "0 0 0.5rem" }}>Consent must specifically mention:</p>
      <BulletList items={[
        "Number of sessions planned",
        "Potential side effects",
        "Memory disturbance risk",
        "Anaesthesia risk",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Consent must not be bundled into general admission consent.</p>

      {/* 7. PRE-PROCEDURE PROTOCOL */}
      <SectionHeader>7. Pre-Procedure Protocol</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Checklist must include:</p>
      <BulletList items={[
        "Identity confirmation",
        "Fasting status verification",
        "Medication review",
        "Removal of dentures / metal objects",
        "Anaesthesia readiness",
        "Emergency resuscitation equipment available",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>ECT checklist must be documented.</p>

      {/* 8. ANAESTHESIA REQUIREMENT */}
      <SectionHeader>8. Anaesthesia Requirement</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>ECT must be administered:</p>
      <BulletList items={[
        "Under supervision of qualified anaesthetist",
        "With appropriate monitoring",
        "With resuscitation equipment available",
      ]} />
      <p style={{ margin: "0 0 0.5rem" }}>Monitoring must include:</p>
      <BulletList items={[
        "Pulse",
        "Blood pressure",
        "Oxygen saturation",
        "ECG (as indicated)",
      ]} />

      {/* 9. PROCEDURE DOCUMENTATION */}
      <SectionHeader>9. Procedure Documentation</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Each session must record:</p>
      <BulletList items={[
        "Date & time",
        "Electrode placement",
        "Stimulus parameters",
        "Seizure duration",
        "Complications",
        "Anaesthesia details",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Documentation must be signed by psychiatrist and anaesthetist.</p>

      {/* 10. POST-ECT MONITORING */}
      <SectionHeader>10. Post-ECT Monitoring</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>After ECT:</p>
      <BulletList items={[
        "Monitor vitals",
        "Assess orientation",
        "Assess recovery status",
        "Monitor for adverse events",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Patient must not be discharged from recovery without clearance.</p>

      {/* 11. COMPLICATION MANAGEMENT */}
      <SectionHeader>11. Complication Management</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Possible complications include:</p>
      <BulletList items={[
        "Prolonged seizure",
        "Arrhythmia",
        "Confusion",
        "Headache",
        "Memory disturbance",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Serious adverse events must be reported under QA-01 and reviewed.</p>

      {/* 12. PRIVILEGING & CREDENTIALING */}
      <SectionHeader>12. Privileging &amp; Credentialing</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Only psychiatrists formally privileged by Dr. Amar Shinde – Clinical Director may administer ECT.</p>
      <p style={{ margin: "0 0 0.5rem" }}>Privileges must be:</p>
      <BulletList items={[
        "Documented",
        "Reviewed annually",
        "Linked to competency",
      ]} />
      <p style={{ margin: "0 0 0.75rem" }}>Anaesthetist credentials must be valid and documented.</p>

      {/* 13. AUDIT & KPI MONITORING */}
      <SectionHeader>13. Audit &amp; KPI Monitoring</SectionHeader>
      <DataTable
        cols={[{ label: "KPI" }, { label: "UoM", width: "10%" }, { label: "Target", width: "20%" }, { label: "Review Frequency", width: "16%" }]}
        rows={KPI_ROWS}
      />

      {/* 14. ACCOUNTABILITY */}
      <SectionHeader>14. Accountability</SectionHeader>
      <SubTitle>Treating Psychiatrist</SubTitle>
      <BulletList items={["Clinical indication", "Consent", "Documentation"]} />
      <SubTitle>Anaesthetist</SubTitle>
      <BulletList items={["Safe anaesthesia"]} />
      <SubTitle>Centre Head</SubTitle>
      <BulletList items={["Infrastructure readiness"]} />
      <SubTitle>Clinical Director</SubTitle>
      <BulletList items={["Network oversight"]} />

      <div style={{ borderTop: `2px solid ${NAVY}`, paddingTop: "0.75rem", marginTop: "1.5rem" }}>
        <p style={{ margin: "0 0 0.25rem", color: NAVY, fontWeight: "bold" }}>Approved By: Dr. Amar Shinde – Founder &amp; Clinical Director</p>
        <p style={{ margin: "0 0 0.25rem" }}>Date: _______________</p>
        <p style={{ margin: "0", fontStyle: "italic", color: "#555", fontSize: "0.8rem" }}>CC-07 | Effective: 15.02.2026 | Jagruti Rehabilitation Centre | Review Cycle: Annual</p>
      </div>

    </div>
  </Fragment>
));

export default Cc07EctGovernanceSOP;
