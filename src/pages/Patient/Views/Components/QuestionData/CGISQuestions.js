export const cgisQuestions = [
  {
    id: "1",
    question: {
      en: "Considering your total clinical experience with this particular population, how mentally ill is the patient at this time?",
      hi: "इस विशेष जनसंख्या के साथ अपने कुल नैदानिक अनुभव को ध्यान में रखते हुए, रोगी अभी मानसिक रूप से कितना बीमार है?",
    },
    type: "multiple",
    score: {
      "1 – Normal, not at all ill": 1,
      "2 – Borderline mentally ill": 2,
      "3 – Mildly ill": 3,
      "4 – Moderately ill": 4,
      "5 – Markedly ill": 5,
      "6 – Severely ill": 6,
      "7 – Among the most extremely ill patients": 7,
    },
    guidance: {
      en: "Select the single score (1–7) that best reflects the patient's overall severity right now, relative to other patients with a similar condition — not relative to the general population.",
      hi: "वह एकल स्कोर (1–7) चुनें जो रोगी की वर्तमान समग्र गंभीरता को सर्वोत्तम रूप से दर्शाता हो — समान स्थिति वाले अन्य रोगियों की तुलना में, सामान्य जनसंख्या की नहीं।",
    },
  },
];

export const calculateScores = (answers) => {
  const answer = answers["1"];
  if (!answer) return 0;
  const question = cgisQuestions.find((q) => q.id === "1");
  return question?.score?.[answer] ?? 0;
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore === 1) {
    severity = "Normal, not at all ill";
    interpretation = "No signs of illness.";
    recommendations =
      "No immediate intervention required. Continue routine monitoring and reassess at scheduled follow-up.";
  } else if (totalScore === 2) {
    severity = "Borderline mentally ill";
    interpretation = "Minimal, non-specific symptoms.";
    recommendations =
      "Monitor closely. Consider psychoeducation and supportive counselling. Reassess within 2–4 weeks.";
  } else if (totalScore === 3) {
    severity = "Mildly ill";
    interpretation = "Symptoms present, mostly functional.";
    recommendations =
      "Consider outpatient psychotherapy. Review current medications if applicable. Schedule follow-up within 2–4 weeks.";
  } else if (totalScore === 4) {
    severity = "Moderately ill";
    interpretation = "Clear symptoms, some functional impact.";
    recommendations =
      "Initiate or review pharmacological and/or psychotherapeutic treatment. Increase follow-up frequency. Assess safety.";
  } else if (totalScore === 5) {
    severity = "Markedly ill";
    interpretation = "Prominent symptoms, significant functional impact.";
    recommendations =
      "Intensify current treatment. Consider specialist referral or day-programme. Evaluate need for inpatient care if safety is a concern.";
  } else if (totalScore === 6) {
    severity = "Severely ill";
    interpretation = "Severe symptoms, major functional impairment.";
    recommendations =
      "Urgent treatment review required. Strongly consider inpatient admission. Implement safety plan. Monitor continuously.";
  } else if (totalScore === 7) {
    severity = "Among the most extremely ill patients";
    interpretation = "Extreme severity.";
    recommendations =
      "Immediate intensive intervention required. Inpatient admission strongly recommended. Initiate crisis protocols and ensure continuous monitoring.";
  }

  return { severity, interpretation, recommendations };
};
