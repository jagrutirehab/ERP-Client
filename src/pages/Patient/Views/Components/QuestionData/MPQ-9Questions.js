export const mpq9Questions = [
  {
    id: "1",
    question: {
      en: "Do you sometimes hear voices or see things that others don't?",
      hi: "क्या आपको कभी-कभी ऐसी आवाजें सुनाई देती हैं या चीजें दिखाई देती हैं जो दूसरों को नहीं दिखतीं?",
    },
    type: "multiple",
    score: { often: 2, sometimes: 1, never: 0 },
    domain: "Psychoticism",
    guidance: {
      en: "Assesses perceptual disturbances commonly seen in psychotic disorders.",
      hi: "यह प्रश्न मनोविकृति विकारों में देखी जाने वाली धारणा संबंधी गड़बड़ियों का आकलन करता है।",
    },
  },
  {
    id: "2",
    question: {
      en: "Do you worry a lot about everyday things?",
      hi: "क्या आप रोज़मर्रा की चीज़ों को लेकर बहुत चिंतित रहते हैं?",
    },
    type: "multiple",
    score: { often: 2, sometimes: 1, never: 0 },
    domain: "Neuroticism",
    guidance: {
      en: "Measures tendency to experience chronic worry or anxiety.",
      hi: "यह प्रश्न लगातार चिंता या तनाव की प्रवृत्ति को मापता है।",
    },
  },
  {
    id: "3",
    question: {
      en: "Do you feel a need to check things repeatedly?",
      hi: "क्या आपको चीजों को बार-बार जांचने की ज़रूरत महसूस होती है?",
    },
    type: "binary",
    score: { yes: 2, no: 0 },
    domain: "Obsessive Compulsive",
    guidance: {
      en: "Checks for compulsive checking behavior seen in OCD.",
      hi: "यह प्रश्न ओसीडी में देखे जाने वाले बार-बार जांचने के व्यवहार का आकलन करता है।",
    },
  },
  {
    id: "4",
    question: {
      en: "Do you experience physical symptoms like racing heart or sweating when anxious?",
      hi: "क्या चिंता के समय आपको दिल की धड़कन तेज़ होना या पसीना आना जैसे शारीरिक लक्षण होते हैं?",
    },
    type: "multiple",
    score: { often: 2, sometimes: 1, never: 0 },
    domain: "Somatization of Anxiety",
    guidance: {
      en: "Assesses somatic symptoms related to anxiety.",
      hi: "यह प्रश्न चिंता से संबंधित शारीरिक लक्षणों का आकलन करता है।",
    },
  },
  {
    id: "5",
    question: {
      en: "Do you often feel down or sad?",
      hi: "क्या आप अक्सर उदास या दुखी महसूस करते हैं?",
    },
    type: "binary",
    score: { yes: 0, no: 2 }, // Reversed scoring
    domain: "Depression",
    guidance: {
      en: "Checks for low mood, but uses reverse scoring.",
      hi: "यह प्रश्न कम मूड की जांच करता है, लेकिन इसका स्कोरिंग उल्टा है।",
    },
  },
  {
    id: "6",
    question: {
      en: "Do you sometimes find yourself exaggerating problems to others?",
      hi: "क्या आप कभी-कभी दूसरों से अपनी समस्याओं को बढ़ा-चढ़ाकर बताते हैं?",
    },
    type: "binary",
    score: { yes: 2, no: 0 },
    domain: "Hysteria",
    guidance: {
      en: "Assesses tendency to dramatize or exaggerate experiences.",
      hi: "यह प्रश्न अनुभवों को नाटकीय रूप से प्रस्तुत करने की प्रवृत्ति का आकलन करता है।",
    },
  },
  {
    id: "7",
    question: {
      en: "Do you often feel that people are trying to harm you?",
      hi: "क्या आपको अक्सर लगता है कि लोग आपको नुकसान पहुंचाना चाहते हैं?",
    },
    type: "multiple",
    score: { often: 2, sometimes: 1, never: 0 },
    domain: "Psychoticism",
    guidance: {
      en: "Evaluates paranoid thoughts or suspiciousness.",
      hi: "यह प्रश्न संदेह या पीड़ित मानसिकता का मूल्यांकन करता है।",
    },
  },
  {
    id: "8",
    question: {
      en: "Do you frequently feel tense or on edge?",
      hi: "क्या आप अक्सर तनाव में या बेचैन महसूस करते हैं?",
    },
    type: "multiple",
    score: { often: 2, sometimes: 1, never: 0 },
    domain: "Neuroticism",
    guidance: {
      en: "Assesses chronic tension or restlessness.",
      hi: "यह प्रश्न लगातार तनाव या बेचैनी का आकलन करता है।",
    },
  },
  {
    id: "9",
    question: {
      en: "Do you have repetitive thoughts that you can't get rid of?",
      hi: "क्या आपके मन में बार-बार विचार आते हैं जिन्हें आप हटा नहीं पाते?",
    },
    type: "binary",
    score: { yes: 2, no: 1 },
    domain: "Obsessive Compulsive",
    guidance: {
      en: "Screens for obsessive thought patterns.",
      hi: "यह प्रश्न जुनूनी सोच के पैटर्न की पहचान करता है।",
    },
  },
  {
    id: "10",
    question: {
      en: "Do you often feel fatigued for no clear reason?",
      hi: "क्या आप बिना किसी स्पष्ट कारण के थका हुआ महसूस करते हैं?",
    },
    type: "binary",
    score: { yes: 2, no: 0 },
    domain: "Somatization of Anxiety",
    guidance: {
      en: "Measures unexplained physical fatigue linked to anxiety.",
      hi: "यह प्रश्न चिंता से संबंधित बिना कारण की थकान का आकलन करता है।",
    },
  },
  {
    id: "11",
    question: {
      en: "Do you find yourself losing interest in activities you once enjoyed?",
      hi: "क्या आप उन गतिविधियों में रुचि खोते जा रहे हैं जिन्हें आप पहले पसंद करते थे?",
    },
    type: "multiple",
    score: { often: 2, "at times": 1, never: 0 },
    domain: "Depression",
    guidance: {
      en: "Assesses anhedonia or loss of interest.",
      hi: "यह प्रश्न आनंद की कमी या रुचि खोने का मूल्यांकन करता है।",
    },
  },
  {
    id: "12",
    question: {
      en: "Do you often feel misunderstood by others?",
      hi: "क्या आपको अक्सर लगता है कि लोग आपको समझ नहीं पाते?",
    },
    type: "binary",
    score: { yes: 2, no: 0 },
    domain: "Hysteria",
    guidance: {
      en: "Evaluates feelings of social alienation or dramatization.",
      hi: "यह प्रश्न सामाजिक अलगाव या नाटकीय व्यवहार की भावना का आकलन करता है।",
    },
  },
];

