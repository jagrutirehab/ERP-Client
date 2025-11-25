import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const IndependentAdmMinor = ({ register, patient, details, chartData }) => {
  const pageContainer = {
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    pageBreakAfter: "always",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.5",
    width: "100%",
    maxWidth: "800px",
  };
  const heading = {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "17px",
    marginBottom: "2px",
  };
  const subHeading = {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "15px",
    marginBottom: "15px",
  };
  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    flex: "1",
    minWidth: "100px",
    maxWidth: "250px",
    margin: "0 5px",
    fontSize: "14px",
  };
  const inputLine2 = {
    border: "none",
    borderBottom: "1px solid #000",
    flex: "1",
    minWidth: "100px",
    maxWidth: "270px",
    margin: "0 5px",
    fontSize: "14px",
  };
  const fullLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
    fontSize: "14px",
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

  const [today, setToday] = useState("");
  const [guardianName, setGuardianName] = useState("");

  useEffect(() => {
    const localISODate = new Date().toISOString().split("T")[0];
    setToday(localISODate);
    setGuardianName(patient?.guardianName);
  }, [patient]);

  return (
    <div style={pageContainer}>
      <style>
        {`
          /* Responsive adjustments */
          @media (max-width: 768px) {
            input {
              width: 100% !important;
              margin: 5px 0 !important;
              display: block;
            }
            ol {
              padding-left: 20px !important;
            }
          }

          /* Print-specific styles */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            input {
              border: none;
              border-bottom: 1px solid #000;
              font-size: 12px;
              text-transform: uppercase;
            }
          }
        `}
      </style>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} pageWidth={window.innerWidth} />
      </div>
      <div style={heading}>Request For Admission of A Minor</div>
      <div style={subHeading}>
        Jagruti Rehabilitation Centre (MHCA 2017 Section 87)
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
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
            defaultValue={today}
            {...register("Indipendent_Admission_minor_date", {
              setValueAs: (val) => {
                if (!val) return "";
                const [year, month, day] = val.split("-");
                return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
              },
            })}
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
          value={patient?.name}
          {...register("Indipendent_Admission_minor_name")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />{" "}
        residing at
        <input
          type="text"
          value={patient?.address}
          {...register("Indipendent_Admission_minor_address")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullLine,
          }}
        />{" "}
        who is the Parent/Care taker being legal guardian of Master/Ms.
        <input
          type="text"
          value={patient?.name}
          {...register("Indipendent_Admission_minor_patientName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        UID No.
        <input
          type="text"
          // value={details?.IPDnum}
          value={patient?.id?.value}
          {...register("Indipendent_Admission_minor_ipd")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine2,
          }}
        />{" "}
        age
        <input
          type="text"
          defaultValue={chartData?.detailAdmission?.detailAdmission?.age || age}
          {...register("Indipendent_Admission_minor_age")}
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
          // value={patient?.guardianName}
          {...register("Indipendent_Admission_minor_parentName")}
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
          value={patient?.name}
          {...register("Indipendent_Admission_minor_patientName2")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        has been having following Symptoms since
        <input
          type="text"
          {...register("Indipendent_Admission_minor_symptomSince")}
          style={inputLine}
        />
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input
            type="text"
            value={chartData?.detailAdmission?.ChiefComplaints?.line1}
            {...register("Indipendent_Admission_minor_symptom1")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullLine,
            }}
          />
        </li>
        <li>
          <input
            type="text"
            value={chartData?.detailAdmission?.ChiefComplaints?.line2}
            {...register("Indipendent_Admission_minor_symptom2")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullLine,
            }}
          />
        </li>
        <li>
          <input
            type="text"
            value={chartData?.detailAdmission?.ChiefComplaints?.line3}
            {...register("Indipendent_Admission_minor_symptom3")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullLine,
            }}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_symptom4")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_symptom5")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_symptom6")}
            style={fullLine}
          />
        </li>
      </ol>
      <p>
        The following papers related to his/her illness along my photo identity
        copy are enclosed
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper1")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper2")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper3")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper4")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper5")}
            style={fullLine}
          />
        </li>
        <li>
          <input
            type="text"
            {...register("Indipendent_Admission_minor_paper6")}
            style={fullLine}
          />
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
          value={patient?.address}
          {...register("Indipendent_Admission_minor_fullAddress")}
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
          value={patient?.guardianPhoneNumber}
          {...register("Indipendent_Admission_minor_mobile")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        Alternate Mob./Landline No.
        <input
          type="text"
          {...register("Indipendent_Admission_minor_altMobile")}
          style={inputLine}
        />{" "}
        <div>
          Email
          <input
            type="text"
            {...register("Indipendent_Admission_minor_email")}
            style={inputLine}
          />
        </div>
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
          <br />
          Witness Name
          <input
            type="text"
            {...register("Indipendent_Admission_minor_witnessName")}
            style={fullLine}
          />
          <br />
          Date & Time
          <input
            type="date"
            defaultValue={today}
            {...register("Indipendent_Admission_minor_staffDateTime")}
            style={fullLine}
          />
        </div>
        <div>
          <div style={{ display: "flex" }}>
            Signature of Guardian:
            <div
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              <input
                type="text"
                defaultValue={guardianName}
                {...register("Indipendent_Admission_adult_guardianName3")}
                style={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  ...fullLine,
                }}
              />
            </div>
          </div>
          <br />
          Name
          <input
            type="text"
            value={patient?.name}
            {...register("Indipendent_Admission_minor_guardianName")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullLine,
            }}
          />
          <br />
          Date & Time
          <input
            type="date"
            defaultValue={today}
            {...register("Indipendent_Admission_minor_guardianDateTime")}
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
