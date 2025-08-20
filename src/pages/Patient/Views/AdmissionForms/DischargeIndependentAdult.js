const DischargeIndependentAdult = ({ register }) => {
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
      <div style={heading}>Request For Discharge By Independent Patient</div>
      <div style={subHeading}>
        Jagruti Rehabilitation Centre (MHCA 2017 Section 88)
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          To, <br />
          The Psychiatrist, <br />
          Unit
          <input
            type="text"
            {...register("page10_unit")}
            style={inputLine}
          />{" "}
          Department of Psychiatry, <br />
          Jagruti Rehabilitation Centre.
        </div>
        <div>
          Date:
          <input
            type="date"
            {...register("page10_date")}
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
        <input type="text" {...register("page10_name")} style={fullLine} /> IPD
        No.
        <input type="text" {...register("page10_ipd")} style={inputLine} /> aged
        <input
          type="text"
          {...register("page10_age")}
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
          {...register("page10_parentName")}
          style={inputLine}
        />{" "}
        residing at
        <input
          type="text"
          {...register("page10_address")}
          style={fullLine}
        />{" "}
        was admitted in your mental health establishment as an independent
        admission patient on
        <input
          type="text"
          {...register("page10_admissionDate")}
          style={inputLine}
        />{" "}
        I now feel better and wish to be discharged. If any other reasons for
        discharge, please mention below :
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page10_reason1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page10_reason2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page10_reason3")} style={fullLine} />
        </li>
      </ol>
      <p>Kindly arrange to discharge me immediately.</p>
      <p>
        Address
        <input
          type="text"
          {...register("page10_fullAddress")}
          style={fullLine}
        />
      </p>
      <p>
        Mob.
        <input
          type="text"
          {...register("page10_mobile")}
          style={inputLine}
        />{" "}
        Alternate Mob./Landline No.
        <input
          type="text"
          {...register("page10_altMobile")}
          style={inputLine}
        />{" "}
        Email
        <input type="text" {...register("page10_email")} style={inputLine} />
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div></div>
        <div>
          Signature of Guardian:
          <input
            type="text"
            {...register("page10_guardianSignature")}
            style={fullLine}
          />
          <br />
          Name
          <input
            type="text"
            {...register("page10_guardianName")}
            style={fullLine}
          />
          <br />
          Date & Time
          <input
            type="text"
            {...register("page10_dateTime")}
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
export default DischargeIndependentAdult;
