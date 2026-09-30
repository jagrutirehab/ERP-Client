import React, { forwardRef, Fragment } from "react";
import {
  SectionHeader, SubTitle, BulletList, NumberedList,
  DataTable, ControlTable, WarningBox, AlertBox, CalloutBox, ResponseStep,
  SEDocHeader, SEAuthorisation,
} from "./SEComponents";

// ── DATA ──────────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  ["Doc ID", "SE-03"],
  ["Series", "SE — Safety & Emergency"],
  ["Category", "Patient Safety | Patient Rights | Sentinel Event Governance"],
  ["Replaces", "SE-03 v1.0 dated 15.02.2026 (Jagruti Rehabilitation Centre)"],
  ["Version", "2.0 (Refined)"],
  ["Effective Date", "June 2025"],
  ["Review Due", "June 2026 (Annual or post-restraint sentinel event)"],
  ["Prepared By", "Dr. Amar Shinde | Clinical Director, Jagrutii Rehab Centre Pvt. Ltd."],
  ["Approved By", "Dr. Amar Shinde | Clinical Director"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Clinical & Security Staff"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 94, 97, 99, 100, 115); NABH COP 9; Occupational Safety; IPS Guidelines; UN Principles for Protection of Persons with Mental Illness"],
  ["NABH Chapter", "COP | ACE | RM | MOM"],
  ["Classification", "CONFIDENTIAL – Restricted Clinical Document"],
];

const DEFINITIONS_ROWS = [
  ["Physical Restraint", "Manual application of force by trained clinical staff to restrict a patient's freedom of movement temporarily to prevent immediate harm. Also referred to as 'manual holding'."],
  ["Mechanical Restraint", "Use of a physical device (e.g., wrist cuffs, body belt, limb restraint) to restrict movement. Requires the highest level of authorisation and monitoring. NOT to be confused with chaining, which is prohibited."],
  ["Chemical Restraint", "Use of medication specifically to control acute agitation or dangerous behaviour, beyond routine therapeutic dosing. Governed jointly by this SOP and SE-02 (Rapid Tranquilisation Protocol)."],
  ["Seclusion", "Placing a patient alone in a designated room to prevent harm, where the patient is not free to leave. Requires specific infrastructure, authorisation, monitoring, and maximum duration."],
  ["Therapeutic Holding", "Brief, low-level physical support (e.g., guiding a patient's arm) that does not constitute formal restraint and does not require the full restraint protocol — but must still be documented."],
  ["Positional Asphyxia", "Death caused by a body position that restricts breathing. Prone restraint (face-down) is the primary cause. Absolutely prohibited."],
  ["Restraint Register", "A dedicated, centre-level register maintained separately from the EMR, recording every restraint episode with key data fields. Required for NABH audit."],
];

const LEGAL_ROWS = [
  ["MHCA 2017 Sec. 94", "Emergency treatment", "Authority to administer emergency treatment without consent when there is immediate life-threatening risk — applies to chemical restraint during emergencies"],
  ["MHCA 2017 Sec. 97", "Police powers", "Patient brought by police: facility's clinical obligations remain; police involvement does not authorise inappropriate restraint"],
  ["MHCA 2017 Sec. 99", "PROHIBITED CONDUCT – Criminal", "Chaining, unmodified ECT, physical punishment, acts causing unnecessary pain or humiliation are criminal offences. Prone restraint causing injury may also attract prosecution."],
  ["MHCA 2017 Sec. 100", "Discharge of Sec. 89/90 patients", "MHRB may review and order discharge; restraint of involuntary patients must be reported to MHRB"],
  ["MHCA 2017 Sec. 115", "MHRB jurisdiction", "Patients or NRs may complain to MHRB about any restraint episode; facility must have documentation ready"],
  ["NABH COP 9", "Restraint standard", "Defined indications, authorisation, monitoring, duration limits, and documentation standards; audit evidence required"],
  ["BNS 2023 Sec. 115", "Voluntarily causing hurt", "Excessive force, improper holds, or punitive restraint by staff may constitute a criminal offence"],
];

const AUTH_FRAMEWORK_ROWS = [
  ["Physical (manual holding)", "Nursing In-Charge may initiate in immediate life-threatening emergency", "Treating Psychiatrist — written order in EMR", "30 minutes"],
  ["Mechanical restraint", "Nursing In-Charge may apply device in immediate emergency pending psychiatrist", "Treating Psychiatrist — written order in EMR AND physical presence", "15 minutes"],
  ["Chemical restraint (RT)", "None — prescribing authority is required at all times", "Treating Psychiatrist or MO under supervising psychiatrist", "No emergency exception; RT cannot be given without prescribing authority"],
  ["Seclusion", "Centre Head may initiate pending psychiatrist review", "Treating Psychiatrist — written order in EMR", "30 minutes"],
  ["Continuation beyond 2 hours (any type)", "N/A", "Treating Psychiatrist + Regional Head review and documented clinical justification", "Review must occur before 2-hour mark"],
];

