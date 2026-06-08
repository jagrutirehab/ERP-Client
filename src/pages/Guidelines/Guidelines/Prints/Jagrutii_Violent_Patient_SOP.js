import React, { forwardRef, Fragment } from "react";

const BLUE = "#1a3a6b";
const RED = "#c0392b";

const Heading = ({ children }) => (
  <div style={{ color: BLUE, fontWeight: "bold", fontSize: "1rem", borderBottom: `2px solid ${BLUE}`, paddingBottom: "3px", marginTop: "1.25rem", marginBottom: "0.5rem", letterSpacing: "0.03em" }}>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: "3px" }}>{item}</li>)}
  </ul>
);

const JagrutiiViolentPatientSOP = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      <div className={`${props.heading} mb-4`} style={{ textAlign: "center", borderBottom: `2px solid ${BLUE}`, paddingBottom: "12px", marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: "bold", fontSize: "1rem", color: BLUE }}>JAGRUTII REHAB CENTRE PVT. LTD.</div>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: BLUE, marginTop: "4px" }}>SOP: HANDLING VIOLENT / AGGRESSIVE PATIENTS</div>
      </div>

      <Heading>Purpose</Heading>
      <p style={{ margin: "0 0 0.5rem" }}>
        To ensure safety of staff and patients while managing violent or aggressive behavior in rehabilitation settings through standardized protocols.
      </p>

      <Heading>General Safety Principles</Heading>
      <BulletList items={[
        "Maintain minimum one arm's distance from the patient at all times",
        "Do not approach closely unless absolutely necessary",
        "Be alert — sudden aggression can occur without warning",
        "Always ensure escape access (avoid corners or closed spaces)",
        "Call for backup support immediately if patient shows agitation",
        "Avoid arguing, provoking, or challenging the patient",
        "Use calm, firm, and non-threatening communication",
        "Ensure security staff presence when required",
      ]} />

      <Heading>De-Escalation Protocol</Heading>
      <BulletList items={[
        "Approach patient calmly and respectfully",
        "Use simple, clear instructions",
        "Acknowledge patient feelings without agreeing to harmful behavior",
        "Reduce environmental stimuli (noise, crowd)",
        "Maintain non-threatening body language",
      ]} />

      <Heading>Escalation Management</Heading>
      <BulletList items={[
        "Inform duty doctor immediately",
        "Alert additional staff / security",
        "Prepare for possible restraint if indicated",
        "Keep emergency medications ready as per protocol",
      ]} />

      <Heading>Restraint &amp; Medication</Heading>
      <BulletList items={[
        "Use restraint only as per SOP and legal guidelines",
        "Ensure adequate trained staff during restraint",
        "Continuous monitoring during and after restraint",
        "Administer medication as prescribed by doctor",
        "Document indication, duration, and monitoring",
      ]} />

      <Heading>Documentation Requirements</Heading>
      <BulletList items={[
        "Time and nature of aggression",
        "Triggers identified (if any)",
        "Interventions used (verbal / physical / medication)",
        "Staff involved",
        "Patient response",
        "Any injuries or incidents",
      ]} />

      <Heading>Golden Rule</Heading>
      <p style={{ fontWeight: "bold", color: RED, margin: "0 0 1.5rem" }}>
        Staff safety comes first. A safe doctor/staff can provide better care.
      </p>

      <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <div>Clinical Director:</div>
        <div style={{ fontWeight: "bold", color: BLUE }}>Dr. Amar Shinde</div>
        <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
      </div>
    </div>
  </Fragment>
));

export default JagrutiiViolentPatientSOP;
