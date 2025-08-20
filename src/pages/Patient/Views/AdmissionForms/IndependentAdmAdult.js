const IndependentAdmAdult = ({ register }) => {
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
      {/* Headings */}
      <div style={heading}>Request For Independent Admission</div>
      <div style={subHeading}>
        Jagruti Rehabilitation Centre (MHCA 2017 Section 86)
      </div>

      {/* Address to Psychiatrist */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          To, <br />
          The Psychiatrist, <br />
          Unit
          <input
            type="text"
            {...register("page7_unit")}
            style={inputLine}
          />{" "}
          Department of Psychiatry <br />
          Jagruti Rehabilitation Centre.
        </div>
        <div>
          Date:
          <input
            type="date"
            {...register("page7_date")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              marginLeft: "5px",
            }}
          />
        </div>
      </div>

      {/* Salutation */}
      <p>Sir/Madam,</p>

      {/* First Paragraph */}
      <p>
        I Mr./ Mrs./ Ms.
        <input type="text" {...register("page7_name")} style={fullLine} /> IPD
        No.
        <input type="text" {...register("page7_ipd")} style={inputLine} /> age
        <input
          type="text"
          {...register("page7_age")}
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
          {...register("page7_parentName")}
          style={inputLine}
        />{" "}
        residing at
        <input
          type="text"
          {...register("page7_address")}
          style={fullLine}
        />{" "}
        have mental illness with following Symptoms since
        <input
          type="text"
          {...register("page7_symptomSince")}
          style={inputLine}
        />
      </p>

      {/* Symptoms List */}
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page7_symptom1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page7_symptom2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page7_symptom3")} style={fullLine} />
        </li>
      </ol>

      {/* Papers Enclosed */}
      <p>
        The following papers related to his/her illness along my photo identity
        copy are enclosed.
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page7_paper1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page7_paper2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page7_paper3")} style={fullLine} />
        </li>
      </ol>

      {/* Request Admission */}
      <p>
        I wish to be admitted in your establishment for treatment and request
        you to please admit me as an independent patient.
      </p>

      <p>
        Mr./Mrs/Ms.
        <input
          type="text"
          {...register("page7_guardianName")}
          style={inputLine}
        />{" "}
        who is my
        <input
          type="text"
          {...register("page7_guardianRelation")}
          style={inputLine}
        />{" "}
        (specify relationship) will be supporting me financially during my
        admission period to help in the treatment process.
      </p>

      {/* Identity Proof */}
      <p>A self-attested copy of my identity Proof is enclosed.</p>

      {/* Address */}
      <p>
        Address
        <input
          type="text"
          {...register("page7_fullAddress")}
          style={fullLine}
        />
      </p>
      <p>
        Mobile no
        <input
          type="text"
          {...register("page7_mobile")}
          style={inputLine}
        />{" "}
        Alternative Mobile/Land Line no
        <input
          type="text"
          {...register("page7_altMobile")}
          style={inputLine}
        />{" "}
        Email
        <input type="text" {...register("page7_email")} style={inputLine} />
      </p>

      {/* List of Enclosures */}
      <p>
        List of enclosures:
        <input
          type="text"
          {...register("page7_listEnclosures")}
          style={fullLine}
        />
      </p>

      {/* Signature Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div>
          ........................................................... <br />
          Signature of Guardian:
          <input
            type="text"
            {...register("page7_guardianSignature")}
            style={fullLine}
          />
        </div>
        <div>
          Name:
          <input
            type="text"
            {...register("page7_guardianName2")}
            style={fullLine}
          />
          <br />
          Date & Time:
          <input type="text" {...register("page7_dateTime")} style={fullLine} />
        </div>
      </div>

      {/* Note */}
      <p style={{ marginTop: "20px", fontSize: "11px" }}>
        <b>N.B.:</b> Please strike off those which are not required.
      </p>
    </div>
  );
};

export default IndependentAdmAdult;
