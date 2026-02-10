import { differenceInYears, format } from "date-fns";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const clean = (v) =>
  typeof v === "string"
    ? v.normalize("NFKC").replace(/\u200B|\uFEFF/g, "")
    : "";

const safe = (v) => {
  if (v === undefined || v === null || v === "") return "";
  if (typeof v === "string" && v.toLowerCase() === "undefined") return "";
  return v;
};

const cap = (v) => {
  const s = safe(v);
  return s ? capitalizeWords(String(s)) : "";
};

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:image");

const h = (text, margin = [0, 0, 0, 6]) => ({
  text,
  bold: true,
  fontSize: 13,
  margin,
});

const bodyText = (text, margin = [0, 0, 0, 10]) => ({
  text: cap(clean(text)) || "",
  margin,
});

const line = (y = 0, dash = null) => ({
  canvas: [
    {
      type: "line",
      x1: 0,
      y1: y,
      x2: 535,
      y2: y,
      lineWidth: 1,
      dash: dash || undefined,
    },
  ],
});

const lineShort = (width, y = 0) => ({
  canvas: [
    {
      type: "line",
      x1: 0,
      y1: y,
      x2: width,
      y2: y,
      lineWidth: 1,
    },
  ],
});

const mseItem = (label, value) => ({
  columns: [
    {
      width: "30%",
      columns: [
        { text: "\u2022", width: 10 },
        { text: label, width: "*" },
      ],
    },
    { text: cap(value), width: "70%" },
  ],
  margin: [5, 0, 0, 4],
});

