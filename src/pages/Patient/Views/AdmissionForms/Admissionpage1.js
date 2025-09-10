import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const Admissionpage1 = ({
  register,
  admissions,
  patient,
  details,
}) => {
  const pageContainer = {
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    pageBreakAfter: "always",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
  };

  const heading = {
    fontWeight: "bold",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "5px",
    textTransform: "uppercase",
  };

  const formRow = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  };

  const label = { fontWeight: "bold" };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "300px",
    marginLeft: "5px",
    marginRight: "5px",
  };

  const fullWidthInput = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginLeft: "5px",
  };

  const consentHeading = {
    fontWeight: "bold",
    marginTop: "15px",
    marginBottom: "8px",
    textAlign: "center",
  };

  const consentPara = {
    marginBottom: "6px",
    textAlign: "justify",
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
      {/* Heading */}
      <div style={heading}>ADMISSION FORM</div>

      {/* Patient Info */}
      <div style={formRow}>
        <div>
          <span style={label}>Patient’s Name :</span>
          <input
            type="text"
            value={patient?.name}
            {...register("Basic_Admission_Form_patientName")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          <span style={label}>UID :</span>
          <input
            type="text"
            value={patient?.id?.value}
            {...register("Basic_Admission_Form_uid")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          <span style={label}>Age :</span>
          <input
            type="text"
            value={age}
            {...register("Basic_Admission_Form_age")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
              width: "50px",
            }}
          />
        </div>
      </div>

      <div style={formRow}>
        <div>
          <span style={label}>Sex :</span>
          <input
            type="text"
            value={patient?.gender}
            {...register("Basic_Admission_Form_sex")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
              width: "60px",
            }}
          />
        </div>
        {/* <div>
          <span style={label}>IPD No. :</span>
          <input
            type="text"
            value={details?.IPDnum}
            {...register("Basic_Admission_Form_IPDnum")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div> */}
        <div>
          <span style={label}>Ward / Bed :</span>
          <input
            type="text"
            value={`${details?.ward}/ ${details?.bed}`}
            {...register("Basic_Admission_Form_wardBed")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "5px" }}>
        <span style={label}>Address :</span>
        <input
          type="text"
          value={patient?.address}
          {...register("Basic_Admission_Form_address")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...fullWidthInput,
          }}
        />
      </div>

      <div style={formRow}>
        <div>
          <span style={label}>Referred by Dr. :</span>
          <input
            type="text"
            {...register("Basic_Admission_Form_referredBy")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          <span style={label}>Admitted Under Dr. :</span>
          <input
            type="text"
            value={admissions[0]?.doctor?.name}
            {...register("Basic_Admission_Form_admittedUnder")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
      </div>

      <div style={formRow}>
        <div>
          <span style={label}>Date of Admission :</span>
          <input
            type="date"
            value={
              admissions?.[0]?.addmissionDate
                ? new Date(admissions[0].addmissionDate)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            {...register("Basic_Admission_Form_dateAdmission")}
            style={inputLine}
          />
        </div>
        <div>
          <span style={label}>Time :</span>
          <input
            type="text"
            value={new Date(
              admissions[0]?.addmissionDate
            ).toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            {...register("Basic_Admission_Form_timeAdmission")}
            style={{ ...inputLine, width: "80px" }}
          />{" "}
          AM / PM
        </div>
      </div>

      <div style={formRow}>
        <div>
          <span style={label}>Date of Discharge :</span>
          <input
            type="date"
            {...register("Basic_Admission_Form_dateDischarge")}
            style={inputLine}
          />
        </div>
        <div>
          <span style={label}>Time :</span>
          <input
            type="text"
            {...register("Basic_Admission_Form_timeDischarge")}
            style={{ ...inputLine, width: "80px" }}
          />{" "}
          AM / PM
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <span style={label}>Provisional Diagnosis :</span>
        <input
          type="text"
          value={patient?.addmission?.provisionalDiagnosis}
          {...register("Basic_Admission_Form_provisionalDiagnosis")}
          style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...fullWidthInput,
            }}
        />
      </div>

      {/* Consent Section */}
      <div style={consentHeading}>
        Consent for Hospitalization and Undertaking by The Patient / Relatives
      </div>

      {[
        "I have been well informed by hospital staff about my / patient's provisional diagnosis and severity of the illness, current status of health and illness, investigations required to be carried out, the proposed modality of the treatment, risk factors, possibility of the complications, the prognosis, rules and regulations of the hospital, the rough estimation of expenses and approximate duration of hospital stay.",
        "I have been fully explained about investigations, medications, their effects and possible ill- effects, or untoward reactions & possible complications arising during the course of or after the investigations, medications, procedures and surgeries.",
        "I hereby provide my free and voluntary consent for the necessary investigations (including HIV tests for which I have been counseled) and treatment. The doctors have explained me the advantages as well as limitations of such investigations.",
        "I am sufficiently explained that medicines, infusion bottles and infusion sets, surgical implants and stents etc. are not manufactured by the hospital and as such hospital or any of its staff cannot be held liable for any deficiency in these items. It is also explained to me that medications from only authorized and licensed companies are used in this hospital.",
        "I am aware that I have the opportunity to ask any question / doubt / query / clarification about the medical, financial or any other aspect of my treatment.",
        "If the patient or any of his / her attendant damage any of the hospital property and equipments, we shall be responsible for it and we will pay for the damage / breakage separately.",
        "We are aware of the available facilities and also of non-availability of certain facilities in this Hospital.",
        "We hereby authorize the medical and paramedical staff of this hospital to admit and provide assessment, evaluation, investigations and medical treatment including administration of drugs during the course of the patient’s hospitalization.",
        "In consideration of this line of treatment, agreed by us, we release our doctor, his associates and assistants, the hospital, its personnel and any other person participating in patient’s care from any responsibility whatsoever from any resulting illness, ill effects of reactions that patient may get and undertake not to raise any claim or take any legal action for damage in any court against doctor in charge of this case or other staff member of the hospital. We are signing this letter of our free will, without any coercion and obligation. The above statements have been explained to us in our mother tongue.",
      ].map((point, i) => (
        <div key={i} style={consentPara}>
          {i + 1}) {point}
        </div>
      ))}
    </div>
  );
};

export default Admissionpage1;
