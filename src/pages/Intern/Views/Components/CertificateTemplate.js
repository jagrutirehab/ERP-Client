import InternBg from "../../../../assets/images/intern-bg-template.jpg";

const CertificateTemplate = ({ intern = {}, type, psychologist }) => {
  const styles = {
    page: {
      width: "210mm",
      height: "297mm",
      margin: "0 auto",
      position: "relative",
      fontFamily: '"Times New Roman", serif',
      padding: "140px 70px 60px 70px",
      boxSizing: "border-box",
      fontWeight: "16px",
    },
    bgImg: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: -1,
    },
    content: {
      position: "relative",
      zIndex: 1,
    },
  };

  const toTitleCase = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const gender = intern?.gender || "";

  let pronoun1 = "";
  let pronoun2 = "";
  let pronoun3 = "";

  if (gender === "MALE") {
    pronoun1 = "Mr.";
    pronoun2 = "his";
    pronoun3 = "he";
  } else if (gender === "FEMALE") {
    pronoun1 = "Mrs.";
    pronoun2 = "her";
    pronoun3 = "she";
  } else {
    pronoun1 = "";
    pronoun2 = "the";
    pronoun3 = "the intern";
  }

  const psychologistName = psychologist?.name || "Psychologist";
  const internshipDuration = intern?.internshipDuration
    ? `${intern.internshipDuration * 30} days`
    : "the internship period";

  let nameWithPronoun = intern?.name || "______";
  if (gender !== "OTHERS" && pronoun1) {
    nameWithPronoun = `${pronoun1} ${nameWithPronoun}`;
  }

  const paragraph1 = `This is to certify that ${nameWithPronoun}, a student of ${
    intern?.educationalInstitution || "______"
  }, ${intern?.state || "______"}, pursuing ${
    intern?.courseProgram || "______"
  }${
    type === "ONGOING"
      ? `, is currently undergoing ${pronoun2} internship at Jagruti Rehabilitation Centre under the supervision of ${psychologistName}.`
      : `, has completed ${pronoun2} internship at Jagruti Rehabilitation Centre under the supervision of ${psychologistName} for ${internshipDuration}.`
  }`;

  const paragraph2 =
    gender === "OTHERS"
      ? `${toTitleCase(
          intern?.name || "The intern"
        )} has been sincere, diligent and proactive through the course of the internship. ${toTitleCase(
          intern?.name || "The intern"
        )} was hands-on and engaged in observation of Case History Taking & Mental Status Examination, conducting Psycho Education Sessions and Activities. The dedication, hard work and work ethic during this course was commendable.`
      : `${toTitleCase(
          pronoun3
        )} has been sincere, diligent and proactive through the course of ${pronoun2} internship. ${toTitleCase(
          pronoun3
        )} was hands-on and engaged in observation of Case History Taking & Mental Status Examination, conducting Psycho Education Sessions and Activities. ${toTitleCase(
          pronoun2
        )} dedication, hard work and work ethic during this course was commendable.`;

  const paragraph3 =
    gender === "OTHERS"
      ? `We wish ${
          intern?.name || "the intern"
        } the best of luck for future endeavors.`
      : `We wish ${pronoun2} the best of luck for ${pronoun2} future endeavors.`;

  return (
    <div style={styles.page}>
      <img src={InternBg} alt="certificate background" style={styles.bgImg} />

      <div style={styles.content}>
        <div
          style={{
            textAlign: "right",
            fontWeight: "bold",
            marginBottom: "40px",
          }}
        >
          Date :{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>

        <div
          style={{
            marginBottom: "50px",
            fontFamily: "Arial, sans-serif",
            fontWeight: "14.7px",
          }}
        >
          <p style={{ marginBottom: 0, fontWeight: "bold" }}>To,</p>
          <p style={{ marginBottom: 0, fontWeight: "bold" }}>
            {nameWithPronoun}
          </p>
          <p>(Intern)</p>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "18px",
            fontWeight: "bold",
            textDecoration: "underline",
            textUnderlineOffset: "8px",
          }}
        >
          Subject: Internship Certificate
        </div>

        <div style={{ textAlign: "justify", lineHeight: 1.6, fontSize: 15 }}>
          <p>{paragraph1}</p>
          <p>{paragraph2}</p>
          <p>
            {paragraph3}
            <br />
            <p style={{ fontWeight: "bold" }}>
              For Jagruti Rehabilitation Centre,
            </p>
          </p>
        </div>

        <div style={{ marginTop: "100px" }}>
          <p style={{ marginBottom: 0, fontWeight: "bold" }}>
            {psychologistName}
          </p>
          <p style={{ fontWeight: "bold" }}>Senior Psychologist</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
