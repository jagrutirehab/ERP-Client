// COWS — Clinical Opiate Withdrawal Scale
// Source: Wesson DR, Ling W (2003). Journal of Psychoactive Drugs, 35(2), 253–259.
// All 11 items are mandatory. Order matches the published instrument exactly.

export const cowsQuestions = [
  {
    id: "1",
    question: {
      en: "Resting Pulse Rate (beats/minute, after sitting or lying for 1 minute)",
      hi: "आराम की नाड़ी दर (बीट्स/मिनट, 1 मिनट बैठने या लेटने के बाद)",
    },
    type: "multiple",
    score: {
      "80 or below": 0,
      "81–100": 1,
      "101–120": 2,
      "Greater than 120": 4,
    },
    guidance: {
      en: "Measure after the patient has been sitting or lying for one minute. Rate only the component related to opiate withdrawal.",
      hi: "रोगी के एक मिनट बैठने या लेटने के बाद मापें। केवल ओपिएट वापसी से संबंधित घटक को स्कोर करें।",
    },
  },
  {
    id: "2",
    question: {
      en: "GI Upset (over last ½ hour)",
      hi: "जठरांत्र संबंधी परेशानी (पिछले आधे घंटे में)",
    },
    type: "multiple",
    score: {
      "No GI symptoms": 0,
      "Stomach cramps": 1,
      "Nausea or loose stool": 2,
      "Vomiting or diarrhea": 3,
      "Multiple episodes of diarrhea or vomiting": 5,
    },
    guidance: {
      en: "Assess gastrointestinal symptoms experienced over the last 30 minutes.",
      hi: "पिछले 30 मिनट में अनुभव किए गए जठरांत्र संबंधी लक्षणों का आकलन करें।",
    },
  },
  {
    id: "3",
    question: {
      en: "Sweating (over past ½ hour, not accounted for by room temperature or activity)",
      hi: "पसीना (पिछले आधे घंटे में, जो कमरे के तापमान या गतिविधि से स्पष्ट न हो)",
    },
    type: "multiple",
    score: {
      "No report of chills or flushing": 0,
      "Subjective report of chills or flushing": 1,
      "Flushed or observable moistness on face": 2,
      "Beads of sweat on brow or face": 3,
      "Sweat streaming off face": 4,
    },
    guidance: {
      en: "Score only sweating not accounted for by room temperature or patient activity.",
      hi: "केवल वह पसीना स्कोर करें जो कमरे के तापमान या रोगी की गतिविधि से असंबंधित हो।",
    },
  },
  {
    id: "4",
    question: {
      en: "Tremor (observation of outstretched hands)",
      hi: "कंपन (फैले हुए हाथों का अवलोकन)",
    },
    type: "multiple",
    score: {
      "No tremor": 0,
      "Tremor can be felt, but not observed": 1,
      "Slight tremor observable": 2,
      "Gross tremor or muscle twitching": 4,
    },
    guidance: {
      en: "Ask the patient to extend both hands and observe for tremor.",
      hi: "रोगी को दोनों हाथ फैलाने के लिए कहें और कंपन का निरीक्षण करें।",
    },
  },
  {
    id: "5",
    question: {
      en: "Restlessness (observation during assessment)",
      hi: "बेचैनी (मूल्यांकन के दौरान अवलोकन)",
    },
    type: "multiple",
    score: {
      "Able to sit still": 0,
      "Reports difficulty sitting still, but is able to do so": 1,
      "Frequent shifting or extraneous movements of legs/arms": 3,
      "Unable to sit still for more than a few seconds": 5,
    },
    guidance: {
      en: "Observe the patient's ability to remain still throughout the assessment period.",
      hi: "मूल्यांकन के दौरान रोगी की स्थिर रहने की क्षमता का निरीक्षण करें।",
    },
  },
  {
    id: "6",
    question: {
      en: "Yawning (observation during assessment)",
      hi: "जम्हाई (मूल्यांकन के दौरान अवलोकन)",
    },
    type: "multiple",
    score: {
      "No yawning": 0,
      "Yawning once or twice": 1,
      "Yawning three or more times": 2,
      "Yawning several times per minute": 4,
    },
    guidance: {
      en: "Observe and count the frequency of yawning throughout the assessment.",
      hi: "मूल्यांकन के दौरान जम्हाई की आवृत्ति का निरीक्षण और गणना करें।",
    },
  },
  {
    id: "7",
    question: {
      en: "Pupil Size",
      hi: "पुतली का आकार",
    },
    type: "multiple",
    score: {
      "Pupils pinned or normal size for room light": 0,
      "Pupils possibly larger than normal for room light": 1,
      "Pupils moderately dilated": 2,
      "Pupils so dilated that only the rim of the iris is visible": 5,
    },
    guidance: {
      en: "Assess pupil size relative to the current room lighting conditions.",
      hi: "वर्तमान कमरे की रोशनी के सापेक्ष पुतली के आकार का आकलन करें।",
    },
  },
  {
    id: "8",
    question: {
      en: "Anxiety or Irritability",
      hi: "चिंता या चिड़चिड़ापन",
    },
    type: "multiple",
    score: {
      None: 0,
      "Patient reports increasing irritability or anxiousness": 1,
      "Patient obviously irritable or anxious": 2,
      "Patient so irritable or anxious that participation in the assessment is difficult": 4,
    },
    guidance: {
      en: "Assess through both direct observation and patient self-report.",
      hi: "प्रत्यक्ष अवलोकन और रोगी की स्व-रिपोर्ट दोनों के माध्यम से आकलन करें।",
    },
  },
  {
    id: "9",
    question: {
      en: "Bone or Joint Aches (only the component attributed to withdrawal, if pain pre-existed)",
      hi: "हड्डी या जोड़ों का दर्द (केवल वापसी से संबंधित घटक, यदि दर्द पहले से था)",
    },
    type: "multiple",
    score: {
      "Not present": 0,
      "Mild diffuse discomfort": 1,
      "Patient reports severe diffuse aching of joints/muscles": 2,
      "Patient is rubbing joints or muscles and unable to sit still because of discomfort": 4,
    },
    guidance: {
      en: "If pain pre-existed, score only the additional component directly attributed to opiate withdrawal.",
      hi: "यदि दर्द पहले से था, तो केवल ओपिएट वापसी से प्रत्यक्ष रूप से संबंधित अतिरिक्त घटक को स्कोर करें।",
    },
  },
  {
    id: "10",
    question: {
      en: "Gooseflesh Skin",
      hi: "रोमांच (गूज़फ्लेश)",
    },
    type: "multiple",
    score: {
      "Skin is smooth": 0,
      "Piloerection of skin can be felt, or hairs standing up on arms": 3,
      "Prominent piloerection": 5,
    },
    guidance: {
      en: "Observe and palpate the patient's skin, particularly the arms, for piloerection.",
      hi: "पिलोइरेक्शन के लिए रोगी की त्वचा, विशेष रूप से भुजाओं का निरीक्षण और स्पर्श करें।",
    },
  },
  {
    id: "11",
    question: {
      en: "Runny Nose or Tearing (not accounted for by cold symptoms or allergies)",
      hi: "नाक बहना या आंसू (सर्दी के लक्षणों या एलर्जी से असंबंधित)",
    },
    type: "multiple",
    score: {
      "Not present": 0,
      "Nasal stuffiness or unusually moist eyes": 1,
      "Nose running or tearing": 2,
      "Nose constantly running or tears streaming down cheeks": 4,
    },
    guidance: {
      en: "Score only if not accounted for by cold symptoms or allergies.",
      hi: "केवल तभी स्कोर करें जब सर्दी के लक्षणों या एलर्जी से असंबंधित हो।",
    },
  },
];

