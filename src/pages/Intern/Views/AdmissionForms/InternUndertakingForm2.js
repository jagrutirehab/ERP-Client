const InternUndertakingFormPage2 = ({ register, intern }) => {
  const pageContainer = {
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    pageBreakAfter: "always",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    lineHeight: "1.5",
  };

  const heading = {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  };

  const subHeading = {
    fontWeight: "bold",
    fontSize: "12.5px",
    marginTop: "15px",
    marginBottom: "6px",
  };

  const section = { marginBottom: "10px", textAlign: "justify" };

  const bold = { fontWeight: "bold" };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "220px",
    margin: "0 6px",
  };

  return (
    <div style={pageContainer}>
      {/* Header (optional) */}
      {/* <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div> */}

      {/* Title */}
      <div style={heading}>Intern’s Undertaking Form</div>

      {/* Section 3 */}
      <div style={subHeading}>3. Protocol for Conduct</div>
      <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
        <li style={section}>
          <span style={bold}>Confidentiality:</span> I will maintain strict
          confidentiality regarding patients’ personal, medical, or
          psychological information, including minors, sharing details only with
          authorized supervisors or staff, per applicable laws and ethical
          guidelines.
        </li>
        <li style={section}>
          <span style={bold}>Supervised Interactions:</span> I will interact
          with patients, including minors, only under the guidance of my
          assigned supervisor and follow all therapeutic protocols provided
          during orientation, including evidence-based practices like cognitive
          behavioral therapy (CBT) or mindfulness.
        </li>
        <li style={section}>
          <span style={bold}>Reporting Concerns:</span> I will immediately
          report any concerns about a patient's well-being, behavior, or my own
          interactions to my supervisor, ensuring prompt and appropriate action,
          particularly for minors involved.
        </li>
        <li style={section}>
          <span style={bold}>Compliance with Guidelines:</span> I will adhere to
          Jagruti Rehabilitation Centre’s policies, ethical standards for
          psychological practice, and instructions from supervisors or the
          multidisciplinary team.
        </li>
      </ul>

      {/* Section 4 */}
      <div style={subHeading}>4. Consequences of Non-Compliance</div>
      <div style={section}>
        I understand that failure to maintain professional boundaries or follow
        this protocol, including unauthorized social media connections or
        inappropriate interactions with minors, may result in:
      </div>
      <ul style={{ marginTop: 0, paddingLeft: "28px" }}>
        <li>
          <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
            <li>Immediate termination of my internship.</li>
            <li>
              Reporting to my academic institution or relevant authorities
              (e.g., Rehabilitation Council of India, child protection
              agencies).
            </li>
            <li>
              Potential legal or ethical consequences, depending on the severity
              of the breach.
            </li>
          </ul>
        </li>
        <li style={{ marginTop: "8px" }}>
          Jagruti Rehabilitation Centre reserves the right to take necessary
          actions to protect patients’ safety and well-being.
        </li>
      </ul>

      {/* Section 5 */}
      <div style={subHeading}>5. Consent and Commitment</div>
      <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
        <li style={section}>
          I confirm that I have been informed about the vulnerability of Jagruti
          Rehabilitation Centre patients, including minors, and the importance
          of maintaining professional boundaries, avoiding social media
          connections, and complying with child protection laws.
        </li>
        <li style={section}>
          I have had the opportunity to ask questions and have received
          satisfactory answers regarding my responsibilities.
        </li>
        <li style={section}>
          I voluntarily agree to abide by the terms of this Form and the
          internship protocol, ensuring ethical and professional conduct
          throughout my tenure.
        </li>
      </ul>

      {/* Signature */}
      <div style={{ marginTop: "25px" }}>
        <div style={{ marginBottom: "12px" }}>
          <strong>Name:</strong>
          <input
            type="text"
            {...(register ? register("page2_sign_name") : {})}
            defaultValue={intern?.name || ""}
            style={{ ...inputLine, width: "300px", marginLeft: "8px" }}
          />
        </div>

        <div>
          <strong>Sign:</strong>
          <input
            type="text"
            {...(register ? register("page2_sign_signature") : {})}
            style={{ ...inputLine, width: "300px", marginLeft: "22px" }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #ccc",
          paddingTop: "8px",
          textAlign: "center",
          fontSize: "11px",
          color: "#444",
        }}
      >
        🌐 www.jagrutirehab.org &nbsp;&nbsp; | &nbsp;&nbsp; 📞 +91-9822207761
      </div>
    </div>
  );
};

export default InternUndertakingFormPage2;
