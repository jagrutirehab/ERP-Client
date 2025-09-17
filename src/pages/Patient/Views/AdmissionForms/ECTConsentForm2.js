import { useEffect } from "react";
import PrintHeader from "./printheader";

const ECTConsentForm2 = ({ register, patient, admissions }) => {
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

  useEffect(() => {
    if (patient) {
      document.querySelector('[name="treatmentTo"]').value =
        patient?.name || "";
      document.querySelector('[name="nearestRelative"]').value =
        patient?.guardianName || "";
      document.querySelector('[name="relativeName"]').value =
        patient?.guardianName || "";
      document.querySelector('[name="relativeOf"]').value = patient?.name || "";
      document.querySelector('[name="relativeContact"]').value =
        patient?.guardianPhoneNumber || "";
    }

    const today = new Date().toLocaleDateString("en-GB").split("/").join("/");
    document.querySelector('[name="doctorDate"]').value = today;
    document.querySelector('[name="relativeDate"]').value = today;
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

      {/* Doctor’s Explanation */}
      <div>
        <div style={{ marginBottom: "20px", marginTop: "80px" }}>
          <PrintHeader patient={patient} pageWidth={window.innerWidth} />
        </div>
        <div style={{ marginTop: "35px" }}>
          <p style={bold}>Doctor's Explanation</p>
          <p>
            I confirm that I have explained to the patient / relative the
            nature, purpose and likely effects of this treatment to Shri / Smt.:
            <input
              type="text"
              defaultValue={patient?.name}
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                ...inputInline,
              }}
              {...register("treatmentTo")}
            />
          </p>
          <p>
            The nearest relative available was
            <input
              type="text"
              defaultValue={patient?.guardianName}
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                ...inputInline,
              }}
              {...register("nearestRelative")}
            />
          </p>
          <p>
            Date / Time / Place :{" "}
            <input
              type="text"
              defaultValue={new Date()
                .toLocaleDateString("en-GB")
                .split("/")
                .join("/")}
              style={inputInline}
              {...register("doctorDate")}
            />
          </p>
          <p style={{ textAlign: "right" }}>Signature of Doctor</p>
        </div>
      </div>

      {/* Relative’s Approval */}
      <div style={{ marginTop: "30px" }}>
        <p style={bold}>Relative's Approval (wherever Relevant)</p>
        <p>
          I (name){" "}
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeName")}
          />
          (the closest available relative of){" "}
          <input
            type="text"
            defaultValue={patient?.name}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeOf")}
          />
        </p>
        <p>
          Confirm that an explanation of the nature, purpose, and likely effects
          of ECT has been given to me by Dr.
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
            {...register("relativeDoctor")}
          />
          and that I approve of the treatment being given to the patient.
        </p>
        <p>
          Date / Time / Place :{" "}
          <input
            type="text"
            defaultValue={new Date()
              .toLocaleDateString("en-GB")
              .split("/")
              .join("/")}
            style={inputInline}
            {...register("relativeDate")}
          />
        </p>
        <p>
          Contact No.:{" "}
          <input
            type="text"
            defaultValue={patient?.guardianPhoneNumber}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeContact")}
          />
        </p>
        <p style={{ textAlign: "right" }}>Signature of relative</p>
      </div>
    </div>
  );
};

export default ECTConsentForm2;
