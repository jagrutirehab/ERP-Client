import React, { forwardRef, Fragment } from "react";
import {
  RED, cell, NAVY,
  SectionHeader, SubTitle, BulletList, NumberedList,
  DataTable, ControlTable, WarningBox, AlertBox,
  ResponseStep, CalloutBox, SEDocHeader, SEAuthorisation,
} from "./SEComponents";

// SE-01 specific — sentinel event banner
const SentinelBox = ({ children }) => (
  <div style={{ background: "#fff5f5", border: `2px solid ${RED}`, borderRadius: "4px", padding: "8px 12px", marginBottom: "0.75rem" }}>
    <div style={{ fontWeight: "bold", color: RED, marginBottom: "4px" }}>🚨 Suicide Attempt = Sentinel Event</div>
    <div style={{ color: "#333" }}>{children}</div>
  </div>
);

// ── DATA ──────────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  ["Doc ID", "SE-01"],
  ["Series", "SE — Safety & Emergency"],
  ["Category", "Patient Safety | Sentinel Event Prevention"],
  ["Replaces", "SE-01 v1.0 dated 15.02.2026 (Jagruti Rehabilitation Centre)"],
  ["Version", "2.0 (Refined)"],
  ["Effective Date", "June 2025"],
  ["Review Due", "June 2026 (Annual or post-sentinel event)"],
  ["Prepared By", "Dr. Amar Shinde | Clinical Director, Jagrutii Rehab Centre Pvt. Ltd."],
  ["Approved By", "Dr. Amar Shinde | Clinical Director"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Inpatient & Outpatient Contacts"],
  ["Assessment Tool", "Columbia Suicide Severity Rating Scale (C-SSRS) | Clinical Judgement"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 18, 19, 23, 94); NABH Patient Safety Goal 4; Clinical Establishment Standards; IPS Clinical Practice Guidelines"],
  ["Classification", "CONFIDENTIAL – Restricted Clinical Document"],
];

const TOUCHPOINT_ROWS = [
  ["On admission — all patients", "C-SSRS (full version)", "Admitting Psychiatrist"],
  ["Within 24 hours of admission", "C-SSRS (full version) + clinical MSE", "Treating Psychiatrist"],
  ["Any time a patient expresses ideation, hopelessness, or intent", "C-SSRS + immediate clinical review", "Nurse-in-Charge → Psychiatrist within 30 min"],
  ["After any major stressor or adverse life event (divorce, bereavement, legal matter)", "C-SSRS + clinical note", "Treating Psychiatrist"],
  ["After any clinical deterioration or change in mental state", "C-SSRS + clinical note", "Treating Psychiatrist"],
  ["Before granting leave of absence", "C-SSRS + leave authorisation note", "Treating Psychiatrist"],
  ["Within 48 hours before planned discharge", "C-SSRS + Discharge Safety Checklist (DSC-F-001)", "Treating Psychiatrist"],
  ["On return from leave of absence", "C-SSRS (brief version)", "Nursing In-Charge → Psychiatrist review"],
];

const RISK_ROWS = [
  ["LOW", "Passive ideation only ('wish to be dead'); no plan, no intent, no previous attempt; good social support; engaged in treatment; no acute intoxication", "Ideation Category 1–2", "Routine ward supervision; nursing check every 2 hours; documented shift review"],
  ["MODERATE", "Active ideation with some plan but no clear intent or timeline; past attempt (distant, low lethality); some protective factors present; mild-to-moderate agitation; distress present", "Ideation Category 3–4; Behaviour History present", "Enhanced monitoring; nursing check every 30 minutes; psychiatrist review within 4 hours; safety planning initiated"],
  ["HIGH", "Active ideation with plan AND intent OR recent high-lethality attempt; current intoxication with ideation; command hallucinations for self-harm; refusing treatment; impulsive behaviour; recent serious attempt (within 3 months)", "Ideation Category 4–5 and/or recent Behaviour", "Continuous 1:1 observation; psychiatrist review within 1 hour; environmental safety sweep immediately; safety planning active"],
  ["IMMINENT", "Actively attempting or about to attempt; patient requires immediate physical intervention; medical stabilisation required", "Active attempt in progress", "EMERGENCY RESPONSE — see Section 10"],
];

