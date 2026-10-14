export const gcsQuestions = [
  {
    id: "E",
    component: "Eye Opening (E)",
    question: {
      en: "Eye Opening Response.",
      hi: "आँख खोलने की प्रतिक्रिया।",
    },
    type: "multiple",
    score: {
      "4 – Spontaneous (opens eyes without stimulation)": 4,
      "3 – To sound (opens eyes to voice or verbal command)": 3,
      "2 – To pressure (opens eyes to pain stimulus)": 2,
      "1 – None (no eye opening despite any stimulus)": 1,
    },
    guidance: {
      en: "Observe whether the patient opens their eyes spontaneously, in response to voice, in response to a pain stimulus, or not at all. Do not apply pain stimulus until lower responses have been ruled out.",
      hi: "देखें कि रोगी स्वतः, आवाज़ के जवाब में, दर्द उत्तेजना के जवाब में, या बिल्कुल नहीं आँखें खोलता है। दर्द उत्तेजना तब तक न दें जब तक निचली प्रतिक्रियाओं को नकारा न जाए।",
    },
  },
  {
    id: "V",
    component: "Verbal Response (V)",
    question: {
      en: "Verbal Response.",
      hi: "मौखिक प्रतिक्रिया।",
    },
    type: "multiple",
    score: {
      "5 – Oriented (knows who, where, when they are)": 5,
      "4 – Confused (converses but disoriented)": 4,
      "3 – Words (intelligible words but no sustained conversation)": 3,
      "2 – Sounds (moans or groans, no words)": 2,
      "1 – None (no verbal response)": 1,
    },
    guidance: {
      en: "Engage the patient verbally. Assess orientation to person, place, and time. If intubated or unable to speak, document as NT (Not Testable) and score accordingly. Do not prompt with answers.",
      hi: "रोगी से मौखिक रूप से संपर्क करें। व्यक्ति, स्थान और समय के प्रति उन्मुखता का आकलन करें। यदि इन्ट्यूबेटेड या बोलने में असमर्थ हो, तो NT (परीक्षण योग्य नहीं) दर्ज करें।",
    },
  },
  {
    id: "M",
    component: "Motor Response (M)",
    question: {
      en: "Best Motor Response.",
      hi: "सर्वश्रेष्ठ मोटर प्रतिक्रिया।",
    },
    type: "multiple",
    score: {
      "6 – Obeys commands (follows simple instructions)": 6,
      "5 – Localizes pain (moves toward painful stimulus)": 5,
      "4 – Withdrawal (pulls away from painful stimulus)": 4,
      "3 – Abnormal flexion / Decorticate posturing": 3,
      "2 – Extension / Decerebrate posturing": 2,
      "1 – None (no motor response)": 1,
    },
    guidance: {
      en: "Ask the patient to follow a simple command (e.g., 'squeeze my hand'). If unable to obey, apply central pain stimulus and observe the best response. Always record the best response from either side.",
      hi: "रोगी से एक सरल आदेश का पालन करने के लिए कहें (जैसे 'मेरा हाथ दबाएँ')। यदि आज्ञा मानने में असमर्थ हो, तो केंद्रीय दर्द उत्तेजना लागू करें और सर्वश्रेष्ठ प्रतिक्रिया देखें।",
    },
  },
];

export const calculateScores = (answers) => {
  const eyeAnswer = answers["E"];
  const verbalAnswer = answers["V"];
  const motorAnswer = answers["M"];

  const eyeQuestion = gcsQuestions.find((q) => q.id === "E");
  const verbalQuestion = gcsQuestions.find((q) => q.id === "V");
  const motorQuestion = gcsQuestions.find((q) => q.id === "M");

  const eyeScore = eyeAnswer ? (eyeQuestion?.score?.[eyeAnswer] ?? 0) : 0;
  const verbalScore = verbalAnswer ? (verbalQuestion?.score?.[verbalAnswer] ?? 0) : 0;
  const motorScore = motorAnswer ? (motorQuestion?.score?.[motorAnswer] ?? 0) : 0;

  const totalScore = eyeScore + verbalScore + motorScore;

  return { totalScore, eyeScore, verbalScore, motorScore };
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore >= 13 && totalScore <= 15) {
    severity = "Mild";
    interpretation =
      "GCS score indicates a mild impairment in consciousness. The patient is likely alert or minimally impaired. This range is commonly seen after minor head trauma or early-stage neurological changes.";
    recommendations =
      "Perform serial neurological assessments every 1–2 hours. Monitor for clinical deterioration. CT head if traumatic cause is suspected. Maintain airway. Reassess and document GCS at regular intervals.";
  } else if (totalScore >= 9 && totalScore <= 12) {
    severity = "Moderate";
    interpretation =
      "GCS score indicates a moderate impairment in consciousness. The patient has a significantly reduced level of awareness and may not follow commands consistently. Risk of deterioration is present.";
    recommendations =
      "Continuous neurological monitoring is essential. Maintain airway patency and consider positioning. Urgent CT imaging is indicated if not already performed. Neurosurgical consultation should be considered. Implement aspiration precautions. Reassess GCS every 30–60 minutes.";
  } else if (totalScore >= 3 && totalScore <= 8) {
    severity = "Severe";
    interpretation =
      "GCS score indicates severe impairment of consciousness. A score of 8 or below is the threshold for coma and requires immediate airway management. The patient is unable to follow commands, is unresponsive to verbal stimuli, and may have absent or abnormal motor responses.";
    recommendations =
      "Immediate airway intervention — consider intubation (GCS ≤ 8 is a clinical threshold for intubation). Activate emergency neurological response. Urgent CT head and neurosurgical review. Monitor ICP if indicated. Continuous vital signs and SpO2 monitoring. Maintain euglycemia and normothermia. Involve critical care team immediately.";
  }

  return { severity, interpretation, recommendations };
};