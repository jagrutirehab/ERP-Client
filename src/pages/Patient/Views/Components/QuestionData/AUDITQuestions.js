// AUDIT — Alcohol Use Disorders Identification Test
// Source: Saunders et al. (1993). Addiction, 88, 791–804. WHO/MSD/MSB/01.6a.
// Public domain — WHO instrument, free to reproduce for clinical/EMR use.
//
// SKIP LOGIC (must be enforced in the Assessment component):
//   Rule 1 — If Q1 = "Never" (score 0): auto-score Q2–Q8 as 0, show only Q1, Q9, Q10.
//   Rule 2 — If Q2 score + Q3 score = 0: auto-score Q4–Q8 as 0, show only Q1–Q3, Q9, Q10.
//   Skipped items always contribute 0 to the total.

export const auditQuestions = [
  {
    id: "1",
    question: {
      en: "How often do you have a drink containing alcohol?",
      hi: "आप कितनी बार शराब युक्त पेय पीते हैं?",
    },
    type: "multiple",
    skipsOnNever: true, // Rule 1: if "Never", skip Q2–Q8
    score: {
      Never: 0,
      "Monthly or less": 1,
      "2–4 times per month": 2,
      "2–3 times per week": 3,
      "4 or more times per week": 4,
    },
    guidance: {
      en: "Questions refer to the past year. Use local examples (beer, wine, spirits) to clarify what counts as a drink.",
      hi: "प्रश्न पिछले वर्ष से संबंधित हैं। यह स्पष्ट करने के लिए स्थानीय उदाहरणों (बीयर, वाइन, स्पिरिट्स) का उपयोग करें कि एक पेय क्या होता है।",
    },
  },
  {
    id: "2",
    question: {
      en: "How many drinks containing alcohol do you have on a typical day when you are drinking?",
      hi: "जब आप पीते हैं तो एक सामान्य दिन में आप कितने पेय लेते हैं?",
    },
    type: "multiple",
    skippable: true, // skipped if Q1 = Never
    score: {
      "1–2": 0,
      "3–4": 1,
      "5–6": 2,
      "7–9": 3,
      "10 or more": 4,
    },
    guidance: {
      en: "Count standard drink units. If this and Q3 both score 0, questions 4–8 will be skipped.",
      hi: "मानक पेय इकाइयाँ गिनें। यदि यह और Q3 दोनों 0 स्कोर करते हैं, तो प्रश्न 4–8 छोड़े जाएंगे।",
    },
  },
  {
    id: "3",
    question: {
      en: "How often do you have six or more drinks on one occasion?",
      hi: "आप एक अवसर पर छह या अधिक पेय कितनी बार लेते हैं?",
    },
    type: "multiple",
    skippable: true, // skipped if Q1 = Never
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Identify episodes of heavy or binge drinking. If this and Q2 both score 0, questions 4–8 will be skipped.",
      hi: "भारी या बिंज ड्रिंकिंग के एपिसोड की पहचान करें। यदि यह और Q2 दोनों 0 स्कोर करते हैं, तो प्रश्न 4–8 छोड़े जाएंगे।",
    },
  },
  {
    id: "4",
    question: {
      en: "How often during the last year have you found that you were not able to stop drinking once you had started?",
      hi: "पिछले एक साल में आप कितनी बार एक बार शुरू करने के बाद पीना बंद नहीं कर पाए?",
    },
    type: "multiple",
    skippable: true, // skipped if Q1 = Never OR Q2+Q3 = 0
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Assess impaired control over alcohol consumption in the last year.",
      hi: "पिछले एक वर्ष में शराब सेवन पर नियंत्रण की कमी का आकलन करें।",
    },
  },
  {
    id: "5",
    question: {
      en: "How often during the last year have you failed to do what was normally expected of you because of drinking?",
      hi: "पिछले एक साल में आप शराब के कारण कितनी बार अपेक्षित कार्य करने में विफल रहे?",
    },
    type: "multiple",
    skippable: true,
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Assess failure to fulfil role obligations (work, family, social) due to alcohol use.",
      hi: "शराब के कारण भूमिका संबंधी दायित्वों (कार्य, परिवार, सामाजिक) को पूरा न करने का आकलन करें।",
    },
  },
  {
    id: "6",
    question: {
      en: "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?",
      hi: "पिछले एक साल में आप कितनी बार भारी पीने के बाद सुबह खुद को तैयार करने के लिए पहले पेय की जरूरत महसूस की?",
    },
    type: "multiple",
    skippable: true,
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Identify morning drinking (eye-opener) as an indicator of dependence.",
      hi: "निर्भरता के संकेतक के रूप में सुबह की शराब पीने (आई-ओपनर) की पहचान करें।",
    },
  },
  {
    id: "7",
    question: {
      en: "How often during the last year have you had a feeling of guilt or remorse after drinking?",
      hi: "पिछले एक साल में आप कितनी बार पीने के बाद अपराध बोध या पछतावा महसूस किया?",
    },
    type: "multiple",
    skippable: true,
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Assess feelings of guilt or remorse related to drinking behaviour in the last year.",
      hi: "पिछले एक वर्ष में शराब पीने की आदत से संबंधित अपराध बोध या पछतावे का आकलन करें।",
    },
  },
  {
    id: "8",
    question: {
      en: "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
      hi: "पिछले एक साल में आप कितनी बार शराब पीने के कारण पिछली रात की घटनाएं याद नहीं कर पाए?",
    },
    type: "multiple",
    skippable: true,
    score: {
      Never: 0,
      "Less than monthly": 1,
      Monthly: 2,
      Weekly: 3,
      "Daily or almost daily": 4,
    },
    guidance: {
      en: "Identify alcohol-related blackouts or memory impairment in the last year.",
      hi: "पिछले एक वर्ष में शराब से संबंधित ब्लैकआउट या स्मृति दुर्बलता की पहचान करें।",
    },
  },
  {
    id: "9",
    question: {
      en: "Have you or someone else been injured as a result of your drinking?",
      hi: "क्या आप या किसी अन्य व्यक्ति को आपके पीने के कारण चोट लगी है?",
    },
    type: "multiple",
    score: {
      No: 0,
      "Yes, but not in the last year": 2,
      "Yes, during the last year": 4,
    },
    guidance: {
      en: "Identify alcohol-related physical harm to self or others (not time-limited to last year).",
      hi: "स्वयं या दूसरों को शराब से संबंधित शारीरिक नुकसान की पहचान करें (पिछले वर्ष तक सीमित नहीं)।",
    },
  },
  {
    id: "10",
    question: {
      en: "Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down?",
      hi: "क्या किसी रिश्तेदार, दोस्त, डॉक्टर या स्वास्थ्य कर्मचारी ने आपकी शराब पीने की आदत के बारे में चिंता जताई है या इसे कम करने की सलाह दी है?",
    },
    type: "multiple",
    score: {
      No: 0,
      "Yes, but not in the last year": 2,
      "Yes, during the last year": 4,
    },
    guidance: {
      en: "Identify external concern about the patient's drinking from family, friends, or healthcare professionals.",
      hi: "परिवार, दोस्तों या स्वास्थ्य पेशेवरों से रोगी की शराब पीने की आदत के बारे में बाहरी चिंता की पहचान करें।",
    },
  },
];

