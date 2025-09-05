import PrintHeader from "./printheader";

const Admissionpage2 = ({ register, patient, details }) => {
  const pageContainer = {
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    pageBreakAfter: "always",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
  };

  const consentPara = {
    marginBottom: "6px",
    textAlign: "justify",
  };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100px",
    marginLeft: "5px",
    marginRight: "5px",
  };

  const signatureBox = {
    border: "1px solid #000",
    padding: "8px",
    width: "48%",
    minHeight: "50px",
    boxSizing: "border-box",
  };

  const signatureRow = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  };

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div>
      {/* Points 10-19 */}
      <div style={consentPara}>
        10) I am informed and I am willing to pay Rs for
        <input
          type="text"
          defaultValue={details?.toPay}
          {...register("Basic_Admission_Form_semiPrivate")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        Monthly and
        <input
          type="text"
          defaultValue={details?.semiprivate}
          {...register("Basic_Admission_Form_private")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        for
        <input
          type="text"
          defaultValue={details?.roomtype}
          {...register("Basic_Admission_Form_roomtype")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        & for private room as residential charges, a refundable advance deposit
        of
        <input
          type="text"
          defaultValue={details?.advDeposit}
          {...register("Basic_Admission_Form_advanceDeposit")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />{" "}
        and a non refundable admission fees of Rs. 1000/- at the time of
        admission. Also, minimum of 5 days of initial fees is compulsory.
      </div>

      <div style={consentPara}>
        11) The monthly fee will cover the cost of accommodation, food & other
        necessary psycho Social Interventions such as Individual Counseling,
        Group Therapy, Personal Hygiene Supervision, Gym Fee, Yoga Therapy,
        Music Therapy, Play Therapy, Art Therapy, Mediation And Spiritual
        Techniques, Vocational Training etc. However Following Expenses Would Be
        Charged Extra
        <br />
        <br />
        A) Psychiatric Consultation &nbsp; B) Psychiatric Medicine &nbsp; C)
        General Consultation If Any <br />
        D) General Medicines &nbsp; E) Family Member Counseling & Education{" "}
        <br />
        F) Pathological Tests, X-Ray Etc. <br />
        G) All Personal Expenditure Such As Soaps, Toothbrush, Oil Or Any
        Personal Article Bought <br />
        H) Washing Of Clothes And Ironing, If Any <br />
        I) Any Eatable Or A Special Diet Given Other Then Common Food Provide{" "}
        <br />
        J) Picnic, Movie, Lunch Out Etc. &nbsp; K) Special Attendant
      </div>

      {[
        "If in case of any physical ailment, sickness, contagious disease or any other medical emergency, Jagruti Rehabilitation Centre holds all rights to conduct required tests ,transfer patient to any other Hospital, give him any immediate treatment including surgery in that case. Payment for all the medical Bills & hospital etc. shall be paid by me and Jagruti Rehabilitation Centre shall not be held Responsible for the same.",
        "The monthly fees and other extra expenditure should be paid before 10 th of every English Calendar month. In case of delay in payment then Jagruti Rehabilitation Centre will discharge the patient & complete the discharge procedure & I will not blame Jagruti Rehabilitation Centre for the same.",
        "The fact that the Resident is temporally in the care of Jagruti Rehabilitation Centre, it offers no protection in law. Criminal acts including attempted or actual suicide while as a resident are subject to legal action & Jagruti Rehabilitation Centre accepts no responsibility in this connection.",
        "I do understand that wandering tendencies, absconding, suicidal tendencies, violent Behavior, Suspiciousness etc. are few of the symptoms of mental illness and I will not hold Jagruti Rehabilitation Centre responsible for the same.",
        "I understand that although the patient is under treatment in Jagruti Rehabilitation Centre, there could be some unfortunate incidents such as accidents of any kind, fracture due to fall, any accident while playing games & any type of illness & even to the extent of death can happen to the patient. In case of any such incidents I would not blame Jagruti Rehabilitation Centre for the same.",
        "We will meet the patient only if approved by the Chief Medical Officer.",
        "Residents are required to follow all the or general Rules and Regulation of the Center & in particular to refrain from violence whether to self others & property, use of drugs other than those duly prescribed & engaging in sexual activities in the center.",
        "The admission & discharge rights are reserved with the management.",
      ].map((point, i) => (
        <div key={i} style={consentPara}>
          {i + 12}) {point}
        </div>
      ))}

      {/* Signature Section */}
      <div style={signatureRow}>
        <div style={signatureBox}>
          <div>
            Any Comments:
            <input
              type="text"
              {...register("Basic_Admission_Form_comments")}
              style={{ border: "none", width: "100%", marginTop: "5px" }}
            />
          </div>
        </div>
        <div style={signatureBox}>
          <div>
            Name of Patient / Representative:
            <input
              type="text"
              defaultValue={patient?.name}
              {...register("Basic_Admission_Form_patientRep")}
              style={{
                border: "none",
                width: "100%",
                marginTop: "5px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
          </div>
          <div>
            Relation:
            <input
              type="text"
              defaultValue={patient?.guardianRelation}
              {...register("Basic_Admission_Form_relation")}
              style={{
                border: "none",
                width: "100%",
                marginTop: "5px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
          </div>
          <div>
            Date:
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              {...register("Basic_Admission_Form_dateRep", {
                setValueAs: (val) => {
                  if (!val) return "";
                  const [year, month, day] = val.split("-");
                  return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
                },
              })}
              style={{ border: "none", marginTop: "5px" }}
            />{" "}
            Signature:
          </div>
        </div>
      </div>

      <div style={signatureRow}>
        <div style={signatureBox}>
          Staff Name:
          <input
            type="text"
            {...register("Basic_Admission_Form_staffName")}
            style={{ border: "none", width: "100%", marginTop: "5px" }}
          />
          <div>
            Date:
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              {...register("Basic_Admission_Form_dateStaff", {
                setValueAs: (val) => {
                  if (!val) return "";
                  const [year, month, day] = val.split("-");
                  return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
                },
              })}
              style={{ border: "none", marginTop: "5px" }}
            />{" "}
            Signature:
          </div>
        </div>
        <div style={signatureBox}>
          Witness’s Name:
          <input
            type="text"
            defaultValue={patient?.guardianName}
            {...register("Basic_Admission_Form_witnessName")}
            style={{
              border: "none",
              width: "100%",
              marginTop: "5px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          />
          <div>
            Relation:
            <input
              type="text"
              defaultValue={patient?.guardianRelation}
              {...register("Basic_Admission_Form_relationWitness")}
              style={{
                border: "none",
                width: "100%",
                marginTop: "5px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
          </div>
          <div>
            Date:
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              {...register("Basic_Admission_Form_dateWitness", {
                setValueAs: (val) => {
                  if (!val) return "";
                  const [year, month, day] = val.split("-");
                  return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
                },
              })}
              style={{ border: "none", marginTop: "5px" }}
            />{" "}
            Signature:
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissionpage2;
