import { useEffect, useState } from "react";
import PrintHeader from "./printheader";
import { getCurrentMedicines } from "../../../../helpers/backend_helper";

const DischargeInterFacility = ({
  register,
  patient,
  admissions,
  chartData,
  setValue,
}) => {
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
    minWidth: "80px",
    maxWidth: "200px",
    margin: "0 5px",
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

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    marginBottom: "8px",
  };

  const thStyle = {
    backgroundColor: "#1a2e5a",
    color: "#fff",
    padding: "5px 8px",
    textAlign: "left",
    fontWeight: "bold",
  };

  const tdStyle = {
    border: "1px solid #ccc",
    padding: "4px 6px",
  };

  const [today, setToday] = useState("");
  const [medicineRows, setMedicineRows] = useState([1, 2, 3]);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (!patient?._id) return;

    getCurrentMedicines(patient._id, "IPD")
      .then((res) => {
        const medicines = res?.payload || [];

        const rowCount = Math.max(3, medicines.length);
        setMedicineRows(Array.from({ length: rowCount }, (_, i) => i + 1));

        medicines.forEach((item, index) => {
          const row = index + 1;
          const med = item.medicine;
          const { morning, evening, night } = med?.dosageAndFrequency || {};
          setValue(
            `ift_med${row}_medication`,
            [med?.medicine?.type, med?.medicine?.name, med?.medicine?.strength]
              .filter(Boolean)
              .join(" ") || "",
          );
          setValue(
            `ift_med${row}_dose`,
            `${morning || 0}-${evening || 0}-${night || 0}`,
          );
          setValue(
            `ift_med${row}_frequency`,
            `${med?.frequency || ""} ${med?.unit || ""}`.trim(),
          );
        });
      })
      .catch((err) => console.error("Failed to fetch current medicines", err));
  }, [patient?._id]);

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
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <div style={{ fontWeight: "bold", fontSize: "17px" }}>
          INTER-FACILITY TRANSFER CERTIFICATE
        </div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Form Dis-F-07 | EMR | Version 1.0 | Effective: 1st June 2026
        </div>
        <div style={{ fontSize: "11px" }}>
          Clinical Establishments Act 2010 | NABH COP | NMC Code of Ethics |
          MHCA 2017
        </div>
      </div>

      <div
        style={{
          border: "1px solid #c8a900",
          backgroundColor: "#fffbe6",
          padding: "6px 10px",
          fontWeight: "bold",
          fontSize: "12px",
          color: "#7a5f00",
          marginBottom: "4px",
        }}
      >
        ⚠ MEDICO-LEGAL DOCUMENT — ORIGINAL TO GO WITH PATIENT — COPY RETAINED IN
        EMR
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginBottom: "8px",
        }}
      >
        CONFIDENTIAL — FOR CLINICAL USE
      </div>

      {/* SECTION A */}
      <div style={sectionHeader}>SECTION A — TRANSFERRING FACILITY</div>

      <div style={fieldRow}>
        <span>Facility Name: Jagrutii Rehabilitation Centre —</span>
        <input
          type="text"
          {...register("ift_centreName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>(Centre Name)</span>
      </div>
      <div style={fieldRow}>
        <span>Address:</span>
        <input
          type="text"
          {...register("ift_transferAddress")}
          style={{ ...inputLine, maxWidth: "320px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Centre Manager:</span>
        <input
          type="text"
          {...register("ift_centreManager")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Contact:</span>
        <input
          type="text"
          {...register("ift_centreManagerContact")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Treating Psychiatrist:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("ift_treatingPsych")}
          style={{
            ...inputLine,
            maxWidth: "180px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span>Reg. No.:</span>
        <input
          type="text"
          {...register("ift_treatingPsychReg")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Transfer authorised by Clinical Director:</span>
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
            {...register("ift_clinicalDirectorAuth")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Time of authorisation:</span>
        <input
          type="text"
          {...register("ift_authTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      {/* SECTION B */}
      <div style={sectionHeader}>SECTION B — RECEIVING FACILITY</div>

      <div style={fieldRow}>
        <span>Facility Name:</span>
        <input
          type="text"
          {...register("ift_receivingFacility")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Address:</span>
        <input
          type="text"
          {...register("ift_receivingAddress")}
          style={{ ...inputLine, maxWidth: "320px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Receiving Doctor / Consultant:</span>
        <input
          type="text"
          {...register("ift_receivingDoctor")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Contact:</span>
        <input
          type="text"
          {...register("ift_receivingDoctorContact")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Bed confirmed:</span>
        {["Yes", "No"].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register(`ift_bedConfirmed_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "12px" }}>Bed/Ward:</span>
        <input
          type="text"
          {...register("ift_bedWard")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Confirmation received from:</span>
        <input
          type="text"
          {...register("ift_confirmationFrom")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Time:</span>
        <input
          type="text"
          {...register("ift_confirmationTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Mode of confirmation:</span>
        {["Phone", "Email", "In person", "Written"].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register(`ift_confirmMode_${opt.replace(/\s+/g, "")}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION C */}
      <div style={sectionHeader}>SECTION C — PATIENT DETAILS</div>

      <div style={fieldRow}>
        <span>Patient Name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("ift_patientName")}
          style={{
            ...inputLine,
            maxWidth: "200px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span>MRD Number:</span>
        <input
          type="text"
          defaultValue={admissions?.Ipdnum || ""}
          {...register("ift_mrdNumber")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Date of Birth:</span>
        <input
          type="text"
          value={
            patient?.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB")
              : ""
          }
          {...register("ift_dob")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("ift_age")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span>Gender:</span>
        <input
          type="text"
          value={patient?.gender || ""}
          {...register("ift_gender")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Admission Date at JRCPL:</span>
        <input
          type="text"
          value={
            admissions?.addmissionDate
              ? new Date(admissions.addmissionDate).toLocaleDateString("en-GB")
              : ""
          }
          {...register("ift_admissionDate")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span>Date of Transfer:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("ift_transferDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Admission Category:</span>
        {[
          { key: "ift_catVoluntary", label: "Voluntary (Sec. 86/87)" },
          { key: "ift_catSec89", label: "Supported (Sec. 89)" },
          { key: "ift_catSec90", label: "Supported (Sec. 90)" },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "13px", height: "13px" }}
            />
            {label}
          </label>
        ))}
      </div>
      <div style={fieldRow}>
        <span>Primary Diagnosis (ICD-10):</span>
        <input
          type="text"
          value={
            patient?.addmission?.provisional_diagnosis?.length
              ? patient.addmission?.provisional_diagnosis
                  .map((d) => d.code)
                  .join(", ")
              : ""
          }
          {...register("ift_primaryDiagnosis")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Secondary Diagnosis / Comorbidities:</span>
        <input
          type="text"
          {...register("ift_secondaryDiagnosis")}
          style={{ ...inputLine, maxWidth: "260px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Known Allergies:</span>
        <input
          type="text"
          {...register("ift_allergies")}
          style={{ ...inputLine, maxWidth: "260px" }}
        />
      </div>

      {/* SECTION D */}
      <div style={sectionHeader}>SECTION D — REASON FOR TRANSFER</div>
      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
        Clinical reason for transfer (select all that apply):
      </div>
      {[
        {
          key: "ift_reason1",
          label: "Medical condition beyond JRCPL's scope of care",
        },
        { key: "ift_reason2", label: "Specialist psychiatric input required" },
        {
          key: "ift_reason3",
          label: "Higher level of nursing / dependency care required",
        },
        {
          key: "ift_reason4",
          label: "Continued rehabilitation closer to patient's home",
        },
        {
          key: "ift_reason5",
          label: "Treatment-resistant case — specialist centre required",
        },
        {
          key: "ift_reason6",
          label: "Family request — clinically appropriate",
        },
        { key: "ift_reason7", label: "Court / legal direction (see Dis-F-14)" },
      ].map(({ key, label }) => (
        <div key={key} style={{ ...checkboxRow, paddingLeft: "8px" }}>
          <input
            type="checkbox"
            {...register(key)}
            style={{ width: "13px", height: "13px" }}
          />
          <span>{label}</span>
        </div>
      ))}
      <div style={fieldRow}>
        <input
          type="checkbox"
          {...register("ift_reasonOther")}
          style={{ width: "13px", height: "13px" }}
        />
        <span>Other:</span>
        <input
          type="text"
          {...register("ift_reasonOtherText")}
          style={{ ...inputLine, maxWidth: "250px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Detailed clinical justification:</span>
        <input
          type="text"
          {...register("ift_justification")}
          style={{ ...inputLine, maxWidth: "340px" }}
        />
      </div>

      {/* SECTION E */}
      <div style={sectionHeader}>
        SECTION E — CLINICAL SUMMARY FOR RECEIVING FACILITY
      </div>

      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
        Treatment received at JRCPL:
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          paddingLeft: "8px",
          marginBottom: "6px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            {...register("ift_txPharmacotherapy")}
            style={{ width: "13px", height: "13px" }}
          />
          Pharmacotherapy
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            {...register("ift_txECT")}
            style={{ width: "13px", height: "13px" }}
          />
          ECT (
          <input
            type="text"
            {...register("ift_ectSessions")}
            style={{ ...inputLine, maxWidth: "50px" }}
          />
          sessions)
        </label>
        {[
          { key: "ift_txIndividualTherapy", label: "Individual Therapy" },
          { key: "ift_txGroupTherapy", label: "Group Therapy" },
          { key: "ift_txDeAddiction", label: "De-Addiction Counselling" },
          { key: "ift_txOccupational", label: "Occupational Therapy" },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13px",
            }}
          >
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "13px", height: "13px" }}
            />
            {label}
          </label>
        ))}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            {...register("ift_txOther")}
            style={{ width: "13px", height: "13px" }}
          />
          Other:
          <input
            type="text"
            {...register("ift_txOtherText")}
            style={{ ...inputLine, maxWidth: "140px" }}
          />
        </label>
      </div>

      <div style={fieldRow}>
        <span>Clinical response to treatment:</span>
        <input
          type="text"
          {...register("ift_clinicalResponse")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Current Mental State — Mood:</span>
        <input
          type="text"
          {...register("ift_mood")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Behaviour:</span>
        <input
          type="text"
          {...register("ift_behaviour")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Speech:</span>
        <input
          type="text"
          {...register("ift_speech")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Thought:</span>
        <input
          type="text"
          {...register("ift_thought")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Cognition:</span>
        <input
          type="text"
          {...register("ift_cognition")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Insight:</span>
        <input
          type="text"
          {...register("ift_insight")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Risk at Transfer:</span>
        {["Low", "Moderate", "High"].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "10px",
            }}
          >
            <input
              type="checkbox"
              {...register(`ift_riskTransfer_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Suicidal Ideation:</span>
        {["None", "Passive", "Active"].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "10px",
            }}
          >
            <input
              type="checkbox"
              {...register(`ift_suicidalIdeation_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "16px" }}>Psychosis:</span>
        {["Absent", "Present"].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register(`ift_psychosis_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION F */}
      <div style={sectionHeader}>SECTION F — CURRENT MEDICATIONS</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Medication</th>
            <th style={thStyle}>Dose</th>
            <th style={thStyle}>Frequency</th>
            <th style={thStyle}>Last Dose Given (time/date)</th>
          </tr>
        </thead>
        <tbody>
          {medicineRows.map((row) => (
            <tr key={row}>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`ift_med${row}_medication`)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`ift_med${row}_dose`)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`ift_med${row}_frequency`)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`ift_med${row}_lastDose`)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={fieldRow}>
        <span>NDPS medications (if any):</span>
        <input
          type="text"
          {...register("ift_ndps")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      {/* SECTION G */}
      <div style={sectionHeader}>SECTION G — DOCUMENTS SENT WITH PATIENT</div>
      <div style={{ paddingLeft: "8px" }}>
        {[
          { key: "ift_doc1", label: "This Transfer Certificate (Dis-F-07)" },
          {
            key: "ift_doc2",
            label: "Referral letter addressed to receiving consultant",
          },
          {
            key: "ift_doc3",
            label: "Clinical summary / discharge summary (partial)",
          },
          { key: "ift_doc4", label: "Medication list with doses (Dis-F-13)" },
          { key: "ift_doc5", label: "Current prescription" },
          {
            key: "ift_doc6",
            label: "NDPS dispensing register entry (if NDPS medications)",
          },
          {
            key: "ift_doc7",
            label:
              "JRCPL contact card (Centre Manager + treating psychiatrist numbers)",
          },
        ].map(({ key, label }) => (
          <div key={key} style={checkboxRow}>
            <input
              type="checkbox"
              {...register(key)}
              style={{ width: "13px", height: "13px" }}
            />
            <span>{label}</span>
          </div>
        ))}
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docMedSupply")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Medication supply —</span>
          <input
            type="text"
            {...register("ift_medSupplyDays")}
            style={{ ...inputLine, maxWidth: "50px" }}
          />
          <span>days</span>
        </div>
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docLabReports")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Laboratory reports (most recent):</span>
          <input
            type="text"
            {...register("ift_labReportsText")}
            style={{ ...inputLine, maxWidth: "180px" }}
          />
        </div>
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docECG")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>ECG (dated:</span>
          <input
            type="text"
            {...register("ift_ecgDate")}
            style={{ ...inputLine, maxWidth: "100px" }}
          />
          <span>)</span>
        </div>
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docImaging")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Imaging reports:</span>
          <input
            type="text"
            {...register("ift_imagingText")}
            style={{ ...inputLine, maxWidth: "180px" }}
          />
        </div>
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docConsent")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Consent for transfer — signed by:</span>
          {["Patient", "NR"].map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginLeft: "8px",
              }}
            >
              <input
                type="checkbox"
                {...register(`ift_consentSignedBy_${opt}`)}
                style={{ width: "13px", height: "13px" }}
              />
              {opt}
            </label>
          ))}
        </div>
        <div style={fieldRow}>
          <input
            type="checkbox"
            {...register("ift_docOther")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Other:</span>
          <input
            type="text"
            {...register("ift_docOtherText")}
            style={{ ...inputLine, maxWidth: "200px" }}
          />
        </div>
      </div>

      {/* SECTION H */}
      <div style={sectionHeader}>SECTION H — ESCORT &amp; HANDOVER</div>

      <div style={fieldRow}>
        <span>Patient escorted by:</span>
        <input
          type="text"
          {...register("ift_escortedBy")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Designation:</span>
        <input
          type="text"
          {...register("ift_escortDesignation")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Mode of transport:</span>
        {[
          "Ambulance",
          "Private vehicle (with treating psychiatrist approval)",
        ].map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <input
              type="checkbox"
              {...register(
                `ift_transportMode_${opt.replace(/[^a-zA-Z0-9]/g, "")}`,
              )}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={fieldRow}>
        <span>Ambulance provider:</span>
        <input
          type="text"
          {...register("ift_ambulanceProvider")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span>Vehicle No.:</span>
        <input
          type="text"
          {...register("ift_vehicleNo")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of departure from JRCPL:</span>
        <input
          type="text"
          {...register("ift_departureTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of arrival at receiving facility:</span>
        <input
          type="text"
          {...register("ift_arrivalTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Verbal SBAR handover given to:</span>
        <input
          type="text"
          {...register("ift_sbarHandoverTo")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Designation:</span>
        <input
          type="text"
          {...register("ift_sbarDesignation")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Patient formally received by receiving facility:</span>
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
            {...register("ift_formallyReceived")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
      </div>
      <div style={fieldRow}>
        <span>Receiving facility representative signature:</span>
        <input
          type="text"
          {...register("ift_repSignature")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Date / Time of receipt:</span>
        <input
          type="text"
          {...register("ift_receiptDateTime")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>

      {/* SECTION I */}
      <div style={sectionHeader}>
        SECTION I — TREATING PSYCHIATRIST SIGN-OFF
      </div>
      <div style={{ fontSize: "12px", padding: "0 4px 6px" }}>
        I certify that the patient described above has been assessed and that
        clinical transfer to the receiving facility is appropriate and medically
        necessary as documented above.
      </div>
      <div style={fieldRow}>
        <span>Patient / NR Consent obtained:</span>
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
            {...register("ift_consentYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
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
            {...register("ift_consentNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No (reason:
        </label>
        <input
          type="text"
          {...register("ift_consentNoReason")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span>)</span>
      </div>
      <div style={fieldRow}>
        <span>Clinical Director authorised:</span>
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
            {...register("ift_directorAuthorised")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Date/Time:</span>
        <input
          type="text"
          {...register("ift_directorAuthDateTime")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Treating Psychiatrist:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("ift_psychSignName")}
          style={{
            ...inputLine,
            maxWidth: "180px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span>Reg. No.:</span>
        <input
          type="text"
          {...register("ift_psychSignReg")}
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
        Jagrutii Rehab Centre Pvt. Ltd. | Dis-F-07 | Version 1.0 | NABH COP |
        NMC Code of Ethics | MHCA 2017 | CONFIDENTIAL
      </div>
    </div>
  );
};

export default DischargeInterFacility;
