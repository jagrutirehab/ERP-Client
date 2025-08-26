const InternUndertakingForm = ({ register, intern }) => {
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
    width: "200px",
    margin: "0 5px",
  };

  return (
    <div style={pageContainer}>
      {/* Header */}
      {/* <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div> */}

      {/* Title */}
      <div style={heading}>Intern’s Undertaking Form</div>

      {/* Intern Details */}
      <div style={subHeading}>Intern Details</div>
      <div style={{ marginBottom: "8px" }}>
        Name:
        <input
          type="text"
          defaultValue={intern?.name}
          {...register("intern_name")}
          style={inputLine}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        Contact Number:
        <input
          type="text"
          defaultValue={intern?.contactNumber}
          {...register("intern_contact")}
          style={inputLine}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        Email:
        <input
          type="text"
          defaultValue={intern?.emailAddress}
          {...register("intern_email")}
          style={inputLine}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        Institution:
        <input
          type="text"
          defaultValue={intern?.educationalInstitution}
          {...register("intern_institution")}
          style={inputLine}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        Internship Period: From
        <input type="date" {...register("internship_from")} style={inputLine} />
        To
        <input type="date" {...register("internship_to")} style={inputLine} />
      </div>
      <div style={{ marginBottom: "12px" }}>
        Centre Location:
        <input type="text" defaultValue={intern?.center?.title} {...register("centre_location")} style={inputLine} />
      </div>

      {/* Purpose */}
      <div style={subHeading}>Purpose</div>
      <div style={section}>
        This Undertaking and Consent Form ("Form") outlines the protocol for
        psychology interns participating in the internship program at{" "}
        <span style={bold}>Jagruti Rehabilitation Centre</span>. By signing this
        Form, the intern acknowledges the vulnerability of patients, including
        minors, and agrees to maintain professional boundaries, ensuring ethical
        conduct during the internship.
      </div>

      {/* Section 1 */}
      <div style={subHeading}>1. Understanding Patient Vulnerability</div>
      <ul style={{ marginTop: "0", paddingLeft: "20px" }}>
        <li>
          Jagruti Rehabilitation Centre serves patients, including minors (under
          18 years), with mental health disorders (e.g., depression, anxiety,
          schizophrenia, bipolar disorder), addiction (e.g., alcohol, drugs),
          and neurological conditions (e.g., dementia), who may be{" "}
          <span style={bold}>vulnerable or emotionally sensitive</span> due to
          their conditions.
        </li>
        <li>
          Patients require a safe, therapeutic environment, and interactions
          with them must be conducted with utmost care, respect, and
          professionalism.
        </li>
        <li>
          I understand that patients, particularly minors, may exhibit emotional
          instability, seek comfort, or form attachments due to their mental
          health, addiction challenges, or young age, and it is my
          responsibility to respond appropriately while maintaining professional
          distance.
        </li>
      </ul>

      {/* Section 2 */}
      <div style={subHeading}>2. Professional Boundaries</div>
      <div style={section}>I undertake to:</div>
      <ul style={{ marginTop: "0", paddingLeft: "20px" }}>
        <li>
          <span style={bold}>Avoid Emotional Involvement:</span> Refrain from
          forming personal or emotional relationships with patients, such as
          sharing personal contact details, engaging in overly familiar
          conversations, or responding to emotional overtures beyond
          professional therapeutic support.
        </li>
        <li>
          <span style={bold}>Avoid Physical Involvement:</span> Maintain
          appropriate physical boundaries, limiting contact to necessary
          professional interactions (e.g., under supervision, if required by
          care protocols). Any physical contact must be minimal, respectful, and
          aligned with therapeutic guidelines.
        </li>
        <li>
          <span style={bold}>Avoid Social Media Connections:</span> Refrain from
          connecting with patients on any social media platforms, including but
          not limited to Instagram, Facebook, Twitter, LinkedIn, WhatsApp, or
          Snapchat, to maintain professional separation and protect patient
          privacy.
        </li>
      </ul>

      {/* Signature */}
      <div style={{ marginTop: "25px" }}>
        <div style={{ marginBottom: "10px" }}>
          Name:
          <input
            type="text"
            defaultValue={intern?.name}
            {...register("sign_name")}
            style={{ ...inputLine, width: "250px" }}
          />
        </div>
        <div>
          Sign:
          <input
            type="text"
            {...register("sign_signature")}
            style={{ ...inputLine, width: "250px" }}
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

export default InternUndertakingForm;
