const ECTConsentForm = ({ register, patient, admissions }) => {
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

  const bold = { fontWeight: "bold" };
  const inputInline = {
    border: "none",
    borderBottom: "1px solid #000",
    outline: "none",
    minWidth: "150px",
    margin: "0 5px",
  };

  const signatureRow = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px",
  };

  return (
    <div style={pageContainer}>
      {/* Title */}
      <h3
        style={{
          textAlign: "center",
          textDecoration: "underline",
          fontWeight: "bold",
        }}
      >
        INFORMED CONSENT FOR ELECTRO – CONVULSIVE THERAPY
      </h3>

      {/* Consent Text */}
      <p>
        I hereby consent to the administration of a course of electro-convulsive
        therapy to myself / my relation. (name of the patient
        <input
          type="text"
          defaultValue={patient?.name}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("patientName")}
        />
        ) relation
        <input
          type="text"
          defaultValue={patient?.guardianRelation}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("relation")}
        />{" "}
        by Dr.
        <input
          type="text"
          defaultValue={
            admissions?.length > 0 ? admissions[0].doctor?.name : ""
          }
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("doctorName")}
        />
        (or any other suitably trained doctor deputed by him).
      </p>

      <p>
        I also consent to the use of an anaesthetic and / or a relaxant or
        sedative for this purpose. At the discretion of the doctor.
      </p>

      <p>
        I have been explained the nature and the purpose of the treatment, as
        also, its side effects and possible complications by Dr.
        <input
          type="text"
          defaultValue={
            admissions?.length > 0 ? admissions[0].doctor?.name : ""
          }
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputInline,
          }}
          {...register("doctorExplain")}
        />
        in a language which I understand and to my satisfaction. I have read the
        accompanying information sheet.
      </p>

      <p>
        I have been explained other / alternative methods of treatments. I may
        have a headache and confusion immediately after treatment which are
        common. Memory deficit, lasting for a few weeks, is common, but there is
        no scientific evidence of permanent brain damage.
      </p>

      <p>
        I also understand that, like in other medical and surgical treatments,
        despite all precautions, risk to life cannot be ruled out. Rarely,
        fractures may occur.
      </p>

      <p>
        I authorize the doctor concerned to administer emergency treatment for
        all such complications, shift the patient to other hospital and / or
        seek help of other specialists if necessary. (I also undertake to bear
        the financial liability for such treatment of complications).
      </p>

      <p>
        No guarantee about the results and complications has been given to me.
      </p>

      <p>
        I know that this is not an emergency consent. I am aware that this
        consent can be withdrawn at any time, without affecting the patient's
        right to receive other / alternative scientifically established
        treatment.
      </p>

      <p>
        I have been told that the patient must not take anything by mouth for at
        least six hours, prior to the treatment. The strict care required
        immediately after the treatment and during convalescence has been
        explained to me / my relative.
      </p>

      <p>
        I understand (following my discussion with doctors) that the patient, by
        the very nature / severity of his / her illness, is not competent to
        give a real consent and I, therefore, willingly take the responsibility
        of giving such a consent on his / her behalf.
      </p>

      {/* Signatures */}
      <div style={signatureRow}>
        <div>
          <p>
            <span style={bold}>Signature of witness</span>
          </p>
          <p>
            Date / Time / Place :
            <input
              type="text"
              defaultValue={new Date().toISOString().split("T")[0]}
              style={inputInline}
              {...register("witnessDate")}
            />
          </p>
        </div>

        <div>
          <p>
            <span style={bold}>Signature of patient / Relative</span>
          </p>
          <p>Name & Address :</p>
          <input
            type="text"
            defaultValue={patient?.guardianName}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("patientRelativeName")}
          />
          <br />
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("patientRelativeAddress1")}
          />
          <br />
          <input
            type="text"
            style={inputInline}
            {...register("patientRelativeAddress2")}
          />
        </div>
      </div>

      {/* Doctor’s Explanation */}
      <div style={{ marginTop: "30px" }}>
        <p style={bold}>Doctor's Explanation</p>
        <p>
          I confirm that I have explained to the patient / relative the nature,
          purpose and likely effects of this treatment to Shri / Smt.:
          <input
            type="text"
            defaultValue={patient?.name}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("treatmentTo")}
          />
        </p>
        <p>
          The nearest relative available was
          <input
            type="text"
            defaultValue={patient?.guardianName}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("nearestRelative")}
          />
        </p>
        <p>
          Date / Time / Place :{" "}
          <input
            type="text"
            defaultValue={new Date().toISOString().split("T")[0]}
            style={inputInline}
            {...register("doctorDate")}
          />
        </p>
        <p style={{ textAlign: "right" }}>Signature of Doctor</p>
      </div>

      {/* Relative’s Approval */}
      <div style={{ marginTop: "30px" }}>
        <p style={bold}>Relative's Approval (wherever Relevant)</p>
        <p>
          I (name){" "}
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeName")}
          />
          (the closest available relative of){" "}
          <input
            type="text"
            defaultValue={patient?.name}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeOf")}
          />
        </p>
        <p>
          Confirm that an explanation of the nature, purpose, and likely effects
          of ECT has been given to me by Dr.
          <input
            type="text"
            defaultValue={
              admissions?.length > 0 ? admissions[0].doctor?.name : ""
            }
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeDoctor")}
          />
          and that I approve of the treatment being given to the patient.
        </p>
        <p>
          Date / Time / Place :{" "}
          <input
            type="text"
            defaultValue={new Date().toISOString().split("T")[0]}
            style={inputInline}
            {...register("relativeDate")}
          />
        </p>
        <p>
          Contact No.:{" "}
          <input
            type="text"
            defaultValue={patient?.guardianPhoneNumber}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputInline,
            }}
            {...register("relativeContact")}
          />
        </p>
        <p style={{ textAlign: "right" }}>Signature of relative</p>
      </div>
    </div>
  );
};

export default ECTConsentForm;
