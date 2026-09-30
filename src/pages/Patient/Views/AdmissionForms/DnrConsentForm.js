import { useState, useEffect } from "react";
import PrintHeader from "./printheader";

const DnrConsentForm = ({ register, patient, admissions }) => {
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

  const sectionHeader = {
    backgroundColor: "#1a2e5a",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "13px",
    padding: "6px 10px",
    marginTop: "14px",
    marginBottom: "6px",
  };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    flex: "1",
    minWidth: "100px",
    maxWidth: "250px",
    margin: "0 5px",
    fontSize: "13px",
    background: "transparent",
  };

  const fullLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
    fontSize: "13px",
    background: "transparent",
  };

  const fieldRow = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "6px",
    fontSize: "13px",
  };

  const checkboxRow = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "5px",
    fontSize: "13px",
  };

  const noteText = {
    fontSize: "12px",
    color: "#555",
    fontStyle: "italic",
    marginBottom: "6px",
  };

  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div style={pageContainer}>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          input { border: none; border-bottom: 1px solid #000; font-size: 12px; background: transparent; }
        }
        @media (max-width: 768px) {
          input { width: 100% !important; margin: 5px 0 !important; display: block; }
        }
      `}</style>

      <div style={{ marginBottom: "16px" }}>
        <PrintHeader patient={patient} pageWidth={window.innerWidth} />
      </div>

      <h3
        style={{
          marginBottom: "12px",
          textAlign: "center",
          textDecoration: "underline",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        DO NOT RESUSCITATE CONSENT FORM
      </h3>

      {/* PATIENT DETAILS */}
      <div style={sectionHeader}>PATIENT DETAILS</div>
      <div style={fieldRow}>
        <span>Patient's name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("dnr_patientName")}
          style={{
            ...inputLine,
            maxWidth: "220px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        />
        <span style={{ marginLeft: "16px" }}>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("dnr_age")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>UHID / Reg. No.:</span>
        <input
          type="text"
          defaultValue={admissions?.[0]?.Ipdnum || ""}
          {...register("dnr_uhid")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Patient's address:</span>
        <input
          type="text"
          {...register("dnr_patientAddress")}
          style={fullLine}
        />
      </div>

      {/* RELATIVE / REPRESENTATIVE */}
      <div style={sectionHeader}>RELATIVE / REPRESENTATIVE</div>
      <div style={fieldRow}>
        <span>Name:</span>
        <input
          type="text"
          value={patient?.guardianName || ""}
          {...register("dnr_relativeName")}
          style={{
            ...inputLine,
            maxWidth: "220px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        />
        <span style={{ marginLeft: "16px" }}>Relationship to patient:</span>
        <input
          type="text"
          value={patient?.guardianRelation || ""}
          {...register("dnr_relativeRelation")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Address:</span>
        <input
          type="text"
          {...register("dnr_relativeAddress")}
          style={fullLine}
        />
      </div>
      <div style={fieldRow}>
        <span>Phone:</span>
        <input
          type="text"
          value={patient?.guardianPhoneNumber || ""}
          {...register("dnr_relativePhone")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Reason the patient is unable to give consent personally:</span>
        <input
          type="text"
          {...register("dnr_reasonUnableConsent")}
          style={fullLine}
        />
      </div>

      {/* DECLARATION */}
      <div style={sectionHeader}>DECLARATION</div>
      <ul style={{ paddingLeft: "20px", fontSize: "13px", marginBottom: "10px" }}>
        <li>
          I, the undersigned, request limited emergency care for the patient
          named above, as described in this form.
        </li>
        <li>
          I understand that Do Not Resuscitate means that if the patient's
          heart stops
          beating or the patient stops breathing, no medical procedure to
          restart breathing or heart function (cardiopulmonary resuscitation)
          will be carried out.
        </li>
        <li>
          I understand that this decision will not prevent the patient from
          receiving other appropriate medical care, comfort care, or emergency
          treatment from healthcare professionals.
        </li>
        <li>
          I confirm that, to the best of my knowledge, this decision reflects
          the patient's known wishes and/or best interests, and that it has
          been explained to me by the treating doctor.
        </li>
        <li>
          I give permission for this information to be shared with hospitals,
          out-of-hours and emergency services, and other healthcare
          professionals as necessary to implement this directive.
        </li>
        <li>
          On behalf of the patient, I hereby agree to the Do Not Resuscitate
          order.
        </li>
        <li>
          This directive remains in effect until it is withdrawn in writing by
          me or by the patient (if the patient regains capacity), or is
          reviewed by the treating doctor.
        </li>
      </ul>

      {/* SIGNATURES */}
      <div style={sectionHeader}>SIGNATURES</div>
      <div style={noteText}>
        Sign and date the form here in the presence of a witness.
      </div>
      <div style={fieldRow}>
        <span>Signature of relative / representative:</span>
        <input
          type="text"
          {...register("dnr_relativeSignature")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span style={{ marginLeft: "16px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("dnr_relativeSignDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [year, month, day] = val.split("-");
              return `${day}/${month}/${year}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      <div style={noteText}>
        The witness must sign here after the relative / representative has
        signed the form. The witness should then print his or her name and
        address in the spaces provided and complete the declaration below.
      </div>
      <div style={fieldRow}>
        <span>Signature of witness:</span>
        <input
          type="text"
          {...register("dnr_witnessSignature")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Name of witness:</span>
        <input
          type="text"
          {...register("dnr_witnessName")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Address of witness:</span>
        <input
          type="text"
          {...register("dnr_witnessAddress")}
          style={fullLine}
        />
      </div>

      {/* DECLARATION OF WITNESS */}
      <div style={sectionHeader}>DECLARATION OF WITNESS</div>
      <div style={fieldRow}>
        <span>
          The capacity in which I know the patient and the signing relative:
        </span>
        <input
          type="text"
          {...register("dnr_witnessCapacity")}
          style={fullLine}
        />
      </div>
      <div style={checkboxRow}>
        <input
          type="checkbox"
          {...register("dnr_witnessDeclaration")}
          style={{ width: "14px", height: "14px" }}
        />
        <span>
          I confirm that I am not the patient's spouse or relative, nor the
          person signing this form, and that I will not benefit personally
          from the patient's death
        </span>
      </div>

      {/* TREATING DOCTOR'S CONFIRMATION */}
      <div style={sectionHeader}>TREATING DOCTOR'S CONFIRMATION</div>
      <div style={noteText}>
        I have discussed the patient's condition and the meaning of this Do
        Not Resuscitate order with the signing relative / representative.
      </div>
      <div style={fieldRow}>
        <span>Doctor's name:</span>
        <input
          type="text"
          value={admissions?.[0]?.doctor?.name || ""}
          {...register("dnr_doctorName")}
          style={{
            ...inputLine,
            maxWidth: "200px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        />
        <span style={{ marginLeft: "12px" }}>Registration No.:</span>
        <input
          type="text"
          {...register("dnr_doctorRegNo")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Signature:</span>
        <input
          type="text"
          {...register("dnr_doctorSignature")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("dnr_doctorSignDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [year, month, day] = val.split("-");
              return `${day}/${month}/${year}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginTop: "20px",
          borderTop: "1px solid #ccc",
          paddingTop: "6px",
        }}
      >
        Jagruti Rehabilitation Centre | Do Not Resuscitate Consent Form |
        CONFIDENTIAL
      </div>
    </div>
  );
};

export default DnrConsentForm;