export const calculateScores = (answers) => {
  return cowsQuestions.reduce((total, q) => {
    const answer = answers[q.id];
    if (!answer) return total;
    return total + (q.score[answer] ?? 0);
  }, 0);
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore <= 4) {
    severity = "Below Mild (No significant withdrawal)";
    interpretation =
      "Score is below the mild threshold. No clinically significant opioid withdrawal at this time.";
    recommendations =
      "Continue scheduled taper and daily scoring. No pharmacological intervention required at this stage. Reassess tomorrow as per protocol.";
  } else if (totalScore <= 12) {
    severity = "Mild Withdrawal";
    interpretation = "Patient is experiencing mild opioid withdrawal symptoms.";
    recommendations =
      "Alert: nursing and on-call physician review required. Non-pharmacological comfort measures (hydration, rest). Consider symptomatic relief. Reassess in 4 hours.";
  } else if (totalScore <= 24) {
    severity = "Moderate Withdrawal";
    interpretation =
      "Patient is experiencing moderate opioid withdrawal with noticeable discomfort.";
    recommendations =
      "Alert: nursing and on-call physician review required. Initiate or review pharmacological treatment. Ensure adequate hydration. Reassess every 2–4 hours.";
  } else if (totalScore <= 36) {
    severity = "Moderately Severe Withdrawal";
    interpretation =
      "Patient is experiencing moderately severe opioid withdrawal with significant discomfort.";
    recommendations =
      "Urgent: immediate physician review required. Titrate opioid agonist therapy as per protocol. Monitor every 1–2 hours. Assess for complications.";
  } else {
    severity = "Severe Withdrawal";
    interpretation =
      "Patient is experiencing severe opioid withdrawal. Immediate medical attention is required.";
    recommendations =
      "Urgent: immediate physician review required. Escalate opioid agonist therapy immediately. Continuous monitoring. Assess for dehydration and electrolyte imbalance.";
  }

  return { severity, interpretation, recommendations };
};
