import { useForm } from "react-hook-form";

const Page1 = ({ admissions, patient }) => {
  const { register, handleSubmit, watch } = useForm();
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
  };

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
    "Insurance",
    "Referred By",
    "Adhar Card of the Patient",
    "2 Passport Size Photographs of the Patient",
    "Adhar Card of the Relative/Friend/NR",
    "Protocol for Admission explained to family",
    "Information Exchange/Calls explained to family",
    "Explanation on minimum advance monthly payments",
    "Family members responsible for the payments",
    "Documents signed by Patient & NR/Relatives",
    "Seriousness Content",
    "Restraint Consent",
    "Suicidal/DSH/Sudden Death risk explanation",
    "Preferred Hospital to shift I/C/O emergencies",
    "Expensive things / Gold Returned?",
    "Old Medical document received?",
  ];

  const dischargeChecklist = [
    "Discharge card given?",
    "Laboratory reports given?",
    "Referral doctor informed?",
    "Handover of old documents?",
    "Bills break up?",
    "Signs of patients?",
    "Signs of relatives?",
    "Patients condition in writing?",
    "Higher centre reference?",
    "All the payments done?",
  ];

  return (
    <div style={pageContainer} onSubmit={handleSubmit(onSubmit)}>
      <div style={heading}>ADMISSION CHECKLIST</div>

      <div style={row}>
        <div>
          <label style={label}>Name of the Patient’s Name :</label>
          <input
            type="text"
            defaultValue={patient?.name}
            {...register("patientName")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "200px",
            }}
          />
        </div>
        <div>
          <label style={label}>Date :</label>
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]} // today's date
            {...register("date")}
            style={{ border: "none", borderBottom: "1px solid #000" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={label}>D.O.A. :</label>
        <input
          type="text"
          defaultValue={new Date(admissions[0]?.addmissionDate).toLocaleDateString("en-GB")}
          {...register("doa")}
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
            <tr key={index}>
              <td style={tdItem}>
                {String(index + 1).padStart(2, "0")} {item}
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="YES"
                    {...register(`admission_${index}`)}
                  />{" "}
                  YES
                </label>
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="NO"
                    {...register(`admission_${index}`)}
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
            defaultValue={new Date(admissions[0]?.addmissionDate).toLocaleDateString("en-GB")}
            {...register("doa2")}
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
            {...register("dod")}
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
            <tr key={index}>
              <td style={tdItem}>
                {String(index + 1).padStart(2, "0")} {item}
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="YES"
                    {...register(`discharge_${index}`)}
                  />{" "}
                  YES
                </label>
              </td>
              <td style={tdYN}>
                <label>
                  <input
                    type="radio"
                    value="NO"
                    {...register(`discharge_${index}`)}
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
