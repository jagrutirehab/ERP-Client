import React, { forwardRef, Fragment } from "react";
import {
  RED, cell, NAVY,
  SectionHeader, SubTitle, BulletList, NumberedList,
  DataTable, ControlTable, WarningBox, AlertBox,
  ResponseStep, CalloutBox, SEDocHeader, SEAuthorisation,
} from "./SEComponents";

// ── DATA ──────────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  ["Doc ID", "SE-02"],
  ["Series", "SE — Safety & Emergency"],
  ["Category", "Patient Safety | Staff Safety | Sentinel Event Prevention"],
  ["Replaces", "SE-02 v1.0 dated 15.02.2026 (Jagruti Rehabilitation Centre)"],
  ["Version", "2.0 (Refined)"],
  ["Effective Date", "June 2025"],
  ["Review Due", "June 2026 (Annual or post-major incident)"],
  ["Prepared By", "Dr. Amar Shinde | Clinical Director, Jagrutii Rehab Centre Pvt. Ltd."],
  ["Approved By", "Dr. Amar Shinde | Clinical Director"],
  ["Applicable To", "All 18 Centres | All Four Clinical Verticals | All Staff"],
  ["Regulatory Basis", "MHCA 2017 (Sec. 94, 97, 98, 99); NICE NG10 Violence & Aggression Guidelines; NABH COP 9; IPS Guidelines; Occupational Safety & Health"],
  ["Classification", "CONFIDENTIAL – Restricted Clinical Document"],
];

const LEGAL_ROWS = [
  ["MHCA Sec. 94", "Emergency Treatment", "Authority to administer emergency treatment (including RT) without consent when immediate risk of harm; limits and documentation required"],
  ["MHCA Sec. 97", "Police powers", "Governs police authority to bring an agitated person to a psychiatric facility; does not alter the facility's clinical obligations"],
  ["MHCA Sec. 98", "Emergency admission", "Permits holding a person for up to 72 hours under emergency conditions; see CL-03"],
  ["MHCA Sec. 99", "Prohibited conduct", "Chaining, unmodified ECT, physical punishment, and acts causing unnecessary pain or humiliation are criminal offences regardless of provocation"],
  ["BNS 2023 Sec. 115", "Voluntarily causing hurt", "Applies to excessive force by staff; disciplinary action and criminal prosecution are both possible"],
  ["NICE NG10", "Clinical Guideline", "Evidence-based standards for de-escalation, physical intervention, and RT in acute psychiatric settings"],
];

const SAFEWARDS_ROWS = [
  ["Clear Mutual Expectations", "Ward rules co-developed with patient input; displayed clearly; explained at admission"],
  ["Soft Words", "Staff use calm, non-confrontational language; raised voices prohibited in patient areas"],
  ["Talk Down", "De-escalation techniques practiced by all staff; refreshed in monthly team meetings"],
  ["Positive Collaboration", "Staff engage patients in activity planning; boredom and frustration are identified as aggression triggers"],
  ["Bad News Mitigation", "Potentially distressing information (court dates, family issues) delivered by trained staff in a private, calm setting"],
  ["Reassurance (post-disturbance)", "After any ward incident, staff proactively reassure other patients"],
  ["Know Each Other", "Staff share a brief personal interest with patients; humanises the relationship; reduces fear-based aggression"],
];

const STAMP_ROWS = [
  ["S — Staring", "Fixed, intense eye contact; tracking staff movements; hypervigilant scanning of environment", "Alert nursing team; note in EMR; review trigger"],
  ["T — Tone", "Voice becoming louder, higher-pitched, clipped, or menacing; change from normal baseline", "Attempt verbal de-escalation immediately; inform duty psychiatrist"],
  ["A — Anxiety", "Visible agitation, wringing hands, pacing, sweating, trembling; distress without apparent reason", "Approach calmly; address unmet need; reduce environmental stimuli"],
  ["M — Mumbling", "Inaudible muttering; repetitive verbal statements; responding to internal stimuli (command hallucinations)", "Consider psychotic deterioration; notify psychiatrist; do not challenge content of hallucinations"],
  ["P — Pacing", "Restless physical movement; inability to settle; invasion of personal space; physical gesturing", "Create space; reduce audience; maintain own calm posture; alert team"],
];

