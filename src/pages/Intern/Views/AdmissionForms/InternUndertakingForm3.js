const InternUndertakingFormPage3 = ({ register, intern }) => {
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
    width: "420px",
    margin: "0 6px",
    display: "inline-block",
    verticalAlign: "middle",
  };

  const smallInput = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "180px",
    margin: "0 6px",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <div style={pageContainer}>
      {/* Header (optional) */}
      {/* <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div> */}

      {/* Title */}
      <div style={heading}>Intern’s Undertaking Form</div>

      {/* Section 6: Acknowledgment */}
      <div style={subHeading}>6. Acknowledgment</div>

      <div style={section}>
        I,
        <input
          type="text"
          defaultValue={intern?.name}
          {...(register ? register("ack_intern_name") : {})}
          placeholder="(name of intern)"
          style={{ ...inputLine, width: "460px", marginLeft: "8px" }}
        />
        , have read, understood, and agree to the terms of this Undertaking and
        Consent Form. I confirm that I will uphold professional boundaries and
        adhere to the protocol outlined above during my internship at{" "}
        <span style={bold}>Jagruti Rehabilitation Centre</span>.
      </div>

      <div style={{ marginTop: "18px", marginBottom: "8px" }}>
        Signature:
        <input
          type="text"
          {...(register ? register("ack_signature") : {})}
          style={{ ...smallInput, marginLeft: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        Date:
        <input
          type="date"
          {...(register ? register("ack_date") : {})}
          defaultValue={new Date().toISOString().split("T")[0]}
          style={{ ...smallInput, marginLeft: "55px" }}
        />
      </div>

      {/* Jagruti Representative */}
      <div style={subHeading}>Jagruti Rehabilitation Centre Representative</div>

      <div style={section}>
        I,
        <input
          type="text"
          defaultValue={intern?.name}
          {...(register ? register("rep_name") : {})}
          placeholder="(representative name)"
          style={{ ...inputLine, width: "460px", marginLeft: "8px" }}
        />
        , confirm that the terms of this Form have been explained to the intern,
        and they have agreed to comply with the protocol.
      </div>

      <div style={{ marginTop: "18px", marginBottom: "8px" }}>
        Staff Signature:
        <input
          type="text"
          {...(register ? register("rep_signature") : {})}
          style={{ ...smallInput, marginLeft: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "8px" }}>
        Designation:
        <input
          type="text"
          {...(register ? register("rep_designation") : {})}
          style={{ ...smallInput, marginLeft: "22px" }}
        />
      </div>

      <div style={{ marginBottom: "8px" }}>
        Date:
        <input
          type="date"
          {...(register ? register("rep_date") : {})}
          defaultValue={new Date().toISOString().split("T")[0]}
          style={{ ...smallInput, marginLeft: "75px" }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "80px",
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

export default InternUndertakingFormPage3;
