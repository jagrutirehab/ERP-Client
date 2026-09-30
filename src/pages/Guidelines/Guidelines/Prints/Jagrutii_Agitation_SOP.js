import React, { forwardRef, Fragment } from "react";

const BLUE = "#1a3a6b";

const Heading = ({ children }) => (
  <div style={{ color: BLUE, fontWeight: "bold", fontSize: "1rem", borderBottom: `2px solid ${BLUE}`, paddingBottom: "3px", marginTop: "1.25rem", marginBottom: "0.5rem", letterSpacing: "0.03em" }}>
    {children}
  </div>
);

const Principle = ({ number, title, points, outcome }) => (
  <div style={{ marginBottom: "0.85rem" }}>
    <div style={{ fontWeight: "bold", marginBottom: "3px" }}>{number}. {title}</div>
    <ul style={{ paddingLeft: "1.25rem", margin: "0 0 4px" }}>
      {points.map((p, i) => <li key={i} style={{ marginBottom: "2px" }}>{p}</li>)}
    </ul>
    <div style={{ color: BLUE, fontStyle: "italic" }}>Outcome: {outcome}</div>
  </div>
);

const JagrutiiAgitationSOP = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>
      <div className={`${props.heading} mb-4`} style={{ textAlign: "center", borderBottom: `2px solid ${BLUE}`, paddingBottom: "12px", marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: "bold", fontSize: "1rem", color: BLUE }}>JAGRUTII REHAB CENTRE PVT. LTD.</div>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: BLUE, marginTop: "4px" }}>SOP: MANAGEMENT OF AGITATED PATIENTS IN REHABILITATION SETTINGS</div>
      </div>

      <Heading>Purpose</Heading>
      <p style={{ margin: "0 0 0.5rem" }}>
        To standardize understanding and management of agitation in psychiatric patients within rehabilitation settings, highlighting environmental, psychological, and neurobiological factors contributing to rapid stabilization.
      </p>

      <Heading>Scope</Heading>
      <p style={{ margin: "0 0 0.5rem" }}>
        Applicable to all psychiatrists, psychologists, nursing staff, and rehabilitation teams managing agitated patients.
      </p>

      <Heading>Key Clinical Principles</Heading>
      <Principle
        number="1"
        title="Removal of Triggers (Stimulus Control)"
        points={["Eliminate family conflict, expressed emotion, and substance exposure", "Provide low-stimulation environment"]}
        outcome="Rapid reduction in arousal and aggression"
      />
      <Principle
        number="2"
        title="Structured Environment (External Executive Function)"
        points={["Fixed routine (sleep–wake cycle)", "Predictability and clear rules"]}
        outcome="Reduced impulsivity and improved behavioral control"
      />
      <Principle
        number="3"
        title="Behavioral Containment & Boundaries"
        points={["Continuous staff presence", "Immediate behavioral feedback", "No reinforcement of aggression"]}
        outcome="Behavior modification through conditioning"
      />
      <Principle
        number="4"
        title="Removal of Secondary Gains"
        points={["Eliminate reinforcement of maladaptive behavior", "Promote adaptive coping"]}
        outcome="Reduction in functional agitation"
      />
      <Principle
        number="5"
        title="Nervous System Regulation"
        points={["Quiet environment, regular sleep, nutrition", "Reduction of sensory overload"]}
        outcome="Autonomic stabilization and calming"
      />
      <Principle
        number="6"
        title="Therapeutic Milieu Effect"
        points={["Exposure to stable peer group", "Social modeling and safety perception"]}
        outcome="Internal emotional regulation improves"
      />
      <Principle
        number="7"
        title="Substance Withdrawal Stabilization"
        points={["Controlled detoxification", "Monitoring withdrawal symptoms"]}
        outcome="Reduction in substance-induced agitation"
      />
      <Principle
        number="8"
        title="Reduced Emotional Load"
        points={["Distance from stressful family dynamics", "Emotional stabilization"]}
        outcome="Reduced internal tension"
      />

      <Heading>Important Clinical Insight</Heading>
      <p style={{ margin: "0 0 0.4rem" }}>
        Improvement observed in rehabilitation settings is often situational stabilization and not complete recovery.
      </p>
      <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
        <li>Risk of relapse after discharge</li>
        <li>Continued treatment and follow-up are essential</li>
      </ul>

      <Heading>Clinical Implications</Heading>
      <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
        <li>Do not overestimate recovery based on short-term improvement</li>
        <li>Continue appropriate pharmacological and psychological treatment</li>
        <li>Plan structured discharge and relapse prevention strategies</li>
      </ul>

      <Heading>Golden Rule</Heading>
      <p style={{ fontWeight: "bold", margin: "0 0 1.5rem" }}>
        Environmental structure can stabilize behavior rapidly, but sustained recovery requires comprehensive ongoing treatment.
      </p>

      <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <div>Clinical Director:</div>
        <div style={{ fontWeight: "bold", color: BLUE }}>Dr. Amar Shinde</div>
        <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
      </div>
    </div>
  </Fragment>
));

export default JagrutiiAgitationSOP;