const MONITORING_ROWS = [
  ["SpO2", "Every 15 min", "< 94%", "Release restraint; supplemental O2; call psychiatrist; prepare for SE-04 transfer if no improvement"],
  ["Respiratory Rate", "Every 15 min", "< 10 or > 25", "Release restraint immediately; call psychiatrist; assess for obstruction"],
  ["Blood Pressure", "Every 15 min", "Systolic < 90 mmHg", "IV access; call psychiatrist; consider SE-04 transfer"],
  ["Pulse / HR", "Every 15 min", "< 50 or > 130", "Call psychiatrist immediately; continuous monitoring"],
  ["Level of Consciousness / GCS", "Continuous visual; formal every 15 min", "Any drop in GCS or unresponsive", "Release immediately; emergency response (SE-04)"],
  ["Skin Colour (all patients)", "Continuous visual", "Cyanosis (blue lips/fingers)", "Release immediately; emergency response (SE-04)"],
  ["Circulation – restrained limbs (mechanical only)", "Every 15 min", "Pale, cold, numb, or absent capillary refill", "Remove mechanical device from affected limb immediately; call psychiatrist"],
  ["Temperature (if prolonged)", "Every 30 min", "Temp > 38.5°C", "Consider NMS (neuroleptic malignant syndrome); call psychiatrist urgently"],
];

const DURATION_ROWS = [
  ["Physical (manual holding)", "Every 15 minutes", "30 minutes without psychiatrist physical presence", "2 hours; beyond this requires Regional Head documented review"],
  ["Mechanical restraint", "Every 15 minutes", "2 hours without Senior Psychiatrist + Regional Head review", "4 hours; beyond this requires Clinical Director notification"],
  ["Seclusion", "Every 30 minutes", "2 hours without Psychiatrist review", "4 hours; beyond this Clinical Director must be informed"],
  ["Chemical restraint (RT)", "Per SE-02 RTMC protocol", "Per SE-02 Section 8.4 monitoring", "Per SE-02; redosing requires fresh clinical decision"],
];

const RESTRAINT_REGISTER_ROWS = [
  ["Patient identifier", "Full name, UHID, ward"],
  ["Type of restraint", "Physical / Mechanical / Chemical / Seclusion (specify)"],
  ["Date and time of initiation", "Exact, to the minute"],
  ["Indication", "Specific risk stated; de-escalation attempts documented"],
  ["Alternatives attempted before restraint", "Named specifically — 'de-escalation' alone is insufficient"],
  ["Authorising clinician", "Name, designation, time of authorisation"],
  ["Staff present", "Names and designations of all staff involved"],
  ["Monitoring entries", "Every 15-minute vitals and observation entries"],
  ["Psychiatrist review times", "All clinical review entries with times"],
  ["Date and time of discontinuation", "Exact"],
  ["Reason for discontinuation", "Criteria that allowed safe release"],
  ["Post-restraint assessment", "Physical and mental state after release"],
];

const RCA_ROWS = [
  ["Any patient injury during restraint", "Centre Head + Regional Head + Clinical Director", "Within 4 hours"],
  ["Any mechanical restraint episode", "Regional Head", "Within 24 hours"],
  ["Restraint duration > 4 hours", "Regional Head + Clinical Director", "Within 4 hours of the 4-hour mark"],
  ["Restraint of a minor under 16", "Clinical Director", "Within 2 hours"],
  ["Restraint of a pregnant patient", "Clinical Director + Obstetrician review", "Immediately"],
  ["Complaint from patient or NR about restraint", "Grievance Officer + Regional Head", "Within 24 hours; refer CL-05"],
  ["MHRB complaint related to restraint", "Clinical Director + Legal Counsel", "Within 4 hours of receipt"],
  ["Prone restraint used under any circumstances", "Clinical Director — immediate suspension of involved staff pending review", "Immediately"],
  ["Three or more restraint episodes in a week at one centre", "Regional Head", "Within 24 hours"],
];

const TRAINING_ROWS = [
  ["All clinical staff", "Restraint indications; MHCA Sec. 99 prohibitions; de-escalation (cross-ref SE-02); documentation standards", "On joining + Annual"],
  ["Nurses – physical restraint authorised", "Safe holds; monitoring parameters; circulation checks; prohibited holds; positional asphyxia risk; restraint register", "On joining + 6-Monthly practical"],
  ["Nurses – mechanical restraint", "Device application; tension checks; circulation monitoring; maximum duration", "Separate practical assessment annually"],
  ["Psychiatrists / MOs", "Authorisation criteria; MHCA framework; chemical restraint pharmacology (SE-02); RCA requirements", "On joining + Annual"],
  ["Security staff", "Support role only; absolute prohibitions; reporting chain; de-escalation", "On joining + Annual"],
  ["Centre Heads", "RCA triggers; restraint register audit; MHRB notification; staff support", "On joining + Annual"],
];

