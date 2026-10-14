export const morseFallQuestions = [
  {
    id: "1",
    question: {
      en: "History of falling (immediate or within 3 months).",
      hi: "गिरने का इतिहास (तत्काल या 3 महीने के भीतर)।",
    },
    type: "multiple",
    score: {
      No: 0,
      Yes: 25,
    },
    guidance: {
      en: "Ask the patient or check medical records for any documented fall within the past 3 months or during the current admission.",
      hi: "पिछले 3 महीनों में या वर्तमान प्रवेश के दौरान किसी दर्ज गिरावट के लिए रोगी से पूछें या चिकित्सा रिकॉर्ड देखें।",
    },
  },
  {
    id: "2",
    question: {
      en: "Secondary diagnosis (more than one medical diagnosis present).",
      hi: "द्वितीयक निदान (एक से अधिक चिकित्सा निदान मौजूद)।",
    },
    type: "multiple",
    score: {
      No: 0,
      Yes: 15,
    },
    guidance: {
      en: "Score Yes if more than one active medical diagnosis is listed in the patient's chart.",
      hi: "यदि रोगी के चार्ट में एक से अधिक सक्रिय चिकित्सा निदान सूचीबद्ध हैं तो हाँ अंकित करें।",
    },
  },
  {
    id: "3",
    question: {
      en: "Ambulatory aid.",
      hi: "चलने में सहायक उपकरण।",
    },
    type: "multiple",
    score: {
      "None / Bed rest / Nurse assist": 0,
      Crutches: 15,
      "Cane / Walker": 15,
      "Furniture (holds onto furniture while walking)": 30,
    },
    guidance: {
      en: "Observe or ask what the patient currently uses to ambulate. If patient is on bed rest or walks with nurse assistance only, score 0.",
      hi: "देखें या पूछें कि रोगी वर्तमान में चलने के लिए क्या उपयोग करता है। यदि रोगी बिस्तर पर है या केवल नर्स की सहायता से चलता है, तो 0 अंक दें।",
    },
  },
  {
    id: "4",
    question: {
      en: "IV / Heparin lock (intravenous therapy or saline lock in use).",
      hi: "IV / हेपरिन लॉक (अंतःशिरा चिकित्सा या सलाइन लॉक उपयोग में)।",
    },
    type: "multiple",
    score: {
      No: 0,
      Yes: 20,
    },
    guidance: {
      en: "Score Yes if the patient currently has an IV infusion or saline/heparin lock in place.",
      hi: "यदि रोगी के पास वर्तमान में IV इन्फ्यूजन या सलाइन/हेपरिन लॉक लगा है, तो हाँ अंकित करें।",
    },
  },
  {
    id: "5",
    question: {
      en: "Gait / Transferring.",
      hi: "चाल / स्थानांतरण।",
    },
    type: "multiple",
    score: {
      Normal: 0,
      "Weak (short steps, stooped, shuffles)": 10,
      "Impaired (unable to maintain balance, lurching gait)": 20,
    },
    guidance: {
      en: "Observe the patient walking. Normal = steady, erect. Weak = short steps, stooped, shuffles. Impaired = unable to maintain balance without support.",
      hi: "रोगी को चलते हुए देखें। सामान्य = स्थिर, सीधा। कमज़ोर = छोटे कदम, झुका हुआ, घसीटते हुए। बाधित = बिना सहायता के संतुलन बनाए रखने में असमर्थ।",
    },
  },
  {
    id: "6",
    question: {
      en: "Mental status.",
      hi: "मानसिक स्थिति।",
    },
    type: "multiple",
    score: {
      "Oriented to own ability": 0,
      "Overestimates / Forgets limitations": 15,
    },
    guidance: {
      en: "Ask the patient 'Can you go to the bathroom alone?' If the patient's response is consistent with their actual ability, score 0. If they overestimate ability or forget limitations, score 15.",
      hi: "रोगी से पूछें 'क्या आप अकेले शौचालय जा सकते हैं?' यदि रोगी का उत्तर उनकी वास्तविक क्षमता के अनुरूप है, तो 0 अंक दें। यदि वे क्षमता को अधिक आंकते हैं या सीमाएँ भूल जाते हैं, तो 15 अंक दें।",
    },
  },
];

export const calculateScores = (answers) => {
  let totalScore = 0;
  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = morseFallQuestions.find(
      (q) => q.id === questionId && q.type !== "optional"
    );
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

  if (totalScore <= 24) {
    severity = "No Risk";
    interpretation =
      "The patient shows no significant risk of falling based on current clinical indicators. All assessed domains are within safe parameters.";
    recommendations =
      "Maintain standard safety practices. Orient patient to environment. Ensure call bell is within reach. Reassess if condition changes.";
  } else if (totalScore >= 25 && totalScore <= 50) {
    severity = "Low Risk";
    interpretation =
      "The patient is at low risk for falls. One or more minor risk factors are present but the overall risk profile remains manageable with standard precautions.";
    recommendations =
      "Implement standard fall prevention protocols. Educate patient about fall risks. Ensure a clear path to the bathroom. Non-slip footwear should be worn. Reassess every shift or if clinical status changes.";
  } else if (totalScore >= 51) {
    severity = "High Risk";
    interpretation =
      "The patient is at high risk for falls. Multiple significant fall risk factors are present, requiring immediate implementation of intensive fall prevention measures.";
    recommendations =
      "Initiate high-risk fall prevention protocol immediately. Place fall risk identification band and bed signage. Keep bed in lowest position with side rails up. Increase observation frequency. Consider bed alarm. Refer to physiotherapy for mobility assessment. Review medications for fall-risk contributors. Educate patient and family.";
  }

  return { severity, interpretation, recommendations };
};