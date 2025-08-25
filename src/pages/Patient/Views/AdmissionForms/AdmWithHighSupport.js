import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const AdmWithHighSupport = ({ register, patient, details }) => {
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

  const [age, setAge] = useState("");

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (patient?.dateOfBirth) {
      const calculatedAge = calculateAge(patient.dateOfBirth);
      setAge(calculatedAge.toString());
    }
  }, [patient]);

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div>
      <div style={heading}>Request For Admissions With High Support Needs</div>
      <div style={subHeading}>
        Jagruti Rehabilitation Centre (MHCA 2017 Section 89 / 90)
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          To, <br />
          The Psychiatrist, <br />
          Unit
          <input
            type="text"
            {...register("page9_unit")}
            style={inputLine}
          />{" "}
          Department of Psychiatry <br />
          Jagruti Rehabilitation Centre.
        </div>
        <div>
          Date:
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("page9_date")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              marginLeft: "5px",
            }}
          />
        </div>
      </div>
      <p>Sir/Madam,</p>
      <p>
        I Mr./Mrs./Ms.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("page9_name")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />{" "}
        residing at
        <input
          type="text"
          defaultValue={patient?.address}
          {...register("page9_address")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />{" "}
        Nominated representative Mr./Mrs./Ms.
        <input
          type="text"
          {...register("page9_nominatedRep")}
          style={inputLine}
        />{" "}
        of IPD No.
        <input
          type="text"
          defaultValue={details?.IPDnum}
          {...register("page9_ipd")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        age
        <input
          type="text"
          defaultValue={age}
          {...register("page9_age")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "60px",
            marginLeft: "5px",
            marginRight: "5px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />{" "}
        son/daughter of
        <input
          type="text"
          defaultValue={patient?.guardianRelation}
          {...register("page9_parentName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        request for his/her admission in your establishment for treatment of
        mental illness.
      </p>
      <p>
        Mr./Mrs./Ms.
        <input
          type="text"
          {...register("page9_patientName")}
          style={inputLine}
        />{" "}
        has/not written Advance Directive.
        <br />
        Mr./Mrs./Ms.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("page9_patientName2")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        has been having the following symptoms since
        <input
          type="text"
          {...register("page9_symptomSince")}
          style={inputLine}
        />
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page9_symptom1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_symptom2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_symptom3")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_symptom4")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_symptom5")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_symptom6")} style={fullLine} />
        </li>
      </ol>
      <p>
        The following papers regarding my appointment as nominated
        representative and information related to treatment of his/her mental
        illness are enclosed
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page9_paper1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_paper2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_paper3")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_paper4")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_paper5")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page9_paper6")} style={fullLine} />
        </li>
      </ol>
      <p>
        A self-attested copy of my identity Proof is enclosed.
        <br />
        Kindly admit him/her in your mental health establishment as patient with
        high support needs.
      </p>
      <p>
        Address
        <input
          type="text"
          defaultValue={patient?.address}
          {...register("page9_fullAddress")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />
      </p>
      <p>
        Mob.
        <input
          type="text"
          defaultValue={patient?.guardianPhoneNumber}
          {...register("page9_mobile")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        Alternate Mob./Landline No.
        <input
          type="text"
          {...register("page9_altMobile")}
          style={inputLine}
        />{" "}
        Email
        <input type="text" {...register("page9_email")} style={inputLine} />
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div>
          Signature of Guardian:
          <input
            type="text"
            {...register("page9_guardianSignature")}
            style={fullLine}
          />
          <br />
          Name
          <input
            type="text"
            defaultValue={patient?.guardianName}
            {...register("page9_guardianName")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullLine,
            }}
          />
          <br />
          Date & Time
          <input
            type="text"
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("page9_dateTime")}
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
export default AdmWithHighSupport;