const OBS_ROWS = [
  ["General (Low)", "Nurse aware of patient location at all times; check at least every 2 hours", "Nursing shift note; C-SSRS score in EMR", "Nursing In-Charge"],
  ["Close (Moderate)", "Physical check every 30 minutes; nursing staff can see patient at all times during waking hours", "Observation Log (OBS-F-001): every 30 min entry with behaviour observation, mood, location", "Treating Psychiatrist (written order)"],
  ["Continuous 1:1 (High)", "Named nurse within arm's reach at all times including bathroom, sleeping; handover every shift", "OBS-F-001: every 15 min entry; handover note at each shift with risk status; psychiatrist counter-signs daily", "Treating Psychiatrist (written order in EMR)"],
];

const LIGATURE_ROWS = [
  ["Ligature Points", "Door handles, shower rails, towel rails, window grilles, curtain rods, wardrobe rails, pipes", "Anti-ligature fittings; tamper-proof fixtures; no exposed metal bars in high-risk areas"],
  ["Sharp Objects", "Razors, glass items, cutlery, scissors, nail files, syringes", "Controlled access; sharps locked; plastic cutlery for high-risk patients"],
  ["Heights / Window Access", "Windows, rooftop access, staircases", "Window restrictors (max 15 cm opening); staircase baffles; roof access locked"],
  ["Chemical Access", "Cleaning agents, medications, flammable materials", "Locked storage; medications dispensed one dose at a time for high-risk patients"],
  ["Cord / Belt Items", "Clothing belts, phone charger cables, earphone cords, bedsheets", "Removed on admission for high-risk patients; stored securely; replaced with safe alternatives"],
  ["Medication Access", "Tablets dispensed in bulk, medication storage accessible to patients", "Controlled dispensing; watch-swallow protocol for high-risk patients; blister packs removed"],
];

const SAFETY_PLAN_ROWS = [
  ["1", "Warning Signs", "Patient identifies their personal early warning signs: thoughts, feelings, behaviours that precede a crisis"],
  ["2", "Internal Coping Strategies", "What the patient can do alone to distract or self-regulate (not involving others)"],
  ["3", "Social Contacts for Distraction", "People and places the patient can contact for distraction (not necessarily for crisis support)"],
  ["4", "Family / Friends Who Can Help", "Named persons the patient can contact when in crisis; their contact details in the plan"],
  ["5", "Professionals & Crisis Lines", "Treating psychiatrist's contact, centre helpline, iCall (9152987821), Vandrevala Foundation (1860-2662-345)"],
  ["6", "Making the Environment Safer", "Specific means restriction agreed with the patient: what is stored away, who holds it"],
];

const DISCHARGE_ROWS = [
  ["C-SSRS reassessment within 48 hours before discharge", "C-SSRS + clinical note", "Treating Psychiatrist"],
  ["Safety Plan reviewed, updated, and signed by patient", "SPF-F-001", "Psychiatrist / Psychologist"],
  ["Discharge Safety Checklist completed", "DSC-F-001", "Treating Psychiatrist"],
  ["Family / NR means restriction counselling completed", "Communication Log", "Social Worker"],
  ["Discharge medications: safe quantities only; no large supply of high-lethality medications for High-risk patients", "Prescription Review", "Treating Psychiatrist"],
  ["Post-discharge follow-up appointment — within 48 hours (High-risk); within 7 days (Moderate-risk)", "EMR appointment", "Treating Psychiatrist"],
  ["Crisis contact card given to patient and family: centre helpline, psychiatrist, Vandrevala Foundation 1860-2662-345, iCall 9152987821", "Crisis Card", "Nursing In-Charge"],
  ["Post-discharge contact: nurse calls patient within 24 hours (High-risk) or 48 hours (Moderate) to confirm wellbeing", "Call logged in EMR", "Nursing In-Charge"],
];

const ROLES_ROWS = [
  ["Treating Psychiatrist", "C-SSRS assessment; risk stratification; observation orders; safety planning; medication safety review; discharge safety checklist; family communication for serious events"],
  ["Clinical Psychologist", "Safety plan development and review; psychological debriefing for patients post-attempt; carer psychoeducation; staff debriefing"],
  ["Nursing In-Charge", "Observation implementation; OBS-F-001 documentation; environmental safety checklist; shift handover briefing; incident report initiation"],
  ["Social Worker", "Means restriction counselling; family involvement in safety planning; post-discharge welfare monitoring; AMA follow-up"],
  ["Centre Head", "Environmental safety audit; observation compliance audit; staff support coordination; family notification for serious events; NABH reporting"],
  ["Regional Head (Dr. Bharat Mali)", "RCA lead; Corrective Action Plan; network escalation; 4-hour notification for serious events"],
  ["Clinical Director (Dr. Amar Shinde)", "Policy oversight; 4-hour notification for serious events; RCA sign-off; network learning; MHRB interface if required"],
];

