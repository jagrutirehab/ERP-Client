export const hamdQuestions = [
  {
    id: "1",
    question: {
      en: "Depressed mood.",
      hi: "अवसादग्रस्त मनोदशा।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "2",
    question: {
      en: "Guilt feelings.",
      hi: "अपराधबोध की भावना।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "3",
    question: {
      en: "Suicide.",
      hi: "आत्महत्या।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "4",
    question: {
      en: "Insomnia - early.",
      hi: "अनिद्रा – प्रारंभिक।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "5",
    question: {
      en: "Insomnia - middle.",
      hi: "अनिद्रा – मध्यकालीन।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "6",
    question: {
      en: "Insomnia - late.",
      hi: "अनिद्रा – उत्तरकालीन।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "7",
    question: {
      en: "Work and activities.",
      hi: "कार्य और गतिविधियाँ।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "8",
    question: {
      en: "Retardation - psychomotor.",
      hi: "स्नायुगत मनोमोटर मंदता।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "9",
    question: {
      en: "Agitation.",
      hi: "उत्तेजना।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "10",
    question: {
      en: "Anxiety - psychological.",
      hi: "चिंता – मानसिक।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      moderate: 2,
      severe: 3,
      incapacitating: 4,
    },
  },
  {
    id: "11",
    question: {
      en: "Anxiety - somatic.",
      hi: "चिंता – शारीरिक।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      Moderate: 2,
      Severe: 3,
      Incapacitating: 4,
    },
  },
  {
    id: "12",
    question: {
      en: "Somatic symptoms GI.",
      hi: "शारीरिक लक्षण – जठरांत्रीय (GI)।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "13",
    question: {
      en: "Somatic symptoms - General.",
      hi: "शारीरिक लक्षण – सामान्य।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "14",
    question: {
      en: "Sexual dysfunction - menstrual disturbance.",
      hi: "यौन कार्यक्षमता में विकार – मासिक धर्म में विकार।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "15",
    question: {
      en: "Hypochondrias.",
      hi: "स्वास्थ्संवेदनासंबंधी चिंता।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      Mild: 1,
      Moderate: 2,
      Severe: 3,
      Incapacitating: 4,
    },
  },
  {
    id: "16",
    question: {
      en: "Weight loss by history (According to the patient / According to weekly measurements).",
      hi: "इतिहास द्वारा वजन में कमी (रोगी के अनुसार / साप्ताहिक माप के अनुसार)।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
  {
    id: "17",
    question: {
      en: "Insight.",
      hi: "अवबोधन।"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
  },
];

export const calculateScores = (answers) => {
  let totalScore = 0;
  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = hamdQuestions.find((q) => q.id === questionId);
    if (question && question.score) {
      const scoreValue = question.score[answerValue] ?? 0;
      totalScore += scoreValue;
    }
  }
  return totalScore;
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore <= 9) {
    severity = "Minimal";
    interpretation =
      "No significant depressive symptoms detected. The patient's mood is within normal limits.";
    recommendations =
      "No treatment necessary at this time. Suggest periodic monitoring for mood changes.";
  } else if (totalScore >= 10 && totalScore <= 13) {
    severity = "Mild";
    interpretation =
      "Mild depressive symptoms present, with low impact on daily life; patient may experience occasional sadness or decreased motivation.";
    recommendations =
      "Supportive psychotherapy or counseling is often sufficient. Encourage healthy routines and monitor symptoms regularly.";
  } else if (totalScore >= 14 && totalScore <= 17) {
    severity = "Mild to Moderate";
    interpretation =
      "Mild to moderate depressive symptoms, with noticeable but manageable effects on daily functioning.";
    recommendations =
      "Recommend formal psychotherapy, review need for medication especially if functional impairment is present, and reinforce support systems.";
  } else if (totalScore > 17) {
    severity = "Moderate to Severe";
    interpretation =
      "Moderate to severe symptoms; substantial impact on daily living and functioning, potentially associated with risk factors such as suicidal ideation.";
    recommendations =
      "Strongly recommend psychiatric/mental health referral. Consider combined treatment with medication and psychotherapy. Evaluate risk factors and safety as a priority.";
  }

  return { severity, interpretation, recommendations };
};