const KPI_ROWS = [
  ["Restraint Register (RR-F-001) completed in real time", "100%", "Monthly"],
  ["Psychiatrist authorisation documented within 30 minutes", "100%", "Monthly"],
  ["Monitoring chart (RMC-F-001) complete with no gaps", "100%", "Monthly"],
  ["Post-restraint patient assessment within 30 minutes of release", "100%", "Monthly"],
  ["Patient debrief within 24 hours of restraint episode", "100%", "Monthly"],
  ["De-escalation attempt documented before restraint", "100%", "Monthly"],
  ["MHRB notification within 48 hrs (mechanical restraint / Sec. 89-90 patients)", "100%", "Monthly"],
  ["Restraint episodes discussed at next MCR", "100%", "Monthly"],
  ["RCA initiated within 5 days of trigger event", "100%", "Per event"],
  ["Prone restraint incidents", "Zero", "Monthly"],
  ["Mechanical restraint of patient under 16", "Zero", "Monthly"],
  ["Chaining of any patient", "Zero", "Monthly"],
];

const RELATED_DOCS_ROWS = [
  ["SE-01", "Suicide Risk Prevention & Management SOP", "Restraint in suicidal crisis; post-restraint suicide risk assessment"],
  ["SE-02", "Violence & Aggression Management SOP", "De-escalation before restraint; RT protocol (chemical restraint)"],
  ["SE-04", "Medical Emergency & ICU Escalation SOP", "Medical deterioration during restraint; transfer protocol"],
  ["CL-03", "Emergency Admission SOP", "MHCA Sec. 94 authority during restraint emergencies"],
  ["CL-05", "Patient & Family Grievance Redressal SOP", "Patient / family complaint about restraint"],
  ["CL-06", "MHRB Process & Compliance SOP", "MHRB notification for restraint of Sec. 89/90 patients"],
  ["DG-01", "Clinical Documentation Standards SOP", "Restraint register and EMR documentation standards"],
  ["QM Incident Reporting SOP", "JRCPL/QM/IR/001", "Sentinel event reporting for restraint-related injuries"],
];

