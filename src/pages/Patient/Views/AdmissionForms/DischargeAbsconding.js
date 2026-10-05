import { useEffect, useState } from "react";
import PrintHeader from "./printheader";

const DischargeAbsconding = ({ register, patient, admissions }) => {
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
          ABSCONDING PATIENT REPORT &amp; POLICE INTIMATION
        </div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Form Dis-F-06 | EMR | Version 1.0 | Effective: 1st June 2026
        </div>
        <div style={{ fontSize: "11px" }}>
          MHCA 2017 Sec. 103 (Recall) | BNS 2023 | NABH COP | ACE | RM
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
        ⚠ TIME-CRITICAL — COMPLETE WITHIN 24 HOURS OF CONFIRMED ABSCONDING
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginBottom: "8px",
        }}
      >
        CONFIDENTIAL — FOR INTERNAL &amp; LEGAL USE
      </div>

      {/* SECTION A */}
      <div style={sectionHeader}>SECTION A — PATIENT DETAILS</div>

      <div style={fieldRow}>
        <span>Patient Name:</span>
        <input
          type="text"
          value={patient?.name || ""}
          {...register("abs_patientName")}
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
          {...register("abs_mrdNumber")}
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
          {...register("abs_dob")}
          style={{ ...inputLine, maxWidth: "110px" }}
        />
        <span>Age:</span>
        <input
          type="text"
          value={patient?.age || ""}
          {...register("abs_age")}
          style={{ ...inputLine, maxWidth: "60px" }}
        />
        <span>Gender:</span>
        <input
          type="text"
          value={patient?.gender || ""}
          {...register("abs_gender")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Physical Description — Height:</span>
        <input
          type="text"
          {...register("abs_height")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Build:</span>
        <input
          type="text"
          {...register("abs_build")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Complexion:</span>
        <input
          type="text"
          {...register("abs_complexion")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Hair:</span>
        <input
          type="text"
          {...register("abs_hair")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
        <span>Clothing at time of absconding:</span>
        <input
          type="text"
          {...register("abs_clothing")}
          style={{ ...inputLine, maxWidth: "220px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Identifying marks / features:</span>
        <input
          type="text"
          {...register("abs_identifyingMarks")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Admission Category:</span>
        {[
          { key: "abs_catVoluntary", label: "Voluntary (Sec. 86/87)" },
          { key: "abs_catSec89", label: "Supported (Sec. 89)" },
          { key: "abs_catSec90", label: "Supported (Sec. 90)" },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "10px",
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
          {...register("abs_diagnosis")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Current Risk Level:</span>
        {["Low", "Moderate", "HIGH"].map((opt) => (
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
              {...register(`abs_risk_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "16px" }}>Suicidal Ideation:</span>
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
              {...register(`abs_suicidalIdeation_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Active Psychosis:</span>
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
              {...register(`abs_psychosis_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "16px" }}>Active Withdrawal:</span>
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
              {...register(`abs_withdrawal_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION B */}
      <div style={sectionHeader}>SECTION B — TIMELINE OF ABSCONDING EVENT</div>

      <div style={fieldRow}>
        <span>Date of absconding:</span>
        <input
          type="date"
          defaultValue={today}
          {...register("abs_abscondDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span style={{ marginLeft: "12px" }}>Day:</span>
        <input
          type="text"
          {...register("abs_abscondDay")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Time patient was last CONFIRMED seen on premises:</span>
        <input
          type="text"
          {...register("abs_lastSeenTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Name of staff who last saw patient:</span>
        <input
          type="text"
          {...register("abs_lastStaffName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Location:</span>
        <input
          type="text"
          {...register("abs_lastStaffLocation")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Time absconding was confirmed / reported:</span>
        <input
          type="text"
          {...register("abs_confirmedTime")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Reported by:</span>
        <input
          type="text"
          {...register("abs_reportedBy")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span style={{ marginLeft: "12px" }}>Designation:</span>
        <input
          type="text"
          {...register("abs_reportedByDesignation")}
          style={{ ...inputLine, maxWidth: "150px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>STRUCTURED WARD SEARCH CONDUCTED:</span>
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
              {...register(`abs_wardSearch_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
        Areas searched:
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          paddingLeft: "8px",
          marginBottom: "6px",
        }}
      >
        {[
          "All rooms",
          "Bathrooms",
          "Garden/outdoor",
          "Common areas",
          "Roof/terrace",
          "All exits/stairwells",
          "CCTV reviewed",
        ].map((area) => (
          <label
            key={area}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13px",
            }}
          >
            <input
              type="checkbox"
              {...register(`abs_area_${area.replace(/[^a-zA-Z0-9]/g, "")}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {area}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Search outcome:</span>
        <input
          type="text"
          {...register("abs_searchOutcome")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      {/* SECTION C */}
      <div style={sectionHeader}>
        SECTION C — ESCALATION LOG (All times must be precise)
      </div>
      {[
        { key: "NursingInCharge", label: "Nursing In-Charge informed" },
        { key: "DutyDoctor", label: "Duty Doctor informed" },
        {
          key: "TreatingPsychiatrist",
          label: "Treating Psychiatrist informed",
        },
        { key: "CentreManager", label: "Centre Manager informed" },
      ].map(({ key, label }) => (
        <div key={key} style={fieldRow}>
          <span>{label}: Time:</span>
          <input
            type="text"
            {...register(`abs_escalation_${key}_time`)}
            style={{ ...inputLine, maxWidth: "80px" }}
          />
          <span>Name:</span>
          <input
            type="text"
            {...register(`abs_escalation_${key}_name`)}
            style={{ ...inputLine, maxWidth: "180px" }}
          />
        </div>
      ))}

      {/* SECTION D */}
      <div style={sectionHeader}>SECTION D — FAMILY / NR NOTIFICATION</div>

      <div style={fieldRow}>
        <span>Family / NR notified:</span>
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
              {...register(`abs_familyNotified_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>NR / Family Name:</span>
        <input
          type="text"
          value={patient?.guardianName || ""}
          {...register("abs_nrName")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Relationship:</span>
        <input
          type="text"
          value={patient?.guardianRelation || ""}
          {...register("abs_nrRelationship")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Phone:</span>
        <input
          type="text"
          {...register("abs_nrPhone")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
        <span>Time of Call:</span>
        <input
          type="text"
          {...register("abs_nrCallTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Who called:</span>
        <input
          type="text"
          {...register("abs_whoCalled")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
        <span>What was communicated:</span>
        <input
          type="text"
          {...register("abs_whatCommunicated")}
          style={{ ...inputLine, maxWidth: "220px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Family response:</span>
        <input
          type="text"
          {...register("abs_familyResponse")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Has patient contacted family?</span>
        {["Yes", "No", "Unknown"].map((opt) => (
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
              {...register(`abs_patientContactedFamily_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>If yes — when and what was said:</span>
        <input
          type="text"
          {...register("abs_patientContactedFamilyDetails")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Known locations patient may go:</span>
        <input
          type="text"
          {...register("abs_knownLocations")}
          style={{ ...inputLine, maxWidth: "300px" }}
        />
      </div>

      {/* SECTION E */}
      <div style={sectionHeader}>SECTION E — POLICE INTIMATION</div>

      <div
        style={{ fontSize: "12px", marginBottom: "6px", fontStyle: "italic" }}
      >
        Police intimation MANDATORY for:
        {[
          { key: "abs_mandatorySec8990", label: "Sec. 89/90 patients" },
          { key: "abs_mandatoryMinors", label: "Minors" },
          { key: "abs_mandatoryNDPS", label: "NDPS" },
          { key: "abs_mandatoryHighSuicidal", label: "High suicidal risk" },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "10px",
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
        <span>Police Intimation Required:</span>
        {[
          { key: "abs_policeMandatory", label: "Yes — Mandatory" },
          { key: "abs_policeRecommended", label: "Yes — Recommended" },
          {
            key: "abs_policeNo",
            label: "No (Voluntary, low risk — document reason)",
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

      <div style={fieldRow}>
        <span>Reason if no police intimation:</span>
        <input
          type="text"
          {...register("abs_noPoliceReason")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Police Station Name:</span>
        <input
          type="text"
          {...register("abs_policeStation")}
          style={{ ...inputLine, maxWidth: "220px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Station Contact Number:</span>
        <input
          type="text"
          {...register("abs_stationContact")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Time of Call:</span>
        <input
          type="text"
          {...register("abs_policeCallTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
        <span>Officer Spoken To:</span>
        <input
          type="text"
          {...register("abs_officerSpokenTo")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Officer Designation / Badge No.:</span>
        <input
          type="text"
          {...register("abs_officerDesignation")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>FIR / NCR No. (if issued):</span>
        <input
          type="text"
          {...register("abs_firNo")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Written intimation submitted:</span>
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
              {...register(`abs_writtenIntimation_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "12px" }}>Time submitted:</span>
        <input
          type="text"
          {...register("abs_intimationSubmittedTime")}
          style={{ ...inputLine, maxWidth: "90px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>MHCA 2017 Sec. 103 Recall initiated:</span>
        {["Yes", "No", "Not applicable (Voluntary patient)"].map((opt) => (
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
                `abs_mhcaRecall_${opt.replace(/[^a-zA-Z0-9]/g, "")}`,
              )}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* SECTION F */}
      <div style={sectionHeader}>SECTION F — IF PATIENT RETURNS</div>

      <div style={fieldRow}>
        <span>Date / Time of return:</span>
        <input
          type="text"
          {...register("abs_returnDateTime")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
        <span>Returned with:</span>
        {["Family", "Police", "Self"].map((opt) => (
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
              {...register(`abs_returnedWith_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
      </div>

      <div style={fieldRow}>
        <span>Physical condition on return:</span>
        <input
          type="text"
          {...register("abs_physicalCondition")}
          style={{ ...inputLine, maxWidth: "280px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Immediate clinical assessment by:</span>
        <input
          type="text"
          {...register("abs_assessmentBy")}
          style={{ ...inputLine, maxWidth: "180px" }}
        />
        <span>Time:</span>
        <input
          type="text"
          {...register("abs_assessmentTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Injuries noted:</span>
        <input
          type="text"
          {...register("abs_injuries")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
        <span>Intoxication:</span>
        <input
          type="text"
          {...register("abs_intoxication")}
          style={{ ...inputLine, maxWidth: "100px" }}
        />
        <span>Mental state:</span>
        <input
          type="text"
          {...register("abs_mentalState")}
          style={{ ...inputLine, maxWidth: "120px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Police informed of return:</span>
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
              {...register(`abs_policeInformedReturn_${opt}`)}
              style={{ width: "13px", height: "13px" }}
            />
            {opt}
          </label>
        ))}
        <span style={{ marginLeft: "12px" }}>Time:</span>
        <input
          type="text"
          {...register("abs_policeInformedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
        <span>Officer informed:</span>
        <input
          type="text"
          {...register("abs_officerInformed")}
          style={{ ...inputLine, maxWidth: "140px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Root cause review scheduled:</span>
        {["Yes"].map((opt) => (
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
              {...register("abs_rootCauseReview")}
              style={{ width: "13px", height: "13px" }}
            />
            Yes
          </label>
        ))}
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          {...register("abs_rootCauseDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
            },
          })}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      {/* SECTION G */}
      <div style={sectionHeader}>SECTION G — CLINICIAN CERTIFICATION</div>

      <div style={fieldRow}>
        <span>Completed by (Nursing In-Charge):</span>
        <input
          type="text"
          {...register("abs_completedBy")}
          style={{ ...inputLine, maxWidth: "200px" }}
        />
        <span>Time:</span>
        <input
          type="text"
          {...register("abs_completedTime")}
          style={{ ...inputLine, maxWidth: "80px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Reviewed by (Treating Psychiatrist):</span>
        <input
          type="text"
          value={admissions?.doctor?.name || ""}
          {...register("abs_reviewedBy")}
          style={{
            ...inputLine,
            maxWidth: "200px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
        <span>Signature:</span>
        <input
          type="text"
          {...register("abs_reviewedSignature")}
          style={{ ...inputLine, maxWidth: "160px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>Incident Report submitted (within 4 hours):</span>
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
            {...register("abs_incidentReportSubmitted")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Incident Report No.:</span>
        <input
          type="text"
          {...register("abs_incidentReportNo")}
          style={{ ...inputLine, maxWidth: "130px" }}
        />
      </div>

      <div style={fieldRow}>
        <span>MDT review scheduled (within 48 hours):</span>
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
            {...register("abs_mdtReview")}
            style={{ width: "13px", height: "13px" }}
          />
          Yes
        </label>
        <span style={{ marginLeft: "12px" }}>Date:</span>
        <input
          type="date"
          {...register("abs_mdtDate", {
            setValueAs: (val) => {
              if (!val) return "";
              const [y, m, d] = val.split("-");
              return `${d}/${m}/${y}`;
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
        Jagrutii Rehab Centre Pvt. Ltd. | Dis-F-06 | Version 1.0 | MHCA 2017
        Sec. 103 | CONFIDENTIAL
      </div>
    </div>
  );
};

export default DischargeAbsconding;
