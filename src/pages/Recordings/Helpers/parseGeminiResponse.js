export const parseGeminiResponse = (text) => {
  if (!text) return {};

  const result = {
    summary: "",
    scores: {},
    strengths: "",
    weaknesses: "",
    coaching: "",
  };

  try {
    // Summary
    const summaryMatch = text.match(/Summary:\s*([\s\S]*?)\n\nScores:/);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }

    // Scores (C1, C2...)
    const scoresMatch = text.match(/Scores:\s*([\s\S]*?)\n\nStrengths:/);
    if (scoresMatch) {
      const scoresText = scoresMatch[1].trim();

      scoresText.split("\n").forEach((line) => {
        const [key, value] = line.split(":").map((i) => i.trim());
        if (key && value) {
          result.scores[key] = value;
        }
      });
    }

    // Strengths
    const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)\n\nWeaknesses:/);
    if (strengthsMatch) {
      result.strengths = strengthsMatch[1].trim();
    }

    // Weaknesses
    const weaknessesMatch = text.match(/Weaknesses:\s*([\s\S]*?)\n\nCoaching:/);
    if (weaknessesMatch) {
      result.weaknesses = weaknessesMatch[1].trim();
    }

    // Coaching
    const coachingMatch = text.match(/Coaching:\s*([\s\S]*)/);
    if (coachingMatch) {
      result.coaching = coachingMatch[1].trim();
    }
  } catch (err) {
    console.log("Parsing error:", err);
  }

  return result;
};