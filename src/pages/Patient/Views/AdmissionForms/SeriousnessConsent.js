const SeriousnessConsent = ({ register, patient}) => {
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
    marginBottom: "10px",
    textAlign: "center",
    textTransform: "uppercase",
  };

  const section = {
    marginBottom: "10px",
    textAlign: "justify",
  };

  const bold = { fontWeight: "bold" };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "60%",
    marginLeft: "5px",
    marginRight: "5px",
  };

  return (
    <div style={pageContainer}>
      <div style={{ textAlign: "right", marginBottom: "5px" }}>
        Date:
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          {...register("page3_date")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            marginLeft: "5px",
          }}
        />
      </div>

      <div style={heading}>
        Seriousness Consent For Emergency Medical Treatment and/or
        Hospitalization in ICU
      </div>

      {/* A) Seriousness */}
      <div style={section}>
        <span style={bold}>A) Seriousness</span> I,
        <input type="text" {...register("seriousness_name")} style={inputLine} />,
        aware of the Serious Condition of our patient, Mr/Mrs/Miss/Smt.
        <input
          type="text"
          {...register("seriousness_patientName")}
          style={inputLine}
        />
        , who is critical & might deteriorate further leading to medical
        complications including death.
      </div>

      {/* B) Emergency Medication */}
      <div style={section}>
        <span style={bold}>B) Emergency Medication</span> I do hereby willfully
        give my full, complete, and irrevocable written consent to administer
        any/all Emergency Oral/Injectable Medication (both intramuscular and/or
        intravenous) as required to be given to the patient by doctors, nursing,
        and care staffs of <span style={bold}>Jagruti Rehabilitation Centre Pvt. Ltd.</span> I understand
        that emergency medicines are “NOT” optional and are necessary for
        appropriate management in case of non-psychiatric emergency. I
        understand that all the medication whatsoever are useful but may have
        side effect/s. The same have been clearly explained to me.
      </div>

      {/* C) Transfer to Other Hospital */}
      <div style={section}>
        <span style={bold}>C) Transfer to Other Hospital</span> I, do hereby
        willfully give my full, complete and irrevocable written consent to{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> to act in capacity
        of a legal guardian of Mr/Mrs/Smt/Miss
        <input
          type="text"
          {...register("transfer_patientName")}
          style={inputLine}
        />{" "}
        to take any/all medical decisions deemed necessary for providing medical
        treatment in case of any medical emergency which may include
        transportation and admission to a Nursing Home/Hospital/consenting for a
        surgery on my behalf without prior information to me, if possible shift
        to our preferred Hospital
      </div>

      <div style={{ textAlign: "center", fontWeight: "bold", margin: "10px 0" }}>
        OR
      </div>

      {/* D) In-house Treatment */}
      <div style={section}>
        <span style={bold}>D) In-house Treatment</span> I do not want to shift my
        patient to higher centre, looking at the age & condition of the patient.
        Also, we are satisfied with the facilities of{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> & would like to
        continue the management of the patient here only.
      </div>

      {/* E) Disclaimer */}
      <div style={section}>
        <span style={bold}>E)</span> I will not hold{" "}
        <span style={bold}>Jagruti Rehab Centre Pvt. Ltd.</span> & its staff
        responsible for any untoward incidence including death & will bear the
        expenses of this extraordinary situation.
      </div>

      <div style={{ textAlign: "center", fontWeight: "bold", margin: "10px 0" }}>
        AND
      </div>

      <div style={section}>
        Jagruti has given me clear understanding of my patient’s physical and
        mental health. I understood the same and we give our full consent with
        regards to his/her treatment. During the course of treatment if patient
        get violent / aggressive / delirious / disoriented etc., then in that
        case he/she may need to be restrained temporarily to prevent head injury
        / fracture / suicidal attempt / injury to self or others.
      </div>

      {/* Patient & NOK Info */}
      <div style={{ marginTop: "15px" }}>
        <div>
          Name of Patient:
          <input
            type="text"
            defaultValue={patient?.name}
            {...register("consent_patientName")}
            style={inputLine}
          />
        </div>
        <div>
          Relation with the Patient:
          <input
            type="text"
            {...register("consent_relation")}
            style={inputLine}
          />
        </div>
        <div>
          Name of NOK:
          <input
            type="text"
            {...register("consent_nokName")}
            style={inputLine}
          />
        </div>
        <div>
          Signature of NOK:
          <input
            type="text"
            {...register("consent_nokSignature")}
            style={inputLine}
          />
        </div>
      </div>
    </div>
  );
};

export default SeriousnessConsent;
