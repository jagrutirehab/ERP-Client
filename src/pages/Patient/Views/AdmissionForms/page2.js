const Page2 = ({ register }) => {
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
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "8px",
  };

  const checkboxList = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const li = {
    marginBottom: "5px",
  };

  const label = {
    marginLeft: "5px",
  };

  const textarea = {
    width: "100%",
    border: "1px solid #000",
    fontSize: "12px",
    resize: "none",
    minHeight: "20mm",
  };

  const relevantEvents = [
    "Self – Harm/Attempted Suicide.",
    "Violence/ Aggressiveness",
    "Running Away from Home/ Risk of Absconding",
    "Lack of Insight",
    "Indulging in Anti – social activities.",
    "Unwillingness to take the medication.",
    "Has there ever been a Police case against the patient?",
    "Has the patient ever served a prison sentence or is there any criminal case pending in the court of Law against the patients?",
  ];

  const targetSymptoms = [
    "Personal Hygiene",
    "Interpersonal Relationships",
    "Social Skills",
    "Money Managements",
    "Work habits",
    "Leisure Activities",
    "Time Management",
    "Family Therapy",
    "Marital Therapy",
    "Home Management Skills",
    "Crisis Management",
    "Any Other",
  ];

  return (
    <div style={pageContainer}>
      <div style={{ textAlign: "right", marginBottom: "5px" }}>
        Date:
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          {...register("page2_date")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            marginLeft: "5px",
          }}
        />
      </div>

      {/* Relevant Events */}
      <div style={heading}>
        TICK MARK ANY RELEVANT EVENTS IN THE PATIENT’S HISTORY
      </div>
      <ul style={checkboxList}>
        {relevantEvents.map((event, index) => (
          <li key={index} style={li}>
            <input type="checkbox" {...register(`relevantEvents_${index}`)} />
            <span style={label}>{event}</span>
          </li>
        ))}
        <li style={li}>
          <input type="checkbox" {...register("relevantEvents_ifYes")} />{" "}
          <span style={label}>If yes</span>{" "}
          <input
            type="text"
            {...register("relevantEvents_ifYesText")}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "50%",
            }}
          />
        </li>
      </ul>

      {/* Target Symptoms */}
      <div style={heading}>TARGET SYMPTOMS</div>
      <p style={{ marginBottom: "5px" }}>
        AREAS OF THERAPEUTIC INTERVENTION YOU WOULD LIKE TO SEE DURING THE
        TENURE OF PATIENT’S STAY AT JAGRUTI REHABILITATION CENTRE PVT. LTD.{" "}
        <strong>(PLEASE TICK THE APPROPRIATE)</strong>
      </p>
      <ul style={checkboxList}>
        {targetSymptoms.map((symptom, index) => (
          <li key={index} style={li}>
            <label>
              {String(index + 1).padStart(2, "0")} {symptom}{" "}
              <input type="checkbox" {...register(`targetSymptoms_${index}`)} />
            </label>
          </li>
        ))}
      </ul>

      {/* Specific Comments */}
      <div style={{ fontWeight: "bold", marginTop: "10px" }}>
        Specific Comments:
      </div>
      <textarea {...register("specificComments")} style={textarea} rows={2} />
      <textarea {...register("specificComments2")} style={textarea} rows={2} />
      <textarea {...register("specificComments3")} style={textarea} rows={2} />
    </div>
  );
};

export default Page2;
