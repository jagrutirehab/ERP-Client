import PrintHeader from "./printheader";

const MediactionConcent = ({ register, patient }) => {
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
    textAlign: "center",
    marginBottom: "2px",
  };

  const subHeading = {
    fontWeight: "bold",
    fontSize: "12px",
    textAlign: "center",
    marginBottom: "15px",
  };

  const medicineList = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  };

  const listColumn = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const li = {
    marginBottom: "4px",
  };

  const inputLine = {
    border: "none",
    borderBottom: "1px solid #000",
    width: "60%",
    marginLeft: "5px",
    marginRight: "5px",
  };

  const bold = { fontWeight: "bold" };

  return (
    <div style={pageContainer}>
      <div style={{ marginBottom: "20px" }}>
        <PrintHeader patient={patient} />
      </div>
      {/* Date */}
      <div style={{ textAlign: "right", marginBottom: "5px" }}>
        Date:
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          {...register("page4_date", {
            setValueAs: (val) => {
              if (!val) return "";
              const [year, month, day] = val.split("-");
              return `${day}/${month}/${year}`; // convert to DD/MM/YYYY
            },
          })}
          style={{
            border: "none",
            borderBottom: "1px solid #000",
            marginLeft: "5px",
          }}
        />
      </div>

      {/* Headings */}
      <div style={heading}>MEDICATION CONSENT</div>
      <div style={subHeading}>(Family)</div>

      {/* Medicines */}
      <div style={medicineList}>
        <ul style={listColumn}>
          <li style={li}>LITHIUM,</li>
          <li style={li}>ANTIPSYCHOTIC MEDICINES,</li>
          <li style={li}>CLOZAPINE,</li>
          <li style={li}>BENZODIAZEPINES,</li>
          <li style={li}>MOOD STABILIZERS,</li>
          <li style={li}>DRUGS,</li>
        </ul>
        <ul style={listColumn}>
          <li style={li}>ANTI DEPRESSANTS,</li>
          <li style={li}>EMERGENCY,</li>
          <li style={li}>IV FLUID,</li>
          <li style={li}>INJECTABLE,</li>
          <li style={li}>ANTIBIOTICS</li>
        </ul>
      </div>

      {/* Consent Statement */}
      <div style={{ textAlign: "justify", marginBottom: "15px" }}>
        I,
        <input
          type="text"
          defaultValue={patient?.guardianName}
          {...register("medicationConsent_name")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        Father/Mother/Son/Daughter/Husband/Wife/NR/NOK
        <input
          type="text"
          defaultValue={patient?.guardianRelation}
          {...register("medicationConsent_relation")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        of
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("medicationConsent_patientName")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        Mr/Mrs/Miss/Smt
        <input
          type="text"
          defaultValue={patient?.name}
          {...register("medicationConsent_patientFull")}
          style={{
            fontWeight: "bold",
            textTransform: "uppercase",
            ...inputLine,
          }}
        />
        give my full and informed consent for starting any/all of the above
        medication on him/her/other.
      </div>

      <div style={{ textAlign: "justify", marginBottom: "20px" }}>
        I have been explained about the risk and consequences occurring out of
        consumption of Tab. / Cap. / Inj. & I hold no one responsible for the
        adverse consequences due to the use of abovementioned medication.
      </div>

      {/* Signatures */}
      <div style={{ marginTop: "15px" }}>
        <div>
          <span style={bold}>Name of Patient</span>:
          <input
            type="text"
            defaultValue={patient?.name}
            {...register("medicationConsent_patientName2")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          <span style={bold}>Relation with the Patient</span>:
          <input
            type="text"
            defaultValue={patient?.guardianRelation}
            {...register("medicationConsent_relation2")}
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              ...inputLine,
            }}
          />
        </div>
        <div>
          <span style={bold}>Name of NOK</span>:
          <input
            type="text"
            {...register("medicationConsent_nokName")}
            style={inputLine}
          />
        </div>
        <div>
          <span style={bold}>Signature of NOK</span>:
          <input
            type="text"
            {...register("medicationConsent_nokSignature")}
            style={inputLine}
          />
        </div>
      </div>
    </div>
  );
};

export default MediactionConcent;
