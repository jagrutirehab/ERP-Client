export const ybocsQuestions = [
  {
    id: "1",
    question: {
      en: "Time Spent: How much of your time is occupied by obsessive thoughts?",
      hi: "समय व्यतीत: आपके जुनूनी विचारों में आपका कितना समय व्यतीत होता है?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (<1 hr/day)": 1,
      "Moderate (1–3 hrs/day)": 2,
      "Severe (3–8 hrs/day)": 3,
      "Extreme (>8 hrs/day)": 4,
    },
    domain: "Obsessions",
    guidance: {
      en: "Assess the proportion of waking time spent on obsessions",
      hi: "जागते समय का वह अनुपात आंके जो जुनूनी विचारों में व्यतीत होता है।",
    },
  },
  {
    id: "2",
    question: {
      en: "Interference: To what extent do your obsessive thoughts interfere with your work, school, social activities, or relationships?",
      hi: "हस्तक्षेप: आपके जुनूनी विचार आपके काम, पढ़ाई, सामाजिक गतिविधियों या संबंधों में किस हद तक बाधा डालते हैं?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (slight interference)": 1,
      "Moderate (definite interference)": 2,
      "Severe (causes considerable interference": 3,
      "Extreme (incapacitating)": 4,
    },
    domain: "Obsessions",
    guidance: {
      en: "Evaluate the impact of obsessions on daily functioning.",
      hi: "दैनिक कार्यक्षमता पर जुनूनी विचारों के प्रभाव का मूल्यांकन करें।",
    },
  },
  {
    id: "3",
    question: {
      en: "Distress: How much distress do your obsessive thoughts cause you",
      hi: "कष्ट: आपके जुनूनी विचार आपको कितना कष्ट देते हैं?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (rarely disturbing)": 1,
      "Moderate (disturbing but manageable)": 2,
      "Severe (very distressing)": 3,
      "Extreme (near constant distress)": 4,
    },
    domain: "Obsessions",
    guidance: {
      en: "Evaluates emotional distress from obsessive thoughts.",
      hi: "जुनूनी विचारों के कारण होने वाले भावनात्मक असुविधा को मापें।",
    },
  },
  {
    id: "4",
    question: {
      en: "Resistance: How much do you try to resist your obsessive thoughts?",
      hi: "प्रतिरोध: आप अपने जुनूनी विचारों का कितना विरोध करने की कोशिश करते हैं?",
    },
    type: "multiple",
    score: {
      "Always resist": 0,
      "Usually resist": 1,
      "Sometimes resist": 2,
      "Rarely resist": 3,
      "Never resist": 4,
    },
    domain: "Obsessions",
    guidance: {
      en: "Assesses the ability to resist obsessive thoughts.",
      hi: "मरीज़ के जुनूनी विचारों के विरुद्ध संघर्ष करने के प्रयास का आकलन करें।",
    },
  },
  {
    id: "5",
    question: {
      en: "Control: How much control do you feel you have over your obsessive thoughts?",
      hi: "नियंत्रण: आपको अपने जुनूनी विचारों पर कितना नियंत्रण महसूस होता है?",
    },
    type: "multiple",
    score: {
      "Complete control": 0,
      "Much control": 1,
      "Moderate control": 2,
      "Little control": 3,
      "No control": 4,
    },
    domain: "Obsessions",
    guidance: {
      en: "Determine the patient's perceived ability to stop or dismiss obsessions.",
      hi: "मरीज़ की जुनूनी विचारों को रोकने या नज़रअंदाज़ करने की अनुभव की गई क्षमता का निर्धारण करें।",
    },
  },

  {
    id: "6",
    question: {
      en: "Time Spent: How much of your time is occupied by compulsive behaviors?",
      hi: "समय व्यतीत: आपके बाध्यकारी व्यवहारों में आपका कितना समय व्यतीत होता है?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (<1 hr/day)": 1,
      "Moderate (1–3 hrs/day)": 2,
      "Severe (3–8 hrs/day)": 3,
      "Extreme (>8 hrs/day)": 4,
    },
    domain: "Compulsions",
    guidance: {
      en: "Assesses the daily time spent performing compulsive behaviors.",
      hi: "जागते समय का वह अनुपात आंके जो बाध्यकारी कार्यों को करने में व्यतीत होता है।",
    },
  },
  {
    id: "7",
    question: {
      en: "Interference: To what extent do your compulsive behaviors interfere with your work, school, social activities, or relationships?",
      hi: "हस्तक्षेप: आपके बाध्यकारी व्यवहार आपके काम, पढ़ाई, सामाजिक गतिविधियों या संबंधों में किस हद तक बाधा डालते हैं?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (slight interference)": 1,
      "Moderate (definite interference)": 2,
      "Severe (causes considerable interference)": 3,
      "Extreme (incapacitating)": 4,
    },
    domain: "Compulsions",
    guidance: {
      en: "Evaluate the impact of compulsions on daily functioning.",
      hi: "दैनिक कार्यक्षमता पर बाध्यकारी व्यवहारों के प्रभाव का मूल्यांकन करें।",
    },
  },
  {
    id: "8",
    question: {
      en: "Distress: How much distress do your compulsive behaviors cause you?",
      hi: "कष्ट: आपके बाध्यकारी व्यवहारों से आपको कितना कष्ट होता है?",
    },
    type: "multiple",
    score: {
      None: 0,
      "Mild (rarely disturbing)": 1,
      "Moderate (disturbing but manageable)": 2,
      "Severe (very distressing)": 3,
      "Extreme (near constant distress)": 4,
    },
    domain: "Compulsions",
    guidance: {
      en: "Quantify the emotional discomfort due to compulsions.",
      hi: "बाध्यकारी व्यवहारों के कारण होने वाली भावनात्मक असुविधा को मापें।",
    },
  },
  {
    id: "9",
    question: {
      en: "Resistance: How much do you try to resist your compulsive behaviors?",
      hi: "प्रतिरोध: आप अपने बाध्यकारी व्यवहारों का कितना विरोध करने की कोशिश करते हैं",
    },
    type: "multiple",
    score: {
      "Always resist": 0,
      "Usually resist": 1,
      "Sometimes resist": 2,
      "Rarely resist": 3,
      "Never resist": 4,
    },
    domain: "Compulsions",
    guidance: {
      en: "Assesses the ability to resist compulsive acts.",
      hi: "मरीज़ के बाध्यकारी व्यवहारों के विरुद्ध संघर्ष करने के प्रयास का आकलन करें।",
    },
  },
  {
    id: "10",
    question: {
      en: "Control: How much control do you feel you have over your compulsive behaviors?",
      hi: "नियंत्रण: आपको अपने बाध्यकारी व्यवहारों पर कितना नियंत्रण महसूस होता है?",
    },
    type: "multiple",
    score: {
      "Complete control": 0,
      "Much control": 1,
      "Moderate control": 2,
      "Little control": 3,
      "No control": 4,
    },
    domain: "Compulsions",
    guidance: {
      en: "Determine the patient's perceived ability to stop or dismiss compulsions.",
      hi: "मरीज़ की बाध्यकारी व्यवहारों को रोकने या नज़रअंदाज़ करने की अनुभव की गई क्षमता का निर्धारण करें।",
    },
  },
];

