import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const DischargeDeath = ({ register, patient, admissions }) => {
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
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <div style={{ fontWeight: "bold", fontSize: "17px" }}>
          DEATH / EXPIRY DECLARATION &amp; MLC ASSESSMENT
        </div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Form Dis-F-09 | EMR | Version 1.0 | Effective: 1st June 2026
        </div>
        <div style={{ fontSize: "11px" }}>
          BNS 2023 (Sec. 174 equivalent) | MHCA 2017 Sec. 31 | Registration of
          Births &amp; Deaths Act 1969 | NABH COP
        </div>
      </div>

      {/* Critical warnings */}
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
        ⚠ CRITICAL MEDICO-LEGAL DOCUMENT — ALL TIMESTAMPS MUST BE PRECISE
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
        ⚠ RETAIN PERMANENTLY — NEVER DESTROY
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginBottom: "4px",
        }}
      >
        CONFIDENTIAL — FOR INTERNAL &amp; LEGAL USE
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
        ⚠ DO NOT HAND OVER THE BODY TO FAMILY BEFORE COMPLETING MLC ASSESSMENT.
        IF MLC — POLICE MUST BE INTIMATED WITHIN 2 HOURS. BODY HANDOVER AFTER
        POLICE FORMALITIES ONLY.
      </div>

      {/* SECTION A */}
      <div style={sectionHeader}>SECTION A — PATIENT DETAILS</div>

      <div style={fieldRow}>
        <span>Patient Name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("death_patientName")}
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
          {...register("death_mrdNumber")}
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
          {...register("death_dob")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("death_age")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span>Gender:</span>
        <input
          type="text"
          value={patient?.gender || ""}
          {...register("death_gender")}
          style={{ ...inputLine, maxWidth: "100px" }}
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
          {...register("death_admissionDate")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span>Date of Death:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("death_dateOfDeath", {
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
        <span>Centre:</span>
        <input
          type="text"
          defaultValue="Jagruti Rehabilitation Centre"
          {...register("death_centre")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span>Ward / Room:</span>
        <input
          type="text"
          {...register("death_wardRoom")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Admission Category:</span>
        {[
          { key: "death_catVoluntary", label: "Voluntary" },
          { key: "death_catSec89", label: "Sec. 89" },
          { key: "death_catSec90", label: "Sec. 90" },
          { key: "death_catEmergency", label: "Emergency" },
          { key: "death_catNDPS", label: "NDPS" },
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
        <span>Primary Diagnosis:</span>
        <input
          type="text"
          {...register("death_primaryDiagnosis")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>DNAR Order in place:</span>
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
            {...register("death_dnarYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes (document reference:
        </label>
        <input
          type="text"
          {...register("death_dnarRef")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
        <span>)</span>
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
            {...register("death_dnarNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      {/* SECTION B */}
      <div style={sectionHeader}>
        SECTION B — DISCOVERY &amp; RESUSCITATION TIMELINE
      </div>

      <div style={fieldRow}>
        <span>Time patient was last confirmed alive:</span>
        <input
          type="text"
          {...register("death_lastAliveTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>(by whom:</span>
        <input
          type="text"
          {...register("death_lastAliveByWhom")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
        <span>)</span>
      </div>

      <div style={fieldRow}>
        <span>Time patient found unresponsive / in distress:</span>
        <input
          type="text"
          {...register("death_foundUnresponsiveTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Found by (name &amp; designation):</span>
        <input
          type="text"
          {...register("death_foundBy")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Time duty doctor arrived at bedside:</span>
        <input
          type="text"
          {...register("death_doctorArrivedTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Resuscitation attempted:</span>
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
            {...register("death_resuscYes")}
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
            {...register("death_resuscNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No (DNAR applied)
        </label>
      </div>

      <div style={fieldRow}>
        <span>Time BLS commenced:</span>
        <input
          type="text"
          {...register("death_blsTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span style={{ marginLeft: "12px" }}>Time ACLS commenced:</span>
        <input
          type="text"
          {...register("death_aclsTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Duration of resuscitation:</span>
        <input
          type="text"
          {...register("death_resuscDuration")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>CPR record — Chest compressions:</span>
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
            {...register("death_cprCompressions")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Rescue breaths:</span>
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
            {...register("death_cprBreaths")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>AED/Defibrillator:</span>
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
            {...register("death_aedYes")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
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
            {...register("death_aedNo")}
            style={{ width: "13px", height: "13px" }}
          />
          No
        </label>
      </div>

      <div style={fieldRow}>
        <span>Shocks delivered:</span>
        <input
          type="text"
          {...register("death_shocksDelivered")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
      </div>

      <div style={{ fontSize: "12px", marginBottom: "4px" }}>
        Medications during resuscitation:
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Medication</th>
            <th style={thStyle}>Dose</th>
            <th style={thStyle}>Route</th>
            <th style={thStyle}>Time</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((row) => (
            <tr key={row}>
              <td style={tdStyle}>
                <input
                  type="text"
                  {...register(`death_resuscMed${row}_medication`)}
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
                  {...register(`death_resuscMed${row}_dose`)}
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
                  {...register(`death_resuscMed${row}_route`)}
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
                  {...register(`death_resuscMed${row}_time`)}
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
        <span>Time resuscitation discontinued:</span>
        <input
          type="text"
          {...register("death_resuscDiscontinuedTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Reason resuscitation discontinued:</span>
        {[
          { key: "death_reasonDNAR", label: "DNAR" },
          { key: "death_reasonRigorMortis", label: "Rigor mortis present" },
          {
            key: "death_reasonInjuries",
            label: "Injuries incompatible with life",
          },
          {
            key: "death_reasonAdequate",
            label: "Adequate resuscitation — no response",
          },
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

      {/* SECTION C */}
      <div style={sectionHeader}>SECTION C — DEATH DECLARATION</div>
      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
        Clinical examination findings at declaration:
      </div>

      <div style={fieldRow}>
        <span>Pulse (carotid):</span>
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
            {...register("death_pulseAbsent")}
            style={{ width: "13px", height: "13px" }}
          />
          Absent
        </label>
        <span>Time checked:</span>
        <input
          type="text"
          {...register("death_pulseTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Duration:</span>
        <input
          type="text"
          {...register("death_pulseDuration")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Respiration:</span>
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
            {...register("death_respAbsent")}
            style={{ width: "13px", height: "13px" }}
          />
          Absent
        </label>
        <span>Time checked:</span>
        <input
          type="text"
          {...register("death_respTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Duration:</span>
        <input
          type="text"
          {...register("death_respDuration")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Pupils:</span>
        {[
          { key: "death_pupilsFixed", label: "Fixed and dilated" },
          { key: "death_pupilsEqual", label: "Equal" },
          { key: "death_pupilsUnreactive", label: "Unreactive to light" },
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
        <span>Cardiac auscultation:</span>
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
            {...register("death_noHeartSounds")}
            style={{ width: "13px", height: "13px" }}
          />
          No heart sounds (duration:
        </label>
        <input
          type="text"
          {...register("death_heartSoundsDuration")}
          style={{ ...inputLine, maxWidth: "70px" }}
        />
        <span>)</span>
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
            {...register("death_ecgFlatline")}
            style={{ width: "13px", height: "13px" }}
          />
          ECG: Flatline
        </label>
      </div>

      <div style={fieldRow}>
        <span>GCS:</span>
        <input
          type="text"
          {...register("death_gcs")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
      </div>

      <div style={fieldRow}>
        <span style={{ fontWeight: "bold" }}>TIME OF DEATH DECLARED:</span>
        <input
          type="text"
          {...register("death_timeOfDeath")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>on Date:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("death_dateOfDeathDeclared", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#555",
          marginBottom: "6px",
          fontStyle: "italic",
        }}
      >
        (NOTE: Time of death = time of clinical declaration, NOT time of
        discovery)
      </div>

      <div
        style={{ fontSize: "13px", marginBottom: "4px", fontWeight: "bold" }}
      >
        Death declared by:
      </div>

      <div style={fieldRow}>
        <span>Doctor 1 Name:</span>
        <input
          type="text"
          {...register("death_doctor1Name")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Reg. No.:</span>
        <input
          type="text"
          {...register("death_doctor1RegNo")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Designation:</span>
        <input
          type="text"
          {...register("death_doctor1Designation")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span>Signature:</span>
        <input
          type="text"
          {...register("death_doctor1Signature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Doctor 2 Name (where available):</span>
        <input
          type="text"
          {...register("death_doctor2Name")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span>Reg. No.:</span>
        <input
          type="text"
          {...register("death_doctor2RegNo")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Designation:</span>
        <input
          type="text"
          {...register("death_doctor2Designation")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span>Signature:</span>
        <input
          type="text"
          {...register("death_doctor2Signature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Provisional Cause of Death:</span>
        <input
          type="text"
          {...register("death_provisionalCause")}
          style={{ ...inputLine, maxWidth: "320px" }}
        />
      </div>

      {/* SECTION D */}
      <div style={sectionHeader}>
        SECTION D — MLC (MEDICO-LEGAL CASE) ASSESSMENT — MANDATORY
      </div>
      <div style={{ fontSize: "12px", marginBottom: "6px" }}>
        Assess each criterion. ANY single criterion = AUTOMATIC MLC.
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>MLC Criterion</th>
            <th style={thStyle}>Present</th>
            <th style={thStyle}>Action Required</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              key: "death_mlc1",
              label: "Death within 24 hours of admission",
              action: "MANDATORY MLC — police within 2 hrs",
            },
            {
              key: "death_mlc2",
              label: "Suspected / confirmed suicide",
              action: "MANDATORY MLC — police within 2 hrs",
            },
            {
              key: "death_mlc3",
              label: "Unnatural / suspicious / unexplained death",
              action: "MANDATORY MLC — police within 2 hrs",
            },
            {
              key: "death_mlc4",
              label: "Death under restraint",
              action: "MANDATORY MLC + SMHA notification",
            },
            {
              key: "death_mlc5",
              label: "Death following absconding",
              action: "MANDATORY MLC — police within 2 hrs",
            },
            {
              key: "death_mlc6",
              label: "Sudden unexpected death (previously stable patient)",
              action: "MANDATORY MLC — police within 2 hrs",
            },
          ].map(({ key, label, action }) => (
            <tr key={key}>
              <td style={tdStyle}>{label}</td>
              <td style={tdStyle}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginRight: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    {...register(`${key}_yes`)}
                    style={{ width: "13px", height: "13px" }}
                  />{" "}
                  Yes
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <input
                    type="checkbox"
                    {...register(`${key}_no`)}
                    style={{ width: "13px", height: "13px" }}
                  />{" "}
                  No
                </label>
              </td>
              <td style={{ ...tdStyle, fontSize: "11px" }}>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={fieldRow}>
        <span>MLC Status:</span>
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
            {...register("death_mlcStatusYes")}
            style={{ width: "13px", height: "13px" }}
          />
          YES — MLC (any above = Yes)
        </label>
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
            {...register("death_mlcStatusNo")}
            style={{ width: "13px", height: "13px" }}
          />
          NO — Natural expected death (document basis below)
        </label>
      </div>
      <div style={fieldRow}>
        <span>Basis for non-MLC determination (if applicable):</span>
        <input
          type="text"
          {...register("death_nonMlcBasis")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      {/* SECTION E */}
      <div style={sectionHeader}>
        SECTION E — POLICE INTIMATION (MLC CASES ONLY)
      </div>

      <div style={fieldRow}>
        <span>Police Station contacted:</span>
        <input
          type="text"
          {...register("death_policeStation")}
          style={{ ...inputLine, maxWidth: "220px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of call:</span>
        <input
          type="text"
          {...register("death_policeCallTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Officer spoken to:</span>
        <input
          type="text"
          {...register("death_officerSpokenTo")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Officer's name &amp; designation:</span>
        <input
          type="text"
          {...register("death_officerNameDesignation")}
          style={{ ...inputLine, maxWidth: "250px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>FIR / MLR No. issued:</span>
        <input
          type="text"
          {...register("death_firMlrNo")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time police arrived at centre:</span>
        <input
          type="text"
          {...register("death_policeArrivedTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Police inquest conducted:</span>
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
              {...register(`death_policeInquest_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={fieldRow}>
        <span>Viscera / samples preserved as directed by police:</span>
        {["Yes", "No", "Not applicable"].map((opt) => (
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
              {...register(`death_viscera_${opt.replace(/\s+/g, "")}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={fieldRow}>
        <span>Post-mortem ordered by police:</span>
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
            {...register("death_pmOrdered")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes — Hospital for PM:
        </label>
        <input
          type="text"
          {...register("death_pmHospital")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>SMHA notification (if death under restraint):</span>
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
            {...register("death_smhaNotified")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Date:</span>
        <input
          type="date"
          {...register("death_smhaDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      {/* SECTION F */}
      <div style={sectionHeader}>SECTION F — FAMILY NOTIFICATION</div>
      <div
        style={{ fontSize: "12px", marginBottom: "6px", fontStyle: "italic" }}
      >
        Family / NR notified by (Treating Psychiatrist / Clinical Director ONLY
        — not nursing or admin staff):
      </div>

      <div style={fieldRow}>
        <span>Notified by:</span>
        <input
          type="text"
          {...register("death_notifiedBy")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Designation:</span>
        <input
          type="text"
          {...register("death_notifiedByDesignation")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Family/NR Name:</span>
        <input
          type="text"
          value={patient?.guardianName || ""}
          {...register("death_familyNRName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Relationship:</span>
        <input
          type="text"
          value={patient?.guardianRelation || ""}
          {...register("death_familyNRRelationship")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of notification:</span>
        <input
          type="text"
          {...register("death_notificationTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Mode:</span>
        {["Phone", "In person"].map((opt) => (
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
              {...register(`death_notifyMode_${opt.replace(/\s+/g, "")}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={fieldRow}>
        <span>Family's emotional state at notification:</span>
        <input
          type="text"
          {...register("death_familyEmotionalState")}
          style={{ ...inputLine, maxWidth: "260px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Bereavement support offered:</span>
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
            {...register("death_bereavementSupport")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes — by:
        </label>
        <input
          type="text"
          {...register("death_bereavementBy")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Family / NR arrived at centre:</span>
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
            {...register("death_familyArrived")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Time:</span>
        <input
          type="text"
          {...register("death_familyArrivedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      {/* SECTION G */}
      <div style={sectionHeader}>
        SECTION G — BODY HANDOVER (Non-MLC Cases Only)
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
        ⚠ MLC CASES: Body may only be handed over AFTER police complete
        formalities.
      </div>

      <div style={fieldRow}>
        <span>Body prepared for handover:</span>
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
            {...register("death_bodyPrepared")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
      </div>
      <div style={fieldRow}>
        <span>Body identification confirmed by family:</span>
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
            {...register("death_identityConfirmed")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
      </div>
      <div style={fieldRow}>
        <span>Name of family member confirming identity:</span>
        <input
          type="text"
          {...register("death_identityConfirmedBy")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span>Relationship:</span>
        <input
          type="text"
          {...register("death_identityRelationship")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Body handed over to:</span>
        <input
          type="text"
          {...register("death_handedOverTo")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Relationship:</span>
        <input
          type="text"
          {...register("death_handedOverRelationship")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Time of body handover:</span>
        <input
          type="text"
          {...register("death_handoverTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Signature of receiving family member:</span>
        <input
          type="text"
          {...register("death_familyMemberSignature")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Death Certificate issued:</span>
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
            {...register("death_certIssued")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Certificate No.:</span>
        <input
          type="text"
          {...register("death_certNo")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Registration of death initiated:</span>
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
              {...register(`death_registrationInitiated_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION H */}
      <div style={sectionHeader}>
        SECTION H — CLINICAL DIRECTOR NOTIFICATION &amp; SENTINEL EVENT
      </div>

      <div style={fieldRow}>
        <span>Clinical Director notified:</span>
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
            {...register("death_directorNotified")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Time:</span>
        <input
          type="text"
          {...register("death_directorNotifiedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>By:</span>
        <input
          type="text"
          {...register("death_directorNotifiedBy")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>CEO notified:</span>
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
            {...register("death_ceoNotified")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Time:</span>
        <input
          type="text"
          {...register("death_ceoNotifiedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Sentinel event review triggered:</span>
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
            {...register("death_sentinelReview")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Date for RCA:</span>
        <input
          type="date"
          {...register("death_rcaDate", {
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
        <span>Incident report completed within 4 hours:</span>
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
            {...register("death_incidentReport")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span>Incident Report No.:</span>
        <input
          type="text"
          {...register("death_incidentReportNo")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Treating Psychiatrist:</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("death_treatingPsych")}
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
          {...register("death_treatingPsychReg")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>
      <div style={fieldRow}>
        <span>Centre Manager:</span>
        <input
          type="text"
          {...register("death_centreManager")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Signature:</span>
        <input
          type="text"
          {...register("death_centreManagerSignature")}
          style={{ ...inputLine, maxWidth: "160px" }}
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
        Jagrutii Rehab Centre Pvt. Ltd. | Dis-F-09 | Version 1.0 | BNS 2023 |
        MHCA 2017 Sec. 31 | NEVER DESTROY | CONFIDENTIAL
      </div>
    </div>
  );
};

export default DischargeDeath;
