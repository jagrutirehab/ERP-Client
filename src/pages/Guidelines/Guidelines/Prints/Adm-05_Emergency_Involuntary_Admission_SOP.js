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

const Adm05EmergencyInvoluntarySOP = forwardRef((props, ref) => {
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
            Emergency &amp; Involuntary Admission SOP
          </h2>
          <p className="text-center text-muted">
            Adn-05 | Version 2.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>Adn-05</td></tr>
            <tr><td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>Version 2.0</td></tr>
            <tr><td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td></tr>
            <tr><td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td></tr>
            <tr><td style={tableHeadStyle}>Vertical / Scope</td><td style={tableCellStyle}>All Four Verticals — All Centres</td></tr>
            <tr><td style={tableHeadStyle}>Category</td><td style={tableCellStyle}>Clinical Governance | Patient Rights | Legal Compliance | Emergency Management</td></tr>
            <tr><td style={tableHeadStyle}>Prepared / Approved By</td><td style={tableCellStyle}>Dr. Amar Shinde | Founder &amp; Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Regulatory Basis</td><td style={tableCellStyle}>MHCA 2017 (Sec. 3, 5-12, 14, 87-91, 94, 97, 98, 99, 100, 103, 115); NDPS Act 1985; NABH PCC 1, PCC 5, COP 1</td></tr>
            <tr><td style={tableHeadStyle}>NABH Chapter</td><td style={tableCellStyle}>ACC | COP | ACE | RM</td></tr>
            <tr><td style={tableHeadStyle}>Classification</td><td style={tableCellStyle}><strong>CONFIDENTIAL — Internal Clinical Governance Document</strong></td></tr>
          </tbody>
        </table>

        <div style={warnStyle}>
          ⚠ CRITICAL LEGAL NOTICE: This SOP governs the most legally sensitive clinical decisions made at any
          JRCPL centre. Every emergency and involuntary admission carries statutory obligations under MHCA
          2017. Non-compliance may constitute a criminal offence under Section 99 of the Act. All staff must
          be trained, assessed, and signed off on this SOP before independent practice.
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">1. Purpose</h3>
          <p>
            This SOP defines the complete clinical, legal, and administrative framework for managing emergency
            psychiatric admissions and involuntary (supported) admissions at JRCPL across all 18 centres and
            all four clinical verticals.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">2. Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All patients presenting to any JRCPL centre in a psychiatric emergency</li>
            <li>All patients for whom involuntary (supported) admission under MHCA 2017 is being considered</li>
            <li>All clinical staff: psychiatrists, medical officers, nursing staff, counsellors, social workers</li>
            <li>Administrative and management staff responsible for documentation and legal compliance</li>
            <li>Security staff involved in patient management during emergencies</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">3. Admission Categories &amp; Legal Basis</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Admission Category</th><th style={tableHeadStyle}>Legal Basis</th><th style={tableHeadStyle}>Core Criteria</th><th style={tableHeadStyle}>Max Initial Period</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Voluntary (Independent)</td><td style={tableCellStyle}>MHCA Sec. 87</td><td style={tableCellStyle}>Patient aged 18+ with capacity; gives informed consent voluntarily</td><td style={tableCellStyle}>Indefinite — patient may request discharge at any time</td></tr>
              <tr><td style={tableCellStyle}>Supported</td><td style={tableCellStyle}>MHCA Sec. 89</td><td style={tableCellStyle}>Patient lacks capacity; NR consent + one psychiatrist &amp; one MH Professional certificates</td><td style={tableCellStyle}>Subject to MHRB review; reviewed regularly</td></tr>
              <tr><td style={tableCellStyle}>Involuntary</td><td style={tableCellStyle}>MHCA Sec. 90</td><td style={tableCellStyle}>Patient refuses; meets risk criteria; two psychiatrist certificates</td><td style={tableCellStyle}>Initially 30 days; renewal requires MHRB review</td></tr>
              <tr><td style={tableCellStyle}>Emergency (72-hour)</td><td style={tableCellStyle}>MHCA Sec. 97-98</td><td style={tableCellStyle}>Immediate risk of serious harm; no prior consent process possible</td><td style={tableCellStyle}>72 hours from certificate signing — hard deadline</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">4. Key Definitions</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Term</th><th style={tableHeadStyle}>Definition</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Nominated Representative (NR)</td><td style={tableCellStyle}>Person nominated by patient under MHCA Sec. 14 to make decisions when capacity is absent. May be family, guardian, or legal representative. Not automatically the nearest relative.</td></tr>
              <tr><td style={tableCellStyle}>MHRB</td><td style={tableCellStyle}>Mental Health Review Board — statutory body under MHCA Sec. 73 constituted in each district. Reviews involuntary admissions; safeguards patient rights.</td></tr>
              <tr><td style={tableCellStyle}>Advance Directive</td><td style={tableCellStyle}>Legal document under MHCA Sec. 5-12 specifying preferred or refused treatments when capacity is absent. Must be checked before every admission. Legally binding unless overridden by MHRB.</td></tr>
              <tr><td style={tableCellStyle}>Emergency Admission Certificate (EAC)</td><td style={tableCellStyle}>JRCPL Form EAC-001 — signed by the treating psychiatrist to authorise 72-hour emergency admission. Clock starts from time of signature.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">5. Part A — Emergency Admission (MHCA Sec. 94, 98)</h3>

          <h4 className="font-semibold mt-3 mb-1">5.1 Criteria for Emergency Admission</h4>
          <div style={warnStyle}>
            ⚠ The patient must have, or appear to have, a mental illness AND pose an immediate risk of serious
            harm to themselves or others OR be in immediate danger of serious deterioration AND the standard
            admission process (obtaining consent) is not practicable in the circumstances.
          </div>

          <h4 className="font-semibold mt-3 mb-1">5.2 Emergency Admission — Step-by-Step Protocol</h4>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Step</th><th style={tableHeadStyle}>Action</th><th style={tableHeadStyle}>Responsible</th><th style={tableHeadStyle}>Time Target</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>1</td><td style={tableCellStyle}>Immediate safety — escort patient to safe evaluation area; remove dangerous objects; protect other patients and staff</td><td style={tableCellStyle}>Nursing + Security</td><td style={tableCellStyle}>Immediately</td></tr>
              <tr><td style={tableCellStyle}>2</td><td style={tableCellStyle}>Duty psychiatrist or on-call psychiatrist called IMMEDIATELY</td><td style={tableCellStyle}>Reception / Nursing</td><td style={tableCellStyle}>Within 5 minutes</td></tr>
              <tr><td style={tableCellStyle}>3</td><td style={tableCellStyle}>Rapid clinical assessment by psychiatrist — confirm emergency criteria met; assess immediate risk</td><td style={tableCellStyle}>Psychiatrist / Psychologist / MSW</td><td style={tableCellStyle}>Within 15 minutes</td></tr>
              <tr><td style={tableCellStyle}>4</td><td style={tableCellStyle}>Medical stabilisation — vitals, BSL; IV access if required; emergency medication if clinically indicated</td><td style={tableCellStyle}>Medical Officer + Nursing</td><td style={tableCellStyle}>Immediately</td></tr>
              <tr><td style={tableCellStyle}>5</td><td style={tableCellStyle}>Advance Directive checked — even in emergency, if known AD exists it must be considered</td><td style={tableCellStyle}>Psychiatrist / Psychologist / MSW</td><td style={tableCellStyle}>As soon as practicable</td></tr>
              <tr><td style={tableCellStyle}>6</td><td style={tableCellStyle}>Emergency Admission Certificate (EAC-001) signed by psychiatrist — 72-hour clock starts NOW</td><td style={tableCellStyle}>Psychiatrist</td><td style={tableCellStyle}>Before formal admission</td></tr>
              <tr><td style={tableCellStyle}>7</td><td style={tableCellStyle}>Ward admission completed; wristband applied; nursing assessment initiated</td><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>Within 30 minutes of EAC signing</td></tr>
              <tr><td style={tableCellStyle}>8</td><td style={tableCellStyle}>MHRB notified in writing — ideally within 24 hours of admission</td><td style={tableCellStyle}>Grievance Officer</td><td style={tableCellStyle}>Within 24 hours</td></tr>
              <tr><td style={tableCellStyle}>9</td><td style={tableCellStyle}>Family / NR contacted and informed of admission, status, and patient rights</td><td style={tableCellStyle}>Psychiatrist / Psychologist / MSW</td><td style={tableCellStyle}>Within 2 hours</td></tr>
              <tr><td style={tableCellStyle}>10</td><td style={tableCellStyle}>Patient informed of legal status, rights, and reason for emergency admission in language they understand</td><td style={tableCellStyle}>Psychiatrist / Psychologist / MSW</td><td style={tableCellStyle}>At earliest practicable moment</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">5.3 The 72-Hour Clock — Non-Negotiable</h4>
          <div style={calloutStyle}>
            The 72-hour period begins at the time the EAC-001 is signed — NOT from the patient's time of arrival.
            The Grievance Officer maintains a live 72-hour watch-list. An alert is generated 12 hours before the
            window closes. Continued detention without legal basis after 72 hours = unlawful detention (Sec. 99).
          </div>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Timepoint</th><th style={tableHeadStyle}>Mandatory Action</th><th style={tableHeadStyle}>Responsible</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>At EAC signing</td><td style={tableCellStyle}>72-hour clock recorded in EMR and on physical watch-list; Grievance Officer notified</td><td style={tableCellStyle}>Psychiatrist / Grievance Officer</td></tr>
              <tr><td style={tableCellStyle}>Within 24 hours</td><td style={tableCellStyle}>MHRB written notification dispatched; acknowledgement filed</td><td style={tableCellStyle}>Grievance Officer</td></tr>
              <tr><td style={tableCellStyle}>T-12 hours</td><td style={tableCellStyle}>Psychiatrist alerted; clinical review conducted; decision made on pathway</td><td style={tableCellStyle}>Grievance Officer + Psychiatrist</td></tr>
              <tr><td style={tableCellStyle}>At 72 hours</td><td style={tableCellStyle}>Transition to: (A) Sec. 86 voluntary, OR (B) Sec. 89 supported, OR (C) Sec. 90 involuntary, OR (D) discharge.</td><td style={tableCellStyle}>Treating Psychiatrist</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">5.4 Extension Beyond 72 Hours</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Extension requires a SEPARATE psychiatric evaluation confirming ongoing risk criteria.</li>
            <li>A second certificate from an independent psychiatrist (not employed by JRCPL) must be obtained.</li>
            <li>MHRB must be formally notified of extension — written communication filed.</li>
            <li>The transition to a formal admission category (Sec. 89 or 90) should be pursued simultaneously.</li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">6. Part B — Supported Admission (MHCA Sec. 89)</h3>

          <h4 className="font-semibold mt-3 mb-1">6.1 Criteria</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Patient has mental illness (formally assessed)</li>
            <li>Patient lacks decision-making capacity (formally assessed using Cap-Form-001)</li>
            <li>NR is available and willing to provide consent</li>
            <li>Two JRCPL psychiatrist certificates confirm the criteria are met</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1">6.2 Step-by-Step Protocol</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>The treating psychiatrist formally assesses and documents loss of capacity (Cap-Form-001).</li>
            <li>NR identified — verify NR status; if no NR, escalate to Clinical Director.</li>
            <li>Advance Directive checked — if AD addresses this situation, it must be considered.</li>
            <li>NR provided full information and signed the Supported Admission Consent Form (SA-F-001).</li>
            <li>Second psychiatrist certificate obtained — independent assessment confirming criteria.</li>
            <li>Patient informed and their assent sought (even without capacity).</li>
            <li>MHRB notified if admission extends beyond 30 days.</li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">7. Part C — Involuntary Admission (MHCA Sec. 90)</h3>

          <h4 className="font-semibold mt-3 mb-1">7.1 Criteria — ALL must be met</h4>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Documentation Required</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Patient has mental illness</td><td style={tableCellStyle}>Diagnosis documented per MHCA Sec. 3 — clinical assessment by treating psychiatrist</td></tr>
              <tr><td style={tableCellStyle}>Patient requires treatment</td><td style={tableCellStyle}>Clinical opinion that treatment is necessary and in the patient's best interest</td></tr>
              <tr><td style={tableCellStyle}>Patient lacks capacity OR refuses admission</td><td style={tableCellStyle}>Capacity assessment (Cap-Form-001) OR documented refusal with clinical context</td></tr>
              <tr><td style={tableCellStyle}>Patient poses risk to self or others</td><td style={tableCellStyle}>Risk assessment documented — specific, serious, and imminent risk; not vague or speculative</td></tr>
              <tr><td style={tableCellStyle}>No less restrictive alternative available</td><td style={tableCellStyle}>Alternatives considered and documented: outpatient, day programme, community treatment</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">7.2 Step-by-Step Protocol</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>The treating psychiatrist documents all five Sec. 90 criteria in detail in the EMR.</li>
            <li>Certificate 1 signed by treating (JRCPL) psychiatrist — MHCA Sec. 90 Certificate of Involuntary Admission (IA-F-001).</li>
            <li>Independent psychiatrist contacted — independent assessment conducted.</li>
            <li>Certificate 2 signed by independent psychiatrist — must be completed within 72 hours of Certificate 1.</li>
            <li>MHRB notified in writing within 7 days of admission — copies of both certificates attached.</li>
            <li>Patient informed of admission status, reason, rights, and right to appeal to MHRB.</li>
            <li>NR informed of admission, status, and rights — within 24 hours.</li>
          </ol>
          <div style={warnStyle}>
            ⚠ Dual psychiatrist certificates are NON-NEGOTIABLE for Sec. 90 involuntary admission. Admission on
            a single certificate beyond 72 hours is unlawful and constitutes criminal liability under Sec. 99.
          </div>

          <h4 className="font-semibold mt-3 mb-1">7.3 MHRB Compliance Timeline</h4>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Milestone</th><th style={tableHeadStyle}>Timeline</th><th style={tableHeadStyle}>Responsible</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>MHRB written notification of involuntary admission</td><td style={tableCellStyle}>Within 7 days of admission</td><td style={tableCellStyle}>Grievance Officer</td></tr>
              <tr><td style={tableCellStyle}>All admission documents submitted to MHRB</td><td style={tableCellStyle}>Within 7 days</td><td style={tableCellStyle}>Grievance Officer</td></tr>
              <tr><td style={tableCellStyle}>MHRB hearing — JRCPL clinical representative attends</td><td style={tableCellStyle}>As per MHRB schedule</td><td style={tableCellStyle}>Treating Psychiatrist / CD</td></tr>
              <tr><td style={tableCellStyle}>MHRB order compliance</td><td style={tableCellStyle}>Immediate upon receipt</td><td style={tableCellStyle}>Clinical Director</td></tr>
              <tr><td style={tableCellStyle}>30-day review of continued involuntary admission</td><td style={tableCellStyle}>Every 30 days</td><td style={tableCellStyle}>Treating Psychiatrist + MHRB</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">8. Patient Rights in Emergency / Involuntary Admission</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Right</th><th style={tableHeadStyle}>JRCPL Obligation</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Right to be informed of admission status and reason</td><td style={tableCellStyle}>Even in emergency — inform as soon as patient is able to receive information; document</td></tr>
              <tr><td style={tableCellStyle}>Right to legal representation</td><td style={tableCellStyle}>Patient and NR informed of right to legal counsel at any point; contact information provided</td></tr>
              <tr><td style={tableCellStyle}>Right to appeal to MHRB</td><td style={tableCellStyle}>Patient, NR, or legal counsel may apply to MHRB at any time; JRCPL facilitates — never obstructs</td></tr>
              <tr><td style={tableCellStyle}>Right to a second psychiatric opinion</td><td style={tableCellStyle}>Patient or NR may request independent psychiatric opinion; JRCPL facilitates this right</td></tr>
              <tr><td style={tableCellStyle}>Right to humane treatment and dignity</td><td style={tableCellStyle}>Restraint (if any) per MHCA Sec. 97 — minimum force, minimum duration, documented every 15 minutes; reviewed by psychiatrist every 4 hours</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">9. Restraint in Emergency — Legal Boundaries</h3>
          <div style={warnStyle}>
            ⚠ Physical restraint is a LAST RESORT under MHCA 2017. Permitted ONLY when there is imminent risk
            of serious harm AND no less restrictive intervention is effective. Restraint as punishment,
            convenience, or routine management is a criminal offence.
          </div>
          <ul className="list-disc pl-6 space-y-1">
            <li>De-escalation must always be attempted first — verbal, environmental, therapeutic</li>
            <li>Chemical restraint (emergency medication) is preferred over physical restraint where clinically indicated</li>
            <li>If physical restraint is used: written psychiatrist order required; least restrictive method; reviewed every 15 minutes; maximum 4 hours without fresh review</li>
            <li>Patient monitored continuously during restraint — vitals every 30 minutes</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">10. Roles &amp; Responsibilities</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Role</th><th style={tableHeadStyle}>Responsibility</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Treating Psychiatrist</td><td style={tableCellStyle}>Clinical decision authority for all admission categories; certificates; MHRB communications; family briefing</td></tr>
              <tr><td style={tableCellStyle}>On-Call Psychiatrist / RMO</td><td style={tableCellStyle}>Available 24/7 for emergency admissions; first responder when treating psychiatrist unavailable</td></tr>
              <tr><td style={tableCellStyle}>MSW / Nursing In-Charge</td><td style={tableCellStyle}>Safety management; first-line de-escalation; MHCA rights checklist; restraint monitoring; MHRB watch-list</td></tr>
              <tr><td style={tableCellStyle}>CM / Grievance Officer</td><td style={tableCellStyle}>MHRB notification; 72-hour watch-list; MHRB hearing preparation; patient rights documentation</td></tr>
              <tr><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Operational oversight of emergency; family communication; incident reporting; escalation to Clinical Director</td></tr>
              <tr><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Policy owner; approves all involuntary admissions; reviews all emergency and involuntary cases weekly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">11. KPI Monitoring</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>KPI</th><th style={tableHeadStyle}>Target</th><th style={tableHeadStyle}>Measured By</th><th style={tableHeadStyle}>Frequency</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Emergency Admission Certificate completed before formal admission</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Grievance Officer</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>MHRB notification within 24 hrs (emergency) / 7 days (involuntary)</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Grievance Officer</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>72-hour watch-list maintained in real time</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Grievance Officer</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Dual psychiatrist certificates for all Sec. 90 involuntary admissions</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Capacity assessment documented for all supported/involuntary admissions</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>All restraint episodes documented with 15-minute monitoring</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>Monthly</td></tr>
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

export default Adm05EmergencyInvoluntarySOP;
