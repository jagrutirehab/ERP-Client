const IndipendentOpinion2 = ({ register }) => {
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
  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "150px",
    marginLeft: "5px",
    marginRight: "5px",
  };
  const fullLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "100%",
    marginTop: "3px",
  };

  return (
    <div style={pageContainer}>
      <p>
        DOCTOR CONSULTANT
        <input type="text" {...register("page13_name")} style={fullLine} />
      </p>
      <p>
        NAME
        <input type="text" {...register("page13_name")} style={fullLine} />
      </p>
      <p>
        RELIGION
        <input
          type="text"
          {...register("page13_religion")}
          style={inputLine}
        />{" "}
        S.E.S. L/M/M/U
      </p>
      <p>
        AGE
        <input
          type="text"
          {...register("page13_age")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "60px",
            marginLeft: "5px",
            marginRight: "5px",
          }}
        />{" "}
        SEX: M/F
        <input
          type="text"
          {...register("page13_sex")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "30px",
            marginLeft: "5px",
          }}
        />
      </p>
      <p>
        MARITAL STATUS : Single / Married / Widowed / Separated / Divorced /
        Deserted
        <input
          type="text"
          {...register("page13_maritalStatus")}
          style={fullLine}
        />
      </p>
      <p>
        OCCUPATION : Not applicable / Not Occupied / Professional / Service /
        Business / H.W. / Vendor / Farmer / Student / Unemployed / Retired /
        Disability / Pension / Housemaid / Bara Balutedar / Others
        <input
          type="text"
          {...register("page13_occupation")}
          style={fullLine}
        />
      </p>
      <p>
        EDUCATION : No formal Education / Primary / Secondary / S.S.C. / College
        / Graduate / P.G. / Professional / Technical / Others
        <input type="text" {...register("page13_education")} style={fullLine} />
      </p>
      <p>
        ADDRESS : Urban / Semi-urban / Rural
        <input type="text" {...register("page13_address")} style={fullLine} />
      </p>
      <p>
        SOURCE OF REFERRAL : Self / Family Member / Friend / Neighbour /
        Villager / G.P. (ALO) / G.P (Ayur, Homeo) / Specialist / Psychiatrist /
        Employer / Institution / Court / Other Hospital / Para Medicals / Other
        <input
          type="text"
          {...register("page13_sourceOfReferral")}
          style={fullLine}
        />
      </p>
      <p>
        PROVISIONAL DIAGNOSIS :
        <input
          type="text"
          {...register("page13_provisionalDiagnosis")}
          style={fullLine}
        />
      </p>
      <p>
        D.S.M.V.CODE
        <br />
        1.
        <input
          type="text"
          {...register("page13_dsmvCode1")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "200px",
            marginLeft: "5px",
          }}
        />
        <br />
        2.
        <input
          type="text"
          {...register("page13_dsmvCode2")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "200px",
            marginLeft: "5px",
          }}
        />
        <br />
        3.
        <input
          type="text"
          {...register("page13_dsmvCode3")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "200px",
            marginLeft: "5px",
          }}
        />
      </p>
      <p>
        Revised Diagnosis :
        <input
          type="text"
          {...register("page13_revisedDiagnosis")}
          style={fullLine}
        />
      </p>
      <p>
        DATE:
        <input
          type="text"
          {...register("page13_date")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "120px",
            marginLeft: "5px",
          }}
        />
      </p>
      <p>
        INFORMANT :
        <input type="checkbox" {...register("page13_informantSelf")} /> Self
        <input
          type="text"
          {...register("page13_informantOther")}
          style={fullLine}
        />
        <br />
        Reliable / Nonreliable
        <input
          type="text"
          {...register("page13_informantReliability")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "100px",
            marginLeft: "5px",
          }}
        />{" "}
        Adequate / Inadequate
        <input
          type="text"
          {...register("page13_informantAdequacy")}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            width: "100px",
            marginLeft: "5px",
          }}
        />
      </p>
      <p>
        HISTORY / Onset, Duration & Progress
        <textarea
          rows={6}
          type="text"
          {...register("history")}
          style={fullLine}
        />
      </p>
      <p>
        NEGATIVE HISTORY
        <textarea
          rows={6}
          type="text"
          {...register("negative_history")}
          style={fullLine}
        />
      </p>
      <p>
        PAST HISTORY
        <textarea
          rows={6}
          type="text"
          {...register("past_history")}
          style={fullLine}
        />
      </p>
      <p>
        DEVELOPMENT HISTORY & CHILDHOOD/ ADOLESCENCE
        <textarea
          rows={6}
          type="text"
          {...register("development_history")}
          style={fullLine}
        />
      </p>
      <p>
        OCCUPATIONAL HISTORY
        <textarea
          rows={6}
          type="text"
          {...register("occupational_history")}
          style={fullLine}
        />
      </p>
      <p>
        FAMILY HISTORY
        <textarea
          rows={6}
          type="text"
          {...register("family_history")}
          style={fullLine}
        />
      </p>
      <p>
        PERSONAL / SEXUAL/ MARITAL HISTORY
        <textarea
          rows={6}
          type="text"
          {...register("personal_history")}
          style={fullLine}
        />
      </p>
      <p>
        PERSONALITY
        <textarea
          rows={6}
          type="text"
          {...register("personality")}
          style={fullLine}
        />
      </p>
      <p>
        SOCIAL SUPPORT
        <textarea
          rows={6}
          type="text"
          {...register("personality")}
          style={fullLine}
        />
      </p>
    </div>
  );
};
export default IndipendentOpinion2;
