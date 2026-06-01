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

const Adm02RejectionCriteriaSOP = forwardRef((props, ref) => {
  return (
    <Fragment>
      <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>
        <div className={`${props.heading} mb-4`}>
          <h1 className="text-3xl m-auto text-center font-extrabold mb-2">
            JAGRUTII REHAB CENTRE PVT. LTD.
          </h1>
          <p className="text-center mb-3">
            Clinical Excellence Framework — Standard Operating Procedure
          </p>
          <h2 className="text-2xl font-semibold text-center mb-1">
            Admission Rejection &amp; Referral Criteria SOP
          </h2>
          <p className="text-center text-muted">
            ADM-002 | Version 2.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
          <tbody>
            <tr><td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>ADM-002</td></tr>
            <tr><td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>Version 2.0</td></tr>
            <tr><td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td></tr>
            <tr><td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td></tr>
            <tr><td style={tableHeadStyle}>Vertical / Scope</td><td style={tableCellStyle}>All Four Verticals — All 18 Centres</td></tr>
            <tr><td style={tableHeadStyle}>Category</td><td style={tableCellStyle}>Clinical Safety | Triage | Medico-Legal Compliance</td></tr>
            <tr><td style={tableHeadStyle}>Prepared By</td><td style={tableCellStyle}>Dr. Amar Shinde | Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Approved By</td><td style={tableCellStyle}>Dr. Amar Shinde | Founder &amp; Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Regulatory Basis</td><td style={tableCellStyle}>MHCA 2017 (Sec. 19, 21, 29); Clinical Establishments (R&amp;R) Act 2010; NABH ACC Standards (5th Ed.); Maharashtra Clinical Establishments Rules 2018; NDPS Act 1985</td></tr>
            <tr><td style={tableHeadStyle}>NABH Chapter</td><td style={tableCellStyle}>ACC | COP | FMS | QM</td></tr>
            <tr><td style={tableHeadStyle}>Classification</td><td style={tableCellStyle}><strong>CONFIDENTIAL — Internal Clinical Governance Document</strong></td></tr>
          </tbody>
        </table>

        <div style={warnStyle}>
          ⚠ IF mandatory screening reveals ANY abnormal finding OR the patient exhibits clinical instability —
          DO NOT ADMIT. Immediately refer to the nearest General Hospital / ICU. Do not delay referral pending
          family consent or financial discussion.
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>1. Purpose &amp; Rationale</h3>
          <p>
            This SOP establishes the mandatory, evidence-informed criteria for refusing admission to Jagrutii
            Rehab Centre Pvt. Ltd. facilities, and the protocol for safe referral of rejected patients to
            appropriate medical facilities.
          </p>
          <p>
            JRCPL centres are psychiatric rehabilitation facilities — not acute medical hospitals. They do not
            have on-site ICU, ventilator support, or full surgical capability. This SOP protects the patient,
            the clinical team, and the organisation.
          </p>
          <p>This version (v2.0) consolidates and supersedes all prior versions of this document.</p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>2. Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All staff involved in the admissions process: psychiatrists, medical officers, nursing staff, admissions coordinators, reception staff</li>
            <li>All four verticals: Psychiatric Care, De-Addiction, Elderly Care, Child &amp; Adolescent Psychiatry</li>
            <li>All admission modalities: direct walk-in, ambulance/emergency transfer, family-referred, online/telephonic triage, and inter-facility transfer</li>
            <li>24 hours a day, 7 days a week, including weekends and public holidays</li>
          </ul>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>3. Mandatory Pre-Admission Screening</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Screening</th><th style={tableHeadStyle}>Indication</th><th style={tableHeadStyle}>Trigger for Rejection / Further Action</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>BSL — Blood Sugar Level</td><td style={tableCellStyle}>ALL patients — universal, no exceptions</td><td style={tableCellStyle}>BSL &lt; 60 or &gt; 400 mg/dL — refer for stabilisation before admission</td></tr>
              <tr><td style={tableCellStyle}>Vitals — BP, HR, RR, SpO2, Temp</td><td style={tableCellStyle}>ALL patients — universal</td><td style={tableCellStyle}>SpO2 &lt; 92%, HR &gt; 130 or &lt; 50, BP &lt; 90/60 or &gt; 180/110, RR &gt; 24 — refer immediately</td></tr>
              <tr><td style={tableCellStyle}>ECG — Electrocardiogram</td><td style={tableCellStyle}>Age &gt; 40, cardiac history, altered sensorium, suspected intoxication, chest pain, collapse</td><td style={tableCellStyle}>Abnormal ECG (QTc &gt; 450ms, ST changes, AF, blocks) — cardiologist review required before admission</td></tr>
              <tr><td style={tableCellStyle}>GCS — Glasgow Coma Scale</td><td style={tableCellStyle}>Any altered consciousness</td><td style={tableCellStyle}>GCS &lt; 15 — refer to emergency facility</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>4. Admission Rejection Criteria</h3>
          <p>Admission MUST be refused when any of the following criteria are present. This list must be applied without exception.</p>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>Category A — Clinical Instability</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>#</th><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Action</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>A1</td><td style={tableCellStyle}>Drowsy, semi-conscious, or unconscious patient (GCS &lt; 15)</td><td style={tableCellStyle}>Emergency referral — ambulance if required</td></tr>
              <tr><td style={tableCellStyle}>A2</td><td style={tableCellStyle}>Abnormal vital signs: hypotension (SBP &lt; 90), tachycardia (HR &gt; 130), hypoxia (SpO2 &lt; 92%), fever &gt; 39.5C with instability</td><td style={tableCellStyle}>Emergency referral</td></tr>
              <tr><td style={tableCellStyle}>A3</td><td style={tableCellStyle}>Clinically critical patient — any acute life-threatening condition</td><td style={tableCellStyle}>Emergency referral</td></tr>
              <tr><td style={tableCellStyle}>A4</td><td style={tableCellStyle}>Patient requiring ICU monitoring, ventilatory support, or surgical intervention</td><td style={tableCellStyle}>Emergency referral</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>Category B — Medical Risk Conditions</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>#</th><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Action</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>B1</td><td style={tableCellStyle}>Severe intoxication WITH jaundice / known liver disease / suspected overdose / suspected poisoning</td><td style={tableCellStyle}>Emergency referral — liver / toxicology workup required</td></tr>
              <tr><td style={tableCellStyle}>B2</td><td style={tableCellStyle}>Uncontrolled diabetes — BSL &lt; 60 or &gt; 400 mg/dL on testing</td><td style={tableCellStyle}>Refer for medical stabilisation; re-assess once normalised</td></tr>
              <tr><td style={tableCellStyle}>B3</td><td style={tableCellStyle}>Cardiac risk — abnormal ECG findings OR active chest pain or palpitations</td><td style={tableCellStyle}>Cardiology review at general hospital; JRCPL admission only after clearance</td></tr>
              <tr><td style={tableCellStyle}>B4</td><td style={tableCellStyle}>Severe dehydration OR suspected electrolyte imbalance</td><td style={tableCellStyle}>IV fluid stabilisation at general hospital first</td></tr>
              <tr><td style={tableCellStyle}>B5</td><td style={tableCellStyle}>Active seizures OR uncontrolled epilepsy (seizure in last 24 hours without established anti-epileptic regimen)</td><td style={tableCellStyle}>Emergency neurology referral</td></tr>
              <tr><td style={tableCellStyle}>B6</td><td style={tableCellStyle}>Active acute infection requiring IV antibiotics, surgical drainage, or hospitalisation</td><td style={tableCellStyle}>General hospital admission first</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>Category C — De-Addiction Specific</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>#</th><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Action</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>C1</td><td style={tableCellStyle}>Severe alcohol withdrawal with CIWA-Ar score &gt; 15 AND unstable vitals</td><td style={tableCellStyle}>Medical detox unit / general hospital; return to JRCPL after stabilisation</td></tr>
              <tr><td style={tableCellStyle}>C2</td><td style={tableCellStyle}>Suspected opioid overdose — pinpoint pupils, respiratory depression, unconsciousness</td><td style={tableCellStyle}>Emergency: naloxone + ambulance; do not admit</td></tr>
              <tr><td style={tableCellStyle}>C3</td><td style={tableCellStyle}>Known or suspected benzodiazepine overdose with altered sensorium</td><td style={tableCellStyle}>Emergency referral</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>Category D — Geriatric Specific</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>#</th><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Action</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>D1</td><td style={tableCellStyle}>Acute medical complaint in elderly patient (sudden onset confusion, chest pain, fall with suspected fracture)</td><td style={tableCellStyle}>Emergency general hospital referral</td></tr>
              <tr><td style={tableCellStyle}>D2</td><td style={tableCellStyle}>Sudden deterioration in consciousness or mobility</td><td style={tableCellStyle}>Emergency referral</td></tr>
              <tr><td style={tableCellStyle}>D3</td><td style={tableCellStyle}>High fall risk with unstable medical condition — unable to maintain safe mobility without acute medical intervention</td><td style={tableCellStyle}>Stabilise medically; reassess for JRCPL suitability</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>Category E — Administrative &amp; Legal</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={tableHeadStyle}>#</th><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Action</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>E1</td><td style={tableCellStyle}>Family / legally responsible party refuses mandatory consent or required documentation</td><td style={tableCellStyle}>Cannot admit; document refusal; advise legal pathway</td></tr>
              <tr><td style={tableCellStyle}>E2</td><td style={tableCellStyle}>Patient identity cannot be verified — no valid government photo ID and no legally responsible party identifiable</td><td style={tableCellStyle}>Cannot admit; document; refer to DMHB / SMHA if patient requires urgent care</td></tr>
              <tr><td style={tableCellStyle}>E3</td><td style={tableCellStyle}>Patient is a minor (&lt; 18 years) without parent / legal guardian present or reachable</td><td style={tableCellStyle}>Refer to paediatric emergency if acutely unwell; cannot complete admission without guardian</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>5. Mandatory Referral Protocol</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Step</th><th style={tableHeadStyle}>Action</th><th style={tableHeadStyle}>Responsible</th><th style={tableHeadStyle}>Timeline</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>1</td><td style={tableCellStyle}>Duty doctor informed immediately</td><td style={tableCellStyle}>Reception / Nursing</td><td style={tableCellStyle}>Immediately</td></tr>
              <tr><td style={tableCellStyle}>2</td><td style={tableCellStyle}>Rejection reason documented in Admission Rejection Register with patient name, date, time, criterion met, staff name</td><td style={tableCellStyle}>Duty Doctor + Nursing</td><td style={tableCellStyle}>Within 15 minutes</td></tr>
              <tr><td style={tableCellStyle}>3</td><td style={tableCellStyle}>Referral letter issued — signed by duty doctor; includes clinical summary, rejection reason, vital signs, BSL, ECG result</td><td style={tableCellStyle}>Duty Doctor</td><td style={tableCellStyle}>Before patient leaves</td></tr>
              <tr><td style={tableCellStyle}>4</td><td style={tableCellStyle}>Nearest appropriate facility identified — government hospital / ICU / emergency department; contact confirmed</td><td style={tableCellStyle}>Duty Doctor / Centre Manager</td><td style={tableCellStyle}>Within 15 minutes</td></tr>
              <tr><td style={tableCellStyle}>5</td><td style={tableCellStyle}>Ambulance arranged if patient cannot travel independently or safely</td><td style={tableCellStyle}>Centre Manager / Nursing</td><td style={tableCellStyle}>Immediately for critical cases</td></tr>
              <tr><td style={tableCellStyle}>6</td><td style={tableCellStyle}>Family / NR counselled — reason for rejection, what to do, when to return for reassessment</td><td style={tableCellStyle}>Duty Doctor</td><td style={tableCellStyle}>Before patient leaves</td></tr>
              <tr><td style={tableCellStyle}>7</td><td style={tableCellStyle}>Incident Report filed if case involves life-threatening condition, family aggression, or any unusual circumstance</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Within 4 hours</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>6. Re-Admission Pathway</h3>
          <p>Following medical stabilisation at a general hospital or higher-level facility, the patient may return for JRCPL re-assessment provided:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Written discharge summary from treating physician confirming medical stability</li>
            <li>All vital parameters within acceptable clinical limits</li>
            <li>Abnormal investigation findings (BSL, ECG) resolved and within normal limits</li>
            <li>Seizure-free for minimum 48 hours (if rejection criterion was B5)</li>
            <li>Withdrawal safely managed (if rejection criterion was C1)</li>
            <li>Consent and documentation requirements fully met</li>
          </ul>
          <div style={calloutStyle}>
            The original rejection does not prejudice re-admission. Staff must not treat returning patients as
            unwelcome. A fresh clinical assessment is conducted as if the patient is presenting for the first time.
          </div>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>7. MHCA 2017 — Non-Discrimination Clause</h3>
          <p>
            MHCA 2017 Section 19 prohibits discrimination in access to mental healthcare. Admission rejection
            must be based SOLELY on the clinical and administrative criteria defined in Section 4. Rejection on
            grounds of caste, religion, gender, sexual orientation, financial status, or disability (where the
            facility is clinically equipped to handle the case) is unlawful and constitutes a patient rights
            violation.
          </p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>8. KPI Monitoring</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>KPI</th><th style={tableHeadStyle}>Target</th><th style={tableHeadStyle}>Measured By</th><th style={tableHeadStyle}>Frequency</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Pre-admission screening checklist completed for all presentations</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Admissions Coordinator</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Rejection reason documented in Admission Rejection Register</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Referral letter issued for all rejected patients</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Duty Doctor</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Ambulance arranged for all critical rejections</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Rejection register reviewed by Clinical Director</td><td style={tableCellStyle}>Quarterly</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Quarterly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>9. Revision History</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Version</th><th style={tableHeadStyle}>Date</th><th style={tableHeadStyle}>Revised By</th><th style={tableHeadStyle}>Summary of Changes</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>1.0</td><td style={tableCellStyle}>Apr 2026</td><td style={tableCellStyle}>Dr. Amar Shinde</td><td style={tableCellStyle}>Initial version — Jagruti Rehabilitation Centre (two parallel versions)</td></tr>
              <tr><td style={tableCellStyle}>2.0</td><td style={tableCellStyle}>01.06.2026</td><td style={tableCellStyle}>Dr. Amar Shinde</td><td style={tableCellStyle}>Merged and rewritten — JRCPL standard; de-addiction and geriatric criteria added; mandatory referral protocol; re-admission pathway; MHCA non-discrimination clause</td></tr>
            </tbody>
          </table>
        </div>

        <p className="text-muted text-center" style={{ fontSize: "0.85rem" }}>
          This document is the property of Jagrutii Rehab Centre Pvt. Ltd. Any reproduction or distribution
          without written authorisation is prohibited.
        </p>
      </div>
    </Fragment>
  );
});

export default Adm02RejectionCriteriaSOP;
