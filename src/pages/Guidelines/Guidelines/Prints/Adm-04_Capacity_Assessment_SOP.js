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

const Adm04CapacityAssessmentSOP = forwardRef((props, ref) => {
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
            Decision-Making Capacity Assessment SOP
          </h2>
          <p className="text-center text-muted">
            Adm-04 | Version 1.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>Adm-04</td></tr>
            <tr><td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>Version 1.0</td></tr>
            <tr><td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td></tr>
            <tr><td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td></tr>
            <tr><td style={tableHeadStyle}>Vertical / Scope</td><td style={tableCellStyle}>All Four Verticals — All 18 Centres</td></tr>
            <tr><td style={tableHeadStyle}>Category</td><td style={tableCellStyle}>Clinical Governance | Patient Rights | Legal Compliance</td></tr>
            <tr><td style={tableHeadStyle}>Prepared / Approved By</td><td style={tableCellStyle}>Dr. Amar Shinde | Founder &amp; Clinical Director, JRCPL</td></tr>
            <tr><td style={tableHeadStyle}>Regulatory Basis</td><td style={tableCellStyle}>MHCA 2017 (Sec. 4, 86, 87, 88, 89, 90, 94, 95, 97, 98); NABH COP; NMC Code of Ethics; RCI Act 1992</td></tr>
            <tr><td style={tableHeadStyle}>Related Policy</td><td style={tableCellStyle}>JRCPL/GOV/CA/001 — Decision-Making Capacity Assessment Policy v2.0</td></tr>
            <tr><td style={tableHeadStyle}>Classification</td><td style={tableCellStyle}><strong>CONFIDENTIAL — Internal Clinical Governance Document</strong></td></tr>
          </tbody>
        </table>

        <div style={calloutStyle}>
          Every person is PRESUMED to have decision-making capacity under MHCA 2017 Section 4. Capacity must be
          proved absent through formal assessment — it cannot be assumed absent on the basis of diagnosis, age,
          appearance, behaviour, or any other characteristic. Capacity is decision-specific and time-specific.
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">1. Purpose</h3>
          <p>
            This SOP defines the mandatory step-by-step clinical procedure for assessing, documenting, and
            acting on decision-making capacity at JRCPL. It applies at every stage of the patient's care
            journey — not only at admission. It must be read alongside the Decision-Making Capacity Assessment
            Policy (JRCPL/GOV/CA/001 v2.0).
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">2. Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All patients at admission where voluntary consent cannot be immediately confirmed</li>
            <li>All patients before any significant treatment decision: new medication class, ECT under §95, detoxification protocol</li>
            <li>All patients under §89 Supported Admission — mandatory reassessment every 7 days</li>
            <li>All patients under §90 Supported Admission — mandatory reassessment every 14 days</li>
            <li>All patients when clinical status changes significantly</li>
            <li>All patients before discharge where admission was under §88, §89, or §90</li>
            <li>All patients when they or their NR challenges validity of admission or consent</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">3. Who Conducts the Assessment</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Role</th><th style={tableHeadStyle}>Assessment Authority</th><th style={tableHeadStyle}>Qualification</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Treating Psychiatrist</td><td style={tableCellStyle}>PRIMARY — all admission, treatment consent, §89/§90 decisions. Signs all certificates.</td><td style={tableCellStyle}>MBBS + MD/DNB Psychiatry; MCI/NMC registered</td></tr>
              <tr><td style={tableCellStyle}>Clinical Psychologist</td><td style={tableCellStyle}>SUPPORTING — psychometric data (MMSE, MoCA). Does not independently certify for admission.</td><td style={tableCellStyle}>M.Phil or PhD Clinical Psychology; RCI registered</td></tr>
              <tr><td style={tableCellStyle}>Psychiatric Social Worker</td><td style={tableCellStyle}>SUPPORTING — social history, family functioning data. Contributes to MDT.</td><td style={tableCellStyle}>Master's in Psychiatric Social Work; RCI registered</td></tr>
              <tr><td style={tableCellStyle}>Mental Health Nurse</td><td style={tableCellStyle}>OBSERVATIONAL — behaviour, orientation, communication. Supports documentation but does not certify.</td><td style={tableCellStyle}>BSc Nursing + post-basic psychiatric nursing qualification</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">4. Step-by-Step Capacity Assessment Procedure</h3>

          <h4 className="font-semibold mt-3 mb-1">Step 1 — Identify the trigger</h4>
          <p>Confirm that a capacity assessment is required for a specific decision. Document the specific decision being assessed — not a general capacity assessment.</p>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Trigger Category</th><th style={tableHeadStyle}>Examples</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Admission</td><td style={tableCellStyle}>Patient presenting for inpatient admission; voluntary consent cannot be confirmed</td></tr>
              <tr><td style={tableCellStyle}>Treatment decision</td><td style={tableCellStyle}>New medication class; ECT; detoxification; major procedural intervention</td></tr>
              <tr><td style={tableCellStyle}>Treatment refusal</td><td style={tableCellStyle}>Patient refuses recommended treatment; team questions whether refusal reflects capacity</td></tr>
              <tr><td style={tableCellStyle}>Mandatory periodic review</td><td style={tableCellStyle}>§89 every 7 days; §90 every 14 days; §87 at 30 days</td></tr>
              <tr><td style={tableCellStyle}>Significant clinical change</td><td style={tableCellStyle}>Psychosis onset/resolution; delirium; severe withdrawal; mania</td></tr>
              <tr><td style={tableCellStyle}>Discharge review</td><td style={tableCellStyle}>All §88, §89, §90 patients before discharge</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">Step 2 — Optimise conditions before assessing</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Choose the best time of day — avoid peak sedation, acute agitation, or night-time</li>
            <li>Ensure quiet, private space — free from disturbances and other patients</li>
            <li>Communicate in patient's preferred language — arrange interpreter if needed; document language used</li>
            <li>Manage acute symptoms first where clinically possible before assessing capacity</li>
            <li>Allow adequate time — never rush the assessment</li>
          </ul>

          <h4 className="font-semibold mt-3 mb-1">Step 3 — Conduct the four-point capacity test (MHCA 2017 §4)</h4>
          <div style={warnStyle}>
            ⚠ All four criteria must be individually assessed and individually documented. A capacity note that
            only states "patient lacks capacity" without documenting the outcome of each criterion is legally
            insufficient under MHCA 2017.
          </div>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Criterion</th><th style={tableHeadStyle}>Question / Method / Documentation</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>1 — Understand</td><td style={tableCellStyle}>Ask patient to explain their condition and proposed treatment in their own words. Document the patient's own words showing level of understanding.</td></tr>
              <tr><td style={tableCellStyle}>2 — Retain</td><td style={tableCellStyle}>After 5 minutes, ask patient to recall key information. Minor details may be forgotten — focus on essential facts. Document which facts were recalled.</td></tr>
              <tr><td style={tableCellStyle}>3 — Weigh</td><td style={tableCellStyle}>Explore patient's reasoning. Assess whether patient appreciates consequences of accepting and refusing. Document evidence of weighing alternatives.</td></tr>
              <tr><td style={tableCellStyle}>4 — Communicate</td><td style={tableCellStyle}>Observe any consistent communication: verbal, written, gesture, eye movement, AAC device. Document the decision and the method.</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">Step 4 — Record the outcome</h4>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Outcome</th><th style={tableHeadStyle}>Next Step</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Has capacity — all 4 criteria met</td><td style={tableCellStyle}>Obtain patient's own written informed consent (§86 form). No NR or family consent required.</td></tr>
              <tr><td style={tableCellStyle}>Lacks capacity — one or more criteria not met</td><td style={tableCellStyle}>Proceed to Step 5 — identify NR and classify admission. Document which criteria failed and the clinical evidence.</td></tr>
              <tr><td style={tableCellStyle}>Fluctuating capacity</td><td style={tableCellStyle}>Defer non-urgent decisions to when capacity is most likely present. Reassess before each decision. Document reassessment plan.</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">Step 5 — When capacity is absent: identify NR and classify admission</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Document absence of capacity — complete Cap-Form. Record which criteria failed and the clinical evidence for each failure.</li>
            <li>Identify Nominated Representative (NR): default hierarchy — spouse &gt; parent &gt; adult child &gt; sibling. If no NR within 24 hours: escalate to Clinical Director immediately.</li>
            <li>Contact NR — explain condition, proposed treatment, risks, alternatives, and right to seek second opinion. Document time of contact and information provided.</li>
            <li>Obtain specific NR consent for the specific decision. Blanket NR consent is invalid.</li>
            <li>Apply best interests principle — all decisions must be in patient's best interests, not family convenience. Document reasoning.</li>
            <li>Classify admission under correct MHCA section — see Step 6 table.</li>
            <li>Set mandatory reassessment date in EMR: §89 every 7 days; §90 every 14 days.</li>
          </ol>

          <h4 className="font-semibold mt-3 mb-1">Step 6 — MHCA admission classification when capacity is absent</h4>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Situation</th><th style={tableHeadStyle}>MHCA Section &amp; Requirement</th><th style={tableHeadStyle}>Duration &amp; MHRB</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Patient lacks capacity; NR available; admission needed</td><td style={tableCellStyle}>§89 Supported — 1 psychiatrist + 1 MHP/medical practitioner; NR consent</td><td style={tableCellStyle}>Max 30 days | MHRB within 3 days (women/minors); 7 days (all others)</td></tr>
              <tr><td style={tableCellStyle}>§89 patient still requires admission beyond 30 days</td><td style={tableCellStyle}>§90 Supported — 2 psychiatrists, both must independently examine and certify; NR consent</td><td style={tableCellStyle}>90 / 120 / 180 days each | MHRB within 7 days; Board acts within 21 days</td></tr>
              <tr><td style={tableCellStyle}>Immediate risk of harm; no time for consent process</td><td style={tableCellStyle}>§94 Emergency — any registered medical practitioner may initiate</td><td style={tableCellStyle}>Max 72 hours then convert to §86 or §89</td></tr>
              <tr><td style={tableCellStyle}>§86 patient requests discharge; team questions capacity</td><td style={tableCellStyle}>§88 Hold — MHP may hold up to 24 hours ONLY if §89 criteria met</td><td style={tableCellStyle}>Max 24 hours then §89 or discharge</td></tr>
              <tr><td style={tableCellStyle}>Minor (under 18) requiring admission</td><td style={tableCellStyle}>§87 Minor — 2 clinicians; NR consent mandatory</td><td style={tableCellStyle}>No fixed limit | MHRB: 72-hour + Day 30 notification</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1">Step 7 — Mandatory reassessment</h4>
          <p>When capacity returns, voluntary consent must be offered immediately and the admission converted to §86.</p>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Admission Category</th><th style={tableHeadStyle}>Reassessment Requirement &amp; Action When Capacity Returns</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>§89 Supported</td><td style={tableCellStyle}>Every 7 days — mandatory. When capacity returns: convert to §86; obtain new voluntary consent.</td></tr>
              <tr><td style={tableCellStyle}>§90 Supported</td><td style={tableCellStyle}>Every 14 days — mandatory; MHRB reporting. When capacity returns: convert to §86 immediately. Notify MHRB.</td></tr>
              <tr><td style={tableCellStyle}>§94 Emergency</td><td style={tableCellStyle}>Before converting to §89 at 72-hour deadline. If capacity present at 72 hours: obtain §86. If absent: convert to §89.</td></tr>
              <tr><td style={tableCellStyle}>§87 Minor — on turning 18</td><td style={tableCellStyle}>Reassess immediately at 18th birthday. If capacity present: convert to §86. §87 lapses at age 18.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">5. Fluctuating Capacity — Special Protocol</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Defer non-urgent decisions to the time when capacity is most likely present</li>
            <li>Reassess before each significant decision — yesterday's assessment does not apply today</li>
            <li>Document every assessment with precise date and time</li>
            <li>For urgent clinical decisions when capacity fluctuates: use least restrictive option and seek NR consent while continuing reassessment</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">6. Escalation Protocol</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Trigger</th><th style={tableHeadStyle}>Action &amp; Timeline</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Capacity in genuine doubt among the treating team</td><td style={tableCellStyle}>Convene MDT within 24 hours; involve Clinical Psychologist for psychometric input (MMSE, MoCA)</td></tr>
              <tr><td style={tableCellStyle}>NR disagrees with capacity assessment outcome</td><td style={tableCellStyle}>Document NR's position; seek independent second opinion; involve Clinical Director — within 24 hours</td></tr>
              <tr><td style={tableCellStyle}>§89 Day 30 approaching with capacity still absent</td><td style={tableCellStyle}>Initiate §90 two-psychiatrist assessment immediately; notify MHRB — by Day 25</td></tr>
              <tr><td style={tableCellStyle}>No NR available within 24 hours</td><td style={tableCellStyle}>Escalate to Clinical Director immediately; document all attempts to identify NR</td></tr>
              <tr><td style={tableCellStyle}>Legal dispute regarding capacity</td><td style={tableCellStyle}>Notify Clinical Director; contact MHRB; do not proceed with treatment decisions without guidance</td></tr>
              <tr><td style={tableCellStyle}>Any request for seclusion</td><td style={tableCellStyle}>PROHIBITED under MHCA §97(1) — absolute statutory prohibition. Escalate to Clinical Director immediately.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">7. EMR Documentation Requirements — CAP-Form</h3>
          <p>Every capacity assessment must be documented in the EMR using Form CAP-Form. All fields are mandatory.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date and time of assessment</li>
            <li>Name, designation, and registration number of the MHP who conducted the assessment</li>
            <li>The specific decision for which capacity was assessed — not a general statement</li>
            <li>Outcome of each of the four criteria — documented individually with clinical evidence</li>
            <li>Conclusion: Has capacity / Lacks capacity — for this specific decision at this point in time</li>
            <li>If capacity absent: NR contacted, time of contact, information provided, NR consent obtained</li>
            <li>MHCA admission section applied and clinical justification</li>
            <li>Next mandatory reassessment date entered in EMR</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">8. Prohibited Actions</h3>
          <div style={warnStyle}>
            ⚠ The following are prohibited under MHCA 2017 and constitute criminal offences. Any staff member
            who observes or is asked to participate in these must escalate to the Clinical Director immediately.
          </div>
          <ul className="list-disc pl-6 space-y-1">
            <li>Assuming capacity absent on the basis of diagnosis alone</li>
            <li>Requiring NR or family consent for a patient who has been assessed as having capacity (§86)</li>
            <li>Detaining a patient who has capacity and requests discharge (§88 — max 24-hour hold only if §89 criteria met)</li>
            <li>Continuing §89 admission beyond 30 days without converting to §90 with MHRB notification</li>
            <li>Using seclusion in any form — absolutely prohibited under §97(1)</li>
            <li>Administering ECT under §94 emergency provisions — prohibited under §94(3)</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">9. Roles &amp; Responsibilities</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>Role</th><th style={tableHeadStyle}>Responsibility</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Treating Psychiatrist</td><td style={tableCellStyle}>Conducts and signs all capacity assessments; completes Cap-Form; classifies admission under correct MHCA section; sets EMR reassessment alerts</td></tr>
              <tr><td style={tableCellStyle}>Clinical Psychologist</td><td style={tableCellStyle}>Provides psychometric input on request; contributes to MDT; documents observations supporting psychiatrist's assessment</td></tr>
              <tr><td style={tableCellStyle}>Nursing In-Charge</td><td style={tableCellStyle}>Observes and documents patient orientation, behaviour, and communication; alerts psychiatrist to clinical changes requiring reassessment</td></tr>
              <tr><td style={tableCellStyle}>Grievance Officer</td><td style={tableCellStyle}>Monitors §89 and §90 day-counts; generates ERP alerts at Day 25 (§89); coordinates MHRB notifications; maintains watch-list</td></tr>
              <tr><td style={tableCellStyle}>Centre Manager</td><td style={tableCellStyle}>Monthly audit of capacity assessment documentation completeness; reports to Clinical Director</td></tr>
              <tr><td style={tableCellStyle}>Clinical Director</td><td style={tableCellStyle}>Policy owner; reviews all escalated cases; approves all §90 admissions; reviews KPIs monthly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">10. KPI Monitoring</h3>
          <table className="w-100" style={{ borderCollapse: "collapse" }}>
            <thead><tr><th style={tableHeadStyle}>KPI</th><th style={tableHeadStyle}>Target | Measured By | Frequency</th></tr></thead>
            <tbody>
              <tr><td style={tableCellStyle}>Capacity assessment with all 4 criteria individually documented</td><td style={tableCellStyle}>100% | Centre Manager | Monthly</td></tr>
              <tr><td style={tableCellStyle}>§89 admissions — 7-day capacity review completed on time</td><td style={tableCellStyle}>100% | Grievance Officer | Weekly</td></tr>
              <tr><td style={tableCellStyle}>§89 admissions reassessed and actioned by Day 30</td><td style={tableCellStyle}>100% | Grievance Officer | Monthly</td></tr>
              <tr><td style={tableCellStyle}>§90 admissions — fortnightly capacity review completed</td><td style={tableCellStyle}>100% | Grievance Officer | Monthly</td></tr>
              <tr><td style={tableCellStyle}>NR identified and NR consent within 24 hrs (capacity-absent admissions)</td><td style={tableCellStyle}>&gt;= 98% | Centre Manager | Monthly</td></tr>
              <tr><td style={tableCellStyle}>§87 minor admissions — MHRB notified within 72 hours</td><td style={tableCellStyle}>100% | Grievance Officer | Monthly</td></tr>
              <tr><td style={tableCellStyle}>Cap-Form completeness on audit — all mandatory fields</td><td style={tableCellStyle}>&gt;= 98% | Centre Manager | Quarterly</td></tr>
              <tr><td style={tableCellStyle}>Annual staff training on MHCA §4 capacity framework</td><td style={tableCellStyle}>100% MHPs and nurses | HR / Clinical Director | Annual</td></tr>
              <tr><td style={tableCellStyle}>Seclusion incidents — target: zero (prohibited under §97)</td><td style={tableCellStyle}>Zero | Clinical Director | Monthly</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">11. Related Documents</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>JRCPL/GOV/CA/001 — Decision-Making Capacity Assessment Policy v2.0</li>
            <li>Form Cap-Form — Capacity Assessment Form</li>
            <li>Adm-01 — Admission, Informed Consent &amp; Capacity Assessment SOP</li>
            <li>Adm-05 — Emergency &amp; Involuntary Admission SOP</li>
            <li>Against Medical Advice (AMA) Discharge SOP</li>
            <li>MHCA 2017 — Mental Healthcare Act 2017 (authoritative source)</li>
          </ul>
        </div>

        <p className="text-muted text-center" style={{ fontSize: "0.85rem" }}>
          This document is the property of Jagrutii Rehab Centre Pvt. Ltd. Any reproduction or distribution
          without written authorisation is prohibited.
        </p>
      </div>
    </Fragment>
  );
});

export default Adm04CapacityAssessmentSOP;
