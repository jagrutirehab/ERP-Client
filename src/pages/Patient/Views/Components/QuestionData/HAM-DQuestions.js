export const hamdQuestions = [
  {
    id: "1",
    question: {
      en: "Depressed mood - Gloomy attitude, pessimism about the future, feeling of sadness, tendency to weep.",
    },
    type: "rating",
    score: {
      Absent: 0,
      "Sadness, etc.": 1,
      "Occasional weeping": 2,
      "Frequent weeping": 3,
      "Extreme symptoms": 4,
    },
  },
  {
    id: "2",
    question: {
      en: "Feelings of guilt - Self-reproach, feels he/she has let people down, ideas of guilt, punishment, delusions, hallucinations.",
    },
    type: "rating",
    score: {
      Absent: 0,
      "Self-reproach, has let people down": 1,
      "Ideas of guilt": 2,
      "Illness is punishment, delusions": 3,
      "Hallucinations of guilt": 4,
    },
  },
  {
    id: "Q3",
    question: {
      en: "Suicide - Feels life is not worth living, wishes dead, suicidal ideas/gestures, attempts at suicide.",
    },
    type: "rating",
    score: {
      Absent: 0,
      "Feels life is not worth living": 1,
      "Wishes he/she were dead": 2,
      "Suicidal ideas or gestures": 3,
      "Attempts at suicide": 4,
    },
  },
  {
    id: "Q4",
    question: {
      en: "Insomnia - Initial: Difficulty in falling asleep.",
    },
    type: "rating",
    score: {
      Absent: 0,
      Occasional: 1,
      Frequent: 2,
    },
  },
  {
    id: "Q5",
    question: {
      en: "Insomnia - Middle: Being restless or disturbed at night, waking during night.",
    },
    type: "rating",
    score: {
      Absent: 0,
      Occasional: 1,
      Frequent: 2,
    },
  },
  {
    id: "6",
    question: {
      en: "Insomnia - Delayed: Waking in early hours and unable to fall asleep again.",
    },
    type: "rating",
    score: {
      Absent: 0,
      Occasional: 1,
      Frequent: 2,
    },
  },
  {
    id: "7",
    question: {
      en: "Work and interests - Capacity, listlessness, indecision, loss of interest, decreased social activities.",
    },
    type: "rating",
    score: {
      "No difficulty": 0,
      "Feelings of incapacity, indecision": 1,
      "Loss of interest, decreased activities": 2,
      "Productivity decreased": 3,
      "Unable to work": 4,
    },
  },
  {
    id: "8",
    question: {
      en: "Retardation - Slowness of thought, speech, activity; apathy, stupor.",
    },
    type: "rating",
    score: {
      Absent: 0,
      "Slight retardation": 1,
      "Obvious retardation": 2,
      "Interview difficult": 3,
      "Complete stupor": 4,
    },
  },
  {
    id: "9",
    question: {
      en: "Agitation - Restlessness associated with anxiety.",
    },
    type: "rating",
    score: {
      Absent: 0,
      Occasional: 1,
      Frequent: 2,
    },
  },
  {
    id: "10",
    question: {
      en: "Anxiety - Psychic: Tension, irritability, worrying, apprehension, fears.",
    },
    type: "rating",
    score: {
      "No difficulty": 0,
      "Tension and irritability": 1,
      "Worrying about minor matters": 2,
      "Apprehensive attitude": 3,
      Fears: 4,
    },
  },
  {
    id: "11",
    question: {
      en: "Anxiety - Somatic: Gastrointestinal, headaches, palpitations, respiratory, genito-urinary, etc.",
    },
    type: "rating",
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
      en: "Somatic symptoms - Gastrointestinal (loss of appetite, heaviness in abdomen, constipation).",
    },
    type: "rating",
    score: {
      Absent: 0,
      Mild: 1,
      Severe: 2,
    },
  },
  {
    id: "13",
    question: {
      en: "Somatic symptoms - General (heaviness in limbs, loss of energy, fatigue).",
    },
    type: "rating",
    score: {
      Absent: 0,
      Mild: 1,
      Severe: 2,
    },
  },
  {
    id: "14",
    question: {
      en: "Genital symptoms (loss of libido, menstrual disturbances).",
    },
    type: "rating",
    score: {
      Absent: 0,
      Mild: 1,
      Severe: 2,
    },
  },
  {
    id: "15",
    question: {
      en: "Hypochondriasis (self-absorption, preoccupation with health, delusions).",
    },
    type: "rating",
    score: {
      "Not present": 0,
      "Self-absorption (bodily)": 1,
      "Preoccupation with health": 2,
      "Querulous attitude": 3,
      "Hypochondriacal delusions": 4,
    },
  },
  {
    id: "16",
    question: {
      en: "Weight loss.",
    },
    type: "rating",
    score: {
      "No weight loss": 0,
      Slight: 1,
      "Obvious or severe": 2,
    },
  },
  {
    id: "17",
    question: {
      en: "Insight - Patient’s awareness of illness.",
    },
    type: "rating",
    score: {
      "No loss": 0,
      "Partial or doubtful loss": 1,
      "Loss of insight": 2,
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
