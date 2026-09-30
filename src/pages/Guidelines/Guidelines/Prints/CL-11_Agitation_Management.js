import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, CalloutBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "JRCPL-CL-11"],
  ["Title", "Management of Agitated Patients in Rehabilitation Settings"],
  ["Version", "1.0 (Effective 1st June 2026)"],
  ["Effective Date", "1st June 2026"],
  ["Review Date", "May 2027 (Next version: 1st June 2027)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Applicable To", "All Psychiatrists, Psychologists, Nursing Staff & Rehabilitation Teams"],
  ["Cross-Reference", "SE-02 (Violence & Aggression SOP); SE-03 (Restraint SOP); CL-01 to CL-09"],
  ["Regulatory Basis", "MHCA 2017; NABH COP 9; NICE NG10"],
  ["Replaces", "Jagrutii_Agitation_Clinical_SOP.docx"],
];

const CAUSES_ROWS = [
  ["Substance Withdrawal", "Alcohol, opioids, benzodiazepines — CIWA/COWS-driven agitation", "Withdrawal protocol (CL-05/CL-06); sedation per withdrawal score"],
  ["Psychosis", "Schizophrenia, mania, drug-induced psychosis", "Antipsychotic; safe environment; reduce stimulation"],
  ["Delirium (organic)", "UTI, electrolyte imbalance, hepatic encephalopathy, medication toxicity", "Identify and treat cause; AVOID benzodiazepines if hepatic cause"],
  ["Mood Episode", "Acute mania, mixed episode, agitated depression", "Mood stabiliser or antipsychotic (CL-02/CL-03)"],
  ["Pain or Discomfort", "Undertreated pain; urinary retention; constipation", "Physical assessment; analgesia; catheterisation if needed"],
  ["Situational / Environmental", "Family conflict, expressed emotion, unfamiliar environment", "Remove triggers; reduce stimulation; de-escalation"],
  ["Personality / Behavioural", "Impulsive aggression, antisocial features, borderline PD", "De-escalation; PRN medication; limit-setting; MDT review"],
];

const PRINCIPLES_ROWS = [
  ["1", "Removal of Triggers (Stimulus Control)", "Eliminate family conflict, expressed emotion, substance exposure; provide low-stimulation environment", "Rapid reduction in arousal and aggression"],
  ["2", "Structured Environment", "Fixed routine (sleep-wake cycle); predictability; clear rules", "Reduced impulsivity; improved behavioural control"],
  ["3", "Behavioural Containment & Limits", "Continuous staff presence; immediate behavioural feedback; no reinforcement of aggression", "Behaviour modification through conditioning"],
  ["4", "Removal of Secondary Gains", "Eliminate reinforcement of maladaptive behaviour; promote adaptive coping", "Reduction in functional agitation"],
  ["5", "Nervous System Regulation", "Quiet environment; regular sleep; nutrition; reduction of sensory overload", "Autonomic stabilization and calming"],
  ["6", "Therapeutic Milieu Effect", "Exposure to stable peer group; social modelling; safety perception", "Internal emotional regulation improves"],
  ["7", "Substance Withdrawal Stabilisation", "Controlled detoxification; monitoring withdrawal symptoms", "Reduction in substance-induced agitation"],
  ["8", "Reduced Emotional Load", "Distance from stressful family dynamics; emotional stabilization", "Reduced internal tension"],
];

const STAMP_ROWS = [
  ["S — Staring", "Fixed stare; threatening eye contact; non-blinking", "Acknowledge; maintain safe distance; do not stare back"],
  ["T — Tone", "Raised, aggressive, or pressured voice; shouting", "Respond calmly; lower your own voice; speak slowly"],
  ["A — Anxiety", "Visible agitation; pacing; hand-wringing; trembling", "Name what you see: 'You seem very distressed...'"],
  ["M — Mumbling", "Incoherent muttering; talking to self; responding to unseen stimuli", "Screen for psychosis; avoid confronting beliefs"],
  ["P — Pointing/Posturing", "Pointing aggressively; adopting threatening stance", "Increase distance; call for backup; do not block exit"],
];

const RT_ROWS = [
  ["Oral (preferred)", "Lorazepam + Olanzapine (dispersible)", "Lorazepam 1–2 mg + Olanzapine 5–10 mg PO", "Offer oral before IM; non-punitive; document rationale"],
  ["IM (if oral refused)", "Lorazepam", "1–2 mg IM", "Avoid IM olanzapine within 1 hr of IM benzodiazepine (respiratory risk)"],
  ["IM (if oral refused)", "Haloperidol + Promethazine", "Haloperidol 5 mg + Promethazine 25–50 mg IM", "Classic combination; evidence-based; monitor EPS"],
  ["IM (if oral refused)", "Olanzapine IM", "5–10 mg IM", "Do NOT combine with lorazepam IM; ECG if QTc prolongation risk"],
];

const MONITORING_ROWS = [
  ["Level of consciousness / GCS", "Every 15 min × 1 hr, then every 30 min", "GCS < 12 → medical emergency; call physician immediately"],
  ["Respiratory rate", "Every 15 min × 1 hr", "RR < 10/min → position patient; call physician; prepare flumazenil"],
  ["Oxygen saturation", "Continuous if available", "SpO₂ < 95% → oxygen administration; escalate"],
  ["Blood pressure", "Every 15 min × 1 hr", "Systolic < 90 mmHg → IV fluids; escalate to physician"],
  ["ECG", "At baseline if QTc concern; post-RT if antipsychotic used", "QTc > 500 ms → escalate; do not repeat antipsychotic"],
];

