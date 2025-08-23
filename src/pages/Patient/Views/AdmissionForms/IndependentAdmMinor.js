import { useEffect, useState } from "react";

const IndependentAdmMinor = ({ register, patient, details }) => {
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
      <div style={heading}>Request For Admission of A Minor</div>
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
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("page8_date")}
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
        I, Mr./Mrs./Ms.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("page8_name")}
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
          {...register("page8_address")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />{" "}
        who is the Parent/Care taker being legal guardian of Master/Ms.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("page8_patientName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        IPD No.
        <input
          type="text"
          defaultValue={details?.IPDnum}
          {...register("page8_ipd")}
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
          {...register("page8_age")}
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
          defaultValue={patient?.guardianName}
          {...register("page8_parentName")}
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
        Master/Ms.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("page8_patientName2")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        has been having following Symptoms since
        <input
          type="text"
          {...register("page8_symptomSince")}
          style={inputLine}
        />
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page8_symptom1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_symptom2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_symptom3")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_symptom4")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_symptom5")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_symptom6")} style={fullLine} />
        </li>
      </ol>
      <p>
        The following papers related to his/her illness along my photo identity
        copy are enclosed
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input type="text" {...register("page8_paper1")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_paper2")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_paper3")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_paper4")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_paper5")} style={fullLine} />
        </li>
        <li>
          <input type="text" {...register("page8_paper6")} style={fullLine} />
        </li>
      </ol>
      <p>
        Kindly admit him/her in your mental health establishment as minor
        patient.
      </p>
      <p>
        Address
        <input
          type="text"
          defaultValue={patient?.address}
          {...register("page8_fullAddress")}
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
          {...register("page8_mobile")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        Alternate Mob./Landline No.
        <input
          type="text"
          {...register("page8_altMobile")}
          style={inputLine}
        />{" "}
        Email
        <input type="text" {...register("page8_email")} style={inputLine} />
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
            {...register("page8_staffSignature")}
            style={fullLine}
          />
          <br />
          Witness Name
          <input
            type="text"
            {...register("page8_witnessName")}
            style={fullLine}
          />
          <br />
          Date & Time
          <input
            type="text"
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("page8_staffDateTime")}
            style={fullLine}
          />
        </div>
        <div>
          Signature of Guardian:
          <input
            type="text"
            {...register("page8_guardianSignature")}
            style={fullLine}
          />
          <br />
          Name
          <input
            type="text"
            defaultValue={patient?.guardianName}
            {...register("page8_guardianName")}
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
            {...register("page8_guardianDateTime")}
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
export default IndependentAdmMinor;
