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
    guidance: {
      en: "Rate based on patient's verbal report and nonverbal behavior (e.g., facial expression, demeanor).",
      hi: "मरीज़ की मौखिक रिपोर्ट और गैर-मौखिक व्यवहार (जैसे चेहरे के भाव, आचरण) के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Distinguish between self-reproach (score - Mild) and definite delusions (score - Incapacitating).",
      hi: "स्वयं को दोष देने (स्कोर - हल्का) और स्पष्ट भ्रम (स्कोर - अक्षमकारी) के बीच अंतर करें।"
    }
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
    guidance: {
      en: "Rate based on verbal statements and presence of suicidal ideation or attempts.",
      hi: "मौखिक बयानों और आत्महत्या के विचार या प्रयास की उपस्थिति के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Difficulty falling asleep (within 30 minutes).",
      hi: "नींद आने में कठिनाई (30 मिनट के भीतर)।"
    }
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
    guidance: {
      en: "Waking during the night, excluding early morning awakening.",
      hi: "रात में जागना, सुबह जल्दी जागने को छोड़कर।"
    }
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
    guidance: {
      en: "Waking early and inability to go back to sleep (before 4 AM/2 hours before usual).",
      hi: "सुबह जल्दी जागना और फिर से सो न पाना (सुबह 4 बजे से पहले / सामान्य समय से 2 घंटे पहले)।"
    }
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
    guidance: {
      en: "Rate on loss of interest, lack of energy, or inability to perform tasks.",
      hi: "रुचि की कमी, ऊर्जा की कमी, या कार्य करने में असमर्थता के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate based on patient's thought, speech, and motor activity.",
      hi: "मरीज़ के विचार, भाषण, और गतिशीलता के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate based on patient's observed restlessness, fidgeting, and pacing.",
      hi: "मरीज़ की देखी गई बेचैनी, फिजेटिंग और आगे-पीछे चलने के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Subjective feelings of tension, apprehension, and worry.",
      hi: "तनाव, आशंका और चिंता की व्यक्तिपरक भावनाएँ।"
    }
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
    guidance: {
      en: "Physical symptoms of anxiety (e.g., GI, cardiovascular, or respiratory symptoms).",
      hi: "चिंता के शारीरिक लक्षण (जैसे पाचन, हृदय-संबंधी, या श्वसन संबंधी लक्षण)।"
    }
  },
  {
    id: "12",
    question: {
      en: "Somatic symptoms - Gastrointestinal.",
      hi: "शारीरिक लक्षण – पाचन तंत्र"
    },
    type: "mutiple",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
    guidance: {
      en: "Rate on loss of appetite, heavy feeling in abdomen, or constipation.",
      hi: "भूख की कमी, पेट में भारीपन, या कब्ज़ के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate on heaviness in limbs, backaches, headaches, or muscle pain.",
      hi: "अंगों में भारीपन, पीठ या सिर में दर्द, या मांसपेशियों में दर्द के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate on loss of libido or menstrual disturbances.",
      hi: "कामेच्छा की कमी या मासिक धर्म में असामान्यताओं के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate on preoccupation with bodily health, perceived illness, or delusions.",
      hi: "शारीरिक स्वास्थ्य के प्रति अत्यधिक चिंतन, महसूस की गई बीमारी, या भ्रम के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate on weight loss over the past week/recent time frame.",
      hi: "पिछले सप्ताह/हाल के समय में वजन में कमी के आधार पर मूल्यांकन करें।"
    }
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
    guidance: {
      en: "Rate on patient's self-awareness of being ill and its psychiatric nature.",
      hi: "मरीज़ की अपनी बीमारी और उसके मानसिक स्वभाव के प्रति आत्म-जागरूकता के आधार पर मूल्यांकन करें।"
    }
  },
  {
    id: "18",
    question: {
      en: "Diurnal Variation.",
      hi: "दिन-प्रतिदिन परिवर्तन।"
    },
    type: "optional",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
    guidance: {
      en: "Rate on mood fluctuation (worse in morning/evening).",
      hi: "मूड में उतार-चढ़ाव (सुबह/शाम में अधिक खराब) के आधार पर मूल्यांकन करें।"
    }
  },
  {
    id: "19",
    question: {
      en: "Depersonalization and Derealization.",
      hi: "व्यक्तिविच्छेदन और वास्तविकता विच्छेदन।"
    },
    type: "optional",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
    guidance: {
      en: "Subjective feelings of unreality, nihilistic ideas.",
      hi: "अवास्तविकता की व्यक्तिपरक भावनाएँ, और शून्यवादात्मक विचार।"
    }
  },
  {
    id: "20",
    question: {
      en: "Paranoid Symptoms",
      hi: "संदेहवादी लक्षण।"
    },
    type: "optional",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
    guidance: {
      en: "Ideas of reference, persecution, or delusional content.",
      hi: "संदर्भ के विचार, उत्पीड़न, या भ्रांतिकारी सामग्री।"
    }
  },
  {
    id: "21",
    question: {
      en: "Obsessional and Compulsive Symptoms",
      hi: "आवधिक और बाध्यकारी लक्षण।"
    },
    type: "optional",
    score: {
      Absent: 0,
      "Doubtful or trivial": 1,
      present: 2,
    },
    guidance: {
      en: "Obsessive thoughts or compulsive acts.",
      hi: "आवधिक विचार या बाध्यकारी क्रियाएँ।"
    }
  }
];

export const calculateScores = (answers) => {
  let totalScore = 0;
  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = hamdQuestions.find((q) => q.id === questionId && q.type !== "optional");
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
    severity = "Moderate";
    interpretation =
      "Moderate depressive symptoms, with noticeable but manageable effects on daily functioning.";
    recommendations =
      "Recommend formal psychotherapy, review need for medication especially if functional impairment is present, and reinforce support systems.";
  } else if (totalScore > 17) {
    severity = "Severe";
    interpretation =
      "Severe symptoms, substantial impact on daily living and functioning, potentially associated with risk factors such as suicidal ideation.";
    recommendations =
      "Strongly recommend psychiatric/mental health referral. Consider combined treatment with medication and psychotherapy. Evaluate risk factors and safety as a priority.";
  }

  return { severity, interpretation, recommendations };
};