const KPI_ROWS = [
  ["De-escalation attempted before RT — documented", "100%", "Monthly"],
  ["RT documentation completed within 2 hours", "100%", "Monthly"],
  ["Post-RT monitoring conducted per protocol", "≥ 95%", "Monthly"],
  ["Agitation cause (organic vs psychiatric) assessed and documented", "100%", "Monthly"],
  ["Staff de-escalation training refreshed annually", "100% of clinical staff", "Annual"],
];

const Cl11AgitationManagement = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="CL-11"
        title="Agitation Management in Rehabilitation Settings"
        icdLine="Psychiatric / De-Addiction / Geriatric Verticals — All JRCPL Centres"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE */}
      <SectionTitle>1. Purpose</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        To standardize understanding and evidence-based management of agitation in psychiatric patients within rehabilitation settings, highlighting environmental, psychological, and neurobiological factors contributing to rapid stabilization.
      </p>
      <CalloutBox>
        <strong>Golden Rule:</strong> Environmental structure can stabilize behaviour rapidly, but sustained recovery requires comprehensive ongoing treatment.
      </CalloutBox>

      {/* 2. CAUSES */}
      <ModuleHeader>2. Causes of Agitation — Rehabilitation Context</ModuleHeader>
      <Table
        cols={[{ label: "Cause Category", width: "20%" }, { label: "Examples", width: "42%" }, { label: "Priority Action" }]}
        rows={CAUSES_ROWS}
      />

      {/* 3. PRINCIPLES */}
      <ModuleHeader>3. Key Clinical Principles — 8 Mechanisms</ModuleHeader>
      <Table
        cols={[
          { label: "#", width: "5%", center: true },
          { label: "Principle", width: "22%" },
          { label: "Mechanism", width: "42%" },
          { label: "Outcome" },
        ]}
        rows={PRINCIPLES_ROWS}
      />

      {/* 4. DE-ESCALATION */}
      <ModuleHeader>4. De-Escalation Protocol (Verbal First — Always)</ModuleHeader>
      <SectionTitle>STAMP Framework — Early Warning Recognition</SectionTitle>
      <Table
        cols={[{ label: "STAMP Sign", width: "22%" }, { label: "Observable Behaviour", width: "42%" }, { label: "Response" }]}
        rows={STAMP_ROWS}
      />
      <SectionTitle>De-escalation Techniques (NICE NG10 Aligned)</SectionTitle>
      <BulletList items={[
        "Approach calmly; introduce yourself; use the patient's name",
        "Use simple, clear, non-threatening language; avoid jargon",
        "Acknowledge feelings without agreeing with harmful behaviour: 'I can see you're very angry right now...'",
        "Reduce environmental stimuli: remove audience; offer quiet room; reduce noise and crowding",
        "Maintain non-threatening body language: open posture, side-on, at eye level, safe distance",
        "Offer choice: 'Would you like to sit down or go somewhere quieter?'",
        "Do not argue, challenge delusions, or give ultimatums",
      ]} />

      {/* 5. RT */}
      <ModuleHeader>5. Rapid Tranquilisation (RT) Protocol</ModuleHeader>
      <WarningBox>Rapid Tranquilisation is a LAST RESORT after de-escalation has failed. Only a Psychiatrist may prescribe RT.</WarningBox>
      <Table
        cols={[{ label: "Route", width: "18%" }, { label: "Drug", width: "24%" }, { label: "Dose", width: "26%" }, { label: "Notes" }]}
        rows={RT_ROWS}
      />
      <SectionTitle>Post-RT Monitoring (Mandatory)</SectionTitle>
      <Table
        cols={[{ label: "Parameter", width: "28%" }, { label: "Frequency", width: "32%" }, { label: "Alert" }]}
        rows={MONITORING_ROWS}
      />

      {/* 6. DOCUMENTATION */}
      <ModuleHeader>6. Documentation Requirements</ModuleHeader>
      <BulletList items={[
        "Time and nature of agitation onset",
        "Triggers identified (if any)",
        "De-escalation attempts: techniques used and patient response",
        "RT: medication, dose, route, time, prescribing psychiatrist",
        "Post-RT monitoring: all parameters with timestamps",
        "Any injuries to patient or staff",
        "Incident report within 2 hours if physical intervention or RT was used",
      ]} />

      {/* 7. CLINICAL INSIGHT */}
      <ModuleHeader>7. Important Clinical Insight</ModuleHeader>
      <p style={{ fontWeight: "bold", margin: "0 0 0.75rem" }}>
        Improvement observed in rehabilitation settings is often situational stabilisation and not complete recovery. Risk of relapse after discharge is significant. Environmental structure is NOT a substitute for pharmacological and psychological treatment.
      </p>
      <BulletList items={[
        "Do not overestimate recovery based on short-term improvement within the facility",
        "Continue appropriate pharmacological and psychological treatment in parallel",
        "Plan structured discharge and relapse prevention strategies from admission",
      ]} />

      {/* 8. KPIs */}
      <ModuleHeader>8. KPIs</ModuleHeader>
      <Table
        cols={[{ label: "KPI" }, { label: "Target", width: "20%", center: true }, { label: "Review", width: "13%", center: true }]}
        rows={KPI_ROWS}
      />

      <ProtocolApproval docCode="CL-11" docTitle="Agitation Management in Rehabilitation Settings" />
    </ProtocolWrapper>
  </Fragment>
));

export default Cl11AgitationManagement;