export const calculateScores = (answers) => {
  const scores = {
    totalScore: 0,
    Psychoticism: 0,
    Neuroticism: 0,
    Obsessive_Compulsive: 0,
    Somatization_of_Anxiety: 0,
    Depression: 0,
    Hysteria: 0,
  };

  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = mpq9Questions.find((q) => q.id === questionId);
    if (question && question.score && question.domain) {
      const scoreValue = question.score[answerValue] ?? 0;
      const domainKey = question.domain.replace(/\s+/g, "_");
      if (scores.hasOwnProperty(domainKey)) {
        scores[domainKey] += scoreValue;
        scores.totalScore += scoreValue;
      }
    }
  }

  return scores;
};


export const getInterpretationAndRecommendations = (subscaleScores) => {
  let interpretation = "";
  let recommendations = "";

  // Psychoticism
  if (subscaleScores.Psychoticism >= 3) {
    interpretation +=
      "Psychoticism score is elevated, suggesting a tendency towards unconventional thinking or unusual perceptions. ";
    recommendations +=
      "Further assessment for thought disturbances or perceptual anomalies is recommended.\n";
  } else {
    interpretation += "Psychoticism score is within the normal range. ";
  }

  // Neuroticism
  if (subscaleScores.Neuroticism >= 3) {
    interpretation +=
      "Neuroticism score is high, indicating increased worry, tension, and emotional reactivity. ";
    recommendations +=
      "Consider stress management techniques and coping strategies for anxiety.\n";
  } else if (subscaleScores.Neuroticism >= 1) {
    interpretation +=
      "Neuroticism score is average, suggesting some level of everyday worry. ";
  } else {
    interpretation +=
      "Neuroticism score is low, indicating good emotional balance. ";
  }

  // Obsessive Compulsive
  if (subscaleScores["Obsessive Compulsive"] >= 3) {
    interpretation +=
      "Obsessive Compulsive tendencies are noted, with a propensity for repetitive thoughts or checking behaviors. ";
    recommendations +=
      "Explore cognitive-behavioral interventions for managing obsessive thoughts and compulsive behaviors.\n";
  } else {
    interpretation += "Obsessive Compulsive score is within typical limits. ";
  }

  // Somatization of Anxiety
  if (subscaleScores["Somatization of Anxiety"] >= 3) {
    interpretation +=
      "Elevated Somatization of Anxiety suggests that anxiety is frequently expressed through physical symptoms. ";
    recommendations +=
      "Recommend exploring mind-body techniques and medical evaluation for physical symptoms.\n";
  } else {
    interpretation +=
      "Somatization of Anxiety score is within the normal range. ";
  }

  // Depression
  if (subscaleScores.Depression >= 3) {
    interpretation +=
      "The Depression score is elevated, reflecting symptoms such as low mood, loss of interest, and feelings of sadness. This indicates a significant level of depressive symptomatology. ";
    recommendations +=
      "Immediate and thorough clinical evaluation for depression is strongly recommended.**\n";
    recommendations +=
      "Consider psychotherapy (e.g., CBT, IPT) and pharmacological interventions as appropriate.\n";
    recommendations +=
      "Encourage engagement in enjoyable activities and social support.\n";
  } else if (subscaleScores.Depression >= 1) {
    interpretation +=
      "The Depression score shows some mild depressive tendencies. ";
    recommendations +=
      "Monitor symptoms closely and consider supportive counseling.\n";
  } else {
    interpretation +=
      "The Depression score is low, indicating a generally positive mood and absence of significant depressive symptoms. ";
  }

  // Hysteria
  if (subscaleScores.Hysteria >= 3) {
    interpretation +=
      "Hysteria score is elevated, suggesting a tendency to exaggerate problems or feel misunderstood. ";
    recommendations +=
      "Focus on communication skills and emotional regulation strategies.\n";
  } else {
    interpretation += "Hysteria score is within typical limits. ";
  }

  return {
    interpretationText: interpretation.trim(),
    recommendationsText: recommendations.trim(),
  };
};