export const calculateScores = (answers) => {
  const scores = {
    totalScore: 0,
  };

  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = ybocsQuestions.find((q) => q.id === questionId);
    if (question && question.score && question.domain) {
        const scoreValue = question.score[answerValue] ?? 0;
        scores.totalScore += scoreValue;
    }
  }

  return scores;
};

export const getInterpretationAndRecommendations = (subscaleScores) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (subscaleScores.totalScore >= 0 && subscaleScores.totalScore <= 7) {
    severity = "Subclinical";
    interpretation =
      "Your score suggests that you are experiencing minimal or no symptoms of Obsessive-Compulsive Disorder (OCD). The presence of obsessions and compulsions, if any, is not significantly impacting your daily life.";
    recommendations =
      "Continue to monitor your mental well-being. If any symptoms emerge or worsen, consider consulting a mental health professional for a comprehensive evaluation.";
  } else if (subscaleScores.totalScore >= 8 && subscaleScores.totalScore <= 15) {
    severity = "Mild";
    interpretation =
      "Your score indicates mild symptoms of OCD. Obsessive thoughts and compulsive behaviors may be present but cause limited interference with daily activities and minimal distress.";
    recommendations =
      "It is advisable to discuss these symptoms with a mental health professional. Early intervention, such as cognitive-behavioral therapy (CBT) or exposure and response prevention (ERP), can be highly effective in managing mild symptoms.";
  } else if (subscaleScores.totalScore >= 16 && subscaleScores.totalScore <= 23) {
    severity = "Moderate";
    interpretation =
      "Your score suggests moderate OCD symptoms. Obsessions and compulsions are likely causing noticeable interference with your work, social life, and personal activities, and are associated with moderate distress.";
    recommendations =
      "Professional help is strongly recommended. A comprehensive treatment plan, often involving a combination of psychotherapy (e.g., ERP) and potentially medication, can significantly reduce symptoms and improve quality of life. Consider seeking a specialist in OCD treatment.";
  } else if (subscaleScores.totalScore >= 24 && subscaleScores.totalScore <= 31) {
    severity = "Severe";
    interpretation =
      "Your score points to severe OCD symptoms. Obsessive thoughts and compulsive behaviors are consuming a significant portion of your time, causing considerable interference in most areas of your life, and leading to high levels of distress.";
    recommendations =
      "Immediate and intensive professional intervention is crucial. This may involve specialized psychotherapy (e.g., intensive ERP), medication management, and potentially higher levels of care. Consult with an OCD specialist or a multidisciplinary team for a tailored treatment approach.";
  } else if (subscaleScores.totalScore >= 32 && subscaleScores.totalScore <= 40) {
    severity = "Extreme";
    interpretation =
      "Your score indicates extreme OCD symptoms. Obsessions and compulsions are pervasive, incapacitating, and cause overwhelming distress, making it extremely difficult to function in daily life.";
    recommendations =
      "Urgent and comprehensive clinical intervention is required. This often involves intensive outpatient programs, partial hospitalization, or residential treatment, along with aggressive pharmacotherapy and specialized psychotherapeutic interventions. A dedicated OCD treatment center would be highly beneficial.";
  }

  return {
    severity,
    interpretation,
    recommendations,
  };
};
