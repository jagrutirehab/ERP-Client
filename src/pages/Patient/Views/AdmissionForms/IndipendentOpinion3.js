import PrintHeader from "./printheader";

const IndipendentOpinion3 = ({ register, patient }) => {
  const pageContainer = {
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    pageBreakAfter: "always",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    lineHeight: "1.5",
  };
  const fullLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
  };

  const section = {
    marginBottom: "15px",
  };

  const label = {
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
    outline: "none",
  };

  const checkBoxContainer = {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "8px",
  };

  const checkBoxItem = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  const signatureLine = {
    marginTop: "60px",
    textAlign: "right",
  };

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} pageWidth={window.innerWidth} />
      </div>
      <p>
        Practical
        <input
          type="text"
          {...register("page14_generalAppearance")}
          style={fullLine}
        />
      </p>
      <p>
        Emotional
        <input
          type="text"
          {...register("page14_generalAppearance")}
          style={fullLine}
        />
      </p>
      <p>
        Financial
        <input
          type="text"
          {...register("page14_generalAppearance")}
          style={fullLine}
        />
      </p>
      <p>
        Appearance & Behavior
        <input
          type="text"
          {...register("page14_generalAppearance")}
          style={fullLine}
        />
      </p>
      <p>
        Speech
        <input type="text" {...register("page14_speech")} style={fullLine} />
      </p>
      <p>
        Mood
        <input
          type="text"
          {...register("page14_moodAffect")}
          style={fullLine}
        />
      </p>
      <p>
        Affect
        <input
          type="text"
          {...register("page14_moodAffect")}
          style={fullLine}
        />
      </p>
      <p>
        Thinking
        <input
          type="text"
          {...register("page14_thoughtProcess")}
          style={fullLine}
        />
      </p>
      <p>
        Perception
        <input
          type="text"
          {...register("page14_perception")}
          style={fullLine}
        />
      </p>
      <p>
        Memory
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        Abstract Thinking
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        Social Judgement
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        Insight
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        Physical Examination
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        General Examination
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        CNS
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        CVS
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        PULSE
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        BP
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        RS
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <p>
        PA
        <input
          type="text"
          {...register("page14_thoughtContent")}
          style={fullLine}
        />
      </p>
      <div style={section}>
        <label style={label}>FORMULATION :</label>
        <input type="text" style={inputLine} {...register("formulation")} />
      </div>

      {/* DIAGNOSIS */}
      <div style={section}>
        <label style={label}>DIAGNOSIS :</label>
        <input type="text" style={inputLine} {...register("diagnosis")} />
      </div>

      {/* MANAGEMENT PLAN */}
      <div style={section}>
        <label style={label}>
          MANAGEMENT PLAN : INDOOR (with reason for admission)
        </label>
        <input type="text" style={inputLine} {...register("managementPlan")} />
      </div>

      {/* INVESTIGATIONS */}
      <div style={section}>
        <label style={label}>INVESTIGATIONS :</label>
        <div style={checkBoxContainer}>
          {[
            "CBC",
            "BSL",
            "LFT",
            "RFT",
            "HIV",
            "TFT",
            "VIT B-12",
            "VIT D 3",
          ].map((test, index) => (
            <label key={index} style={checkBoxItem}>
              <input type="checkbox" {...register(`investigation_${test}`)} />
              {test}
            </label>
          ))}
        </div>
      </div>

      {/* SPECIAL TEST */}
      <div style={section}>
        <label style={label}>SPECIAL TEST :</label>
        <input type="text" style={inputLine} {...register("specialTest")} />
      </div>

      {/* TREATMENT */}
      <div style={section}>
        <label style={label}>TREATMENT :</label>
        <textarea
          rows="5"
          style={{ ...inputLine, height: "100px" }}
          {...register("treatment")}
        />
      </div>

      {/* SIGNATURE */}
      <div style={signatureLine}>
        <div
          style={{
            borderTop: "1px solid #000",
            width: "200px",
            marginLeft: "auto",
            paddingTop: "5px",
          }}
        >
          (Doctor's Signature)
        </div>
      </div>
    </div>
  );
};
export default IndipendentOpinion3;