const DEESCALATION_ROWS = [
  ["1", "Acknowledge", "Name the emotion without challenging the content: 'I can see you're very upset right now'"],
  ["2", "Validate", "Legitimise the feeling without agreeing with the trigger: 'It makes sense that you're frustrated'"],
  ["3", "Reduce Demands", "Lower your voice; stop giving instructions; pause requests; give the patient time"],
  ["4", "Identify the Need", "Ask open questions: 'What would help you feel safer right now?'; listen fully before responding"],
  ["5", "Offer Choice", "Provide limited, real choices: 'Would you like to sit in the quiet room or walk with me?'; choice reduces the sense of powerlessness"],
  ["6", "Find Common Ground", "Identify one shared goal: 'We both want you to feel better'; reframe situation as collaborative"],
  ["7", "Environmental Management", "Reduce stimuli: dim lights, lower noise, reduce number of people present, move to quieter space"],
];

const ESCALATION_ROWS = [
  ["LEVEL 1\nVerbal Agitation", "Raised voice, verbal threats, demanding behaviour, pacing; no physical contact; STAMP signs 1–2", "Primary nurse applies STAMP + verbal de-escalation; reduce stimuli; offer quiet room; document in EMR", "Duty psychiatrist informed if de-escalation unsuccessful within 10 minutes"],
  ["LEVEL 2\nPhysical Threat", "Aggressive posturing, throwing objects (not at persons), approach with raised fist; no contact yet", "Increase staff presence (minimum 3 staff visible); remove other patients from area; clear exit routes; duty psychiatrist called immediately; consider oral medication offer", "Centre Head informed; RT medication prepared but not yet administered"],
  ["LEVEL 3\nActive Violence", "Physical assault on staff, patient, or visitor; sustained violent behaviour; object used as weapon", "EMERGENCY: call security; activate emergency alarm; duty psychiatrist to scene immediately; prepare for RT; physical intervention only if patient or others at immediate risk of serious injury", "Regional Head informed within 1 hour; MHCA Sec. 94 authority invoked if RT/restraint required"],
];

const RT_MED_ROWS = [
  ["1", "Patient cooperative; oral possible", "Tab. Lorazepam + Tab. Haloperidol", "Lorazepam 1–2 mg oral + Haloperidol 5 mg oral", "First-line; allow 30–45 min to assess response before next step"],
  ["2A", "Oral refused; general adult", "Inj. Haloperidol + Inj. Promethazine", "Haloperidol 5 mg IM + Promethazine 25–50 mg IM", "Safe combination; Promethazine provides sedation and reduces EPS risk; preferred for general adult"],
  ["2B", "Oral refused; rapid sedation needed", "Inj. Olanzapine", "Olanzapine 10 mg IM", "Do NOT combine IM olanzapine with IM benzodiazepine — risk of fatal respiratory depression"],
  ["3", "Partial response after 2A or 2B; psychiatrist review", "Repeat Step 2A or add Inj. Lorazepam (only with 2A, NOT 2B)", "Lorazepam 1–2 mg IM (only if olanzapine not used)", "Maximum doses apply; psychiatrist re-evaluates before each additional dose"],
  ["Elderly", "Any step — elderly patient", "Haloperidol alone (lower dose)", "Haloperidol 2.5 mg IM; NO benzodiazepine as first-line", "High aspiration risk; extra respiratory monitoring; see Section 15.3"],
  ["Child (12–17)", "Psychiatrist-only decision", "Only under direct consultant psychiatrist order", "Olanzapine 10 mg IM maximum; Haloperidol 2.5–5 mg IM", "Requires parental / guardian consent if feasible; paediatric parameters apply"],
];

const RT_MONITOR_ROWS = [
  ["SpO₂ (pulse oximetry)", "Every 15 minutes", "Every 30 minutes", "SpO₂ < 94%: reposition; supplemental O₂; alert psychiatrist; prepare for transfer SE-04"],
  ["Respiratory Rate", "Every 15 minutes", "Every 30 minutes", "RR < 10 or > 25: alert psychiatrist immediately"],
  ["Blood Pressure", "Every 15 minutes", "Every 30 minutes", "Systolic < 90 mmHg: IV access; alert psychiatrist; consider transfer"],
  ["Pulse / Heart Rate", "Every 15 minutes", "Every 30 minutes", "HR < 50 or > 130: alert psychiatrist"],
  ["Level of Consciousness", "Every 15 minutes", "Every 30 minutes", "GCS drop or unresponsive: emergency response immediately; transfer SE-04"],
  ["Temperature", "Every 30 minutes", "Every hour", "Temp > 38.5°C: consider NMS; alert psychiatrist urgently"],
];

