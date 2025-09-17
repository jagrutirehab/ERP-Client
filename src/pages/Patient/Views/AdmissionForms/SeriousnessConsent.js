import { useEffect } from "react";
import PrintHeader from "./printheader";

const SeriousnessConsent = ({ register, patient }) => {
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
    fontSize: "17px",
    marginBottom: "10px",
    textAlign: "center",
    textTransform: "uppercase",
  };

  const section = {
    marginBottom: "10px",
    textAlign: "justify",
  };

  const bold = { fontWeight: "bold" };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    flex: "1",
    minWidth: "100px",
    maxWidth: "250px",
    margin: "0 5px",
    fontSize: "14px",
  };

  useEffect(() => {
    if (patient) {
      document.querySelector('[name="seriousness_name"]').value =
        patient?.guardianName || "";
      document.querySelector('[name="seriousness_patientName"]').value =
        patient?.name || "";
      document.querySelector('[name="transfer_patientName"]').value =
        patient?.name || "";
      document.querySelector('[name="consent_patientName"]').value =
        patient?.name || "";
      document.querySelector('[name="consent_relation"]').value =
        patient?.guardianRelation || "";
    }

    // auto-fill date
    const today = new Date().toISOString().split("T")[0];
    document.querySelector('[name="page3_date"]').value = today;
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
      <div style={{ textAlign: "right", marginBottom: "5px" }}>
        Date:
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          {...register("page3_date", {
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

      <div style={heading}>
        Seriousness Consent For Emergency Medical Treatment and/or
        Hospitalization in ICU
      </div>

      {/* A) Seriousness */}
      <div style={section}>
        <span style={bold}>A) Seriousness</span> I,
        <input
          type="text"
          defaultValue={patient?.guardianName}
          {...register("seriousness_name")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        , aware of the Serious Condition of our patient, Mr/Mrs/Miss/Smt.
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("seriousness_patientName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        , who is critical & might deteriorate further leading to medical
        complications including death.
      </div>

      {/* B) Emergency Medication */}
      <div style={section}>
        <span style={bold}>B) Emergency Medication</span> I do hereby willfully
        give my full, complete, and irrevocable written consent to administer
        any/all Emergency Oral/Injectable Medication (both intramuscular and/or
        intravenous) as required to be given to the patient by doctors, nursing,
        and care staffs of{" "}
        <span style={bold}>Jagruti Rehabilitation Centre Pvt. Ltd.</span> I
        understand that emergency medicines are “NOT” optional and are necessary
        for appropriate management in case of non-psychiatric emergency. I
        understand that all the medication whatsoever are useful but may have
        side effect/s. The same have been clearly explained to me.
      </div>

      {/* C) Transfer to Other Hospital */}
      <div style={section}>
        <span style={bold}>C) Transfer to Other Hospital</span> I, do hereby
        willfully give my full, complete and irrevocable written consent to{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> to act in
        capacity of a legal guardian of Mr/Mrs/Smt/Miss
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("transfer_patientName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        to take any/all medical decisions deemed necessary for providing medical
        treatment in case of any medical emergency which may include
        transportation and admission to a Nursing Home/Hospital/consenting for a
        surgery on my behalf without prior information to me, if possible shift
        to our preferred Hospital
      </div>

      <div
        style={{ textAlign: "center", fontWeight: "bold", margin: "10px 0" }}
      >
        OR
      </div>

      {/* D) In-house Treatment */}
      <div style={section}>
        <span style={bold}>D) In-house Treatment</span> I do not want to shift
        my patient to higher centre, looking at the age & condition of the
        patient. Also, we are satisfied with the facilities of{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> & would like to
        continue the management of the patient here only.
      </div>

      {/* E) Disclaimer */}
      <div style={section}>
        <span style={bold}>E)</span> I will not hold{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> & its staff
        responsible for any untoward incidence including death & will bear the
        expenses of this extraordinary situation.
      </div>

      <div
        style={{ textAlign: "center", fontWeight: "bold", margin: "10px 0" }}
      >
        AND
      </div>

      <div style={section}>
        Jagruti has given me clear understanding of my patient’s physical and
        mental health. I understood the same and we give our full consent with
        regards to his/her treatment. During the course of treatment if patient
        get violent / aggressive / delirious / disoriented etc., then in that
        case he/she may need to be restrained temporarily to prevent head injury
        / fracture / suicidal attempt / injury to self or others.
      </div>

      {/* Patient & NOK Info */}
      <div style={{ marginTop: "15px" }}>
        <div>
          Name of Patient:
          <input
            type="text"
            defaultValue={patient?.name}
            {...register("consent_patientName")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          Relation with the Patient:
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            {...register("consent_relation")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          Name of NOK:
          <input
            type="text"
            {...register("consent_nokName")}
            style={inputLine}
          />
        </div>
        <div>
          Signature of NOK:
          <input
            type="text"
            {...register("consent_nokSignature")}
            style={inputLine}
          />
        </div>
      </div>
    </div>
  );
};

export default SeriousnessConsent;
