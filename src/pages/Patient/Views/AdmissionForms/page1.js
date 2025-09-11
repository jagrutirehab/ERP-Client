import PrintHeader from "./printheader";

const Page1 = ({ register, admissions, patient }) => {
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
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "10px",
    textTransform: "uppercase",
  };

  const row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  };

  const checklistTable = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
  };

  const tdItem = {
    borderBottom: "1px solid #000",
    padding: "4px",
    verticalAlign: "middle",
  };

  const tdYN = {
    borderBottom: "1px solid #000",
    padding: "4px",
    textAlign: "center",
    width: "120px",
    whiteSpace: "nowrap",
  };

  const label = {
    fontWeight: "bold",
  };

  const signatureLine = {
    borderTop: "1px solid #000",
    marginTop: "20px",
    paddingTop: "5px",
  };

  const admissionChecklist = [
    { key: "insurance", label: "Insurance" },
    { key: "referredBy", label: "Referred By" },
    { key: "patientAadhar", label: "Adhar Card of the Patient" },
    {
      key: "patientPhoto",
      label: "2 Passport Size Photographs of the Patient",
    },
    { key: "relativeAadhar", label: "Adhar Card of the Relative/Friend/NR" },
    {
      key: "protocolExplained",
      label: "Protocol for Admission explained to family",
    },
    {
      key: "callsExplained",
      label: "Information Exchange/Calls explained to family",
    },
    {
      key: "advancePayment",
      label: "Explanation on minimum advance monthly payments",
    },
    {
      key: "responsibleFamily",
      label: "Family members responsible for the payments",
    },
    {
      key: "documentsSigned",
      label: "Documents signed by Patient & NR/Relatives",
    },
    { key: "seriousnessConsent", label: "Seriousness Content" },
    { key: "restraintConsent", label: "Restraint Consent" },
    {
      key: "riskExplanation",
      label: "Suicidal/DSH/Sudden Death risk explanation",
    },
    {
      key: "preferredHospital",
      label: "Preferred Hospital to shift I/C/O emergencies",
    },
    { key: "goldReturned", label: "Expensive things / Gold Returned?" },
    { key: "oldMedicalDocs", label: "Old Medical document received?" },
  ];

  const dischargeChecklist = [
    { key: "dischargeCard", label: "Discharge card given?" },
    { key: "labReports", label: "Laboratory reports given?" },
    { key: "referralDoctor", label: "Referral doctor informed?" },
    { key: "handoverDocs", label: "Handover of old documents?" },
    { key: "billBreakup", label: "Bills break up?" },
    { key: "patientSigns", label: "Signs of patients?" },
    { key: "relativeSigns", label: "Signs of relatives?" },
    { key: "patientCondition", label: "Patients condition in writing?" },
    { key: "higherCentreRef", label: "Higher centre reference?" },
    { key: "allPaymentsDone", label: "All the payments done?" },
  ];

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} pageWidth={window.innerWidth} />
      </div>
      <div style={heading}>ADMISSION CHECKLIST</div>

      <div style={row}>
        <div>
          <label style={label}>Name of the Patient’s Name :</label>
          <input
            type="text"
            value={patient?.name}
            {...register("Admission_Checklist_PatientName")}
            style={{
              border: "none",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              width: "200px",
            }}
          />
        </div>
        <div>
          <label style={label}>Date :</label>
          <input
            type="date"
            value={new Date().toISOString().split("T")[0]} // today's date
            {...register("Admission_Checklist_DOA", {
              setValueAs: (val) => {
                if (!val) return "";
                const [year, month, day] = val.split("-");
                return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
              },
            })}
            style={{ border: "none", borderBottom: "1px solid #000" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={label}>D.O.A. :</label>
        <input
          type="text"
          value={new Date(
            admissions[0]?.addmissionDate
          ).toLocaleDateString("en-GB")}
          {...register("Admission_Checklist_DOA")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "200px",
          }}
        />
      </div>

      {/* Admission Checklist Table */}
      <table style={checklistTable}>
        <tbody>
          {admissionChecklist.map((item, index) => (
            <tr key={item.key}>
              <td style={tdItem}>
                {String(index + 1).padStart(2, "0")} {item.label}
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="YES"
                    {...register(`Admission_Checklist_${item.key}`)}
                  />{" "}
                  YES
                </label>
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="NO"
                    {...register(`Admission_Checklist_${item.key}`)}
                  />{" "}
                  NO
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div style={{ marginTop: "20px" }}>
        <div>
          Signature of Person collecting documents
          <div style={signatureLine}></div>
        </div>
        <div>
          Signature of Patient/Relative/NR/NOK
          <div style={signatureLine}></div>
        </div>
      </div>

      {/* Discharge Section */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <label style={label}>D.O.A. :</label>
          <input
            type="text"
            value={new Date(
              admissions[0]?.addmissionDate
            ).toLocaleDateString("en-GB")}
            {...register("Discharge_Checklist_DOA")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "80px",
            }}
          />
        </div>
        <div>
          <label style={label}>D.O.D. :</label>
          <input
            type="text"
            {...register("Discharge_Checklist_DOD")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "80px",
            }}
          />
        </div>
      </div>

      {/* Discharge Checklist Table */}
      <table style={checklistTable}>
        <tbody>
          {dischargeChecklist.map((item, index) => (
            <tr key={item.key}>
              <td style={tdItem}>
                {String(index + 1).padStart(2, "0")} {item.label}
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="YES"
                    {...register(`Discharge_Checklist_${item.key}`)}
                  />{" "}
                  YES
                </label>
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="NO"
                    {...register(`Discharge_Checklist_${item.key}`)}
                  />{" "}
                  NO
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Discharge Signatures */}
      <div style={{ marginTop: "20px" }}>
        <div>
          Signature of Person Doing Discharge
          <div style={signatureLine}></div>
        </div>
        <div>
          Signature of Patient/Relative/NR/NOK Contact No.:
          <div style={signatureLine}></div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
