export const normalizeGeminiResponse = (response) => {
  if (!response) return "";

  let data = response;

  if (typeof response === "string") {
    try {
      // Remove markdown code block if present
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

  let text = "";

  if (data?.summary) {
    text += `Summary:\n${data.summary}\n\n`;
  }

  if (data?.scores) {
    text += `Scores:\n`;
    Object.entries(data.scores).forEach(([key, value]) => {
      text += `${key}: ${value ?? "NA"}\n`;
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