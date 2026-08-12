import { useEffect } from "react";
import PrintHeader from "./printheader";

const ECTConsentForm = ({ register, patient, admissions }) => {
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

  const bold = { fontWeight: "bold" };
  const inputInline = {
    border: "none",
    borderBottom: "1px solid #000",
    flex: "1",
    minWidth: "100px",
    maxWidth: "250px",
    margin: "0 5px",
    fontSize: "14px",
  };

  const signatureRow = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px",
  };

  useEffect(() => {
    if (patient) {
      document.querySelector('[name="patientName"]').value =
        patient?.name || "";
      document.querySelector('[name="relation"]').value =
        patient?.guardianRelation || "";
      document.querySelector('[name="patientRelativeName"]').value =
        patient?.guardianName || "";
    }

    if (admissions) {
      const doctorName =
        admissions?.length > 0 ? admissions[0].doctor?.name : "";
      document.querySelector('[name="doctorName"]').value = doctorName;
      document.querySelector('[name="doctorExplain"]').value = doctorName;
      document.querySelector('[name="relativeDoctor"]').value = doctorName;
    }

    const today = new Date().toLocaleDateString("en-GB").split("/").join("/");
    document.querySelector('[name="witnessDate"]').value = today;
  }, [patient, admissions]);

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
      {/* Title */}
      <h3
        style={{
          marginBottom: "25px",
          textAlign: "center",
          textDecoration: "underline",
          fontWeight: "bold",
          fontSize: "25px",
        }}
      >
        INFORMED CONSENT FOR ELECTRO – CONVULSIVE THERAPY
      </h3>

      {/* Consent Text */}
      <p>
        I hereby consent to the administration of a course of electro-convulsive
        therapy to myself / my relation. (name of the patient
        <input
          type="text"
          defaultValue={patient?.name}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("patientName")}
        />
        ) relation
        <input
          type="text"
          defaultValue={patient?.guardianRelation}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("relation")}
        />{" "}
        by Dr.
        <input
          type="text"
          defaultValue={
            admissions?.length > 0 ? admissions[0].doctor?.name : ""
          }
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("doctorName")}
        />
        (or any other suitably trained doctor deputed by him).
      </p>

      <p>
        I also consent to the use of an anaesthetic and / or a relaxant or
        sedative for this purpose. At the discretion of the doctor.
      </p>

      <p>
        I have been explained the nature and the purpose of the treatment, as
        also, its side effects and possible complications by Dr.
        <input
          type="text"
          defaultValue={
            admissions?.length > 0 ? admissions[0].doctor?.name : ""
          }
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("doctorExplain")}
        />
        in a language which I understand and to my satisfaction. I have read the
        accompanying information sheet.
      </p>

      <p>
        I have been explained other / alternative methods of treatments. I may
        have a headache and confusion immediately after treatment which are
        common. Memory deficit, lasting for a few weeks, is common, but there is
        no scientific evidence of permanent brain damage.
      </p>

      <p>
        I also understand that, like in other medical and surgical treatments,
        despite all precautions, risk to life cannot be ruled out. Rarely,
        fractures may occur.
      </p>

      <p>
        I authorize the doctor concerned to administer emergency treatment for
        all such complications, shift the patient to other hospital and / or
        seek help of other specialists if necessary. (I also undertake to bear
        the financial liability for such treatment of complications).
      </p>

      <p>
        No guarantee about the results and complications has been given to me.
      </p>

      <p>
        I know that this is not an emergency consent. I am aware that this
        consent can be withdrawn at any time, without affecting the patient's
        right to receive other / alternative scientifically established
        treatment.
      </p>

      <p>
        I have been told that the patient must not take anything by mouth for at
        least six hours, prior to the treatment. The strict care required
        immediately after the treatment and during convalescence has been
        explained to me / my relative.
      </p>

      <p>
        I understand (following my discussion with doctors) that the patient, by
        the very nature / severity of his / her illness, is not competent to
        give a real consent and I, therefore, willingly take the responsibility
        of giving such a consent on his / her behalf.
      </p>

      {/* Signatures */}
      <div style={signatureRow}>
        <div>
          <p>
            <span style={bold}>Signature of witness</span>
          </p>
          <p>
            Date / Time / Place :
            <input
              type="text"
              defaultValue={new Date()
                .toLocaleDateString("en-GB")
                .split("/")
                .join("/")}
              style={inputInline}
              {...register("witnessDate")}
            />
          </p>
        </div>

        <div>
          <p>
            <span style={bold}>Signature of patient / Relative</span>
          </p>
          <p>Name & Address :</p>
          <input
            type="text"
            defaultValue={patient?.guardianName}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("patientRelativeName")}
          />
          <br />
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("patientRelativeAddress1")}
          />
          <br />
          <input
            type="text"
            style={inputInline}
            {...register("patientRelativeAddress2")}
          />
        </div>
      </div>
    </div>
  );
};

export default ECTConsentForm;