const KPI_ROWS = [
  ["C-SSRS completed at admission — all patients", "100%", "Monthly"],
  ["C-SSRS completed within 48 hours before discharge (all patients with risk history)", "100%", "Monthly"],
  ["Observation log (OBS-F-001) with no gaps — High-risk patients", "100%", "Monthly"],
  ["Safety plan initiated within 24 hours for Moderate/High-risk patients", "100%", "Monthly"],
  ["Environmental Safety Checklist completed per shift (High-risk wards)", "100%", "Monthly"],
  ["Monthly ligature risk audit completed by Centre Head", "100%", "Monthly"],
  ["Post-discharge follow-up call within 24 hrs (High) / 48 hrs (Moderate)", "≥ 95%", "Monthly"],
  ["Post-attempt RCA initiated within 5 working days", "100%", "Per event"],
  ["Corrective Action Plan implemented within 30 days of RCA", "100%", "Per event"],
  ["Staff debriefing conducted within 72 hours of serious event", "100%", "Per event"],
  ["Watch-and-swallow protocol compliance — High-risk patients", "100%", "Monthly"],
];

const RELATED_ROWS = [
  ["CL-01", "Admission & Informed Consent SOP", "Admission-level risk assessment; leave of absence recall"],
  ["CL-03", "Emergency Admission SOP", "MHCA Sec. 94 emergency treatment authority during attempt"],
  ["SE-02", "Violence & Aggression Management SOP", "Behavioural emergency overlapping with suicidal crisis"],
  ["SE-03", "Restraint & Seclusion Governance SOP", "Physical intervention during attempt; restraint as last resort"],
  ["SE-04", "Medical Emergency & ICU Escalation SOP", "Transfer after serious attempt requiring medical stabilisation"],
  ["CL-07", "Referral, Transfer & Continuity of Care SOP", "Transfer post-attempt; safety plan handover"],
  ["DG-01", "Clinical Documentation Standards SOP", "Observation log and incident report standards"],
  ["QM Incident Reporting SOP", "JRCPL/QM/IR/001", "Sentinel event reporting pathway"],
];

