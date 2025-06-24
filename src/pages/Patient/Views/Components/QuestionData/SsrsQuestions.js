export const cssrsQuestions = [
  {
    id: "1",
    question: {
      en: "Have you wished you were dead or wished you could go to sleep and not wake up?",
      hi: "क्या आपने कभी चाहा है कि आप मर जाएं या सो जाएं और फिर कभी न उठें?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "ideation",
    guidance: {
      en: "This question assesses passive suicidal ideation.",
      hi: "यह प्रश्न निष्क्रिय आत्मघाती विचारों का आकलन करता है।",
    },
  },
  {
    id: "2",
    question: {
      en: "Have you actually had any thoughts of killing yourself?",
      hi: "क्या वास्तव में आपके मन में खुद को मारने का विचार आया है?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "ideation",
    guidance: {
      en: "This assesses active suicidal ideation.",
      hi: "यह सक्रिय आत्मघाती विचारों का आकलन करता है।",
    },
  },
  {
    id: "3",
    question: {
      en: "Have you had any thoughts about how you might kill yourself?",
      hi: "क्या आपने इस बारे में सोचा है कि आप खुद को कैसे मार सकते हैं?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "ideation",
    guidance: {
      en: "This assesses method ideation.",
      hi: "यह आत्महत्या की विधि के बारे में विचारों का आकलन करता है।",
    },
  },
  {
    id: "4",
    question: {
      en: "Have you had these thoughts and had some intention of acting on them?",
      hi: "क्या आपके मन में ये विचार आए हैं और उन्हें करने का इरादा भी था?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "ideation",
    guidance: {
      en: "This assesses intent.",
      hi: "यह आत्मघाती इरादे का मूल्यांकन करता है।",
    },
  },
  {
    id: "5",
    question: {
      en: "Have you worked out the details of how to kill yourself? Do you intend to carry out this plan?",
      hi: "क्या आपने आत्महत्या करने की योजना बनाई है? क्या आप इसे पूरा करने का इरादा रखते हैं?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "ideation",
    guidance: {
      en: "This assesses plan and intent to carry out.",
      hi: "यह योजना और उस पर अमल के इरादे का आकलन करता है।",
    },
  },
  {
    id: "6",
    question: {
      en: "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
      hi: "क्या आपने कभी कुछ ऐसा किया, शुरू किया या तैयारी की जो आपकी जान ले सकता था?",
    },
    type: "binary",
    score: { yes: 1, no: 0 },
    domain: "behavior",
    guidance: {
      en: "This assesses actual attempt.",
      hi: "यह आत्महत्या के प्रयास का आकलन करता है।",
    },
  },
  {
    id: "7",
    question: {
      en: "In the past week, have you had any of these thoughts/behaviors?",
      hi: "पिछले सप्ताह में क्या आपके मन में ऐसे कोई विचार या व्यवहार आए थे?",
    },
    type: "text",
    score: { yes: 1, no: 0 }, // not scored in current logic but kept for structure
    domain: "behavior",
    guidance: {
      en: "Asks about the recency of any positive responses. Note details if 'yes'.",
      hi: "हाल की सकारात्मक प्रतिक्रियाओं के बारे में पूछता है। यदि 'हाँ', तो विवरण लिखें।",
    },
  },
];

export const calculateScore = (answers) => {
  let totalScore = 0;
  let ideationScore = 0;
  let behaviorScore = 0;

  cssrsQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (!answer) return;

    if (q.type === "binary") {
      const scoreValue = q.score?.[answer] ?? 0;
      totalScore += scoreValue;

      if (q.domain === "ideation") ideationScore += scoreValue;
      else if (q.domain === "behavior") behaviorScore += scoreValue;
    }

    if (
      q.id === "7" &&
      typeof answer === "string" &&
      answer.toLowerCase() === "yes"
    ) {
      totalScore += 2;
      behaviorScore += 2;
    }
  });

  let riskLevel = "Minimal Risk";
  if (totalScore >= 5 || behaviorScore >= 1) {
    riskLevel = "High Risk (Suicidal Behavior/Plan)";
  } else if (totalScore >= 3 && ideationScore >= 2) {
    riskLevel = "Moderate Risk (Specific Ideation/Intent)";
  } else if (totalScore >= 1 && ideationScore >= 1) {
    riskLevel = "Low Risk (Suicidal Ideation Present)";
  }

  return {
    totalScore,
    ideationScore,
    behaviorScore,
    riskLevel,
  };
};

export const generateInterpretation = (assessmentData) => {
  const { patientName, score } = assessmentData;
  const { riskLevel } = score;

  let text = "";
  let recommendations = "";

  switch (riskLevel) {
    case "High Risk (Suicidal Behavior/Plan)":
      text = `${patientName} is currently assessed at a HIGH risk for suicide due to presence of suicidal behavior or high total score.`;
      recommendations = [
        "1. Emergency psychiatric evaluation",
        "2. Possible hospitalization",
        "3. Remove access to lethal means",
        "4. Close monitoring",
      ].join("\n");
      break;

    case "Moderate Risk (Specific Ideation/Intent)":
      text = `${patientName} is assessed at a MODERATE risk for suicide based on ideation with intent or planning.`;
      recommendations = [
        "1. Develop safety plan",
        "2. Refer to mental health professional",
        "3. Schedule follow-up",
      ].join("\n");
      break;

    case "Low Risk (Suicidal Ideation Present)":
      text = `${patientName} is assessed at a LOW risk for suicide with general suicidal ideation but no intent or plan.`;
      recommendations = [
        "1. Provide psychoeducation",
        "2. Encourage coping skills",
        "3. Monitor regularly",
      ].join("\n");
      break;

    default:
      text = `${patientName} is currently assessed at MINIMAL risk for suicide with no significant suicidal ideation or behavior.`;
      recommendations = [
        "1. Continue routine care",
        "2. Encourage protective factors",
        "3. Promote help-seeking behavior",
      ].join("\n");
  }

  return {
    interpretationText: text,
    recommendationsText: recommendations,
  };
};
