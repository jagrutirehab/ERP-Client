import { useEffect, useState } from "react";
import PrintHeader from "./printheader";
import { getCurrentMedicines } from "../../../../helpers/backend_helper";

const DischargeEmergencyTransfer = ({
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

  const latestPrescription = admissions?.charts
    ?.filter((c) => c.chart === "PRESCRIPTION")
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))?.[0];

  console.log("latestPrescription", latestPrescription?.prescription);

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
            `eht_currMed${row}_medication`,
            [med?.medicine?.type, med?.medicine?.name, med?.medicine?.strength]
              .filter(Boolean)
              .join(" ") || "",
          );
          setValue(
            `eht_currMed${row}_dose`,
            `${morning || 0}-${evening || 0}-${night || 0}`,
          );
          setValue(
            `eht_currMed${row}_frequency`,
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
          EMERGENCY HOSPITAL TRANSFER NOTE
        </div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Form Dis-F-08 | EMR | Version 1.0 | Effective: 1st June 2026
        </div>
        <div style={{ fontSize: "11px" }}>
          NABH COP | Clinical Establishments Act 2010 | BNS 2023 (MLC) | MHCA
          2017
        </div>
      </div>

      {/* Warnings */}
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
        ⚠ TIME-CRITICAL — COMPLETE WITHIN 5 MINUTES — SEND WITH PATIENT
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginBottom: "4px",
        }}
      >
        CONFIDENTIAL — ORIGINAL TO GO WITH PATIENT | COPY RETAINED IN EMR
      </div>
      <div
        style={{
          border: "1px solid #c8a900",
          backgroundColor: "#fffbe6",
          padding: "6px 10px",
          fontSize: "12px",
          color: "#7a5f00",
          marginBottom: "8px",
        }}
      >
        ⚠ THIS IS AN EMERGENCY TRANSFER NOTE — NOT A FULL DISCHARGE SUMMARY.
        Complete the minimum required sections. A full clinical summary is to
        follow within 24 hours.
      </div>

      {/* SECTION A */}
      <div style={sectionHeader}>SECTION A — PATIENT IDENTIFICATION</div>

      <div style={fieldRow}>
        <span>Patient Name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("eht_patientName")}
          style={{
            ...inputLine,
            maxWidth: "200px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span style={{ marginLeft: "16px" }}>MRD Number:</span>
        <input
          type="text"
          defaultValue={admissions?.Ipdnum || ""}
          {...register("eht_mrdNumber")}
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
          {...register("eht_dob")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span style={{ marginLeft: "8px" }}>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("eht_age")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span style={{ marginLeft: "8px" }}>Gender:</span>
        <input
          type="text"
          value={patient?.gender || ""}
          {...register("eht_gender")}
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
          {...register("eht_admissionDate")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span style={{ marginLeft: "12px" }}>Admission Category:</span>
        <input
          type="text"
          {...register("eht_admissionCategory")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Known Allergies:</span>
        <input
          type="text"
          {...register("eht_allergies")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span style={{ marginLeft: "16px" }}>Blood Group (if known):</span>
        <input
          type="text"
          {...register("eht_bloodGroup")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      {/* SECTION B */}
      <div style={sectionHeader}>
        SECTION B — EMERGENCY — REASON FOR TRANSFER
      </div>
      <div style={{ fontSize: "13px", marginBottom: "6px" }}>
        Emergency condition (select one):
      </div>
      <div style={{ padding: "0 4px" }}>
        {[
          {
            key: "eht_cond1",
            label: "Cardiorespiratory arrest — CPR in progress / completed",
          },
          {
            key: "eht_cond2",
            label: "Severe alcohol withdrawal — DTs / status epilepticus",
          },
          {
            key: "eht_cond3",
            label: "Opioid overdose / severe respiratory depression",
          },
          {
            key: "eht_cond4",
            label: "Acute myocardial infarction / chest pain with ECG changes",
          },
          { key: "eht_cond5", label: "Stroke / sudden neurological deficit" },
          {
            key: "eht_cond6",
            label: "Severe hypoglycaemia / diabetic emergency",
          },
          { key: "eht_cond7", label: "Anaphylaxis" },
          { key: "eht_cond8", label: "Acute surgical abdomen" },
          {
            key: "eht_cond9",
            label:
              "Suicide attempt with physical injury requiring surgical care",
          },
          {
            key: "eht_cond10",
            label: "Severe aspiration pneumonia / respiratory failure",
          },
        ].map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
              fontSize: "13px",
            }}
          >
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
            {...register("eht_condOther")}
            style={{ width: "13px", height: "13px" }}
          />
          <span>Other:</span>
          <input
            type="text"
            {...register("eht_condOtherText")}
            style={{ ...inputLine, maxWidth: "250px" }}
          />
        </div>
      </div>

      <div style={fieldRow}>
        <span>Time of emergency identified:</span>
        <input
          type="text"
          {...register("eht_emergencyTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of transfer decision:</span>
        <input
          type="text"
          {...register("eht_transferDecisionTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of ambulance call:</span>
        <input
          type="text"
          {...register("eht_ambulanceCallTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time patient departed JRCPL:</span>
        <input
          type="text"
          {...register("eht_departureTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Receiving Hospital:</span>
        <input
          type="text"
          {...register("eht_receivingHospital")}
          style={{ ...inputLine, maxWidth: "250px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Receiving hospital pre-notified:</span>
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
            {...register("eht_preNotified")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Time:</span>
        <input
          type="text"
          {...register("eht_preNotifiedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span style={{ marginLeft: "8px" }}>By:</span>
        <input
          type="text"
          {...register("eht_preNotifiedBy")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
      </div>

      {/* SECTION C */}
      <div style={sectionHeader}>
        SECTION C — CLINICAL STATUS AT TIME OF TRANSFER
      </div>

      <div style={fieldRow}>
        <span>Vital Signs at Transfer — Time:</span>
        <input
          type="text"
          {...register("eht_vitalTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>BP:</span>
        <input
          type="text"
          {...register("eht_bp")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Pulse:</span>
        <input
          type="text"
          {...register("eht_pulse")}
          style={{ ...inputLine, maxWidth: "70px" }}
        />
        <span>RR:</span>
        <input
          type="text"
          {...register("eht_rr")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span>SpO2:</span>
        <input
          type="text"
          {...register("eht_spo2")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span>%</span>
      </div>

      <div style={fieldRow}>
        <span>Temp:</span>
        <input
          type="text"
          {...register("eht_temp")}
          style={{ ...inputLine, maxWidth: "70px" }}
        />
        <span style={{ marginLeft: "8px" }}>GCS:</span>
        <input
          type="text"
          {...register("eht_gcs")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span style={{ marginLeft: "8px" }}>Blood Glucose:</span>
        <input
          type="text"
          {...register("eht_bloodGlucose")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span style={{ marginLeft: "8px" }}>ECG:</span>
        <input
          type="text"
          {...register("eht_ecg")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Level of Consciousness:</span>
        {["Alert", "Drowsy", "Unresponsive", "Combative"].map((opt) => (
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
              {...register(`eht_consciousness_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Airway:</span>
        {["Patent", "Compromised"].map((opt) => (
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
              {...register(`eht_airway_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "8px" }}>— action taken:</span>
        <input
          type="text"
          {...register("eht_airwayAction")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Breathing:</span>
        {["Spontaneous", "Assisted"].map((opt) => (
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
              {...register(`eht_breathing_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
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
            {...register("eht_oxygenAdministered")}
            style={{ width: "13px", height: "13px" }}
          />
          Oxygen administered —
        </label>
        <input
          type="text"
          {...register("eht_oxygenLPM")}
          style={{ ...inputLine, maxWidth: "50px" }}
        />
        <span>L/min</span>
      </div>

      <div style={fieldRow}>
        <span>IV Access:</span>
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
            {...register("eht_ivAccessYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes — site:
        </label>
        <input
          type="text"
          {...register("eht_ivSite")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "12px",
          }}
        >
          <input
            type="checkbox"
            {...register("eht_ivAccessNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      <div style={fieldRow}>
        <span>CPR performed:</span>
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
            {...register("eht_cprYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes — duration:
        </label>
        <input
          type="text"
          {...register("eht_cprDuration")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>minutes</span>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "12px",
          }}
        >
          <input
            type="checkbox"
            {...register("eht_cprNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      <div style={fieldRow}>
        <span>DNAR in place:</span>
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
            {...register("eht_dnarYes")}
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
            {...register("eht_dnarNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      {/* SECTION D */}
      <div style={sectionHeader}>
        SECTION D — TREATMENT GIVEN AT JRCPL BEFORE TRANSFER
      </div>
      <div style={{ fontSize: "12px", marginBottom: "6px" }}>
        Medications given during emergency (include time, drug, dose, route):
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Medication</th>
            <th style={thStyle}>Dose</th>
            <th style={thStyle}>Route</th>
          </tr>
        </thead>
        <tbody>
          {medicineRows.map((row) => (
            <tr key={row}>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`eht_med${row}_time`)}
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
                  {...register(`eht_med${row}_medication`)}
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
                  {...register(`eht_med${row}_dose`)}
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
                  {...register(`eht_med${row}_route`)}
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
        <span>IV fluids administered:</span>
        <input
          type="text"
          {...register("eht_ivFluids")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Volume:</span>
        <input
          type="text"
          {...register("eht_ivVolume")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Defibrillation:</span>
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
            {...register("eht_defibYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes — No. of shocks:
        </label>
        <input
          type="text"
          {...register("eht_defibShocks")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "12px",
          }}
        >
          <input
            type="checkbox"
            {...register("eht_defibNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      <div style={fieldRow}>
        <span>Other interventions:</span>
        <input
          type="text"
          {...register("eht_otherInterventions")}
          style={{ ...inputLine, maxWidth: "320px" }}
        />
      </div>

      {/* SECTION E */}
      <div style={sectionHeader}>
        SECTION E — CURRENT MEDICATIONS (Psychiatric &amp; Medical)
      </div>
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
                  {...register(`eht_currMed${row}_medication`)}
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
                  {...register(`eht_currMed${row}_dose`)}
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
                  {...register(`eht_currMed${row}_frequency`)}
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
                  {...register(`eht_currMed${row}_lastDose`)}
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
          {...register("eht_ndps")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      {/* SECTION F */}
      <div style={sectionHeader}>SECTION F — MLC ASSESSMENT</div>

      <div style={fieldRow}>
        <span>MLC status assessment:</span>
        {["Likely MLC", "Not MLC", "Cannot determine — assess on arrival"].map(
          (opt) => (
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
                {...register(`eht_mlcStatus_${opt.replace(/\s+/g, "")}`)}
                style={{ width: "13px", height: "13px" }}
              />
              {opt}
            </label>
          ),
        )}
      </div>

      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
        MLC criteria present (check all that apply):
      </div>
      {[
        { key: "eht_mlc1", label: "Transfer within 24 hours of admission" },
        { key: "eht_mlc2", label: "Suspected or confirmed suicide attempt" },
        {
          key: "eht_mlc3",
          label: "Unnatural / suspicious / unexplained circumstances",
        },
        {
          key: "eht_mlc4",
          label: "Patient was under restraint at or near time of emergency",
        },
        { key: "eht_mlc5", label: "None of the above — not MLC" },
      ].map(({ key, label }) => (
        <div key={key} style={{ ...checkboxRow, paddingLeft: "16px" }}>
          <input
            type="checkbox"
            {...register(key)}
            style={{ width: "13px", height: "13px" }}
          />
          <span>{label}</span>
        </div>
      ))}

      <div style={{ fontSize: "12px", margin: "4px 0" }}>
        If MLC: Police intimation required within 2 hours of transfer.
      </div>
      <div style={fieldRow}>
        <span>Police intimated:</span>
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
            {...register("eht_policeIntimated")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Time:</span>
        <input
          type="text"
          {...register("eht_policeTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span style={{ marginLeft: "8px" }}>Station:</span>
        <input
          type="text"
          {...register("eht_policeStation")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Officer:</span>
        <input
          type="text"
          {...register("eht_policeOfficer")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>FIR / NCR No.:</span>
        <input
          type="text"
          {...register("eht_firNo")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>

      {/* SECTION G */}
      <div style={sectionHeader}>
        SECTION G — FAMILY NOTIFICATION &amp; ESCORT
      </div>

      <div style={fieldRow}>
        <span>Family / NR notified:</span>
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
            {...register("eht_familyNotifiedYes")}
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
            {...register("eht_familyNotifiedNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No (if No — document reason)
        </label>
      </div>

      <div style={fieldRow}>
        <span>Family contact name:</span>
        <input
          type="text"
          value={patient?.guardianName || ""}
          {...register("eht_familyContactName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Time notified:</span>
        <input
          type="text"
          {...register("eht_familyNotifiedTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Who notified:</span>
        <input
          type="text"
          {...register("eht_whoNotified")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span style={{ marginLeft: "12px" }}>Mode:</span>
        {["Phone", "In person"].map((opt) => (
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
              {...register(`eht_notifyMode_${opt.replace(/\s+/g, "")}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Patient escorted by JRCPL:</span>
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
            {...register("eht_escortedYes")}
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
            {...register("eht_escortedNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
        <span style={{ marginLeft: "12px" }}>Escort name:</span>
        <input
          type="text"
          {...register("eht_escortName")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Family meeting patient at hospital:</span>
        {["Yes", "No", "Unknown"].map((opt) => (
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
              {...register(`eht_familyMeeting_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION H */}
      <div style={sectionHeader}>
        SECTION H — JRCPL CONTACT DETAILS FOR RECEIVING HOSPITAL
      </div>

      <div style={fieldRow}>
        <span>Treating Psychiatrist:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("eht_contactPsych")}
          style={{
            ...inputLine,
            maxWidth: "180px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span style={{ marginLeft: "12px" }}>Phone:</span>
        <input
          type="text"
          {...register("eht_contactPsychPhone")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Centre Manager:</span>
        <input
          type="text"
          {...register("eht_contactManager")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Phone:</span>
        <input
          type="text"
          {...register("eht_contactManagerPhone")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Clinical Director:</span>
        <input
          type="text"
          {...register("eht_contactDirector")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Phone:</span>
        <input
          type="text"
          {...register("eht_contactDirectorPhone")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      {/* Clinician Sign-off */}
      <div style={{ ...sectionHeader, backgroundColor: "#2c3e50" }}>
        CLINICIAN COMPLETING THIS FORM
      </div>
      <div style={fieldRow}>
        <span>Name:</span>
        <input
          type="text"
          {...register("eht_clinicianName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Designation:</span>
        <input
          type="text"
          {...register("eht_clinicianDesignation")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Reg. No.:</span>
        <input
          type="text"
          {...register("eht_clinicianRegNo")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
        <span style={{ marginLeft: "12px" }}>Signature:</span>
        <input
          type="text"
          {...register("eht_clinicianSignature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("eht_clinicianDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "12px" }}>Time:</span>
        <input
          type="text"
          {...register("eht_clinicianTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
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
        Jagrutii Rehab Centre Pvt. Ltd. | Dis-F-08 | Version 1.0 | NABH COP |
        BNS 2023 | CONFIDENTIAL
      </div>
    </div>
  );
};

export default DischargeEmergencyTransfer;