const REVIEW_ROWS = [
  ["Review Cycle", "Annual, or immediately post-sentinel event, or following NABH inspection finding"],
  ["Review Responsibility", "Clinical Director + Regional Head + Senior Psychologist"],
  ["Version History", "v1.0 – 15 February 2026 (Jagruti Rehabilitation Centre, initial release)\nv2.0 – June 2025 (Jagrutii Rehab Centre Pvt. Ltd., full refinement — C-SSRS integration, risk stratification, observation documentation standards, safety planning framework, means restriction, special populations, AMA protocol, near-miss, staff support, 11 KPIs, 8 mandatory forms)"],
  ["Next Review Due", "June 2026"],
  ["Distribution", "All Psychiatrists, Clinical Psychologists, Nursing Heads, Social Workers, Centre Heads, Regional Head"],
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Se01SuicideRiskPrevention = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`}>
        <SEDocHeader
          docCode="SE-01"
          title="Suicide Risk Prevention & Management"
          tagline="MHCA 2017 • C-SSRS • NABH Patient Safety Goal 4 • All Verticals"
        />
      </div>

      <ControlTable rows={CONTROL_ROWS} />

      <CalloutBox title="System Responsibility">
        Suicide prevention is an organisational system responsibility — not the assumption of any single individual. A patient's death by suicide or a serious attempt is a sentinel event. Every component of this SOP is mandatory. Failure to follow observation, documentation, or response protocols is a patient safety failure and a clinical governance violation.
      </CalloutBox>

      <SectionHeader>1. Purpose</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>This SOP establishes the clinical, environmental, and organisational standards for preventing suicide and managing suicidal risk across all centres of Jagrutii Rehab Centre Pvt. Ltd. It covers:</p>
      <BulletList items={[
        "Standardised suicide risk assessment using C-SSRS at defined clinical touchpoints",
        "Risk stratification with explicit clinical criteria for each level",
        "Observation levels and documentation requirements matched to risk",
        "Environmental safety standards and ligature risk management",
        "Immediate clinical response to a suicide attempt",
        "Safety planning as a therapeutic tool throughout admission",
        "Means restriction and medication safety for high-risk patients",
        "Discharge safety standards and post-discharge follow-up",
        "Post-incident review, staff support, and learning",
      ]} />

      <SectionHeader>2. Scope</SectionHeader>
      <BulletList items={[
        "All inpatients across all four clinical verticals",
        "All patients presenting to outpatient services with suicidal ideation",
        "All patients on home visits or leave of absence where suicidal risk has been identified",
        "All staff categories who interact with patients: psychiatric, nursing, counselling, social work, support",
      ]} />

      <SectionHeader>3. Regulatory &amp; Clinical Framework</SectionHeader>
      <SubTitle>3.1 MHCA 2017</SubTitle>
      <BulletList items={[
        "Section 18 – Right to evidence-based treatment; suicide risk management is a clinical standard of care",
        "Section 23 – Confidentiality of suicide attempt history and psychiatric diagnosis",
        "Section 29 – Patients must be informed of their rights, including the right to refuse treatment except in emergencies",
        "Section 94 – Emergency treatment authority for immediate life-threatening risk — applies to suicide attempts",
      ]} />
      <SubTitle>3.2 NABH Patient Safety Goal 4</SubTitle>
      <BulletList items={[
        "Reduce risk of patient harm resulting from suicide: environmental assessment, risk screening, and active management protocols",
        "Documentation of suicide risk assessment at admission and at key clinical transitions is a NABH audit requirement",
      ]} />

      <SectionHeader>4. Suicide Risk Assessment — C-SSRS Based</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>The Columbia Suicide Severity Rating Scale (C-SSRS) is the standardised tool for suicide risk assessment across all Jagrutii Rehab Centre verticals. Clinical judgement is used in conjunction with C-SSRS scores.</p>
      <SubTitle>4.1 When Assessment Is Mandatory</SubTitle>
      <DataTable
        cols={[{ label: "Clinical Touchpoint", width: "40%" }, { label: "Tool", width: "28%" }, { label: "Documented By" }]}
        rows={TOUCHPOINT_ROWS}
      />

      <SectionHeader>5. Risk Stratification — Clinical Criteria</SectionHeader>
      <DataTable
        cols={[{ label: "Risk Level", width: "12%" }, { label: "Clinical Criteria", width: "38%" }, { label: "C-SSRS Indicative Score", width: "20%" }, { label: "Observation Level" }]}
        rows={RISK_ROWS}
      />
      <AlertBox title="Risk Level Escalation">
        Risk level is dynamic. Any nursing staff member who observes a change in the patient's presentation suggesting escalation of risk MUST immediately notify the duty psychiatrist — they do not wait for the next scheduled review. Risk escalation is a clinical emergency. Downgrading risk level from High to Moderate or Low requires treating psychiatrist documentation with clinical rationale.
      </AlertBox>

      <SectionHeader>6. Observation Levels &amp; Documentation Requirements</SectionHeader>
      <SubTitle>6.1 Observation Standards by Level</SubTitle>
      <DataTable
        cols={[{ label: "Level", width: "18%" }, { label: "Description", width: "30%" }, { label: "Minimum Documentation", width: "30%" }, { label: "Authorised By" }]}
        rows={OBS_ROWS}
      />
      <SubTitle>6.2 Observation Log (OBS-F-001) — Mandatory Entries</SubTitle>
      <BulletList items={[
        "Date and time of entry (exact, not approximate)",
        "Name and designation of observing staff member",
        "Patient's location and activity",
        "Observable behaviour, affect, and any verbalisations",
        "Any request or action by patient relevant to safety",
        "Any staff intervention or communication",
        "Handover entry: incoming staff acknowledged and briefed on risk status",
      ]} />
      <WarningBox title="Documentation Failure = Clinical Failure">
        An observation log with gaps, approximate times, or templated entries that do not reflect the patient's actual behaviour is not a legal or clinical defence. It is evidence of negligence. Every entry must be contemporaneous, specific, and signed. The Nursing In-Charge reviews the observation log at each shift handover.
      </WarningBox>
      <SubTitle>6.3 Observation Level Change Protocol</SubTitle>
      <NumberedList items={[
        "Change in observation level (up or down) requires a written psychiatrist order in the EMR",
        "Observation level may NOT be downgraded verbally or informally",
        "When upgrading to 1:1: nurse is allocated and briefed before order is considered active",
        "When downgrading from 1:1: C-SSRS reassessment documented; clinical rationale stated; Centre Head informed",
      ]} />

      <SectionHeader>7. Environmental Safety</SectionHeader>
      <SubTitle>7.1 Ligature Risk Assessment</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>A ligature risk assessment of the physical environment must be completed:</p>
      <BulletList items={["At centre opening / licensing", "When a new high-risk patient is admitted", "After any structural change to the ward", "As part of monthly safety audit"]} />
      <DataTable
        cols={[{ label: "Risk Category", width: "20%" }, { label: "Examples", width: "40%" }, { label: "Mitigation Required" }]}
        rows={LIGATURE_ROWS}
      />
      <SubTitle>7.2 Environmental Safety Checklist</SubTitle>
      <BulletList items={[
        "Environmental Safety Checklist (ESC-F-001) completed every shift by Nursing In-Charge for high-risk wards",
        "Monthly full ligature risk audit completed by Centre Head using Ligature Risk Audit Tool (LRAT-F-001)",
        "Any identified risk: documented, actioned, and resolved within 24 hours; if not resolvable within 24 hours, escalate to Regional Head",
        "CCTV coverage reviewed monthly to ensure high-risk patient areas have no blind spots",
      ]} />

      <SectionHeader>8. Safety Planning</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>A Safety Plan is a personalised, collaboratively developed written plan that helps a patient recognise warning signs and take specific steps to reduce risk. It is a therapeutic tool, not a signature form.</p>
      <SubTitle>8.1 When a Safety Plan Is Required</SubTitle>
      <BulletList items={[
        "All patients assessed as Moderate or High risk — safety plan initiated within 24 hours of risk identification",
        "All patients with a history of previous suicide attempt — safety plan initiated within 48 hours of admission",
        "All patients before discharge regardless of current risk level if they have any lifetime history of suicidal ideation",
      ]} />
      <SubTitle>8.2 Safety Plan Components (Stanley-Brown Framework)</SubTitle>
      <DataTable
        cols={[{ label: "Step", width: "7%" }, { label: "Component", width: "28%" }, { label: "Clinical Guidance" }]}
        rows={SAFETY_PLAN_ROWS}
      />
      <BulletList items={[
        "Safety plan completed with the patient by the treating psychiatrist or clinical psychologist; patient signs the plan",
        "Copy given to patient; copy filed in EMR; copy shared with NR / family with patient's consent",
        "Safety plan reviewed and updated at each risk re-assessment",
      ]} />

      <SectionHeader>9. Means Restriction &amp; Medication Safety</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>Restricting access to lethal means is one of the most evidence-based interventions in suicide prevention. At Jagrutii Rehab Centre, means restriction applies to both the physical environment and medication management.</p>
      <SubTitle>9.1 Medication Safety for High-Risk Patients</SubTitle>
      <BulletList items={[
        "Medications are dispensed on a dose-by-dose basis for all High-risk patients — no bulk dispensing",
        "Watch-and-swallow protocol: nursing staff observes the patient taking medication, checks oral cavity, documents in OBS-F-001",
        "Blister packs and original packaging not given to High-risk patients — medications removed from packaging before dispensing",
        "Medications not taken are returned to the pharmacy / medication trolley; not left at the bedside",
        "The treating psychiatrist reviews the prescribing list with medication safety in mind: avoid high-lethality drugs (tricyclic antidepressants in high doses) as first-line agents in High-risk patients",
      ]} />
      <SubTitle>9.2 Patient Belongings Search</SubTitle>
      <BulletList items={[
        "On admission of all High-risk patients: personal belongings searched with the patient's knowledge and consent (or NR consent if patient lacks capacity)",
        "Items removed: belts, cords, cables, sharp objects, medications from home, alcohol, glass items",
        "Removed items documented, labelled, and stored securely; returned at discharge or when risk level decreases",
        "Patient informed of the reason for removal; approach is therapeutic and non-punitive",
      ]} />

      <SectionHeader>10. Immediate Response to Suicide Attempt</SectionHeader>
      <SentinelBox>
        Any suicide attempt by a patient under Jagrutii Rehab Centre's care — whether completed, incomplete, or aborted — is a Sentinel Event. The full incident response protocol below is mandatory in every case.
      </SentinelBox>
      <ResponseStep num="01" title="Immediate Physical Response (0–5 minutes)" items={[
        "Call for help immediately — do not attempt to manage alone",
        "Ensure safety of the environment: remove other patients; manage bystanders calmly",
        "Assess and secure airway, breathing, circulation (ABCs)",
        "Do not remove any ligature, instrument, or means before the psychiatrist arrives unless delay will cause death",
        "If cardiac arrest: initiate BLS immediately; call for AED",
        "Do not leave the patient alone under any circumstances",
      ]} />
      <ResponseStep num="02" title="Alert Clinical Team (0–10 minutes)" items={[
        "Nursing In-Charge alerts duty psychiatrist immediately — by phone, not relay message",
        "Centre Head alerted within 10 minutes",
        "Medical emergency kit brought to the patient's location",
        "Ambulance called if medical transfer required (refer SE-04)",
        "Other patients moved away from the scene calmly; their wellbeing addressed separately",
      ]} />
      <ResponseStep num="03" title="Medical Stabilisation (Psychiatrist-Led)" items={[
        "Psychiatrist assesses level of consciousness, injury severity, vital signs",
        "Emergency treatment initiated under MHCA 2017 Section 94 authority without consent if patient is unconscious or unable to consent",
        "IV access, oxygen, and emergency medications as clinically indicated",
        "Decision to transfer to general hospital made by psychiatrist; if transferred, refer SE-04 and CL-07",
        "If patient remains at centre: continuous 1:1 observation commenced immediately",
      ]} />
      <ResponseStep num="04" title="Documentation (Within 1 Hour of Incident)" items={[
        "Incident Report (IR-F-001) completed by Nursing In-Charge: date, time, location, what happened, staff present, immediate actions taken",
        "Psychiatrist documents clinical assessment, treatment given, and current mental state in EMR — contemporaneous entry",
        "Observation log (OBS-F-001) entry: exact time of discovery, condition of patient, actions taken",
        "Any physical evidence (objects used) documented and preserved for RCA review",
        "Do NOT alter, delete, or delay documentation",
      ]} />
      <ResponseStep num="05" title="Escalation & Notification" items={[
        "Regional Head (Dr. Bharat Mali) notified within 2 hours",
        "Clinical Director (Dr. Amar Shinde) notified within 4 hours",
        "Family / NR informed by treating psychiatrist or Centre Head: factual information only; no speculation; communication documented",
        "If patient is deceased: police notified; no statements to media without Clinical Director approval",
        "For child or adolescent: Child Welfare Committee notified if minor",
      ]} />
      <ResponseStep num="06" title="Post-Attempt Clinical Review (Within 24 Hours)" items={[
        "Treating psychiatrist documents a full clinical review: updated risk assessment, revised care plan, changed observation level",
        "Multidisciplinary team review (psychiatrist, psychologist, senior nurse, social worker) within 24 hours",
        "Patient's safety plan reviewed and revised with the patient when clinically appropriate",
        "Family psychoeducation session arranged",
        "Peer patients on the ward: ward staff conduct wellbeing check; consider group debriefing session",
      ]} />

      <SectionHeader>11. Staff Communication Protocol</SectionHeader>
      <BulletList items={[
        "When High risk is identified: nursing team briefed in writing at each shift handover; risk flag activated in EMR; observation sheet initiated",
        "Risk status communicated at Multidisciplinary Case Review (MCR) which meets at minimum weekly for all Moderate and High-risk patients",
        "Information about patient's risk status shared only with clinical staff on a need-to-know basis — MHCA Sec. 23 confidentiality applies",
        "No verbal-only communication of risk status change; all changes require EMR entry",
        "Security staff briefed on observation status (without clinical details) where they are involved in monitoring",
      ]} />

      <SectionHeader>12. Family / NR Communication</SectionHeader>
      <NumberedList items={[
        "Family / NR informed of the patient's elevated risk in a planned, calm conversation by the treating psychiatrist — not communicated by nursing staff or administration",
        "Family psychoeducation: what to watch for, what to do in a crisis, who to call; documented in the family communication log",
        "Family involved in safety planning with patient's consent: identified as support persons, briefed on their role",
        "Means restriction at home (for patients on leave or post-discharge): family counselled on securing medications, removing sharps, locking chemicals",
        "Family must not be told of a serious attempt by anyone other than the treating psychiatrist or Centre Head",
        "After a serious attempt: family offered a family counselling session; carer burden and carer mental health acknowledged",
      ]} />

      <SectionHeader>13. Discharge Safety Standards</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>Discharge of a patient with any current or recent suicidal risk requires the following mandatory actions before discharge is finalised:</p>
      <DataTable
        cols={[{ label: "Action", width: "46%" }, { label: "Form / Reference", width: "22%" }, { label: "Completed By" }]}
        rows={DISCHARGE_ROWS}
      />
      <AlertBox title="Follow-Up Standard">
        The evidence base for post-discharge follow-up contact within 24–48 hours in high-risk patients is strong. This call is not a courtesy — it is a clinical safety intervention. It must be documented in the EMR with the content of the conversation and the patient's reported state. If the patient is unreachable, the family / NR is contacted and the attempt is documented.
      </AlertBox>

      <SectionHeader>14. Self-Discharge Against Medical Advice — High-Risk Patients</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>If a patient on High-risk status attempts to leave against medical advice:</p>
      <NumberedList items={[
        "Nursing staff inform duty psychiatrist immediately; patient not physically prevented from leaving at this stage",
        "Duty psychiatrist assesses the patient: capacity, immediate risk level, clinical state",
        "If patient has capacity: informed of specific risks of leaving; given crisis contact card; discharge AMA process completed with written signature (DAMA-F-001); safety plan provided",
        "If patient lacks capacity and is at imminent risk: emergency admission under MHCA 2017 Section 94 may be invoked; Clinical Director and Regional Head informed immediately",
        "If patient on Involuntary Admission attempts to leave: may be lawfully prevented from leaving per their admission status; treating psychiatrist documents clinical rationale",
        "Family / NR informed by treating psychiatrist",
        "Incident documented in EMR as high-risk AMA; post-departure welfare follow-up by Social Worker within 24 hours",
      ]} />

      <SectionHeader>15. Special Population Protocols</SectionHeader>
      <SubTitle>15.1 De-Addiction Vertical</SubTitle>
      <BulletList items={[
        "Suicide risk peaks during acute withdrawal, immediately post-detox, and during early recovery (weeks 2–6)",
        "C-SSRS assessed daily during active withdrawal in addition to standard assessment touchpoints",
        "Alcohol intoxication is a major acute risk amplifier: any patient presenting with suicidal ideation and intoxication is automatically classified as High risk pending full assessment when sober",
        "Co-morbid depression in substance use disorder is significantly underdiagnosed: screening at admission (PHQ-9) and again at day 14 (post-withdrawal) mandatory",
      ]} />
      <SubTitle>15.2 Child &amp; Adolescent Psychiatry</SubTitle>
      <BulletList items={[
        "Self-harm must be assessed separately from suicidal intent in adolescents — the two are distinct and require different interventions",
        "Columbia Suicide Severity Rating Scale – Paediatric version (C-SSRS-P) used for patients under 18",
        "Parents / guardians involved in safety planning with the young person's assent",
        "Social media access reviewed as part of risk assessment: assess exposure to suicide-related content, cyberbullying, peer pressure",
        "School / college counsellors may be involved in discharge planning with the young person's written consent",
      ]} />
      <SubTitle>15.3 Elderly Care</SubTitle>
      <BulletList items={[
        "Suicidal ideation in elderly patients is frequently underreported and underdetected; presents more often as hopelessness, withdrawal, or refusal to eat than explicit ideation",
        "GDS-15 (Geriatric Depression Scale) used at admission as a supplementary screen; elevated score triggers C-SSRS assessment",
        "Recent bereavement, terminal diagnosis, loss of independence, or financial distress: specific risk amplifiers in elderly patients; proactive assessment at these events mandatory",
        "Means restriction counselling must include discussion of medications: elderly patients often have multiple high-lethality medications at home; family counselled on medication storage",
      ]} />
      <SubTitle>15.4 Involuntary Patients</SubTitle>
      <BulletList items={[
        "Involuntary status itself is associated with elevated suicide risk; mandatory High-risk monitoring for all newly involuntary-admitted patients for the first 72 hours",
        "If an involuntary patient refuses to engage with safety planning: acknowledge the refusal without confrontation; document; involve the NR in safety planning instead; review daily",
        "MHRB application by the patient: never treated as evidence of increased risk or used as justification for more restrictive measures",
      ]} />

      <SectionHeader>16. Near-Miss &amp; Remote Communication of Suicidal Ideation</SectionHeader>
      <SubTitle>16.1 Near-Miss Events</SubTitle>
      <BulletList items={[
        "A near-miss is any situation in which a patient's suicidal behaviour was interrupted before harm occurred (e.g., patient found with ligature that had not been used, aborted attempt)",
        "Near-miss events are treated with the same post-incident review rigour as actual attempts",
        "Incident Report (IR-F-001) completed; Regional Head and Clinical Director notified within 4 hours",
        "Root Cause Analysis initiated within 5 working days",
      ]} />
      <SubTitle>16.2 Ideation Communicated by Phone, Family, or WhatsApp</SubTitle>
      <BulletList items={[
        "If a patient on leave contacts the centre or a staff member expressing suicidal ideation: nursing staff alert duty psychiatrist immediately; do not manage alone",
        "Duty psychiatrist attempts direct phone contact with the patient; assesses risk",
        "If immediate risk is assessed: family / NR contacted immediately; nearest emergency services notified if patient location is known and risk is imminent",
        "Patient's leave is revoked; recall procedure per CL-01 (Sec. 103 MHCA leave recall) initiated",
        "If family reports suicidal ideation in a current inpatient patient after a home visit: duty psychiatrist informed immediately; C-SSRS reassessment on return",
      ]} />

      <SectionHeader>17. Post-Incident Review — Serious Attempt or Death</SectionHeader>
      <NumberedList items={[
        "Incident Report (IR-F-001) completed within 1 hour by Nursing In-Charge",
        "Root Cause Analysis (RCA) initiated within 5 working days of the event; led by Regional Head with Clinical Director oversight",
        "RCA review: timeline of events; adequacy of risk assessment; observation compliance; environmental safety; documentation quality; staff communication; any system failures",
        "RCA report submitted to Clinical Director within 10 working days",
        "Corrective Action Plan (CAP) developed from RCA findings; implemented within 30 days",
        "Network-wide learning: de-identified RCA summary shared with all Centre Heads at next monthly governance meeting",
        "NABH Sentinel Event Report filed as required",
      ]} />

      <SectionHeader>18. Staff Psychological Support Post-Incident</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>Staff involved in a patient suicide attempt or death are at significant risk of psychological distress, moral injury, and burnout. Jagrutii Rehab Centre has a duty of care to its staff in these situations.</p>
      <NumberedList items={[
        "Immediate defusing: Centre Head conducts an informal group meeting with all staff who were directly involved within 4 hours of the incident; this is a support meeting, not an investigation",
        "Formal psychological debriefing: facilitated by a senior psychologist or external EAP provider within 48–72 hours",
        "Individual staff members who are significantly distressed offered one-to-one counselling; staff have the right to take compassionate leave",
        "Staff are explicitly told: this is a system review, not individual blame — staff must not self-punish or self-blame pending RCA findings",
        "Clinical Director monitors staff wellbeing at 1 week and 1 month post-incident",
        "Staff involved in a patient death must not be rostered for high-dependency observation duties for a minimum of 48 hours post-incident",
      ]} />

      <SectionHeader>19. Roles &amp; Responsibilities</SectionHeader>
      <DataTable
        cols={[{ label: "Role", width: "28%" }, { label: "Responsibilities" }]}
        rows={ROLES_ROWS}
      />

      <SectionHeader>20. KPIs &amp; Audit</SectionHeader>
      <DataTable
        cols={[{ label: "KPI" }, { label: "Target", width: "12%" }, { label: "Review Frequency", width: "14%" }]}
        rows={KPI_ROWS}
      />

      <SectionHeader>21. Related Documents</SectionHeader>
      <DataTable
        cols={[{ label: "Doc ID", width: "18%" }, { label: "Title", width: "38%" }, { label: "Relationship" }]}
        rows={RELATED_ROWS}
      />

      <SectionHeader>22. Review &amp; Version Control</SectionHeader>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "1rem" }}>
        <tbody>
          {REVIEW_ROWS.map(([label, value], i) => (
            <tr key={label}>
              <td style={{ ...cell, background: i % 2 === 0 ? "#eef1f8" : "#f8f9fc", color: NAVY, fontWeight: "bold", width: "22%", whiteSpace: "nowrap" }}>{label}</td>
              <td style={{ ...cell, background: i % 2 === 0 ? "#fafbfd" : "#fff", whiteSpace: "pre-line" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SectionHeader>Authorisation &amp; Sign-Off</SectionHeader>
      <SEAuthorisation docCode="SE-01" />

    </div>
  </Fragment>
));

export default Se01SuicideRiskPrevention;
