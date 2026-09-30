import React, { forwardRef, Fragment } from "react";

const BLUE = "#1a3a6b";
const RED = "#c0392b";
const AMBER = "#e67e22";
const GREEN = "#1a6b3a";

const Heading = ({ children }) => (
  <div style={{ color: BLUE, fontWeight: "bold", fontSize: "1rem", borderBottom: `2px solid ${BLUE}`, paddingBottom: "3px", marginTop: "1.25rem", marginBottom: "0.5rem", letterSpacing: "0.03em" }}>
    {children}
  </div>
);

const cell = { border: "1px solid #c8cfd8", padding: "7px 10px", verticalAlign: "top" };

const SeverityRow = ({ level, severity, severityColor, actions, isEmergency }) => (
  <tr>
    <td style={{ ...cell, fontWeight: "bold", color: severityColor, whiteSpace: "nowrap" }}>{level}</td>
    <td style={{ ...cell, fontWeight: "bold", color: severityColor }}>{severity}</td>
    <td style={{ ...cell, background: isEmergency ? "#fff5f5" : undefined }}>
      <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
        {actions.map((a, i) => (
          <li key={i} style={{ marginBottom: "2px", fontWeight: isEmergency ? "bold" : undefined, color: isEmergency ? RED : undefined }}>{a}</li>
        ))}
      </ul>
    </td>
  </tr>
);

const JagrutiiElectrolyteEmergencySOP = forwardRef((props, ref) => (
  <Fragment>
    <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>

      {/* Header */}
      <div className={`${props.heading} mb-4`} style={{ textAlign: "center", borderBottom: `2px solid ${BLUE}`, paddingBottom: "12px", marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: "bold", fontSize: "1rem", color: BLUE }}>JAGRUTII REHAB CENTRE PVT. LTD.</div>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: BLUE, marginTop: "4px" }}>ELECTROLYTE EMERGENCY MANAGEMENT SOP</div>
      </div>

      {/* Purpose */}
      <Heading>Purpose</Heading>
      <p style={{ margin: "0 0 0.5rem" }}>
        To ensure early identification and timely management of electrolyte abnormalities (Hyponatremia &amp; Potassium imbalance) and prevent life-threatening complications.
      </p>

      {/* Hyponatremia */}
      <Heading>Hyponatremia (Na⁺)</Heading>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "0.75rem" }}>
        <thead>
          <tr>
            <th style={{ ...cell, background: BLUE, color: "#fff", width: "18%" }}>Level</th>
            <th style={{ ...cell, background: BLUE, color: "#fff", width: "22%" }}>Severity</th>
            <th style={{ ...cell, background: BLUE, color: "#fff" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <SeverityRow
            level="Na⁺ 130–134 mEq/L"
            severity="Mild"
            severityColor={GREEN}
            actions={["Inform treating psychiatrist", "Repeat sodium after 24 hours"]}
          />
          <SeverityRow
            level="Na⁺ 125–129 mEq/L"
            severity="Moderate"
            severityColor={AMBER}
            actions={["Inform psychiatrist + physician", "Close monitoring", "Repeat sodium in 6–12 hours"]}
          />
          <SeverityRow
            level="Na⁺ < 125 mEq/L OR Symptomatic"
            severity="MEDICAL EMERGENCY"
            severityColor={RED}
            isEmergency
            actions={["Call physician immediately", "Inform Clinical Director", "Arrange urgent transfer to ICU / General Hospital"]}
          />
        </tbody>
      </table>

      <div style={{ background: "#fff5f5", border: `1px solid ${RED}`, borderRadius: "4px", padding: "8px 12px", marginBottom: "0.75rem" }}>
        <div style={{ fontWeight: "bold", color: RED, marginBottom: "4px" }}>Emergency Symptoms — Transfer irrespective of value:</div>
        <ul style={{ paddingLeft: "1.1rem", margin: 0, color: RED }}>
          <li>Seizure</li>
          <li>Altered sensorium</li>
          <li>Severe confusion</li>
          <li>Respiratory distress</li>
        </ul>
      </div>

      {/* Potassium */}
      <Heading>Potassium (K⁺)</Heading>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "0.75rem" }}>
        <thead>
          <tr>
            <th style={{ ...cell, background: BLUE, color: "#fff", width: "30%" }}>Level</th>
            <th style={{ ...cell, background: BLUE, color: "#fff", width: "18%" }}>Severity</th>
            <th style={{ ...cell, background: BLUE, color: "#fff" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <SeverityRow
            level="K⁺ 3.0–3.4 OR 5.5–5.9 mEq/L"
            severity="Mild"
            severityColor={GREEN}
            actions={["Inform doctor", "Repeat test"]}
          />
          <SeverityRow
            level="K⁺ 2.5–2.9 OR 6.0–6.4 mEq/L"
            severity="Moderate"
            severityColor={AMBER}
            actions={["Inform physician", "ECG monitoring (if available)"]}
          />
          <SeverityRow
            level="K⁺ < 2.5 OR ≥ 6.5 mEq/L"
            severity="MEDICAL EMERGENCY"
            severityColor={RED}
            isEmergency
            actions={["MEDICAL EMERGENCY", "Immediate ICU / Hospital transfer"]}
          />
        </tbody>
      </table>

      {/* Mandatory Steps */}
      <Heading>Mandatory Steps (Non-Negotiable)</Heading>
      <ol style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
        <li style={{ marginBottom: "4px" }}>Inform On-call Physician immediately</li>
        <li style={{ marginBottom: "4px" }}>Inform Clinical Director</li>
        <li style={{ marginBottom: "4px" }}>Shift patient to close observation</li>
        <li style={{ marginBottom: "4px" }}>Arrange SOS hospital transfer</li>
        <li style={{ marginBottom: "4px" }}>Send lab reports + complete file with patient</li>
        <li style={{ marginBottom: "4px" }}>Document time of detection, escalation, and transfer</li>
      </ol>

      {/* Documentation */}
      <Heading>Documentation Requirement</Heading>
      <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
        <li>Lab report copy</li>
        <li>Vital chart</li>
        <li>Progress notes</li>
        <li>Escalation time record</li>
        <li>Referral / transfer note</li>
      </ul>

      {/* Golden Rule */}
      <Heading>Golden Rule</Heading>
      <p style={{ fontWeight: "bold", color: RED, margin: "0 0 1.5rem" }}>
        No delay in severe electrolyte abnormality.<br />
        Doctor alert + immediate transfer = life-saving
      </p>

      {/* Sign-off */}
      <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <div>Clinical Director:</div>
        <div style={{ fontWeight: "bold", color: BLUE }}>Dr. Amar Shinde</div>
        <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
      </div>
    </div>
  </Fragment>
));

export default JagrutiiElectrolyteEmergencySOP;
