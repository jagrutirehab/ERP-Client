// export const normalizeGeminiResponse = (response) => {
//   if (!response) return "";

//   let data = response;

//   if (typeof response === "string") {
//     try {
//       // Remove markdown code block if present
//       const cleaned = response
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();

//       data = JSON.parse(cleaned);
//     } catch (err) {
//       console.log("Gemini parse failed:", err);
//       return response;
//     }
//   }

//   let text = "";

//   if (data?.summary) {
//     text += `Summary:\n${data.summary}\n\n`;
//   }

//   if (data?.scores) {
//     text += `Scores:\n`;
//     Object.entries(data.scores).forEach(([key, value]) => {
//       text += `${key}: ${value ?? "NA"}\n`;
//     });
//     text += `\n`;
//   }

//   if (data?.strengths?.length) {
//     text += `Strengths:\n`;
//     data.strengths.forEach((s) => {
//       text += `• ${s}\n`;
//     });
//     text += `\n`;
//   }

//   if (data?.weaknesses?.length) {
//     text += `Weaknesses:\n`;
//     data.weaknesses.forEach((w) => {
//       text += `• ${w}\n`;
//     });
//     text += `\n`;
//   }

//   if (data?.coaching) {
//     text += `Coaching:\n${data.coaching}`;
//   }

//   return text;
// };

export const normalizeGeminiResponse = (response) => {
  if (!response) return "";

  let data = response;

  if (typeof response === "string") {
    try {
      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      data = JSON.parse(cleaned);
    } catch (err) {
      console.log("Gemini parse failed:", err);
      return response;
    }
  }

  // ✅ LABEL MAPPING
  const scoreLabels = {
    C1: "Pro greeting (Org/Name)",
    C2: "Calm/Empathetic tone",
    C3: "No interruptions/Active listening",
    C4: "Relevant probing questions",
    C5: "No repetitive questions",
    C6: "Accurate service info (IPD/OPD/Psych/Elder)",
    C7: "Tailored response to needs",
    C8: "Correct location/charges info",
    C9: "No price/discount talk before understanding issue",
    C10: "Explored room/budget before discount",
    C11: "Pitched OPD only if IPD unaffordable/unsuitable",
    C12: "No treatment guarantees",
    C13: "Asked visit timeline",
    C14: "Offered visit/CM escalation",
    C15: "Asked for more queries",
    C16: "Positive close + Next steps",
    C17: "Not rushed",
    C18: "Overall Experience",
  };

  let text = "";

  if (data?.summary) {
    text += `Summary:\n${data.summary}\n\n`;
  }

  if (data?.scores) {
    text += `Scores:\n`;

    Object.entries(data.scores).forEach(([key, value]) => {
      const label = scoreLabels[key] || key;
      text += `${key} (${label}): ${value ?? "NA"}\n`;
    });

    text += `\n`;
  }

  if (data?.strengths?.length) {
    text += `Strengths:\n`;
    data.strengths.forEach((s) => {
      text += `• ${s}\n`;
    });
    text += `\n`;
  }

  if (data?.weaknesses?.length) {
    text += `Weaknesses:\n`;
    data.weaknesses.forEach((w) => {
      text += `• ${w}\n`;
    });
    text += `\n`;
  }

  if (data?.coaching) {
    text += `Coaching:\n${data.coaching}`;
  }

  return text;
};