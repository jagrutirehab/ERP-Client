const DischargeIndependentMinor = ({ register }) => {
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
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "2px",
  };
  const subHeading = {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "12px",
    marginBottom: "15px",
  };
  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "150px",
    marginLeft: "5px",
    marginRight: "5px",
  };
  const fullLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
  };

  return (
    <div style={pageContainer}>
      <div style={heading}>Request For Discharge of Minor Patient</div>
      <div style={subHeading}>
        Jagruti Rehabilitation Centre (MHCA 2017 Section 87)
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          To, <br />
          The Psychiatrist, <br />
          The Department of Psychiatry, <br />
          Raha (Child Psychiatry Unit), <br />
          Jagruti Rehabilitation Centre.
        </div>
        <div>
          Date:
          <input
            type="date"
            {...register("page11_date")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              marginLeft: "5px",
            }}
          />
        </div>
      </div>
      <p>Sir/Madam : Request for Discharge.</p>
      <p>
        I, Mr./Mrs.
        <input type="text" {...register("page11_name")} style={fullLine} /> IPD
        No.
        <input type="text" {...register("page11_ipd")} style={inputLine} /> aged
        <input
          type="text"
          {...register("page11_age")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "60px",
            marginLeft: "5px",
            marginRight: "5px",
          }}
        />{" "}
        son/daughter of
        <input
          type="text"
          {...register("page11_parentName")}
          style={inputLine}
        />{" "}
        residing at
        <input
          type="text"
          {...register("page11_address")}
          style={fullLine}
        />{" "}
        was admitted in your mental health establishment as an Minor admission
        on
        <input
          type="text"
          {...register("page11_admissionDate")}
          style={inputLine}
        />{" "}
        Now he/she feel better and wish to be discharged. If any other reason's
        for discharge, please mention below :
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page11_reason1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page11_reason2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page11_reason3")} style={fullLine} />
        </li>
      </ol>
      <p>Kindly arrange to discharge him/her immediately.</p>
      <p>
        Address
        <input
          type="text"
          {...register("page11_fullAddress")}
          style={fullLine}
        />
      </p>
      <p>
        Mob.
        <input
          type="text"
          {...register("page11_mobile")}
          style={inputLine}
        />{" "}
        Alternate Mob./Landline No.
        <input
          type="text"
          {...register("page11_altMobile")}
          style={inputLine}
        />{" "}
        Email
        <input type="text" {...register("page11_email")} style={inputLine} />
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div>
          Signature of Staff:
          <input
            type="text"
            {...register("page11_staffSignature")}
            style={fullLine}
          />
          <br />
          Witness Name
          <input
            type="text"
            {...register("page11_witnessName")}
            style={fullLine}
          />
          <br />
          Date & Time
          <input
            type="text"
            {...register("page11_staffDateTime")}
            style={fullLine}
          />
        </div>
        <div>
          Signature of Guardian:
          <input
            type="text"
            {...register("page11_guardianSignature")}
            style={fullLine}
          />
          <br />
          Name
          <input
            type="text"
            {...register("page11_guardianName")}
            style={fullLine}
          />
          <br />
          Date & Time
          <input
            type="text"
            {...register("page11_guardianDateTime")}
            style={fullLine}
          />
        </div>
      </div>
      <p style={{ marginTop: "20px", fontSize: "11px" }}>
        <b>N.B.:</b> Please strike off those which are not required.
      </p>
    </div>
  );
};
export default DischargeIndependentMinor;
