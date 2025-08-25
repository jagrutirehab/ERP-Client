import PrintHeader from "./printheader";

const IndipendentOpinion1 = ({ register,patient }) => {
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
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div>
      <div style={heading}>
        Independent Opinion of a Psychiatrist / Medical Practitioner / Medical
        Officer in charge for Admission
      </div>
      <div style={subHeading}>(Under Section 87, 89, 90 of MHCA 2017)</div>
      <p>
        This is to certify that, I Dr.
        <input
          type="text"
          {...register("page12_doctorName")}
          style={fullLine}
        />{" "}
        working as a
        <input
          type="text"
          {...register("page12_designation")}
          style={inputLine}
        />{" "}
        under unit -
        <input
          type="text"
          {...register("page12_unit")}
          style={inputLine}
        />{" "}
        have sought information of the history of presenting illness, examined
        personally and independently Mr./Ms./Mrs.
        <input
          type="text"
          {...register("page12_patientName")}
          style={fullLine}
        />{" "}
        IPD No.
        <input type="text" {...register("page12_ipd")} style={inputLine} />{" "}
        son/daughter/spouse/others of
        <input
          type="text"
          {...register("page12_relation")}
          style={inputLine}
        />{" "}
        Mr./Ms./Mrs.
        <input
          type="text"
          {...register("page12_guardianName")}
          style={inputLine}
        />
      </p>
      <p>Please tick the appropriate choice below and provide explanation :</p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="checkbox" {...register("page12_choice1")} /> Has recently
          threatened or attempted or is threatening or attempting to cause
          bodily harm to himself or another person
        </li>
        <li>
          <input type="checkbox" {...register("page12_choice2")} /> Has recently
          behaved or is behaving violently towards another person or has caused
          or is causing another person to fear bodily harm from him/or
        </li>
        <li>
          <input type="checkbox" {...register("page12_choice3")} /> Has recently
          shown or is showing an inability to care for himself to a degree that
          places the individual at risk of harm to himself
        </li>
      </ol>
      <p>
        Explanation for the choice's
        <input
          type="text"
          {...register("page12_explanation")}
          style={fullLine}
        />
      </p>
      <p>
        In my opinion, Mr./Mrs.
        <input
          type="text"
          {...register("page12_opinionName")}
          style={inputLine}
        />{" "}
        Hospital to
        <input
          type="text"
          {...register("page12_hospital")}
          style={inputLine}
        />{" "}
        requires supported admission under Sec 89 or 90
        <input type="checkbox" {...register("page12_supportedAdmission")} />
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div>
          Signature of the Psychiatrist / Medical Practitioner / Mental Health
          Professional / Medical Officer in charge
          <input
            type="text"
            {...register("page12_signature")}
            style={fullLine}
          />
        </div>
        <div>
          Name of the Psychiatrist / Medical Practitioner / Mental Health
          Professional / Medical Officer in charge
          <input type="text" {...register("page12_name")} style={fullLine} />
          <br />
          Date:
          <input type="text" {...register("page12_date")} style={fullLine} />
          <br />
          Time:
          <input type="text" {...register("page12_time")} style={fullLine} />
        </div>
      </div>
      <p style={{ marginTop: "20px", fontSize: "11px" }}>
        <b>N.B.:</b> Please strike off those which are not required.
      </p>
    </div>
  );
};
export default IndipendentOpinion1;