const prescriptionTable = (medicines = []) => {
  const rows = [
    [
      { text: "DRUG NAME", bold: true },
      { text: "FREQUENCY", bold: true },
      { text: "DURATION", bold: true },
      { text: "INSTRUCTIONS", bold: true },
    ],
  ];

  medicines.forEach((item) => {
    const med = item.medicine || {};
    rows.push([
      {
        text: [
          { text: med.type ? `${med.type} `.toUpperCase() : "" },
          {
            text: `${cap(med.name)}${med.strength ? ` ${med.strength}` : ""} `
              .toUpperCase(),
          },
          { text: med.unit ? `${med.unit}`.toUpperCase() : "" },
        ],
      },
      {
        text: `${safe(item.dosageAndFrequency?.morning)}-${safe(
          item.dosageAndFrequency?.evening
        )}-${safe(item.dosageAndFrequency?.night)}`,
      },
      { text: `${safe(item.duration)} ${safe(item.unit)}` },
      { text: cap(item.intake).toUpperCase() },
    ]);
    rows.push([
      {
        text: `instructions: ${cap(item.instructions)}`.toUpperCase(),
        colSpan: 4,
        margin: [0, 2, 0, 2],
      },
      {},
      {},
      {},
    ]);
  });

  return {
    table: {
      widths: ["28%", "24%", "24%", "24%"],
      body: rows,
    },
    layout: {
      hLineWidth: (i) => (i === 0 ? 0 : 0.5),
      vLineWidth: () => 0,
      hLineColor: () => "#1d1d1d",
      paddingLeft: () => 2,
      paddingRight: () => 2,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    fontSize: 9,
    margin: [0, 4, 0, 10],
  };
};

export const buildDischargeSummaryDoc = ({
  chart,
  patient,
  admission,
  center,
  signatures,
}) => {
  const data = chart?.dischargeSummary || {};

  const age =
    patient?.dateOfBirth &&
    differenceInYears(new Date(), new Date(patient.dateOfBirth));

  const content = [
    {
      columns: [
        {
          width: "50%",
          text: center?.name || "JAGRUTI REHABILITATION CENTRE",
          fontSize: 15,
          bold: true,
        },
        {
          width: "50%",
          alignment: "left",
          stack: [
            { text: cap(center?.address) || "center address goes here" },
            {
              text: safe(center?.numbers) || "+91 77458 80088 / 98222 07761",
              margin: [0, 2, 0, 0],
            },
            { text: "www.jagrutirehab.org", margin: [0, 0, 0, 6] },
          ],
        },
      ],
    },
    line(0),
    {
      columns: [
        {
          width: "70%",
          text: [
            { text: "Created By: " },
            { text: capitalizeWords(chart?.author?.name || ""), bold: true },
          ],
        },
        {
          width: "30%",
          alignment: "right",
          text: `On: ${
            chart?.date ? format(new Date(chart.date), "dd MMM yyyy hh:mm a") : ""
          }`,
        },
      ],
      margin: [0, 5, 0, 5],
    },
    line(0),
    {
      columns: [
        {
          width: "100%",
          text: [
            `Patient: ${cap(patient?.name)} - ${safe(
              patient?.id?.prefix
            )}${safe(patient?.id?.value)}`,
            admission?.Ipdnum ? `\nIPD Num: ${admission?.Ipdnum}` : "",
            patient?.phoneNumber ? `\nPh: ${patient?.phoneNumber}` : "",
            patient?.email ? `\nPh: ${patient?.email}` : "",
            patient?.address ? `\nAddress: ${cap(patient?.address)}` : "",
            patient?.gender ? `\n${cap(patient?.gender)},` : "",
            age ? `\n${age}` : "",
          ].join(""),
        },
      ],
      margin: [0, 5, 0, 5],
    },
    line(0),
    {
      columns: [
        {
          width: "50%",
          text: admission?.addmissionDate
            ? `Date of Addmission: ${format(
                new Date(admission?.addmissionDate),
                "d MMM y"
              )}`
            : "Date of Addmission:",
        },
        {
          width: "50%",
          alignment: "right",
          text:
            admission?.dischargeDate || chart?.dischargeSummary?.dischargeDate
              ? `Date of Discharge: ${format(
                  new Date(
                    admission?.dischargeDate ||
                      chart?.dischargeSummary?.dischargeDate
                  ),
                  "d MMM y"
                )}`
              : "Date of Discharge:",
        },
      ],
      margin: [0, 5, 0, 5],
    },
    line(0),
    {
      text: "Discharge Summary",
      alignment: "center",
      bold: true,
      fontSize: 13,
      margin: [0, 15, 0, 16],
    },
  ];

  if (data?.diagnosis) {
    content.push(h("Diagnosis:"), bodyText(data?.diagnosis));
  }

  if (data?.presentingSymptoms) {
    content.push(h("Presenting Symptoms:"), bodyText(data?.presentingSymptoms));
  }

  if (
    data?.mseAddmission?.appearance ||
    data?.mseAddmission?.ecc ||
    data?.mseAddmission?.speech ||
    data?.mseAddmission?.mood ||
    data?.mseAddmission?.affect ||
    data?.mseAddmission?.thoughts ||
    data?.mseAddmission?.perception ||
    data?.mseAddmission?.memory ||
    data?.mseAddmission?.abstractThinking ||
    data?.mseAddmission?.socialJudgment ||
    data?.mseAddmission?.insight
  ) {
    content.push(h("MSE at Addmission"));
    if (data?.mseAddmission?.appearance)
      content.push(
        mseItem("Appearance and Behavior-", data.mseAddmission.appearance)
      );
    if (data?.mseAddmission?.ecc)
      content.push(mseItem("ECC / RAPPORT-", data.mseAddmission.ecc));
    if (data?.mseAddmission?.speech)
      content.push(mseItem("Speech-", data.mseAddmission.speech));
    if (data?.mseAddmission?.mood)
      content.push(mseItem("Mood-", data.mseAddmission.mood));
    if (data?.mseAddmission?.affect)
      content.push(mseItem("Affect-", data.mseAddmission.affect));
    if (data?.mseAddmission?.thoughts)
      content.push(mseItem("Thoughts-", data.mseAddmission.thoughts));
    if (data?.mseAddmission?.perception)
      content.push(mseItem("Perception-", data.mseAddmission.perception));
    if (data?.mseAddmission?.memory)
      content.push(mseItem("Memory-", data.mseAddmission.memory));
    if (data?.mseAddmission?.abstractThinking)
      content.push(
        mseItem("Abstract Thinking-", data.mseAddmission.abstractThinking)
      );
    if (data?.mseAddmission?.socialJudgment)
      content.push(
        mseItem("Social Judgment-", data.mseAddmission.socialJudgment)
      );
    if (data?.mseAddmission?.insight)
      content.push(mseItem("Insight-", data.mseAddmission.insight));
    content.push({ text: " ", margin: [0, 4, 0, 4] });
  }

  if (data?.pastHistory) {
    content.push(h("PAST HISTORY:"), bodyText(data?.pastHistory));
  }
  if (data?.medicalHistory) {
    content.push(h("MEDICAL HISTORY:"), bodyText(data?.medicalHistory));
  }
  if (data?.familyHistory) {
    content.push(h("RELEVANT FAMILY HISTORY :"), bodyText(data?.familyHistory));
  }

  if (
    data?.personalHistory?.smoking ||
    data?.personalHistory?.chewingTobacco ||
    data?.personalHistory?.alcohol
  ) {
    content.push(h("PERSONAL HISTORY:"));
    if (data.personalHistory?.smoking)
      content.push({
        columns: [
          { text: "Smoking", width: "25%" },
          { text: ":", width: "5%" },
          { text: cap(clean(data.personalHistory.smoking)), width: "70%" },
        ],
        margin: [5, 0, 0, 4],
      });
    if (data.personalHistory?.chewingTobacco)
      content.push({
        columns: [
          { text: "Chewing Tobacco", width: "25%" },
          { text: ":", width: "5%" },
          { text: cap(clean(data.personalHistory.chewingTobacco)), width: "70%" },
        ],
        margin: [5, 0, 0, 4],
      });
    if (data.personalHistory?.alcohol)
      content.push({
        columns: [
          { text: "Alcohol", width: "25%" },
          { text: ":", width: "5%" },
          { text: cap(clean(data.personalHistory.alcohol)), width: "70%" },
        ],
        margin: [5, 0, 0, 8],
      });
  }

  if (
    data?.physicalExamination?.temprature ||
    data?.physicalExamination?.pulse ||
    data?.physicalExamination?.bp ||
    data?.physicalExamination?.cvs ||
    data?.physicalExamination?.rs ||
    data?.physicalExamination?.abdomen ||
    data?.physicalExamination?.cns ||
    data?.physicalExamination?.others
  ) {
    content.push(h("PHYSICAL EXAMINATION:"));
    const pe = data.physicalExamination || {};
    const peRow = (label, value) => ({
      columns: [
        { text: label, width: "25%" },
        { text: ":", width: "5%" },
        { text: cap(clean(value)), width: "70%" },
      ],
      margin: [5, 0, 0, 4],
    });
    if (pe.temprature) content.push(peRow("Temprature", pe.temprature));
    if (pe.pulse) content.push(peRow("pulse", pe.pulse));
    if (pe.bp) content.push(peRow("B.P", pe.bp));
    if (pe.cvs) content.push(peRow("CVS", pe.cvs));
    if (pe.rs) content.push(peRow("RS", pe.rs));
    if (pe.abdomen) content.push(peRow("Abdomen", pe.abdomen));
    if (pe.cns) content.push(peRow("CNS", pe.cns));
    if (pe.others) content.push(peRow("Others", pe.others));
    content.push({ text: " ", margin: [0, 4, 0, 4] });
  }

  if (data?.investigation) {
    content.push(
      h("INVESTIGATIONS : (all reports attached with Discharge Card)"),
      bodyText(data?.investigation)
    );
  }

  if (data?.discussion) {
    content.push(h("DISCUSSION / WARD MANAGEMENT:"), bodyText(data?.discussion));
  }

  if (data?.treatment?.length && data.treatment instanceof Array) {
    content.push(h("GIVEN TREATMENTS:"));
    content.push(prescriptionTable(data.treatment));
  } else if (data?.treatment) {
    content.push(h("GIVEN TREATMENTS:"), bodyText(data?.treatment));
  }

  if (data?.refernces) {
    content.push(h("References:"), bodyText(data?.refernces));
  }

  if (data?.modifiedTreatment) {
    content.push(
      h("Modified ECTs / Ketamine / Other Treatment:"),
      bodyText(data?.modifiedTreatment)
    );
  }

  if (data?.deportAdministered) {
    content.push(
      h("LA / Depot Administered:"),
      bodyText(data?.deportAdministered)
    );
  }

  if (
    data?.mseDischarge?.appearance ||
    data?.mseDischarge?.ecc ||
    data?.mseDischarge?.speech ||
    data?.mseDischarge?.mood ||
    data?.mseDischarge?.affect ||
    data?.mseDischarge?.thoughts ||
    data?.mseDischarge?.perception ||
    data?.mseDischarge?.memory ||
    data?.mseDischarge?.abstractThinking ||
    data?.mseDischarge?.socialJudgment ||
    data?.mseDischarge?.insight
  ) {
    content.push(h("Patient Condition on Discharge: (MSE at Discharge)"));
    if (data?.mseDischarge?.appearance)
      content.push(
        mseItem("Appearance and Behavior-", data.mseDischarge.appearance)
      );
    if (data?.mseDischarge?.ecc)
      content.push(mseItem("ECC / RAPPORT-", data.mseDischarge.ecc));
    if (data?.mseDischarge?.speech)
      content.push(mseItem("Speech-", data.mseDischarge.speech));
    if (data?.mseDischarge?.mood)
      content.push(mseItem("Mood-", data.mseDischarge.mood));
    if (data?.mseDischarge?.affect)
      content.push(mseItem("Affect-", data.mseDischarge.affect));
    if (data?.mseDischarge?.thoughts)
      content.push(mseItem("Thoughts-", data.mseDischarge.thoughts));
    if (data?.mseDischarge?.perception)
      content.push(mseItem("Perception-", data.mseDischarge.perception));
    if (data?.mseDischarge?.memory)
      content.push(mseItem("Memory-", data.mseDischarge.memory));
    if (data?.mseDischarge?.abstractThinking)
      content.push(
        mseItem("Abstract Thinking-", data.mseDischarge.abstractThinking)
      );
    if (data?.mseDischarge?.socialJudgment)
      content.push(
        mseItem("Social Judgment-", data.mseDischarge.socialJudgment)
      );
    if (data?.mseDischarge?.insight)
      content.push(mseItem("Insight-", data.mseDischarge.insight));
    content.push({ text: " ", margin: [0, 4, 0, 4] });
  }

  if (data?.patientStatus) {
    content.push(
      h("PATIENT CONDITION / STATUS AT THE TIME OF DISCHARGE:"),
      bodyText(data?.patientStatus)
    );
  }

  if (data?.medicine?.length || data?.followUp || data?.note) {
    content.push(h("ADVISE ON DISCHARGE:"));
  }

  if (data?.medicine?.length) {
    content.push(prescriptionTable(data.medicine));
  }

  if (typeof data?.followUp === "string" && data.followUp.trim()) {
    content.push(h("Follow-Up:"));
    const lines = clean(data.followUp)
      ?.trim()
      .split(/\r?\n|(?<=\.)\s+/)
      .map((line) => cap(line.trim()));
    lines.forEach((lineText) => {
      content.push({ text: lineText, margin: [5, 0, 0, 2] });
    });
    content.push({ text: " ", margin: [0, 2, 0, 6] });
  }

  if (typeof data?.note === "string" && data.note.trim()) {
    content.push(h("Note:"), bodyText(data.note));
  }

  content.push(
    {
      text: `Consultant Psychiatrist: ${safe(data?.consultantName)}`,
      bold: true,
      margin: [0, 4, 0, 10],
    },
    {
      columns: [
        {
          width: "50%",
          stack: [
            { text: " ", margin: [0, 0, 0, 20] },
            lineShort(240, 0),
            {
              text: cap(data?.consultantPsychologist),
              alignment: "center",
              bold: true,
              margin: [0, 6, 0, 2],
            },
            {
              text: "Consultant Psychologist",
              alignment: "center",
              bold: true,
            },
          ],
          margin: [0, 0, 15, 0],
        },
        {
          width: "50%",
          stack: [
            { text: " ", margin: [0, 0, 0, 20] },
            lineShort(240, 0),
            {
              text: cap(data?.consultantSignature),
              alignment: "center",
              bold: true,
              margin: [0, 6, 0, 2],
            },
            {
              text: "MO/SMO/CMO/Consultant",
              alignment: "center",
              bold: true,
            },
          ],
          margin: [15, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: `Discharge Summary Prepared By: ${safe(data?.summaryPreparedBy)}`,
      bold: true,
      margin: [0, 0, 0, 8],
    }
  );

  if (data?.typeOfDischarge) {
    content.push({
      columns: [
        {
          text: "Type of Discharge : ",
          bold: true,
          width: "auto",
        },
        {
          text: cap(data?.typeOfDischarge),
          font: "Hindi",
        },
      ],
      margin: [0, 0, 0, 8],
    });
  }

  if (data?.dischargeRoutine) {
    content.push({
      text: [
        { text: "Discharge Routine: ", bold: true },
        { text: cap(data?.dischargeRoutine), font: "Marathi" },
      ],
      margin: [0, 0, 0, 8],
    });
  }

  content.push(
    {
      columns: [
        {
          text: `Name of Patient: ${cap(patient?.name)}`,
          width: "50%",
        },
        { text: "Signature", width: "50%" },
      ],
      margin: [0, 0, 0, 6],
    },
    {
      columns: [
        {
          text: `Name of Patient Relative: ${cap(patient?.guardianName)}`,
          width: "50%",
        },
        { text: "Signature", width: "50%" },
      ],
      margin: [0, 0, 0, 6],
    }
  );

  const docSign = patient?.doctorData;
  const psySign = patient?.psychologistData;
  const signatureColumns = [];

  const buildSignatureBlock = (person, signatureDataUrl) => {
    if (!person) return null;
    const stack = [];
    if (signatureDataUrl) {
      stack.push({
        image: signatureDataUrl,
        width: 50,
        alignment: "center",
        margin: [0, 0, 0, 4],
      });
    } else {
      stack.push({
        text: " ",
        fontSize: 24,
        margin: [0, 0, 0, 4],
      });
    }
    const name = cap(person.name);
    const degrees = cap(person.degrees);
    const speciality = cap(person.speciality);
    const registrationNo = safe(person.registrationNo);

    if (name)
      stack.push({ text: name, alignment: "center", margin: [0, 0, 0, 2] });
    if (degrees)
      stack.push({
        text: degrees,
        alignment: "center",
        margin: [0, 0, 0, 2],
      });
    if (speciality)
      stack.push({
        text: speciality,
        alignment: "center",
        margin: [0, 0, 0, 2],
      });
    if (registrationNo)
      stack.push({
        text: `Reg. No. - ${registrationNo}`,
        alignment: "center",
      });
    return { stack, alignment: "center" };
  };

  const doctorSignature =
    signatures?.doctor ||
    (isDataUrl(docSign?.signature) ? docSign?.signature : null);
  const psychologistSignature =
    signatures?.psychologist ||
    (isDataUrl(psySign?.signature) ? psySign?.signature : null);

  const doctorBlock = buildSignatureBlock(docSign, doctorSignature);
  const psychologistBlock = buildSignatureBlock(
    psySign,
    psychologistSignature
  );
  if (doctorBlock) signatureColumns.push({ width: "50%", ...doctorBlock });
  if (psychologistBlock)
    signatureColumns.push({ width: "50%", ...psychologistBlock });
  if (signatureColumns.length === 1) {
    content.push({
      columns: [
        { width: "50%", text: "" },
        { width: "50%", ...signatureColumns[0] },
      ],
      margin: [0, 10, 0, 0],
    });
  } else if (signatureColumns.length) {
    content.push({
      columns: [
        { width: "50%", text: "" },
        {
          width: "50%",
          columns: [
            { width: "50%", ...signatureColumns[0] },
            { width: "50%", ...signatureColumns[1] },
          ],
        },
      ],
      margin: [0, 10, 0, 0],
    });
  }

  return {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 70],
    defaultStyle: {
      font: "HelveticaNeue",
      fontSize: 11,
    },
    content,
    footer: () => ({
      margin: [30, 0, 30, 20],
      fontSize: 10,
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              dash: [3, 3],
            },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: `Reg Add: ${safe(center?.address)?.replace(/\n/g, "") || ""}`,
          margin: [0, 0, 0, 2],
        },
        {
          columns: [
            { text: "Tel: +919822207761 | +919833365230", width: "auto" },
            {
              text: "E-mail : jagrutirehabmumbai@gmail.com",
              color: "#1e90ff",
              decoration: "underline",
              width: "auto",
              margin: [5, 0, 0, 0],
            },
            {
              text: "Web: www.jagrutirehab.org",
              width: "auto",
              margin: [5, 0, 0, 0],
            },
          ],
        },
      ],
    }),
  };
};
