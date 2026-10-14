import React, { forwardRef, Fragment } from "react";

const tableCellStyle = { border: "1px solid #6c757d", padding: "6px 10px", verticalAlign: "top" };
const tableHeadStyle = { ...tableCellStyle, background: "#f1f3f5", fontWeight: "bold" };
const calloutStyle = {
  background: "#eef4ff",
  borderLeft: "4px solid #0d6efd",
  padding: "10px 12px",
  margin: "12px 0",
  fontStyle: "italic",
};
const warnStyle = {
  background: "#fff5f5",
  borderLeft: "4px solid #dc3545",
  padding: "10px 12px",
  margin: "12px 0",
  fontWeight: "bold",
};
const programmeHeaderStyle = {
  background: "#e7f5ff",
  borderLeft: "4px solid #1971c2",
  padding: "10px 12px",
  marginTop: "20px",
  marginBottom: "8px",
};

const Adm06ClinicalCarePathwaysSOP = forwardRef((props, ref) => {
  return (
    <Fragment>
      <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>
        <div className={`${props.heading} mb-4`}>
          <h1 className="text-3xl m-auto text-center font-extrabold mb-2">
            JAGRUTII REHAB CENTRE PVT. LTD.
          </h1>
          <p className="text-center mb-3">Clinical Excellence Framework</p>
          <h2 className="text-2xl font-semibold text-center mb-1">
            Clinical Care Pathways, Programme Duration &amp; Length of Stay Policy
          </h2>
          <p className="text-center text-muted">
            Adm-06 | Version 1.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
          <tbody>
            <tr><td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>Adm-06</td></tr>
            <tr><td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>1.0</td></tr>
            <tr><td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td></tr>
            <tr><td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td></tr>
            <tr><td style={tableHeadStyle}>Category</td><td style={tableCellStyle}>Clinical Governance | Programme Design | Length of Stay</td></tr>
            <tr><td style={tableHeadStyle}>Prepared &amp; Approved By</td><td style={tableCellStyle}>Dr. Amar Shinde | Founder &amp; Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Applicable To</td><td style={tableCellStyle}>All 18 Centres | All Six Clinical Programmes | All Clinical Disciplines</td></tr>
            <tr><td style={tableHeadStyle}>Regulatory Basis</td><td style={tableCellStyle}>MHCA 2017 (Sec. 18, 19); NABH COP 3, 5; NDPS Act 1985; WHO Guidelines; IPS Clinical Practice Guidelines 2022</td></tr>
            <tr><td style={tableHeadStyle}>NABH Chapter</td><td style={tableCellStyle}>COP | MOM | ACE | QM</td></tr>
            <tr><td style={tableHeadStyle}>Classification</td><td style={tableCellStyle}><strong>CONFIDENTIAL — Internal Clinical Governance Document</strong></td></tr>
          </tbody>
        </table>

        <div style={calloutStyle}>
          This document defines the clinical care pathway, programme structure, standard length of stay, outcome
          milestones, and review criteria for all six clinical programmes offered at JRCPL. It is the
          authoritative reference for all admissions, treatment planning, and discharge decisions. Deviations
          from standard programme duration require treating psychiatrist documentation and Clinical Director
          notification.
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>1. Overview — JRCPL Clinical Programmes</h3>
          <p>JRCPL operates six distinct clinical programmes across all 18 centres and four clinical verticals.</p>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Programme</th><th style={tableHeadStyle}>Vertical</th><th style={tableHeadStyle}>Standard Duration</th><th style={tableHeadStyle}>Review Cycle</th><th style={tableHeadStyle}>MHCA Category</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>P1 — Acute Psychiatric Stabilisation</td><td style={tableCellStyle}>Psychiatric Care</td><td style={tableCellStyle}>7–30 days (severity-based)</td><td style={tableCellStyle}>Every 7 days</td><td style={tableCellStyle}>§86 / §98 / §89</td></tr>
              <tr><td style={tableCellStyle}>P2 — Psychiatric Rehabilitation</td><td style={tableCellStyle}>Psychiatric Care</td><td style={tableCellStyle}>90 days (standard)</td><td style={tableCellStyle}>Every 30 days</td><td style={tableCellStyle}>§86 / §89</td></tr>
              <tr><td style={tableCellStyle}>P3 — Alcohol De-Addiction</td><td style={tableCellStyle}>De-Addiction</td><td style={tableCellStyle}>45 days (standard)</td><td style={tableCellStyle}>Phase-based</td><td style={tableCellStyle}>§86 / §98</td></tr>
              <tr><td style={tableCellStyle}>P4 — Drug De-Addiction</td><td style={tableCellStyle}>De-Addiction</td><td style={tableCellStyle}>90 days (standard)</td><td style={tableCellStyle}>Phase-based</td><td style={tableCellStyle}>§86 / §98</td></tr>
              <tr><td style={tableCellStyle}>P5 — Elderly &amp; Dementia Care</td><td style={tableCellStyle}>Elderly Care</td><td style={tableCellStyle}>Condition-dependent; long-term eligible</td><td style={tableCellStyle}>Every 30 days</td><td style={tableCellStyle}>§86 / §87 / §89</td></tr>
              <tr><td style={tableCellStyle}>P6 — End of Life &amp; Palliative Care</td><td style={tableCellStyle}>Elderly / Psychiatric</td><td style={tableCellStyle}>Duration of need — hospice eligible</td><td style={tableCellStyle}>Weekly MDT</td><td style={tableCellStyle}>§86 / §89</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>2. Core Clinical Principles</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Length of stay is a clinical decision made by the treating psychiatrist in consultation with the MDT — never an administrative, financial, or family-driven decision</li>
            <li>Every patient receives an Estimated Length of Stay (ELOS) at admission, documented in the EMR</li>
            <li>ELOS is reviewed at every MDT review cycle and updated when the clinical picture changes</li>
            <li>Early discharge is clinically appropriate when discharge readiness criteria (RC-03) are met — not when the programme duration is complete</li>
            <li>Extended stay beyond standard programme duration requires: treating psychiatrist documentation, MDT agreement, Clinical Director notification, and updated family communication</li>
            <li>All stays are governed by MHCA 2017 — admission category is reviewed and updated throughout the programme</li>
          </ul>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 1 — Acute Psychiatric Stabilisation</strong> · Standard duration: 7 to 30 days | Severity-determined
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>1.1 Programme Definition</h4>
          <p>Short-term, intensive inpatient programme for patients presenting with acute psychiatric illness requiring immediate clinical intervention. Duration is determined entirely by clinical severity and response to treatment.</p>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>1.2 Indications for Admission</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Active suicidal ideation or recent suicide attempt (C-SSRS score 4–5)</li>
            <li>Acute psychosis — first episode or relapse with risk behaviour</li>
            <li>Severe manic episode with disinhibition, aggression, or poor self-care</li>
            <li>Severe depressive episode with psychotic features or suicidality</li>
            <li>Acute onset behavioural disturbance requiring inpatient monitoring</li>
            <li>Medication initiation requiring close monitoring (e.g. clozapine, lithium loading)</li>
            <li>Post-discharge relapse requiring rapid re-stabilisation</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>1.3 Standard Programme Duration</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Severity Level</th><th style={tableHeadStyle}>Clinical Criteria</th><th style={tableHeadStyle}>Standard Duration</th><th style={tableHeadStyle}>MHCA Category</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Mild-Moderate</td><td style={tableCellStyle}>Stable vitals; responsive to initial pharmacotherapy; insight present; low immediate risk</td><td style={tableCellStyle}>7–14 days</td><td style={tableCellStyle}>§86 Voluntary</td></tr>
              <tr><td style={tableCellStyle}>Moderate-Severe</td><td style={tableCellStyle}>Partial response; moderate risk; capacity fluctuating; requires close observation</td><td style={tableCellStyle}>14–21 days</td><td style={tableCellStyle}>§86 / §89</td></tr>
              <tr><td style={tableCellStyle}>Severe</td><td style={tableCellStyle}>Minimal treatment response; high risk; may lack capacity; requires intensive intervention</td><td style={tableCellStyle}>21–30 days</td><td style={tableCellStyle}>§89 / §98</td></tr>
              <tr><td style={tableCellStyle}>Complex / Treatment-resistant</td><td style={tableCellStyle}>Multiple failed trials; dual diagnosis; comorbid medical illness</td><td style={tableCellStyle}>Beyond 30 days — convert to P2 Rehab pathway; CD notification required</td><td style={tableCellStyle}>§89 / §90</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>1.4 Phase Structure</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Phase</th><th style={tableHeadStyle}>Days</th><th style={tableHeadStyle}>Clinical Focus</th><th style={tableHeadStyle}>Key Milestones</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Phase 1</td><td style={tableCellStyle}>Day 1–3</td><td style={tableCellStyle}>Safety, stabilisation, baseline assessment</td><td style={tableCellStyle}>C-SSRS, MSE, labs, risk classification, medication initiation, MHCA admission category confirmed</td></tr>
              <tr><td style={tableCellStyle}>Phase 2</td><td style={tableCellStyle}>Day 4–14</td><td style={tableCellStyle}>Medication optimisation, psychoeducation, risk reduction</td><td style={tableCellStyle}>PANSS/CGI at Day 7; medication response documented; family first contact; sleep stabilised</td></tr>
              <tr><td style={tableCellStyle}>Phase 3</td><td style={tableCellStyle}>Day 15–30</td><td style={tableCellStyle}>Stabilisation, insight building, discharge preparation</td><td style={tableCellStyle}>C-SSRS zero active ideation ≥5 days; insight documented; discharge criteria assessment; CCP drafted</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>1.5 Discharge Criteria</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>C-SSRS active ideation score 0 for ≥ 5 consecutive days</li>
            <li>No uncontrolled psychosis, mania, or severe agitation</li>
            <li>Stable, optimised medication regimen — no dose changes in last 48 hours</li>
            <li>Insight into illness documented by treating psychologist</li>
            <li>Safe home environment confirmed by MSW</li>
            <li>Minimum 2 family counselling sessions completed</li>
            <li>Outpatient follow-up appointment confirmed</li>
          </ul>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 2 — Psychiatric Rehabilitation</strong> · Standard duration: 90 days | Review every 30 days
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>2.1 Programme Definition</h4>
          <p>Structured, long-term inpatient programme for patients with moderate-to-severe psychiatric illness who require comprehensive rehabilitation beyond acute stabilisation. Integrates pharmacotherapy, structured psychotherapy, occupational therapy, family therapy, and relapse prevention into a phased clinical pathway.</p>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>2.2 Indications</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Chronic or recurrent psychiatric illness with poor community functioning (schizophrenia spectrum, bipolar disorder, treatment-resistant depression)</li>
            <li>First episode psychosis requiring extended monitoring and rehabilitation</li>
            <li>Dual diagnosis — psychiatric illness with comorbid substance use</li>
            <li>Post-acute stabilisation requiring sustained rehabilitation before community re-integration</li>
            <li>Inadequate response to outpatient management</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>2.3 Three-Phase Structure — 90 Days</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Phase</th><th style={tableHeadStyle}>Days</th><th style={tableHeadStyle}>Clinical Focus</th><th style={tableHeadStyle}>Outcome Milestone</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Phase 1 — Stabilise</td><td style={tableCellStyle}>Day 1–30</td><td style={tableCellStyle}>Workup; optimise pharmacotherapy; psychoeducation; ADL baseline; family engagement; risk classification</td><td style={tableCellStyle}>Stable medication for 14 days; PANSS/CGI improvement ≥15%; basic ADL independent; no acute risk</td></tr>
              <tr><td style={tableCellStyle}>Phase 2 — Rehabilitate</td><td style={tableCellStyle}>Day 31–60</td><td style={tableCellStyle}>Structured CBT/MET; group therapy; OT and ADL training; social skills; vocational assessment; family therapy; relapse prevention planning</td><td style={tableCellStyle}>PHQ-9/PANSS reduction ≥30%; GAF score ≥40; insight documented; relapse warning signs identified</td></tr>
              <tr><td style={tableCellStyle}>Phase 3 — Reintegrate</td><td style={tableCellStyle}>Day 61–90</td><td style={tableCellStyle}>Discharge preparation; CCP finalised; therapeutic leave trials; community referrals; vocational/educational linkage; medication self-management</td><td style={tableCellStyle}>C-SSRS 0 for ≥5 days; GAF ≥50; CCP documented; follow-up confirmed; family pre-discharge briefing completed</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>2.4 Extension Beyond 90 Days — Three Pathways</h4>
          <div style={calloutStyle}>
            A significant proportion of patients with severe or treatment-resistant psychiatric illness will
            require admission beyond 90 days. This is an expected and appropriate clinical outcome — not a
            failure of the programme.
          </div>
          <p><strong>Pathway A — Patient Willing to Continue (Has Capacity):</strong> formal capacity reassessment at Day 85; fresh written consent; ADM-F-002 re-signed or extension addendum; Clinical Director notified; §86 continues (or MHRB notification if §89).</p>
          <p><strong>Pathway B — Patient Unwilling to Continue (Refuses Extension):</strong></p>
          <div style={warnStyle}>
            ⚠ A voluntary patient with decision-making capacity who refuses continued admission CANNOT be
            detained. This is an absolute right under MHCA 2017 §87. The clinical response is risk counselling,
            AMA documentation, and community safety planning — not restraint or forced continuation.
          </div>
          <p><strong>Pathway C — Patient Lacks Capacity or Meets §90 Criteria:</strong> two independent psychiatrist certificates; NR consent; MHRB notification within 7 days; capacity reassessment every 14 days; convert to §86 if capacity returns.</p>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 3 — Alcohol De-Addiction</strong> · Standard duration: 45 days | Phase-based review
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>3.1 Phase Structure — 45 Days</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Phase</th><th style={tableHeadStyle}>Days</th><th style={tableHeadStyle}>Clinical Focus</th><th style={tableHeadStyle}>Key Milestones</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Phase 1 — Detoxification</td><td style={tableCellStyle}>Day 1–7</td><td style={tableCellStyle}>CIWA-Ar monitored withdrawal; benzodiazepine taper; thiamine, vitamins; 4-hourly vitals; absolute rest; LFT/labs</td><td style={tableCellStyle}>CIWA-Ar ≤ 8; vitals stable; no seizures; sleep stabilising; medically fit</td></tr>
              <tr><td style={tableCellStyle}>Phase 2 — Early Sobriety</td><td style={tableCellStyle}>Day 8–21</td><td style={tableCellStyle}>Psychoeducation; MET; individual counselling; group therapy; family engagement; Antabuse/naltrexone if indicated</td><td style={tableCellStyle}>AUDIT score reduction; motivation articulated; 1 family session; cravings management strategies identified</td></tr>
              <tr><td style={tableCellStyle}>Phase 3 — Rehabilitation</td><td style={tableCellStyle}>Day 22–38</td><td style={tableCellStyle}>Intensive CBT-based relapse prevention; AA/SMART Recovery integration; trigger identification; social skills; family therapy; CCP planning</td><td style={tableCellStyle}>12-step engagement; triggers mapped; relapse prevention plan drafted; family sessions 2 &amp; 3</td></tr>
              <tr><td style={tableCellStyle}>Phase 4 — Pre-Discharge</td><td style={tableCellStyle}>Day 39–45</td><td style={tableCellStyle}>CCP finalisation; community linkage; therapeutic leave trial; medical review; discharge summary</td><td style={tableCellStyle}>45-day sobriety confirmed; CCP with follow-up schedule; AA/SMART connection made; prescriptions issued</td></tr>
            </tbody>
          </table>

          <div style={warnStyle}>
            ⚠ CIWA-Ar score &gt; 15 with unstable vitals = Admission Rejection Criteria B1. Immediate escalation
            to Medical Officer; consider hospital transfer for IV management. Do not manage severe complicated
            withdrawal without ICU backup.
          </div>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>3.2 Medical Protocol — Detoxification</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>CIWA-Ar every 4 hours (Phase 1); every 8 hours (Phase 2)</li>
            <li>Benzodiazepine protocol: symptom-triggered or fixed-dose taper per JRCPL detox protocol</li>
            <li>Thiamine 100mg IV/IM for minimum 3 days before oral — mandatory (Wernicke's prevention)</li>
            <li>LFT, GGT, CBC, RFT, electrolytes, coagulation screen at Day 1 and Day 7</li>
            <li>ECG mandatory — QTc monitoring</li>
            <li>Seizure precautions — padded bedside rails, one-to-one nursing if CIWA-Ar ≥ 15</li>
          </ul>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 4 — Drug De-Addiction</strong> · Standard duration: 90 days | Phase-based review
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>4.1 Why 90 Days — Clinical Rationale</h4>
          <div style={calloutStyle}>
            Meaningful neuroplastic recovery from substance-induced changes in the reward pathway requires a
            minimum of 90 days of structured abstinence and rehabilitation. Shorter programmes show
            significantly higher rates of early relapse. The 90-day standard aligns with WHO guidelines, NDPS
            Act compulsory treatment provisions (§64A), and IPS De-Addiction guidelines 2022.
          </div>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>4.2 Phase Structure — 90 Days</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Phase</th><th style={tableHeadStyle}>Days</th><th style={tableHeadStyle}>Clinical Focus</th><th style={tableHeadStyle}>Key Milestones</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Phase 1 — Detox &amp; Stabilise</td><td style={tableCellStyle}>Day 1–14</td><td style={tableCellStyle}>COWS-monitored withdrawal; MAT initiation if indicated; UDS; labs; psychiatric comorbidity assessment</td><td style={tableCellStyle}>COWS ≤ 8; medically stable; MAT optimised; no acute psychiatric crisis</td></tr>
              <tr><td style={tableCellStyle}>Phase 2 — Early Recovery</td><td style={tableCellStyle}>Day 15–45</td><td style={tableCellStyle}>MET; individual counselling; group therapy; family engagement; 12-step or SMART Recovery introduction</td><td style={tableCellStyle}>CGI improvement ≥15%; cravings management strategies; motivation strengthened; family sessions 1 &amp; 2</td></tr>
              <tr><td style={tableCellStyle}>Phase 3 — Rehabilitation</td><td style={tableCellStyle}>Day 46–75</td><td style={tableCellStyle}>Intensive relapse prevention (CBT); social skills; trigger mapping; vocational planning; AA/NA integration; family therapy</td><td style={tableCellStyle}>Relapse prevention plan; triggers and coping strategies mapped; vocational plan documented</td></tr>
              <tr><td style={tableCellStyle}>Phase 4 — Pre-Discharge</td><td style={tableCellStyle}>Day 76–90</td><td style={tableCellStyle}>CCP finalisation; therapeutic leave; aftercare plan; medical review; discharge summary; MAT continuation</td><td style={tableCellStyle}>90-day sobriety confirmed; aftercare confirmed; family briefed on relapse signs; MAT prescription issued</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>4.3 Substance-Specific Protocols</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Substance</th><th style={tableHeadStyle}>Detox Protocol</th><th style={tableHeadStyle}>MAT Consideration</th><th style={tableHeadStyle}>Special Considerations</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Opioids</td><td style={tableCellStyle}>COWS every 4–6 hours; buprenorphine induction if indicated</td><td style={tableCellStyle}>Buprenorphine/naloxone or extended-release naltrexone</td><td style={tableCellStyle}>HIV/HCV screening mandatory; needle sharing history; TB screen</td></tr>
              <tr><td style={tableCellStyle}>Cannabis</td><td style={tableCellStyle}>Symptomatic management; psychiatric monitoring for cannabis-induced psychosis</td><td style={tableCellStyle}>Not applicable</td><td style={tableCellStyle}>Psychosis risk monitoring — PANSS; adolescent-specific protocol if under 18</td></tr>
              <tr><td style={tableCellStyle}>Benzodiazepines</td><td style={tableCellStyle}>Slow taper protocol (phenobarbitone or long-acting BZD substitution); never abrupt cessation</td><td style={tableCellStyle}>Taper schedule documented in EMR</td><td style={tableCellStyle}>Seizure risk; ECG monitoring; concurrent alcohol withdrawal risk</td></tr>
              <tr><td style={tableCellStyle}>Stimulants</td><td style={tableCellStyle}>Symptomatic; monitor cardiovascular; crash period management</td><td style={tableCellStyle}>Not currently evidence-based</td><td style={tableCellStyle}>ECG mandatory; hypertensive crisis protocol; depression and suicidality in withdrawal</td></tr>
              <tr><td style={tableCellStyle}>Polysubstance</td><td style={tableCellStyle}>Sequential or concurrent management per priority of risk</td><td style={tableCellStyle}>As per primary substance</td><td style={tableCellStyle}>Extended Phase 1 often required; dual diagnosis assessment mandatory</td></tr>
            </tbody>
          </table>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 5 — Elderly &amp; Dementia Care</strong> · Condition-dependent | Long-term residency eligible | Review every 30 days
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.1 Programme Streams</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Stream</th><th style={tableHeadStyle}>Target Population</th><th style={tableHeadStyle}>Duration</th><th style={tableHeadStyle}>Review</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Acute geriatric psychiatric stabilisation</td><td style={tableCellStyle}>Acute psychiatric crisis; new-onset BPSD in dementia; delirium</td><td style={tableCellStyle}>2–6 weeks (episode-based)</td><td style={tableCellStyle}>Every 7 days</td></tr>
              <tr><td style={tableCellStyle}>Post-acute rehabilitation</td><td style={tableCellStyle}>Stabilised older adult requiring functional rehabilitation</td><td style={tableCellStyle}>4–12 weeks</td><td style={tableCellStyle}>Every 14 days</td></tr>
              <tr><td style={tableCellStyle}>Dementia residential care</td><td style={tableCellStyle}>Moderate-to-severe dementia; BPSD; family unable to provide care; safety risk at home</td><td style={tableCellStyle}>Long-term; no fixed discharge date</td><td style={tableCellStyle}>Every 30 days</td></tr>
              <tr><td style={tableCellStyle}>Long-term residential care</td><td style={tableCellStyle}>Complex multimorbidity; severe functional decline; no viable community placement</td><td style={tableCellStyle}>Indefinite — life-of-need basis</td><td style={tableCellStyle}>Monthly MDT; annual goals review</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.2 Core Clinical Principles</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sleep stabilisation first: orexin antagonists and prolonged-release melatonin preferred over antipsychotics</li>
            <li>Minimum pharmacological burden: lowest effective dose; avoid polypharmacy and PRN stacking</li>
            <li>Non-pharmacological behavioural interventions first for BPSD</li>
            <li>Antipsychotics only when safety risk exists and non-pharmacological approaches have been tried</li>
            <li>Cognition preservation: anti-dementia therapy optimised before behavioural sedation</li>
            <li>Fall prevention mandatory; environment modification; physiotherapy</li>
            <li>Dignity-centred care: personal preferences, life history, routines, and communication preferences documented</li>
          </ul>
        </div>

        <div style={programmeHeaderStyle}>
          <strong>Programme 6 — End of Life &amp; Palliative Care (Hospice)</strong> · Duration of need | Weekly MDT review
        </div>
        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>6.1 Eligibility Criteria</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Advanced dementia with severe functional decline (Barthel Index ≤ 20; MMSE ≤ 10)</li>
            <li>Terminal psychiatric illness with severe treatment-resistant symptoms</li>
            <li>Life-limiting medical comorbidity (cancer, heart failure, COPD, renal/liver failure) with psychiatric or cognitive comorbidity</li>
            <li>Prognosis of ≤ 12 months estimated by treating physician and psychiatrist jointly</li>
            <li>Patient or NR has expressed preference for comfort-focused care</li>
            <li>Advance Directive specifying comfort care has been made or agreed with NR</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>6.2 Core Palliative Principles</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Principle</th><th style={tableHeadStyle}>What This Means at JRCPL</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Comfort over cure</td><td style={tableCellStyle}>Treatment goals shift from disease modification to symptom relief, comfort, and quality of remaining life</td></tr>
              <tr><td style={tableCellStyle}>Dignity</td><td style={tableCellStyle}>Patient's personal preferences, life history, cultural and religious practices, and communication preferences are documented and respected</td></tr>
              <tr><td style={tableCellStyle}>Pain and symptom control</td><td style={tableCellStyle}>Active and proactive management of pain, dyspnoea, agitation, nausea, and anxiety — not reactive or minimal</td></tr>
              <tr><td style={tableCellStyle}>Family as partners</td><td style={tableCellStyle}>Family members are active participants in the care plan, not visitors. Counselling, emotional support, and bereavement preparation provided</td></tr>
              <tr><td style={tableCellStyle}>Honest communication</td><td style={tableCellStyle}>Prognosis communicated compassionately and honestly — no false hope</td></tr>
              <tr><td style={tableCellStyle}>Advance care planning</td><td style={tableCellStyle}>Advance Directive reviewed and incorporated. DNAR order documented if patient/family consent obtained</td></tr>
            </tbody>
          </table>

          <div style={calloutStyle}>
            NDPS Act compliance for palliative opioids: JRCPL follows the palliative care provisions of the NDPS
            Act 1985 (§2, §9A, and NDPS Rules 2015). Prescriptions comply with maximum supply rules. Dispensing
            documented in narcotic register. Centre Head holds the narcotic licence.
          </div>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>7. Cross-Programme Clinical Governance</h3>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>7.1 MHCA Compliance by Programme</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>Programme</th><th style={tableHeadStyle}>Typical MHCA Category</th><th style={tableHeadStyle}>Review Requirement</th><th style={tableHeadStyle}>MHRB Notification</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>P1 Acute</td><td style={tableCellStyle}>§86 (voluntary); §98 (emergency); §89 if capacity absent</td><td style={tableCellStyle}>7-day (§89) or 14-day (§90)</td><td style={tableCellStyle}>§89: within 7 days; §98: within 24 hours</td></tr>
              <tr><td style={tableCellStyle}>P2 Psychiatric Rehab</td><td style={tableCellStyle}>§86; §89 if capacity absent</td><td style={tableCellStyle}>7-day (§89); 14-day (§90)</td><td style={tableCellStyle}>§89: within 7 days; §90 extension: within 7 days</td></tr>
              <tr><td style={tableCellStyle}>P3/P4 De-Addiction</td><td style={tableCellStyle}>§86 (majority); §98 for emergency</td><td style={tableCellStyle}>Not required for §86</td><td style={tableCellStyle}>§98: within 24 hours</td></tr>
              <tr><td style={tableCellStyle}>P5 Elderly/Dementia</td><td style={tableCellStyle}>§86; §89 common (dementia); §87 (minors)</td><td style={tableCellStyle}>7-day (§89); monthly minimum for long-term</td><td style={tableCellStyle}>§89: within 7 days; long-term continued admission: notify at each 30-day review</td></tr>
              <tr><td style={tableCellStyle}>P6 End of Life</td><td style={tableCellStyle}>§86; §89 (if capacity absent)</td><td style={tableCellStyle}>As per §89 schedule</td><td style={tableCellStyle}>§89: within 7 days</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>7.2 KPI Monitoring — All Programmes</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>KPI</th><th style={tableHeadStyle}>Target</th><th style={tableHeadStyle}>Measured By</th><th style={tableHeadStyle}>Frequency</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>ELOS documented at admission for all patients</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Head</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>MDT review conducted on schedule</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Head</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Outcome scales documented at specified intervals</td><td style={tableCellStyle}>≥95%</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Programme phase completion criteria documented</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Head</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Extension beyond standard duration — CD notified</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Per event</td></tr>
              <tr><td style={tableCellStyle}>P3 Alcohol: CIWA-Ar documented every 4 hrs during detox</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>Daily</td></tr>
              <tr><td style={tableCellStyle}>P4 Drug: UDS at admission, Day 30, Day 60, discharge</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Head</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>P5/P6: Monthly MDT and monthly family communication</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Head</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>P6 Advance care planning documented at programme entry</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Treating Psychiatrist</td><td style={tableCellStyle}>Per admission</td></tr>
              <tr><td style={tableCellStyle}>30-day readmission rate — all programmes</td><td style={tableCellStyle}>≤15% (De-addiction); ≤10% (Psychiatric)</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Monthly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>8. Related Documents</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>RC-03 — Discharge Planning &amp; Readiness SOP</li>
            <li>RC-04 — Against Medical Advice (AMA) Discharge SOP</li>
            <li>Adm-01 — Independent Voluntary Admission SOP</li>
            <li>Adm-04 — Capacity Assessment SOP</li>
            <li>Adm-05 — Emergency &amp; Involuntary Admission SOP</li>
            <li>Adm-03 — Admission Laboratory Investigations SOP</li>
          </ul>
        </div>

        <p className="text-muted text-center" style={{ fontSize: "0.85rem" }}>
          This document is the property of Jagrutii Rehab Centre Pvt. Ltd. Reproduction without written
          authorisation is prohibited.
        </p>
      </div>
    </Fragment>
  );
});

export default Adm06ClinicalCarePathwaysSOP;