// Compute which questions are visible given current answers
export const getVisibleQuestions = (answers) => {
  const q1Answer = answers["1"];
  const q1Score =
    q1Answer !== undefined ? auditQuestions[0].score[q1Answer] : null;

  // Rule 1: Q1 = Never → show only Q1, Q9, Q10
  if (q1Score === 0) {
    return auditQuestions.filter((q) => ["1", "9", "10"].includes(q.id));
  }

  const q2Answer = answers["2"];
  const q3Answer = answers["3"];
  const q2Score =
    q2Answer !== undefined ? auditQuestions[1].score[q2Answer] : null;
  const q3Score =
    q3Answer !== undefined ? auditQuestions[2].score[q3Answer] : null;

  // Rule 2: Q2 + Q3 both 0 → show Q1–Q3, Q9, Q10
  if (q2Score === 0 && q3Score === 0) {
    return auditQuestions.filter((q) =>
      ["1", "2", "3", "9", "10"].includes(q.id),
    );
  }

  return auditQuestions;
};

// Auto-fill skipped questions as 0 before submitting
export const applySkipLogic = (answers) => {
  const filled = { ...answers };
  const visible = getVisibleQuestions(answers);
  const visibleIds = visible.map((q) => q.id);

  auditQuestions.forEach((q) => {
    if (!visibleIds.includes(q.id)) {
      // Skipped — assign the 0-score option key
      const zeroKey = Object.keys(q.score).find((k) => q.score[k] === 0);
      filled[q.id] = zeroKey;
    }
  });

  return filled;
};

export const calculateScores = (answers) => {
  const filled = applySkipLogic(answers);
  return auditQuestions.reduce((total, q) => {
    const answer = filled[q.id];
    if (!answer) return total;
    return total + (q.score[answer] ?? 0);
  }, 0);
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore <= 7) {
    severity = "Low Risk";
    interpretation =
      "Patient's alcohol use is within low-risk limits and is unlikely to be causing harm.";
    recommendations =
      "No action beyond standard intake documentation. Provide brief alcohol education if appropriate.";
  } else if (totalScore <= 15) {
    severity = "Hazardous Use";
    interpretation =
      "Patient's drinking pattern is hazardous and places them at increased risk of harm.";
    recommendations =
      "Alert: note in care plan. Provide brief motivational intervention. Incorporate into relapse-prevention planning.";
  } else if (totalScore <= 19) {
    severity = "Harmful Use";
    interpretation =
      "Patient's drinking is causing physical or psychological harm.";
    recommendations =
      "Alert: note in care plan. Incorporate into relapse-prevention planning. Consider referral for specialist alcohol treatment.";
  } else {
    severity = "Possible Dependence";
    interpretation =
      "Patient's drinking pattern is consistent with possible alcohol dependence.";
    recommendations =
      "Alert: flag for intensified relapse-prevention planning ahead of discharge. Assess for withdrawal risk. Consider pharmacological support.";
  }

  return { severity, interpretation, recommendations };
};