const REVIEW_ROWS = [
  ["Review Cycle", "Annual, or immediately post-sentinel restraint event, MHRB complaint, NABH inspection finding, or pattern of repeat episodes"],
  ["Review Responsibility", "Clinical Director + Regional Head + Nursing Head + Legal Advisor"],
  ["Version History", "v1.0 – 15 February 2026 (Jagruti Rehabilitation Centre, initial release) v2.0 – June 2025 (Jagrutii Rehab Centre Pvt. Ltd., full refinement — MHCA Sec. 99, mechanical restraint protocol, monitoring parameters with thresholds, duration limits table, seclusion room specifications, patient debrief, MHRB notification, RCA trigger matrix, special populations, staff support, 12 KPIs, 9 mandatory forms)"],
  ["Next Review Due", "June 2026"],
  ["Distribution", "All Psychiatrists, Nursing Heads, Centre Heads, Security Supervisors, Regional Head, Grievance Officers"],
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Se03RestraintSeclusionGovernance = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`}>
        <SEDocHeader
          docCode="SE-03"
          title="Restraint & Seclusion Governance SOP"
          tagline="MHCA 2017 Sec. 99 • NABH COP 9 • Zero Misuse Culture • All Verticals"
        />
      </div>

      <ControlTable rows={CONTROL_ROWS} />

      <CalloutBox title="Non-Negotiable Governance Principles:">
        <BulletList items={[
          "Restraint and seclusion are LAST-RESORT safety interventions — never first responses, never punitive, never for staff convenience",
          "Every episode of restraint is a potential sentinel event and is reviewed without exception",
          "Prone restraint (face-down) is ABSOLUTELY PROHIBITED under any circumstances — it carries a risk of death by positional asphyxia",
          "Chaining of any patient is a criminal offence under MHCA 2017 Section 99",
          "Every patient has the right to be free from arbitrary physical restriction under MHCA 2017",
        ]} />
      </CalloutBox>

      {/* 1. PURPOSE */}
      <SectionHeader>1. Purpose</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>This SOP defines the clinical criteria, authorisation procedures, monitoring standards, duration limits, documentation requirements, and post-episode governance for physical restraint, mechanical restraint, chemical restraint, and seclusion across all Jagrutii Rehab Centre locations.</p>
      <p style={{ margin: "0 0 0.5rem" }}>It ensures:</p>
      <BulletList items={[
        "Restraint and seclusion are used only as last-resort safety measures, never punitively",
        "Every episode is properly authorised, monitored, documented, and reviewed",
        "Patient dignity and rights are maintained throughout any restrictive intervention",
        "Staff act within legal and ethical boundaries under MHCA 2017",
        "The organisation can demonstrate compliance with NABH COP 9 and MHCA Sec. 99 at any audit",
      ]} />

      {/* 2. SCOPE */}
      <SectionHeader>2. Scope</SectionHeader>
      <BulletList items={[
        "All inpatient patients across all four clinical verticals and all 18 centres",
        "All clinical staff authorised to participate in restraint: psychiatrists, medical officers, nurses (trained)",
        "Security staff (support role only; may not initiate or lead restraint independently)",
        "This SOP applies regardless of the patient's admission category — voluntary, supported, involuntary, or emergency",
      ]} />

      {/* 3. DEFINITIONS */}
      <SectionHeader>3. Definitions</SectionHeader>
      <DataTable
        cols={[{ label: "Term", width: "22%" }, { label: "Definition" }]}
        rows={DEFINITIONS_ROWS}
      />

      {/* 4. LEGAL FRAMEWORK */}
      <SectionHeader>4. Legal Framework</SectionHeader>
      <DataTable
        cols={[{ label: "Reference", width: "18%" }, { label: "Subject", width: "24%" }, { label: "Requirement" }]}
        rows={LEGAL_ROWS}
      />

      {/* 5. INDICATIONS, CONTRAINDICATIONS & PROHIBITED USES */}
      <SectionHeader>5. Indications, Contraindications &amp; Prohibited Uses</SectionHeader>
      <SubTitle>5.1 Indications – ALL Three Must Be Present</SubTitle>
      <AlertBox title="✓ Restraint or seclusion is only permissible when ALL three criteria are documented:">
        <BulletList items={[
          "There is an immediate risk of serious physical harm to the patient, staff, or others",
          "Less restrictive interventions (verbal de-escalation, environmental modification, oral medication) have been genuinely attempted and have failed — cross-ref SE-02",
          "The treating psychiatrist has authorised (or in a life-threatening emergency, temporary holding is in progress pending psychiatrist arrival within 30 minutes)",
        ]} />
      </AlertBox>

      <SubTitle>5.2 Contraindications – Restraint Must NOT Be Used</SubTitle>
      <CalloutBox title="Restraint is contraindicated in the following situations and must not be applied:">
        <BulletList items={[
          "As punishment for non-compliant or difficult behaviour",
          "For staff convenience, reduced staffing, or to manage an agitated patient 'more easily'",
          "As a substitute for adequate staffing levels",
          "For a patient who is asking to be discharged (even against medical advice) — see CL-01 DAMA process",
          "For a patient who is medically unstable, where restraint would worsen the medical condition",
          "For an elderly patient with known osteoporosis or frailty without explicit senior psychiatrist authorisation and documented risk-benefit",
        ]} />
      </CalloutBox>

      {/* 6. TYPES OF RESTRAINT */}
      <SectionHeader>6. Types of Restraint – Specific Standards</SectionHeader>
      <SubTitle>6.1 Physical Restraint (Manual Holding)</SubTitle>
      <BulletList items={[
        "Minimum 3 trained clinical staff required: 1 leads (communication), 2 apply holds",
        "Lead staff member maintains continuous verbal communication with the patient throughout: explains what is happening; uses calm tone; does not argue",
        "Holds applied to arms and torso only; smooth, controlled application without jerking or pain",
        "Patient positioned upright or on their side — NEVER face-down",
        "Patient's airway must be visible and unobstructed at all times",
        "If physical restraint is required beyond 5 minutes: psychiatrist must be physically present or mechanical restraint evaluation initiated",
        "Transition to mechanical restraint or chemical restraint if manual holding cannot be safely maintained with available staff",
      ]} />

      <SubTitle>6.2 Mechanical Restraint</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Mechanical restraint (use of physical devices) is the most restrictive form of restraint and carries the greatest clinical and legal risk. It requires the highest level of authorisation and monitoring.</p>
      <BulletList items={[
        "Devices permitted: padded wrist cuffs, padded ankle cuffs, body belt — only devices specifically approved for clinical use; never improvised materials",
        "Application: trained clinical staff only; device must be applied at correct tension — two fingers must fit between the restraint and the skin at all times",
        "Only 4-point restraint maximum (both wrists and both ankles); never fixed to an immovable structure in a way that prevents any movement",
        "Patient must be in supine (on back) or lateral (on side) position; NEVER prone",
        "Circulation checks every 15 minutes: colour, warmth, capillary refill, sensation and movement of all restrained limbs — documented in Mechanical Restraint Monitoring Chart (MRMC-F-001)",
        "Psychiatrist must be notified immediately and must authorise mechanical restraint within 15 minutes of application",
        "Mechanical restraint must be discontinued at the earliest possible moment; maximum continuous duration without senior psychiatrist review is 2 hours",
      ]} />
      <CalloutBox title="Absolutely Prohibited Mechanical Restraint Practices:">
        <BulletList items={[
          "Chaining any patient to a bed, wall, or furniture — this is a criminal offence under MHCA Sec. 99",
          "Restraining a patient in a prone (face-down) position",
          "Using improvised materials (sarees, bedsheets, rope, tape) as restraints",
          "Applying restraints so tightly that circulation is impaired",
          "Leaving a mechanically restrained patient unobserved for any period",
          "Using mechanical restraint on a pregnant patient without obstetrician review",
        ]} />
      </CalloutBox>

      <SubTitle>6.3 Chemical Restraint</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Chemical restraint refers to administration of medication for acute behavioural control, beyond routine therapeutic dosing. It is governed jointly by this SOP and the Rapid Tranquilisation Protocol (SE-02 Section 8).</p>
      <BulletList items={[
        "Chemical restraint is only prescribed by a Psychiatrist or MO under supervising psychiatrist direction",
        "Indications and contraindications as per SE-02 Section 8.1 and 8.2",
        "Medication, dose, route, and clinical rationale documented in the Restraint Register (RR-F-001) and EMR simultaneously",
        "Post-RT monitoring per SE-02 RTMC-F-001 protocol applies in all cases of chemical restraint",
        "Chemical restraint must not be used as a substitute for adequate staffing or as a first-line response before de-escalation is attempted",
      ]} />

      {/* 7. AUTHORISATION FRAMEWORK */}
      <SectionHeader>7. Authorisation Framework</SectionHeader>
      <DataTable
        cols={[
          { label: "Restraint Type", width: "18%" },
          { label: "Emergency Temporary Authority", width: "24%" },
          { label: "Formal Authorisation Required By", width: "30%" },
          { label: "Maximum Time to Formal Authorisation" },
        ]}
        rows={AUTH_FRAMEWORK_ROWS}
      />
      <AlertBox title="⚠ Authorisation Documentation">
        A verbal order for restraint does not satisfy the documentation requirement. Every authorisation must be entered in the EMR as a dated and timed written order by the prescribing/authorising clinician before restraint is considered formally authorised. Where the clinical urgency prevents this, the note must be entered within 30 minutes with a 'retrospective authorisation' entry noting the exact time of verbal instruction.
      </AlertBox>

      {/* 8. PHYSICAL RESTRAINT PROCEDURE */}
      <SectionHeader>8. Physical Restraint Procedure</SectionHeader>
      <ResponseStep
        num="01"
        title="Before Applying Restraint"
        items={[
          "Confirm all three criteria in Section 5.1 are present",
          "Confirm de-escalation has been attempted and documented (cross-ref SE-02)",
          "Notify duty psychiatrist immediately; do not wait for arrival before documenting the call",
          "Assign 3 trained staff minimum: identify lead (communication) and 2 support",
          "Remove other patients from the immediate area",
          "Brief the team on their roles in under 30 seconds before approach",
        ]}
      />
      <ResponseStep
        num="02"
        title="During Restraint Application"
        items={[
          "Lead staff member speaks to the patient calmly throughout: 'We are going to hold you to keep you safe. We are not hurting you.'",
          "Smooth, controlled hold applied to arms and torso — no jerking, no pain",
          "Patient positioned upright or on side — NEVER face-down (prone)",
          "Airway visible and unobstructed; breathing checked every 2 minutes verbally",
          "Time of initiation entered into Restraint Register (RR-F-001) immediately",
          "If patient becomes unresponsive or cyanotic: release immediately; initiate emergency response (SE-04)",
        ]}
      />
      <ResponseStep
        num="03"
        title="During Restraint – Ongoing Monitoring (Every 15 Minutes)"
        items={[
          "Vitals: BP, pulse, RR, SpO2 — entered in Restraint Monitoring Chart (RMC-F-001)",
          "GCS / level of consciousness",
          "Skin colour and breathing — continuous visual check",
          "Patient's verbal communication: able to speak? Report any distress?",
          "Circulation if mechanical restraint: warmth, colour, capillary refill, sensation",
          "Need for continued restraint re-assessed at every 15-minute check — discontinue as soon as safe to do so",
        ]}
      />
      <ResponseStep
        num="04"
        title="Psychiatrist Review"
        items={[
          "Psychiatrist reviews the patient physically within 30 minutes of restraint initiation",
          "Documents: clinical justification for continuing or discontinuing, updated risk assessment, observation level, medication review",
          "If restraint continuing at 2 hours: Senior Psychiatrist + Regional Head documented review required before continuation",
          "Maximum duration without Regional Head review: 4 hours",
        ]}
      />
      <ResponseStep
        num="05"
        title="Discontinuation"
        items={[
          "Restraint discontinued as soon as immediate risk has reduced — this is the clinical goal",
          "De-escalation resumes at discontinuation: calm verbal reassurance",
          "Patient moved to safe, calm environment (quiet room / seclusion step-down if applicable)",
          "Time of discontinuation entered in RR-F-001 immediately",
          "Physical and mental state assessment within 30 minutes of discontinuation — documented in EMR",
        ]}
      />

      {/* 9. MONITORING PARAMETERS */}
      <SectionHeader>9. Monitoring Parameters &amp; Escalation Thresholds</SectionHeader>
      <DataTable
        cols={[
          { label: "Parameter", width: "22%" },
          { label: "Frequency", width: "16%" },
          { label: "Escalation Threshold", width: "20%" },
          { label: "Required Action" },
        ]}
        rows={MONITORING_ROWS}
      />
      <AlertBox title="⚠ Resuscitation Equipment">
        During any physical or mechanical restraint episode, the following must be accessible within 2 minutes: Ambu bag, oxygen supply with mask, suction device, IV access kit. The nursing team must not begin physical or mechanical restraint in an area where this equipment is not accessible.
      </AlertBox>

      {/* 10. DURATION LIMITS */}
      <SectionHeader>10. Duration Limits</SectionHeader>
      <DataTable
        cols={[
          { label: "Restraint Type", width: "20%" },
          { label: "Review Interval", width: "18%" },
          { label: "Maximum Without Senior Review", width: "30%" },
          { label: "Absolute Maximum" },
        ]}
        rows={DURATION_ROWS}
      />
      <p style={{ margin: "0 0 0.75rem" }}>Prolonged restraint beyond these limits without documented clinical review is treated as a governance failure. The Regional Head conducts a mandatory review of any restraint episode exceeding 4 hours.</p>

      {/* 11. SECLUSION PROTOCOL */}
      <SectionHeader>11. Seclusion Protocol</SectionHeader>
      <AlertBox title="Seclusion at Jagrutii Rehab Centres">
        Seclusion is only used at centres with a designated seclusion room that meets the safety specifications below. Locking a patient in any other room does not constitute therapeutic seclusion — it constitutes unlawful detention. Centres without a compliant seclusion room must manage behavioural emergencies through physical restraint and rapid tranquilisation only.
      </AlertBox>

      <SubTitle>11.1 Seclusion Room Specifications</SubTitle>
      <BulletList items={[
        "Minimum 4m² floor area; no furniture except a mattress on the floor",
        "Ligature-free: no hooks, exposed pipes, curtain rails, or protruding fittings",
        "Continuous direct visual observation possible: reinforced glass observation panel OR monitored CCTV with real-time viewing at nursing station",
        "Intercom or call facility so patient can communicate with staff",
        "Adequate ventilation, lighting, and temperature",
        "Clean, non-punitive environment; patient given appropriate clothing and toilet access",
      ]} />

      <SubTitle>11.2 Seclusion Indications</SubTitle>
      <BulletList items={[
        "Immediate risk of serious harm where physical restraint alone cannot be safely maintained with available staff",
        "Brief step-down from physical restraint when patient is partially de-escalated but not yet safe for open ward",
        "Seclusion is NOT to be used as a punishment, for non-compliance, or for patients who are merely verbally abusive",
      ]} />

      <SubTitle>11.3 Seclusion Procedure</SubTitle>
      <NumberedList items={[
        "Centre Head or Nursing In-Charge initiates; psychiatrist notified immediately",
        "Patient informed of reason in plain language; patient's request to leave documented",
        "Time of entry into seclusion room documented in Restraint Register (RR-F-001) immediately",
        "Continuous observation maintained: visual check every 15 minutes minimum; documented in Seclusion Monitoring Chart (SMC-F-001)",
        "Psychiatrist review within 30 minutes of initiation; documented order in EMR",
        "Patient offered toilet access and water at each 30-minute nursing review",
        "Seclusion discontinued as soon as patient is calm and risk has reduced",
        "Time of exit documented; post-seclusion assessment within 30 minutes of release",
      ]} />

      {/* 12. DOCUMENTATION STANDARDS */}
      <SectionHeader>12. Documentation Standards</SectionHeader>
      <SubTitle>12.1 Restraint Register (RR-F-001) – Mandatory Real-Time Record</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>The Restraint Register is a paper register maintained at each centre, separate from the EMR. It provides an immediately accessible audit trail.</p>
      <DataTable
        cols={[{ label: "Field", width: "35%" }, { label: "Required Entry" }]}
        rows={RESTRAINT_REGISTER_ROWS}
      />
      <BulletList items={[
        "RR-F-001 entry completed in real time — not retrospectively",
        "Nursing In-Charge is responsible for ensuring the register is complete before end of shift",
        "Restraint Register reviewed monthly by Centre Head; submitted to Regional Head quarterly",
      ]} />

      <SubTitle>12.2 EMR Documentation (Parallel to Register)</SubTitle>
      <BulletList items={[
        "Psychiatrist documents clinical note in EMR: indication, alternatives tried, authorisation, clinical assessment, monitoring plan, continuation decision",
        "Each 15-minute monitoring entry also reflected in nursing notes in EMR",
        "Discontinuation note in EMR: time, clinical state at release, post-restraint care plan",
        "If MHRB notification required (Sec. 89/90 patients): Grievance Officer enters notification reference in EMR",
      ]} />

      {/* 13. MHRB NOTIFICATION */}
      <SectionHeader>13. MHRB Notification for Involuntary / Supported Patients</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>When a patient on Supported Admission (Sec. 89) or Involuntary Admission (Sec. 90) is subjected to any restraint episode, the following MHRB obligations apply in addition to the standard documentation requirements:</p>
      <NumberedList items={[
        "Grievance Officer informed of the restraint episode within 24 hours",
        "If the restraint exceeded 4 hours OR involved mechanical restraint: written notification to the District MHRB within 48 hours of the episode",
        "Notification includes: patient identifier, type of restraint, duration, clinical justification, name of authorising psychiatrist",
        "MHRB notification reference filed in patient's medical record and EMR",
        "Patient and NR informed of their right to apply to the MHRB for review of the restraint decision at any time — cross-ref CL-06",
      ]} />

      {/* 14. POST-RESTRAINT REVIEW */}
      <SectionHeader>14. Post-Restraint Review</SectionHeader>
      <SubTitle>14.1 Immediate Post-Restraint Assessment (Within 30 Minutes of Release)</SubTitle>
      <NumberedList items={[
        "Physical assessment: injuries, skin integrity, circulation in restrained limbs, vital signs, neurological status",
        "Mental state assessment: orientation, mood, level of distress, risk level",
        "Injuries documented using body map (BM-F-001) with description and photograph if injury is visible",
        "Incident Report (IR-F-001) initiated if any injury to patient or staff has occurred",
      ]} />

      <SubTitle>14.2 Patient Debrief (Within 24 Hours, When Clinically Appropriate)</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>The patient debrief is a therapeutic, non-punitive conversation conducted by the treating psychiatrist or senior clinician. Its purpose is to:</p>
      <BulletList items={[
        "Understand the patient's experience and perspective on the restraint episode",
        "Acknowledge any distress caused, without diminishing the clinical necessity",
        "Identify the antecedents and triggers that led to restraint",
        "Revise the care plan to reduce the likelihood of future episodes",
        "Rebuild the therapeutic alliance",
        "Debrief documented in the clinical EMR notes; patient's own account recorded",
      ]} />

      <SubTitle>14.3 MDT Review</SubTitle>
      <BulletList items={[
        "Every restraint episode is discussed at the next Multidisciplinary Case Review (MCR) meeting",
        "Review covers: clinical justification, alternatives considered, monitoring compliance, patient experience, lessons for prevention",
        "If restraint was repeated (second episode within 7 days for the same patient): mandatory review of the patient's care plan, risk assessment, and therapeutic approach",
      ]} />

      {/* 15. ROOT CAUSE ANALYSIS TRIGGERS */}
      <SectionHeader>15. Root Cause Analysis Triggers</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>A Root Cause Analysis (RCA) is mandatory for any of the following:</p>
      <DataTable
        cols={[{ label: "Trigger" }, { label: "Escalate To", width: "28%" }, { label: "Timeline", width: "22%" }]}
        rows={RCA_ROWS}
      />
      <p style={{ margin: "0 0 0.75rem" }}>RCA report submitted to Clinical Director within 10 working days. Corrective Action Plan implemented within 30 days. De-identified learning shared across all centres.</p>

      {/* 16. SPECIAL POPULATION PROVISIONS */}
      <SectionHeader>16. Special Population Provisions</SectionHeader>
      <SubTitle>16.1 Elderly Patients</SubTitle>
      <WarningBox title="Elderly – Extreme Caution">
        Physical and mechanical restraint in elderly patients carries a significantly elevated risk of fracture, aspiration, delirium worsening, and death. Even a correctly applied hold may fracture an osteoporotic limb. Senior Psychiatrist must personally review and authorise any restraint in a patient over 65 years. The bar for justification is higher; chemical restraint at reduced doses is usually preferable.
      </WarningBox>
      <BulletList items={[
        "Haloperidol maximum 2.5 mg IM for chemical restraint in elderly; avoid benzodiazepines as first-line — aspiration risk",
        "Post-restraint: mandatory check for falls, fractures, bruising; document on BM-F-001",
        "Dementia-related aggression: address unmet need (pain, constipation, fear) before any physical intervention",
      ]} />

      <SubTitle>16.2 Children &amp; Adolescents (Under 18)</SubTitle>
      <CalloutBox title="Restraint of minors:">
        <BulletList items={[
          "Physical restraint of a patient under 18: only under direct supervising psychiatrist presence; prohibited without psychiatrist on-site",
          "Mechanical restraint of a patient under 16: absolutely prohibited",
          "Parent or legal guardian notified within 1 hour of any restraint episode involving a minor",
          "Clinical Director notified within 2 hours of any restraint of a minor under 16",
          "Post-restraint debrief with the young person is mandatory, developmentally appropriate, and conducted within 24 hours",
          "Repeated restraint of a minor triggers CWC notification review",
        ]} />
      </CalloutBox>

      <SubTitle>16.3 Pregnant Patients</SubTitle>
      <BulletList items={[
        "Any physical restraint of a pregnant patient: immediate involvement of treating psychiatrist and obstetrician (or obstetric consultation within 1 hour)",
        "Mechanical restraint of a pregnant patient: absolutely prohibited without joint psychiatrist-obstetrician written authorisation",
        "Holds that apply any pressure to the abdomen: absolutely prohibited",
        "All restraint episodes involving a pregnant patient: Clinical Director notified immediately; automatic RCA initiated",
      ]} />

      <SubTitle>16.4 Involuntary / Supported Patients</SubTitle>
      <BulletList items={[
        "MHRB notification obligations apply — see Section 13",
        "Patient's involuntary status does not make restraint easier to justify — the same clinical criteria apply",
        "Any restraint of an involuntary patient must be reviewed at the next MHRB notification and available for Board scrutiny",
      ]} />

      <SubTitle>16.5 De-Addiction – Active Withdrawal</SubTitle>
      <BulletList items={[
        "Aggression during active alcohol or opioid withdrawal: rule out medical emergency (DTs, hypoglycaemia) before restraint decision",
        "Chemical restraint (RT) in intoxicated patients: use lower doses; benzodiazepine + alcohol intoxication = increased respiratory depression risk",
        "CIWA-Ar score and BSL must be documented within 30 minutes before mechanical restraint in any withdrawal patient",
      ]} />

      {/* 17. STAFF TRAINING & COMPETENCY */}
      <SectionHeader>17. Staff Training &amp; Competency</SectionHeader>
      <DataTable
        cols={[{ label: "Staff Category", width: "24%" }, { label: "Training Content" }, { label: "Frequency", width: "22%" }]}
        rows={TRAINING_ROWS}
      />
      <BulletList items={[
        "Physical restraint training: minimum 4 hours practical; scenario-based; trainer-assessed competency",
        "Staff not assessed as competent in safe physical restraint are not rostered for high-dependency wards",
        "Any staff member found to have used a prohibited hold: immediate suspension from restraint duties pending review",
      ]} />

      {/* 18. KPIs & AUDIT */}
      <SectionHeader>18. KPIs &amp; Audit</SectionHeader>
      <DataTable
        cols={[{ label: "KPI" }, { label: "Target", width: "12%" }, { label: "Review Frequency", width: "18%" }]}
        rows={KPI_ROWS}
      />

      {/* 19. STAFF PSYCHOLOGICAL SUPPORT */}
      <SectionHeader>19. Staff Psychological Support Post-Incident</SectionHeader>
      <NumberedList items={[
        "Immediate defusing: Centre Head conducts informal support meeting with directly involved staff within 4 hours",
        "Formal debriefing: facilitated by senior psychologist or EAP provider within 48–72 hours",
        "Staff involved in a patient injury have the right to compassionate leave without penalty",
        "Staff are explicitly told: this is a systems review, not individual blame — pending RCA findings",
        "Clinical Director monitors staff wellbeing at 1 week and 1 month post-significant incident",
        "Any staff member using a prohibited hold must be removed from restraint duties pending review; this is a clinical safety measure, not a prejudgement",
      ]} />

      {/* 20. RELATED DOCUMENTS */}
      <SectionHeader>20. Related Documents</SectionHeader>
      <DataTable
        cols={[{ label: "Doc ID", width: "14%" }, { label: "Title", width: "36%" }, { label: "Relationship" }]}
        rows={RELATED_DOCS_ROWS}
      />

      {/* 21. REVIEW & VERSION CONTROL */}
      <SectionHeader>21. Review &amp; Version Control</SectionHeader>
      <ControlTable rows={REVIEW_ROWS} />

      <SectionHeader>Authorisation &amp; Sign-Off</SectionHeader>
      <SEAuthorisation docCode="SE-03" version="2.0" date="June 2025" />

    </div>
  </Fragment>
));

export default Se03RestraintSeclusionGovernance;
