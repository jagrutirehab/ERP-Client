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

const Adm01VoluntaryAdmissionSOP = forwardRef((props, ref) => {
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
            Independent (Voluntary) Admission SOP — MHCA 2017 Section 86 &amp; 87
          </h2>
          <p className="text-center text-muted">
            Adm-01 | Version 2.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
          <tbody>
            <tr><td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>Adm-01</td></tr>
            <tr><td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>Version 2.0</td></tr>
            <tr><td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td></tr>
            <tr><td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td></tr>
            <tr><td style={tableHeadStyle}>Vertical / Scope</td><td style={tableCellStyle}>All Four Verticals — All 18 Centres</td></tr>
            <tr><td style={tableHeadStyle}>Category</td><td style={tableCellStyle}>Clinical Governance | Patient Rights | Legal Compliance</td></tr>
            <tr><td style={tableHeadStyle}>Prepared By</td><td style={tableCellStyle}>Dr. Amar Shinde | Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Approved By</td><td style={tableCellStyle}>Dr. Amar Shinde | Founder &amp; Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Regulatory Basis</td><td style={tableCellStyle}>MHCA 2017 (Sec. 3, 5-12, 14, 18, 19, 21, 23, 86, 87); NABH ACC; Clinical Establishments Act 2010; IT Act 2000</td></tr>
            <tr><td style={tableHeadStyle}>NABH Chapter</td><td style={tableCellStyle}>ACC | COP | ACE | RM</td></tr>
            <tr><td style={tableHeadStyle}>Classification</td><td style={tableCellStyle}><strong>CONFIDENTIAL — Internal Clinical Governance Document</strong></td></tr>
          </tbody>
        </table>

        <div style={calloutStyle}>
          Independent (Voluntary) admission under MHCA 2017 is founded on informed consent and preserved
          autonomy. The patient is not a passive recipient of admission — they are an active, rights-bearing
          participant. Every step must reinforce dignity, transparency, and the patient's legal right to withdraw
          consent and request discharge.
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>1. Purpose</h3>
          <p>
            This SOP defines the mandatory clinical, legal, and administrative procedure for admitting a patient
            under Independent (Voluntary) Admission at Jagrutii Rehab Centre Pvt. Ltd. under Section 86 and
            Section 87 of the Mental Healthcare Act, 2017.
          </p>
          <p>
            It ensures that every voluntary admission is based on genuine, informed, and documented consent;
            that capacity is formally assessed; and that patient rights are upheld from first contact through to
            the post-admission orientation period.
          </p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>2. Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All patients presenting for voluntary admission across all 18 JRCPL centres</li>
            <li>All four clinical verticals</li>
            <li>All clinical and administrative staff involved in the admission process</li>
            <li>Patients aged 18 years and above with decision-making capacity (minors governed by Section 88 — see CL-01B)</li>
          </ul>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>3. Definitions</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Term</th><th style={tableHeadStyle}>Definition</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Independent / Voluntary Admission</td><td style={tableCellStyle}>Admission under MHCA 2017 Section 87 — patient aged 18+ with mental capacity who understands their condition and freely consents to admission and treatment.</td></tr>
              <tr><td style={tableCellStyle}>Mental Capacity</td><td style={tableCellStyle}>The legal and clinical ability to: (a) understand information about treatment, (b) retain it, (c) weigh it in the balance, (d) communicate a decision. Formal assessment is mandatory.</td></tr>
              <tr><td style={tableCellStyle}>Informed Consent</td><td style={tableCellStyle}>Consent given voluntarily, without coercion, after the patient has received and understood full information about diagnosis, proposed treatment, alternatives, risks, and right to refuse.</td></tr>
              <tr><td style={tableCellStyle}>Nominated Representative (NR)</td><td style={tableCellStyle}>A person nominated by the patient under MHCA 2017 Section 14 to make decisions on their behalf if capacity is lost. Nomination is voluntary but should be actively encouraged.</td></tr>
              <tr><td style={tableCellStyle}>Advance Directive</td><td style={tableCellStyle}>A legal document under MHCA 2017 Sections 5-12 specifying treatment preferences or refusals in advance. Must be checked before every admission.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>4. Legal Framework — MHCA 2017</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Section</th><th style={tableHeadStyle}>Subject</th><th style={tableHeadStyle}>Requirement</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Sec. 3</td><td style={tableCellStyle}>Mental illness definition</td><td style={tableCellStyle}>Diagnosis based on accepted medical standards; social deviance alone does not constitute mental illness — document explicitly</td></tr>
              <tr><td style={tableCellStyle}>Sec. 5-12</td><td style={tableCellStyle}>Advance Directives</td><td style={tableCellStyle}>Must be checked at every admission; if valid AD exists, it is legally binding unless overridden by MHRB</td></tr>
              <tr><td style={tableCellStyle}>Sec. 14</td><td style={tableCellStyle}>Right to Nomination</td><td style={tableCellStyle}>Patient must be offered the opportunity to nominate a representative; offer and response must be documented</td></tr>
              <tr><td style={tableCellStyle}>Sec. 18-19</td><td style={tableCellStyle}>Right to treatment &amp; equality</td><td style={tableCellStyle}>Admission must not be influenced by financial status, caste, gender, religion, or social standing</td></tr>
              <tr><td style={tableCellStyle}>Sec. 23</td><td style={tableCellStyle}>Confidentiality</td><td style={tableCellStyle}>Patient information shared only with lawfully authorised persons; family access requires patient consent</td></tr>
              <tr><td style={tableCellStyle}>Sec. 87</td><td style={tableCellStyle}>Voluntary admission</td><td style={tableCellStyle}>Patient may be admitted voluntarily and retains right to request discharge at any time</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>5. Pre-Admission Process</h3>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.1 First Contact &amp; Initial Triage</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Reception or admissions coordinator receives the patient/family and ascertains nature of presentation, urgency, and admission category.</li>
            <li>Pre-Admission Screening Checklist (ADM-F-001) initiated — vitals, BSL, ECG if indicated.</li>
            <li>If a patient meets any Admission Rejection Criteria (ADM-002) — do NOT proceed to admission; refer to the appropriate facility.</li>
            <li>If medically stable — proceed to clinical assessment.</li>
          </ol>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.2 Clinical Assessment by Treating Psychiatrist</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Assessment Domain</th><th style={tableHeadStyle}>Content</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Chief complaint &amp; HPI</td><td style={tableCellStyle}>Onset, duration, triggers, severity, prior episodes, prior treatment</td></tr>
              <tr><td style={tableCellStyle}>Mental Status Examination (MSE)</td><td style={tableCellStyle}>Full MSE documented — appearance, behaviour, speech, mood, affect, thought, perception, cognition, insight, judgement</td></tr>
              <tr><td style={tableCellStyle}>Capacity Assessment</td><td style={tableCellStyle}>Formal capacity assessment using CAP-F-001 — four domains tested and documented</td></tr>
              <tr><td style={tableCellStyle}>Risk Assessment</td><td style={tableCellStyle}>C-SSRS (suicide), HCR-20 or equivalent (violence risk) — documented and risk level classified</td></tr>
              <tr><td style={tableCellStyle}>Advance Directive check</td><td style={tableCellStyle}>Registrar searched; if AD found — reviewed and filed; acknowledged in clinical note</td></tr>
              <tr><td style={tableCellStyle}>NR check / offer</td><td style={tableCellStyle}>Existing NR verified; if none — patient offered opportunity to nominate; decision documented</td></tr>
              <tr><td style={tableCellStyle}>Physical examination</td><td style={tableCellStyle}>Vital signs, neurological screen, relevant systemic examination; baseline investigations ordered</td></tr>
            </tbody>
          </table>

          <div style={calloutStyle}>
            If capacity assessment reveals the patient LACKS decision-making capacity, this SOP must be STOPPED.
            The admission must be processed under Supported Admission (CL-01B — MHCA Sec. 89) with appropriate
            NR consent.
          </div>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>6. Admission Consent Process</h3>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>6.1 Information Disclosure — Mandatory Before Consent</h4>
          <p>The treating psychiatrist must personally explain (in language the patient understands):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Their diagnosis and clinical formulation</li>
            <li>Proposed treatment plan: medications, psychological therapies, investigations</li>
            <li>Expected duration of stay and treatment milestones</li>
            <li>Alternatives to admission and their relative risks and benefits</li>
            <li>Centre rules, restrictions, and daily routine</li>
            <li>Right to refuse any specific treatment even while admitted</li>
            <li>Right to request discharge at any time (with clinical implications explained)</li>
            <li>Confidentiality policy — what is shared with family and under what conditions</li>
            <li>Grievance redressal process (CL-05)</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>6.2 Consent Documentation</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Patient signs JRCPL Admission Consent Form (ADM-F-002) — voluntarily, without coercion.</li>
            <li>If a patient cannot sign (physical disability) — thumb impression with two witnesses is acceptable.</li>
            <li>Psychiatrist countersigns confirming consent was given voluntarily after full disclosure.</li>
            <li>Signed form uploaded to EMR immediately.</li>
            <li>Copy offered to patients (mandatory under MHCA 2017 Sec. 21).</li>
          </ol>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>7. Admission Execution</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Step</th><th style={tableHeadStyle}>Action</th><th style={tableHeadStyle}>Responsible</th><th style={tableHeadStyle}>Timeframe</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>1</td><td style={tableCellStyle}>Patient registration — unique JRCPL ID assigned</td><td style={tableCellStyle}>Centre Manager / Admissions Coordinator</td><td style={tableCellStyle}>At arrival</td></tr>
              <tr><td style={tableCellStyle}>2</td><td style={tableCellStyle}>Identity verification — government photo ID documented</td><td style={tableCellStyle}>Centre Manager / Admissions Coordinator</td><td style={tableCellStyle}>At arrival</td></tr>
              <tr><td style={tableCellStyle}>3</td><td style={tableCellStyle}>Financial Responsibility Agreement signed (CL-08)</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Before admission</td></tr>
              <tr><td style={tableCellStyle}>4</td><td style={tableCellStyle}>Ward assignment — appropriate ward confirmed per clinical need and gender</td><td style={tableCellStyle}>CM / MSW / Nursing In-Charge</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>5</td><td style={tableCellStyle}>Belongings inventory — patient belongings recorded; prohibited items removed per SOP</td><td style={tableCellStyle}>MSW / Nursing In-Charge</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>6</td><td style={tableCellStyle}>Patient orientation — ward orientation conducted; rights booklet provided</td><td style={tableCellStyle}>Assigned Psychologist / Nurse</td><td style={tableCellStyle}>Within 2 hours</td></tr>
              <tr><td style={tableCellStyle}>7</td><td style={tableCellStyle}>Patient wristband applied with name, JRCPL ID, admission date, and allergy status</td><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>At admission</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>7.1 Post-Admission Clinical Milestones</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Timeframe</th><th style={tableHeadStyle}>Requirement</th><th style={tableHeadStyle}>Responsible</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Within 4 hours</td><td style={tableCellStyle}>Provisional diagnosis and initial management plan in EMR</td><td style={tableCellStyle}>Treating Psychiatrist / Psychologist</td></tr>
              <tr><td style={tableCellStyle}>Within 24 hours</td><td style={tableCellStyle}>Biopsychosocial history by psychologist (Form 1)</td><td style={tableCellStyle}>Psychologist</td></tr>
              <tr><td style={tableCellStyle}>Within 48 hours</td><td style={tableCellStyle}>MSE by psychologist (Form 2)</td><td style={tableCellStyle}>Psychologist</td></tr>
              <tr><td style={tableCellStyle}>Within 72 hours</td><td style={tableCellStyle}>Formal Treatment Plan — goals, interventions, expected LOS, discharge criteria</td><td style={tableCellStyle}>MDT</td></tr>
              <tr><td style={tableCellStyle}>Within 7 days</td><td style={tableCellStyle}>First family update — psychologist or social worker</td><td style={tableCellStyle}>Psychologist / MSW</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>8. Patient Rights During Voluntary Admission</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Right</th><th style={tableHeadStyle}>How JRCPL Ensures This</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Right to information about treatment</td><td style={tableCellStyle}>Explained at admission; consent form documents this; rights booklet provided</td></tr>
              <tr><td style={tableCellStyle}>Right to refuse any specific treatment</td><td style={tableCellStyle}>Refusal documented in EMR; patient cannot be forced</td></tr>
              <tr><td style={tableCellStyle}>Right to request discharge at any time</td><td style={tableCellStyle}>Processed per RC-03 (planned) or RC-04 (AMA); voluntary patient with capacity may not be detained</td></tr>
              <tr><td style={tableCellStyle}>Right to confidentiality</td><td style={tableCellStyle}>Family access to clinical information requires patient consent; governed by DG-01 and DG-02</td></tr>
              <tr><td style={tableCellStyle}>Right to nominate a representative</td><td style={tableCellStyle}>Offered at admission; documented whether accepted or declined</td></tr>
              <tr><td style={tableCellStyle}>Right to make an Advance Directive</td><td style={tableCellStyle}>Patient informed of AD rights; existing ADs checked and filed</td></tr>
              <tr><td style={tableCellStyle}>Right to grievance redressal</td><td style={tableCellStyle}>Grievance process explained; complaint box accessible; CL-05 applies</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>9. EMR Gate — Documentation Checklist</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Item</th><th style={tableHeadStyle}>Form</th><th style={tableHeadStyle}>Responsible</th><th style={tableHeadStyle}>Timeframe</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Pre-admission screening completed</td><td style={tableCellStyle}>ADM-F-001</td><td style={tableCellStyle}>Admissions Coord.</td><td style={tableCellStyle}>Before admission</td></tr>
              <tr><td style={tableCellStyle}>Capacity assessment completed</td><td style={tableCellStyle}>EMR</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>Before consent</td></tr>
              <tr><td style={tableCellStyle}>Advance Directive checked</td><td style={tableCellStyle}>EMR note</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>Before consent</td></tr>
              <tr><td style={tableCellStyle}>NR nomination offered and outcome documented</td><td style={tableCellStyle}>EMR note</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>Information disclosure documented</td><td style={tableCellStyle}>EMR clinical note</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>Before consent</td></tr>
              <tr><td style={tableCellStyle}>Admission consent form signed and uploaded</td><td style={tableCellStyle}>ADM-F-002</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>Financial Responsibility Agreement signed</td><td style={tableCellStyle}>FRA Form</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>Patient wristband applied</td><td style={tableCellStyle}>Nursing record</td><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>At admission</td></tr>
              <tr><td style={tableCellStyle}>Rights booklet provided and acknowledged</td><td style={tableCellStyle}>ADM-F-004</td><td style={tableCellStyle}>Assigned Nurse</td><td style={tableCellStyle}>Within 2 hours</td></tr>
              <tr><td style={tableCellStyle}>Initial clinical note and provisional diagnosis</td><td style={tableCellStyle}>EMR</td><td style={tableCellStyle}>Psychiatrist / Psychologist</td><td style={tableCellStyle}>Within 4 hours</td></tr>
              <tr><td style={tableCellStyle}>Medicine Prescription</td><td style={tableCellStyle}>EMR</td><td style={tableCellStyle}>Psychiatrist</td><td style={tableCellStyle}>Within 2 hours</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>10. KPI Monitoring</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>KPI</th><th style={tableHeadStyle}>Target</th><th style={tableHeadStyle}>Measured By</th><th style={tableHeadStyle}>Frequency</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Capacity assessment documented for all voluntary admissions</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Informed consent form signed before admission</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>NR nomination offered and documented</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Advance Directive check documented</td><td style={tableCellStyle}>100%</td><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly</td></tr>
              <tr><td style={tableCellStyle}>Formal Treatment Plan within 72 hours</td><td style={tableCellStyle}>&gt;= 95%</td><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Monthly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>11. Revision History</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Version</th><th style={tableHeadStyle}>Date</th><th style={tableHeadStyle}>Revised By</th><th style={tableHeadStyle}>Summary of Changes</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>1.0 (B-05)</td><td style={tableCellStyle}>15.03.2026</td><td style={tableCellStyle}>Dr. Amar Shinde</td><td style={tableCellStyle}>Initial version — B-05 series, Jagruti Rehabilitation Centre</td></tr>
              <tr><td style={tableCellStyle}>2.0 (Adm-01)</td><td style={tableCellStyle}>01.06.2026</td><td style={tableCellStyle}>Dr. Amar Shinde</td><td style={tableCellStyle}>Full rewrite — migrated to Adm series; MHCA 2017 legal framework; capacity protocol; post-admission milestones; rights table; EMR gate checklist</td></tr>
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

export default Adm01VoluntaryAdmissionSOP;