const SECURITY_ROWS = [
  ["Respond to emergency alarm and attend the scene", "Initiate physical intervention without clinical staff direction"],
  ["Assist in containing an area and managing bystanders", "Administer any medication"],
  ["Support trained clinical staff during a physical intervention when directed", "Apply restraint independently"],
  ["Manage external persons (visitors) who become threatening", "Use force against a patient without clinical authorisation"],
  ["Control access to ward during an incident", "Make clinical decisions about the patient's care or disposition"],
  ["Escort an aggressive visitor off the premises", "Use excessive force; any strike is prohibited"],
];

const ENV_ROWS = [
  ["Furniture", "Heavy furniture bolted down or heavy enough to prevent throwing; no sharp corners on high-risk ward furniture"],
  ["Objects", "No glass items, heavy loose objects, or improvised weapons in high-risk patient areas; regular audit"],
  ["Exit pathways", "Staff exit from every patient area unobstructed; panic buttons installed at nursing station and in consultation rooms"],
  ["Space management", "Avoid overcrowding; maintain designated quiet space for de-escalation; separate aggressive patient from others promptly"],
  ["CCTV", "Full coverage of all common areas, corridors, and patient-accessible areas; reviewed after every incident; no CCTV in bathrooms or bedrooms"],
  ["Panic alarm", "Silent panic alarms installed at nursing station, reception, and consultation rooms; tested monthly"],
  ["Visitor management", "Visitor access controlled; visitors screened for items (bags checked on high-risk wards); visiting hours defined and enforced"],
];

const TRAINING_ROWS = [
  ["All clinical staff", "STAMP recognition; verbal de-escalation (NICE NG10); RT protocol awareness; post-incident documentation", "On joining + Annual"],
  ["Psychiatrists / MOs", "Full RT pharmacology; medical cause exclusion; physical intervention authority; MHCA Sec. 94", "On joining + Annual"],
  ["Nursing staff", "STAMP; de-escalation; safe physical support; post-RT monitoring; OBS documentation", "On joining + 6-Monthly"],
  ["Security staff", "STAMP recognition; de-escalation; safe-support role (non-clinical); absolute prohibitions", "On joining + Annual"],
  ["Centre Heads", "Incident escalation; RCA; staff support; environmental audit; visitor management", "On joining + Annual"],
];

const KPI_ROWS = [
  ["Aggression incidents documented within 2 hours", "≥ 95%", "Monthly"],
  ["RT documentation complete (indication, drug, dose, monitoring)", "100%", "Monthly"],
  ["Post-RT monitoring (RTMC-F-001) completed for full 4-hour period", "100%", "Monthly"],
  ["Medical cause exclusion documented before RT", "100%", "Monthly"],
  ["De-escalation attempt documented before RT or physical intervention", "100%", "Monthly"],
  ["Patient debrief within 24 hours of Level 2/3 incident", "100%", "Monthly"],
  ["Staff injury documented in SIR-F-001 within 2 hours", "100%", "Monthly"],
  ["Environmental Safety Audit completed monthly", "100%", "Monthly"],
  ["Level 3 incident RCA initiated within 5 working days", "100%", "Per event"],
  ["Staff trained in de-escalation", "100%", "Annual"],
  ["Prone restraint incidents", "Zero", "Monthly"],
  ["RT administered without psychiatrist prescription", "Zero", "Monthly"],
];

const RELATED_ROWS = [
  ["SE-01", "Suicide Risk Prevention & Management SOP", "Overlapping risk in suicidal + aggressive presentations"],
  ["SE-03", "Restraint & Seclusion Governance SOP", "Physical intervention transitioning to formal restraint"],
  ["SE-04", "Medical Emergency & ICU Escalation SOP", "RT complications; medical cause presentations; post-incident transfer"],
  ["CL-03", "Emergency Admission SOP", "MHCA Sec. 94 authority during RT"],
  ["CL-07", "Referral, Transfer & Continuity of Care SOP", "Transfer of patient after serious incident"],
  ["DG-01", "Clinical Documentation Standards SOP", "Incident reporting and RT documentation standards"],
];

