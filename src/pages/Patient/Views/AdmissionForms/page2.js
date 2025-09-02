import PrintHeader from "./printheader";

const Page2 = ({ register, patient }) => {
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
    { key: "selfHarm", label: "Self – Harm/Attempted Suicide." },
    { key: "violence", label: "Violence/ Aggressiveness" },
    { key: "runningAway", label: "Running Away from Home/ Risk of Absconding" },
    { key: "lackInsight", label: "Lack of Insight" },
    { key: "antiSocial", label: "Indulging in Anti – social activities." },
    {
      key: "unwillingMedication",
      label: "Unwillingness to take the medication.",
    },
    {
      key: "policeCase",
      label: "Has there ever been a Police case against the patient?",
    },
    {
      key: "criminalCase",
      label:
        "Has the patient ever served a prison sentence or is there any criminal case pending in the court of Law against the patients?",
    },
  ];

  const targetSymptoms = [
    { key: "personalHygiene", label: "Personal Hygiene" },
    { key: "interpersonalRelationships", label: "Interpersonal Relationships" },
    { key: "socialSkills", label: "Social Skills" },
    { key: "moneyManagement", label: "Money Managements" },
    { key: "workHabits", label: "Work habits" },
    { key: "leisureActivities", label: "Leisure Activities" },
    { key: "timeManagement", label: "Time Management" },
    { key: "familyTherapy", label: "Family Therapy" },
    { key: "maritalTherapy", label: "Marital Therapy" },
    { key: "homeManagement", label: "Home Management Skills" },
    { key: "crisisManagement", label: "Crisis Management" },
    { key: "anyOther", label: "Any Other" },
  ];

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div>
      <div style={{ textAlign: "right", marginBottom: "5px" }}>
        Date:
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          {...register("Relevent_checklist_date")}
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
        <ul>
          {relevantEvents.map((event) => (
            <li key={event.key} style={li}>
              <input
                type="checkbox"
                {...register(`Relevant_Checklist_${event.key}`)}
              />
              <span style={label}>{event.label}</span>
            </li>
          ))}
        </ul>
        <li style={li}>
          <input type="checkbox" {...register("Relevant_Checklist_ifYes")} />{" "}
          <span style={label}>If yes</span>{" "}
          <input
            type="text"
            {...register("Relevant_Checklist_ifYes_text")}
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
          <li key={symptom.key} style={li}>
            <label>
              {String(index + 1).padStart(2, "0")} {symptom.label}{" "}
              <input
                type="checkbox"
                {...register(`Relevant_Checklist_${symptom.key}`)}
              />
            </label>
          </li>
        ))}
      </ul>

      {/* Specific Comments */}
      <div style={{ fontWeight: "bold", marginTop: "10px" }}>
        Specific Comments:
      </div>
      <textarea
        {...register("Relevant_Checklist_specificComments")}
        style={textarea}
        rows={2}
      />
      <textarea
        {...register("Relevant_Checklist_specificComments2")}
        style={textarea}
        rows={2}
      />
      <textarea
        {...register("Relevant_Checklist_specificComments3")}
        style={textarea}
        rows={2}
      />
    </div>
  );
};

export default Page2;
