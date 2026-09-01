import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const DischargeAMA = ({ register, patient, admissions }) => {
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

  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div style={pageContainer}>
      <style>{`
        @media print { body { margin: 0; padding: 0; } input { border: none; border-bottom: 1px solid #000; font-size: 12px; background: transparent; } }
        @media (max-width: 768px) { input { width: 100% !important; margin: 5px 0 !important; display: block; } }
      `}</style>

      <div style={{ marginBottom: "16px" }}>
        <PrintHeader patient={patient} pageWidth={window.innerWidth} />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "4px" }}>
        <div style={{ fontWeight: "bold", fontSize: "17px" }}>
          DISCHARGE AGAINST MEDICAL ADVICE — DECLARATION
        </div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Form AMA-F-001 | Dis-F-02 | Version 1.0 | MHCA 2017 §87–88 | RC-04
        </div>
        <div style={{ fontSize: "11px", color: "#555" }}>
          CONFIDENTIAL — UPLOAD TO EMR WITHIN 4 HOURS
        </div>
      </div>

      {/* Warning */}
      <div
        style={{
          border: "1px solid #c8a900",
          backgroundColor: "#fffbe6",
          padding: "8px 10px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#7a5f00",
          margin: "10px 0",
        }}
      >
        ⚠ AMA is a LEGAL EVENT. Complete BEFORE patient leaves. A voluntary,
        capacitous patient CANNOT be detained (MHCA §99). If the patient refuses
        to sign, two staff witnesses sign instead.
      </div>

      {/* SECTION A */}
      <div style={sectionHeader}>
        SECTION A — PATIENT &amp; ADMISSION DETAILS
      </div>

      <div style={fieldRow}>
        <span>Patient Name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("ama_patientName")}
          style={{
            ...inputLine,
            maxWidth: "200px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span style={{ marginLeft: "16px" }}>JRCPL ID:</span>
        <input
          type="text"
          defaultValue={admissions?.Ipdnum || ""}
          {...register("ama_jrcplId")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>DOB:</span>
        <input
          type="text"
          value={
            patient?.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB")
              : ""
          }
          {...register("ama_dob")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span style={{ marginLeft: "8px" }}>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("ama_age")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span style={{ marginLeft: "8px" }}>Gender:</span>
        <input
          type="text"
          value={patient?.gender || ""}
          {...register("ama_gender")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Diagnosis:</span>
        <input
          type="text"
          {...register("ama_diagnosis")}
          style={{ ...inputLine, maxWidth: "220px" }}
        />
        <span style={{ marginLeft: "16px" }}>Centre:</span>
        <input
          type="text"
          defaultValue={patient?.center?.title}
          disabled
          {...register("ama_centre")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Admission Date:</span>
        <input
          type="text"
          value={
            admissions?.addmissionDate
              ? new Date(admissions.addmissionDate).toLocaleDateString("en-GB")
              : ""
          }
          {...register("ama_admissionDate")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span style={{ marginLeft: "12px" }}>Time:</span>
        <input
          type="text"
          {...register("ama_admissionTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span style={{ marginLeft: "12px" }}>Psychiatrist:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("ama_psychiatrist")}
          style={{
            ...inputLine,
            maxWidth: "180px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
      </div>

      {/* SECTION B */}
      <div style={sectionHeader}>SECTION B — AMA REQUEST DETAILS</div>

      <div style={fieldRow}>
        <span>Date &amp; Time of AMA request:</span>
        <input
          type="datetime-local"
          defaultValue={`${today}T00:00`}
          {...register("ama_requestDateTime")}
          style={{ ...inputLine, maxWidth: "190px" }}
        />
        <span style={{ marginLeft: "16px" }}>Requested by:</span>
        <input
          type="text"
          {...register("ama_requestedBy")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Capacity at time of request:</span>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "10px",
          }}
        >
          <input
            type="checkbox"
            {...register("ama_hasCapacity")}
            style={{ width: "13px", height: "13px" }}
          />
          Has capacity — patient has right to leave
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "16px",
          }}
        >
          <input
            type="checkbox"
            {...register("ama_lacksCapacity")}
            style={{ width: "13px", height: "13px" }}
          />
          Lacks capacity — see clinical notes
        </label>
      </div>

      {/* SECTION C */}
      <div style={sectionHeader}>SECTION C — RISK COUNSELLING PROVIDED</div>
      <div style={{ padding: "0 4px" }}>
        {[
          {
            key: "ama_risk1",
            label: "Clinical risks of early discharge explained",
          },
          { key: "ama_risk2", label: "Relapse risk explained" },
          {
            key: "ama_risk3",
            label: "Medication discontinuation risks explained",
          },
          { key: "ama_risk4", label: "Alternatives offered" },
          { key: "ama_risk5", label: "Emergency contacts provided" },
          { key: "ama_risk6", label: "Prescription given (if appropriate)" },
        ].map(({ key, label }) => (
          <div key={key} style={checkboxRow}>
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "14px", height: "14px" }}
            />
            <span>{label}</span>
          </div>
        ))}

        <div style={fieldRow}>
          <span>Family/NR also counselled:</span>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register("ama_familyCounselled")}
              style={{ width: "13px", height: "13px" }}
            />
            Yes — Name:
          </label>
          <input
            type="text"
            {...register("ama_familyName")}
            style={{ ...inputLine, maxWidth: "180px" }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "16px",
            }}
          >
            <input
              type="checkbox"
              {...register("ama_patientDeclinedFamily")}
              style={{ width: "13px", height: "13px" }}
            />
            Patient declined family involvement
          </label>
        </div>
      </div>

      {/* SECTION D */}
      <div style={sectionHeader}>SECTION D — PATIENT / LAR DECLARATION</div>
      <div style={{ padding: "0 4px", fontSize: "13px", marginBottom: "6px" }}>
        I choose to leave against medical advice.
      </div>
      <div style={{ padding: "0 4px" }}>
        {[
          {
            key: "ama_decl1",
            label: "I understand the clinical risks of leaving now",
          },
          {
            key: "ama_decl2",
            label: "I have been offered alternatives and decline",
          },
          { key: "ama_decl3", label: "I choose to leave of my own free will" },
        ].map(({ key, label }) => (
          <div key={key} style={checkboxRow}>
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "14px", height: "14px" }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Patient / LAR Signature:</span>
        <input
          type="text"
          {...register("ama_patientSignature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Name:</span>
        <input
          type="text"
          {...register("ama_patientSignName")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("ama_patientSignDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "8px" }}>Time:</span>
        <input
          type="text"
          {...register("ama_patientSignTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Treating Psychiatrist Signature:</span>
        <input
          type="text"
          {...register("ama_psychSignature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Name &amp; Reg. No.:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("ama_psychName")}
          style={{
            ...inputLine,
            maxWidth: "160px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <input
          type="text"
          {...register("ama_psychRegNo")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("ama_psychDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "8px" }}>Time:</span>
        <input
          type="text"
          {...register("ama_psychTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      {/* SECTION E */}
      <div style={sectionHeader}>SECTION E — IF PATIENT REFUSES TO SIGN</div>
      <div style={{ fontSize: "12px", padding: "0 4px 6px" }}>
        We confirm the patient verbally requested AMA discharge. Risk
        counselling was provided. Patient declined to sign.
      </div>

      <div style={fieldRow}>
        <span>Witness 1 (Staff) Name:</span>
        <input
          type="text"
          {...register("ama_witness1Name")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Signature:</span>
        <input
          type="text"
          {...register("ama_witness1Signature")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("ama_witness1Date", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "8px" }}>Time:</span>
        <input
          type="text"
          {...register("ama_witness1Time")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Witness 2 (Staff) Name &amp; Reg. No.:</span>
        <input
          type="text"
          {...register("ama_witness2Name")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <input
          type="text"
          {...register("ama_witness2RegNo")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
        <span style={{ marginLeft: "12px" }}>Signature:</span>
        <input
          type="text"
          {...register("ama_witness2Signature")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("ama_witness2Date", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "8px" }}>Time:</span>
        <input
          type="text"
          {...register("ama_witness2Time")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      {/* SECTION F */}
      <div style={sectionHeader}>SECTION F — DISCHARGE CHECKLIST</div>
      <div style={{ padding: "0 4px" }}>
        {[
          { key: "ama_check1", label: "AMA discharge summary issued" },
          { key: "ama_check2", label: "Prescription provided" },
          { key: "ama_check3", label: "Entered in AMA register" },
        ].map(({ key, label }) => (
          <div key={key} style={checkboxRow}>
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "14px", height: "14px" }}
            />
            <span>{label}</span>
          </div>
        ))}
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
        Jagrutii Rehab Centre Pvt. Ltd. | AMA-F-001 | Dis-F-02 | Version 1.0 |
        MHCA 2017 §87–88 | CONFIDENTIAL
      </div>
    </div>
  );
};

export default DischargeAMA;