const REVIEW_ROWS = [
  ["Review Cycle", "Annual, or post-major violent incident, NABH inspection finding, or RT-related adverse event"],
  ["Review Responsibility", "Clinical Director + Regional Head + Nursing Head"],
  ["Version History", "v1.0 – 15 February 2026 (Jagruti Rehabilitation Centre, initial release)\nv2.0 – June 2025 (Jagrutii Rehab Centre Pvt. Ltd., full refinement — STAMP framework, NICE NG10 de-escalation, RT pharmacology with doses and contraindications, post-RT monitoring chart, physical intervention prohibitions, Safewards, medical cause exclusion, special populations, patient debrief, staff support, 12 KPIs)"],
  ["Next Review Due", "June 2026"],
  ["Distribution", "All Psychiatrists, Nursing Heads, Centre Heads, Security Supervisors, Social Workers, Regional Head"],
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Se02ViolenceAggressionManagement = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`}>
        <SEDocHeader
          docCode="SE-02"
          title="Violence & Aggression Prevention & Management"
          tagline="MHCA 2017 • STAMP • NICE NG10 • NABH COP 9 • All Verticals"
        />
      </div>

      <ControlTable rows={CONTROL_ROWS} />

      <CalloutBox title="Priority Principle">
        Violence prevention begins before physical aggression. The primary goal is prevention through environmental design, therapeutic relationships, and early warning recognition. Physical intervention and chemical restraint are last resorts — never first responses. Every use of physical force or rapid tranquilisation must be clinically justified, documented in real time, and reviewed.
      </CalloutBox>

      {/* 1. PURPOSE */}
      <SectionHeader>1. Purpose</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>This SOP establishes a structured, evidence-based system for preventing, recognising, and safely managing violent and aggressive incidents across all Jagrutii Rehab Centre locations. It covers the full continuum from proactive prevention through to post-incident review and staff support.</p>
      <BulletList items={[
        "Early warning recognition using the STAMP framework",
        "Evidence-based de-escalation techniques (NICE NG10 aligned)",
        "Structured escalation levels with specific clinical responses",
        "Rapid Tranquilisation (RT) protocol with pharmacology, doses, and monitoring",
        "Safe physical intervention standards and absolute prohibitions",
        "Post-incident review, patient debrief, and staff support",
      ]} />

      {/* 2. SCOPE */}
      <SectionHeader>2. Scope</SectionHeader>
      <BulletList items={[
        "All inpatient units: psychiatric, de-addiction, elderly care, and child & adolescent",
        "All outpatient clinical areas where patients present",
        "Visiting areas and reception",
        "All staff categories: psychiatric, nursing, counselling, social work, security, administrative, and support",
        "Visitors and external persons on the premises",
      ]} />

      {/* 3. LEGAL */}
      <SectionHeader>3. Legal &amp; Regulatory Framework</SectionHeader>
      <DataTable
        cols={[{ label: "Section", width: "18%" }, { label: "Subject", width: "22%" }, { label: "Clinical Implication" }]}
        rows={LEGAL_ROWS}
      />

      {/* 4. SAFEWARDS */}
      <SectionHeader>4. Proactive Prevention — Safewards Approach</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>The Safewards model is an evidence-based framework that reduces conflict and containment episodes in inpatient psychiatric settings. Jagrutii Rehab Centre applies the following Safewards interventions proactively:</p>
      <DataTable
        cols={[{ label: "Intervention", width: "28%" }, { label: "Implementation at Jagrutii Rehab Centre" }]}
        rows={SAFEWARDS_ROWS}
      />

      {/* 5. STAMP */}
      <SectionHeader>5. Early Warning Recognition — STAMP Framework</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>The STAMP framework provides a structured approach to recognising escalating aggression before it becomes physical. All clinical and security staff are trained to apply STAMP continuously.</p>
      <DataTable
        cols={[{ label: "Sign", width: "22%" }, { label: "Observable Indicators", width: "38%" }, { label: "Required Action" }]}
        rows={STAMP_ROWS}
      />
      <AlertBox title="Act on STAMP Early">
        Every STAMP sign observed is an opportunity to intervene before physical aggression occurs. A staff member who observes any STAMP sign must act immediately — not wait to see if it escalates. Early intervention prevents 80% of physical incidents.
      </AlertBox>

      <SubTitle>5.1 Medical Cause Exclusion — Critical First Step</SubTitle>
      <WarningBox title="Always Exclude Medical Causes First">
        Agitation and aggression may be the presenting sign of a medical emergency: hypoglycaemia, sepsis, hypoxia, alcohol or drug withdrawal (delirium tremens), traumatic brain injury, or medication toxicity. Before any psychiatric intervention, the duty MO/psychiatrist must assess: blood glucose (BSL), oxygen saturation (SpO₂), temperature, blood pressure, and neurological state. Treating an unrecognised medical emergency as a psychiatric episode is a patient safety failure.
      </WarningBox>

      {/* 6. DE-ESCALATION */}
      <SectionHeader>6. De-Escalation Protocol — First-Line Mandatory Response</SectionHeader>
      <p style={{ margin: "0 0 0.75rem" }}>De-escalation is the evidence-based, clinically mandated first response to all levels of agitation or aggression. Physical intervention and RT are only considered after de-escalation has been genuinely attempted and documented.</p>

      <SubTitle>6.1 Staff Positioning &amp; Safety</SubTitle>
      <BulletList items={[
        "Maintain a safe personal distance (minimum 1.5–2 metres); never stand directly in front of an agitated patient",
        "Position yourself near the exit; never allow an agitated patient to block your exit route",
        "Remove or secure your own items that could be used as weapons (stethoscope, ID lanyard, keys)",
        "Signal to a colleague that you require support without alarming the patient",
      ]} />

      <SubTitle>6.2 Verbal De-Escalation Technique (NICE NG10 Aligned)</SubTitle>
      <DataTable
        cols={[{ label: "Step", width: "7%" }, { label: "Technique", width: "25%" }, { label: "How to Apply" }]}
        rows={DEESCALATION_ROWS}
      />
      <AlertBox title="De-escalation: What NOT to Do">
        <BulletList items={[
          "Raise your voice or match the patient's tone",
          "Use sarcasm, threats, bargaining, or ultimatums",
          "Challenge delusions or hallucinations directly",
          "Invade personal space or make sudden movements",
          "Allow a large audience of staff — one primary person leads; others stand back",
          "Issue multiple instructions simultaneously",
        ]} />
      </AlertBox>

      {/* 7. ESCALATION LEVELS */}
      <SectionHeader>7. Escalation Levels — Clinical Response Framework</SectionHeader>
      <DataTable
        cols={[{ label: "Level", width: "14%" }, { label: "Presentation", width: "26%" }, { label: "Immediate Response", width: "32%" }, { label: "Escalation" }]}
        rows={ESCALATION_ROWS}
      />

      {/* 8. RT */}
      <SectionHeader>8. Rapid Tranquilisation (RT) Protocol</SectionHeader>
      <AlertBox title="RT Authority">
        Rapid Tranquilisation may only be prescribed and ordered by a Psychiatrist or Medical Officer under the supervising psychiatrist's direction. Security staff and nursing staff CANNOT administer RT independently. RT is a clinical intervention under MHCA 2017 Section 94 when the patient does not consent due to the emergency.
      </AlertBox>

      <SubTitle>8.1 Indications for RT</SubTitle>
      <BulletList items={[
        "De-escalation has been genuinely attempted and documented; verbal techniques have failed",
        "Patient is at Level 2 or Level 3 escalation and poses immediate risk of serious harm to self, others, or staff",
        "Oral medication has been offered and refused OR the patient's condition does not permit safe oral administration",
      ]} />

      <SubTitle>8.2 Pre-RT Assessment (Mandatory)</SubTitle>
      <NumberedList items={[
        "Medical cause exclusion completed: BSL, SpO₂, BP, temp, neuro check documented",
        "Previous medication history checked (current medications, allergies, prior RT responses)",
        "Contraindications assessed: respiratory depression, known QTc prolongation, pregnancy",
        "Psychiatrist makes clinical decision and documents: indication, intended medication, dose, route, monitoring plan",
      ]} />

      <SubTitle>8.3 RT Medication Protocol</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>The following represents the standard RT stepwise protocol for Jagrutii Rehab Centre. Prescribing psychiatrist may adjust based on patient-specific factors.</p>
      <DataTable
        cols={[{ label: "Step", width: "7%" }, { label: "Situation", width: "22%" }, { label: "Drug(s)", width: "22%" }, { label: "Dose & Route", width: "20%" }, { label: "Key Notes" }]}
        rows={RT_MED_ROWS}
      />
      <WarningBox title="Absolute Contraindications to RT Combinations" color={RED}>
        <BulletList items={[
          "NEVER combine IM Olanzapine + IM Benzodiazepine (Lorazepam / Diazepam) — risk of fatal respiratory depression and cardiovascular collapse",
          "NEVER administer RT to a pregnant patient without direct psychiatrist + obstetrician assessment",
          "NEVER administer RT to a patient with unknown allergy history without adrenaline available",
          "NEVER administer Haloperidol to a patient with known QTc prolongation without ECG review",
          "NEVER use RT as a punishment or for staff convenience — this is a criminal offence under MHCA Sec. 99",
        ]} />
      </WarningBox>

      <SubTitle>8.4 Post-RT Monitoring Protocol</SubTitle>
      <p style={{ margin: "0 0 0.5rem" }}>Post-RT monitoring begins immediately and is the responsibility of the nursing staff under the prescribing psychiatrist's direction.</p>
      <DataTable
        cols={[{ label: "Parameter", width: "26%" }, { label: "Frequency (First Hour)", width: "20%" }, { label: "Frequency (Hours 2–4)", width: "20%" }, { label: "Action if Abnormal" }]}
        rows={RT_MONITOR_ROWS}
      />
      <BulletList items={[
        "All monitoring parameters entered in the RT Monitoring Chart (RTMC-F-001) in real time",
        "Resuscitation equipment (Ambu bag, O₂ supply, IV access kit, Flumazenil for benzodiazepine reversal) available at bedside during monitoring period",
        "Monitoring continues for minimum 4 hours post-RT or until patient is clinically stable; longer if sedation persists",
      ]} />

      {/* 9. PHYSICAL INTERVENTION */}
      <SectionHeader>9. Physical Intervention Standards</SectionHeader>
      <AlertBox title="Last Resort Only">
        Physical intervention (manual holding) is used ONLY when verbal de-escalation has failed, medication cannot be safely administered, and the patient poses an immediate risk of serious injury to themselves or others. It is a clinical decision, not a security decision.
      </AlertBox>

      <SubTitle>9.1 Principles</SubTitle>
      <BulletList items={[
        "Minimum necessary force only; use the least restrictive hold that achieves safety",
        "Minimum 3 trained staff required for any planned physical intervention; 1 leads, 2 support",
        "One staff member designated as the communication lead throughout: speaks calmly to the patient; explains what is happening; does not argue",
        "Physical intervention should transition to restraint under SE-03 if holding is required beyond 3 minutes",
      ]} />

      <SubTitle>9.2 Permitted Holds</SubTitle>
      <BulletList items={[
        "Standing or seated holds on arms and torso, applied smoothly and without pain",
        "Guiding holds to move a patient to a safer location",
        "Holds must allow the patient's airway to remain clear and unobstructed at all times",
      ]} />

      <SubTitle>9.3 Absolute Prohibitions</SubTitle>
      <WarningBox title="The following physical actions are prohibited under MHCA Sec. 99 and constitute criminal conduct" color={RED}>
        <BulletList items={[
          "Prone restraint (face-down): risk of positional asphyxia and death; absolutely prohibited regardless of circumstances",
          "Neck holds, chokeholds, or any pressure on the neck or throat",
          "Kneeling on a patient's back, chest, or neck",
          "Strikes, slaps, or blows of any kind",
          "Dragging a patient across the floor",
          "Using weight (body or objects) to compress the patient's chest",
          "Restraint that prevents the patient from communicating distress",
        ]} />
      </WarningBox>

      <SubTitle>9.4 Monitoring During Physical Intervention</SubTitle>
      <BulletList items={[
        "Breathing and skin colour monitored continuously; any sign of cyanosis, laboured breathing, or loss of consciousness — release immediately",
        "Patient must be able to speak or verbalise; if silent: check responsiveness every 60 seconds",
        "Duration of physical hold documented from start to end in real time",
        "Transition to SE-03 Restraint Protocol if holding extends beyond 3 minutes",
      ]} />

      {/* 10. SECURITY */}
      <SectionHeader>10. Security Staff Role</SectionHeader>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "0.75rem" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #c8cfd8", padding: "6px 10px", background: NAVY, color: "#fff", fontWeight: "bold", width: "50%" }}>Security Staff MAY</th>
            <th style={{ border: "1px solid #c8cfd8", padding: "6px 10px", background: RED,  color: "#fff", fontWeight: "bold", width: "50%" }}>Security Staff MAY NOT</th>
          </tr>
        </thead>
        <tbody>
          {SECURITY_ROWS.map(([may, mayNot], i) => (
            <tr key={i}>
              <td style={{ ...cell, background: i % 2 === 0 ? "#fff" : "#f5f7fb" }}>{may}</td>
              <td style={{ ...cell, background: i % 2 === 0 ? "#fff5f5" : "#fdf0f0" }}>{mayNot}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <BulletList items={[
        "Security staff receive annual de-escalation and safe-support training alongside clinical staff",
        "Security staff who observe a clinical staff member using excessive force must report this to the Centre Head immediately",
      ]} />

      {/* 11. ENVIRONMENTAL */}
      <SectionHeader>11. Environmental Safety Design</SectionHeader>
      <DataTable
        cols={[{ label: "Design Element", width: "22%" }, { label: "Standard" }]}
        rows={ENV_ROWS}
      />
      <BulletList items={[
        "Environmental Safety Audit (ESA-F-002) completed monthly by Centre Head",
        "Any identified risk: documented, actioned within 24 hours, and escalated to Regional Head if not resolvable",
      ]} />

      {/* 12. POST-INCIDENT */}
      <SectionHeader>12. Immediate Post-Incident Protocol</SectionHeader>
      <ResponseStep num="01" title="Immediate Safety Check (0–5 minutes)" items={[
        "Confirm scene is safe; other patients removed from the area",
        "Patient assessed: airway, breathing, vital signs, injuries",
        "Staff and visitors assessed for injuries",
      ]} />
      <ResponseStep num="02" title="Medical Assessment (Within 15 minutes)" items={[
        "Duty MO / psychiatrist formally assesses the patient post-incident",
        "Injuries documented with body map (BM-F-001)",
        "If serious injury: emergency transfer per SE-04",
        "Post-RT patients: activate RTMC-F-001 monitoring protocol",
      ]} />
      <ResponseStep num="03" title="Incident Documentation (Within 2 Hours)" items={[
        "Incident Report (IR-F-001) completed by Nursing In-Charge: exact time, location, triggers, actions taken, staff present, injuries",
        "Psychiatrist documents clinical note in EMR: clinical state, interventions, rationale, current risk level",
        "Any RT administered: RTMC-F-001 completed with all monitoring entries",
        "Physical intervention duration and holds used documented precisely",
      ]} />
      <ResponseStep num="04" title="Escalation & Notification" items={[
        "Centre Head informed immediately",
        "Regional Head (Dr. Bharat Mali) informed within 1 hour of Level 3 incident",
        "Clinical Director (Dr. Amar Shinde) informed within 4 hours of Level 3 incident",
        "Family / NR informed of serious incident by treating psychiatrist: factual information only; documented",
        "Police notified if criminal assault on staff or visitor has occurred; Centre Head decision",
      ]} />
      <ResponseStep num="05" title="Patient Debrief (Within 24 Hours)" items={[
        "Treating psychiatrist or designated senior clinician conducts a calm, non-punitive debrief with the patient when clinically appropriate",
        "Purpose: understand the patient's experience; identify unmet needs; rebuild therapeutic alliance; revise care plan",
        "Safety plan revised if suicidal risk is also present (cross-ref SE-01)",
        "Debrief documented in clinical notes in EMR",
      ]} />
      <ResponseStep num="06" title="Ward Debrief for Other Patients" items={[
        "Nursing In-Charge addresses other patients on the ward: calm, factual, reassuring",
        "Acknowledge that something difficult happened; normalise feelings; invite questions",
        "Individual support offered to patients who are visibly distressed",
        "Documented in ward log",
      ]} />

      {/* 13. STAFF INJURY */}
      <SectionHeader>13. Staff Injury Management &amp; Psychological Support</SectionHeader>
      <SubTitle>13.1 Immediate Injury Management</SubTitle>
      <NumberedList items={[
        "Any injured staff member receives immediate first aid on site",
        "Injuries documented in Staff Injury Register (SIR-F-001) within 2 hours",
        "Significant injuries referred to occupational health or hospital same day",
        "Incident Reporting Form completed; may be reported to applicable occupational safety authority (OSHA requirements)",
      ]} />
      <SubTitle>13.2 Psychological Support</SubTitle>
      <NumberedList items={[
        "Immediate defusing: Centre Head speaks informally with directly involved staff within 4 hours",
        "Formal psychological debriefing offered within 48–72 hours, facilitated by senior psychologist or external EAP",
        "Staff have the right to take compassionate leave following a serious incident without penalty",
        "No staff member who has been involved in a serious physical incident is rostered for high-dependency duties for the following 24 hours without their agreement",
        "Clinical Director follows up with staff wellbeing at 1 week and 1 month post-incident",
      ]} />

      {/* 14. RCA */}
      <SectionHeader>14. Root Cause Analysis — Major Incidents</SectionHeader>
      <p style={{ margin: "0 0 0.5rem" }}>Any Level 3 incident, any RT administration, or any injury to staff or patient triggers a mandatory Root Cause Analysis (RCA).</p>
      <NumberedList items={[
        "RCA initiated within 5 working days; led by Regional Head",
        "RCA reviews: STAMP recognition; de-escalation adequacy; RT indication and documentation; physical intervention compliance; environmental factors; staffing levels; prior warning signs in clinical notes",
        "RCA report submitted to Clinical Director within 10 working days",
        "Corrective Action Plan (CAP) developed and implemented within 30 days",
        "De-identified RCA learning shared at next monthly clinical governance meeting",
      ]} />

      {/* 15. SPECIAL POPULATIONS */}
      <SectionHeader>15. Special Population Protocols</SectionHeader>
      <SubTitle>15.1 De-Addiction Vertical</SubTitle>
      <BulletList items={[
        "Intoxicated patients: aggression is primarily driven by pharmacological disinhibition, not psychosis; de-escalation has a high success rate; patience and reduced demands are key",
        "During active withdrawal (especially alcohol delirium): rule out medical cause (CIWA-Ar score, BSL, electrolytes) before assuming psychiatric aggression; aggressive delirium tremens = medical emergency",
        "RT in intoxicated patients: use lower doses; increased respiratory depression risk with benzodiazepines if patient is alcohol-intoxicated",
        "If patient is intoxicated and aggressive on arrival: do not accept for admission until assessed for medical stability; refer to general hospital if medically unstable",
      ]} />
      <SubTitle>15.2 Child &amp; Adolescent</SubTitle>
      <BulletList items={[
        "Physical intervention for minors: prohibited except under direct consultant psychiatrist supervision; notify Clinical Director within 1 hour",
        "RT for minors under 12: not permitted except in life-threatening situations with direct psychiatrist order and guardian notification",
        "De-escalation in adolescents: peer presence is a significant escalator; remove peers first; give the young person a face-saving exit",
        "Parent / guardian notified of any Level 2 or Level 3 incident within 2 hours",
      ]} />
      <SubTitle>15.3 Elderly Care</SubTitle>
      <BulletList items={[
        "Physical intervention in elderly patients: extreme caution; frailty increases fracture risk; even minimal force can cause serious injury",
        "RT in elderly: Haloperidol 2.5 mg IM maximum as first-line; avoid benzodiazepines as first-line; increased aspiration and respiratory depression risk",
        "Aggression in dementia patients is most often driven by unmet need (pain, constipation, hunger, fear, overstimulation); address the need first before pharmacological intervention",
        "Delirium is a common driver of aggression in elderly patients; medical cause must be excluded first (infection, metabolic disturbance, medication interaction)",
      ]} />
      <SubTitle>15.4 Pregnancy</SubTitle>
      <WarningBox title="Pregnant Patients">
        Any RT or physical intervention in a pregnant patient requires immediate involvement of both the treating psychiatrist AND an obstetrician if available, or obstetric consultation within 1 hour. IM medications have foetal risk implications. Physical holds that apply pressure to the abdomen are absolutely prohibited. All incidents involving pregnant patients are automatically escalated to Clinical Director.
      </WarningBox>
      <SubTitle>15.5 Involuntary Patients</SubTitle>
      <BulletList items={[
        "Involuntary patients have heightened sensitivity to any perceived coercion; extra de-escalation effort required",
        "RT for an involuntary patient: invokes MHCA Sec. 94 emergency authority; must be documented as emergency treatment",
        "Post-incident debrief is especially important for involuntary patients to maintain therapeutic trust",
      ]} />

      {/* 16. TRAINING */}
      <SectionHeader>16. Training &amp; Competency Requirements</SectionHeader>
      <DataTable
        cols={[{ label: "Staff Category", width: "22%" }, { label: "Training Required", width: "55%" }, { label: "Frequency" }]}
        rows={TRAINING_ROWS}
      />
      <BulletList items={[
        "Safe physical intervention training: practical, scenario-based; minimum 4 hours; competency assessed by a qualified trainer",
        "Staff who do not pass the physical intervention competency assessment are not rostered for high-dependency wards",
      ]} />

      {/* 17. KPIs */}
      <SectionHeader>17. KPIs &amp; Audit</SectionHeader>
      <DataTable
        cols={[{ label: "KPI" }, { label: "Target", width: "12%" }, { label: "Review Frequency", width: "14%" }]}
        rows={KPI_ROWS}
      />

      {/* 18. RELATED */}
      <SectionHeader>18. Related Documents</SectionHeader>
      <DataTable
        cols={[{ label: "Doc ID", width: "12%" }, { label: "Title", width: "42%" }, { label: "Relationship" }]}
        rows={RELATED_ROWS}
      />

      {/* 19. REVIEW */}
      <SectionHeader>19. Review &amp; Version Control</SectionHeader>
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
      <SEAuthorisation docCode="SE-02" />

    </div>
  </Fragment>
));

export default Se02ViolenceAggressionManagement;
