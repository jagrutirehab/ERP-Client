// CIWA-B — Clinical Institute Withdrawal Assessment for Benzodiazepines
// Source: Busto UE et al., J Clin Psychopharmacol 1989;9:412-416, as laid out in
// the Jagruti CIWA-B Assessment Form. Item wording follows that form exactly.
//
// 20 items, each scored 0–4, all mandatory:
//   Part A — items 1–17, patient-rated  (max 68)
//   Part B — items 18–20, clinician-observed (max 12)
// Total max 80. testType 22.

// Part A answer scale: "0 = Not at all … 4 = Very much so".
const PATIENT_SCALE = {
  "0 – Not at all": 0,
  "1 – Slightly": 1,
  "2 – Moderately": 2,
  "3 – Quite a bit": 3,
  "4 – Very much so": 4,
};

const PART_A_GUIDANCE = {
  en: "Patient-rated: ask how the patient feels right now.",
  hi: "रोगी द्वारा रेटेड: रोगी से पूछें कि वह अभी कैसा महसूस कर रहा है।",
};

const PART_B_GUIDANCE = {
  en: "Clinician-observed: score what you observe.",
  hi: "चिकित्सक द्वारा अवलोकन: जो आप देखते हैं उसके आधार पर स्कोर करें।",
};

const partAItem = (id, en, hi, score = PATIENT_SCALE) => ({
  id,
  part: "A",
  question: { en, hi },
  type: "multiple",
  score,
  guidance: PART_A_GUIDANCE,
});

export const ciwaBQuestions = [
  partAItem("1", "Do you feel irritable?", "क्या आप चिड़चिड़ा महसूस करते हैं?"),
  partAItem(
    "2",
    "Do you feel fatigued (tired)?",
    "क्या आप थकान (थका हुआ) महसूस करते हैं?",
  ),
  partAItem("3", "Do you feel tense?", "क्या आप तनाव महसूस करते हैं?"),
  partAItem(
    "4",
    "Do you have difficulty concentrating?",
    "क्या आपको ध्यान केंद्रित करने में कठिनाई होती है?",
  ),
  partAItem(
    "5",
    "Do you have any loss of appetite?",
    "क्या आपको भूख कम लग रही है?",
  ),
  partAItem(
    "6",
    "Do you have any numbness or burning on your face, hands or feet?",
    "क्या आपके चेहरे, हाथों या पैरों में सुन्नपन या जलन है?",
  ),
  partAItem(
    "7",
    "Do you feel your heart racing (palpitations)?",
    "क्या आपको अपना दिल तेज़ी से धड़कता हुआ (धड़कन) महसूस होता है?",
  ),
  partAItem(
    "8",
    "Does your head feel full or achy?",
    "क्या आपका सिर भारी या दर्द भरा महसूस होता है?",
  ),
  partAItem(
    "9",
    "Do you feel muscle aches or stiffness?",
    "क्या आपको मांसपेशियों में दर्द या अकड़न महसूस होती है?",
  ),
  partAItem(
    "10",
    "Do you feel anxious, nervous or jittery?",
    "क्या आप चिंतित, घबराए हुए या बेचैन महसूस करते हैं?",
  ),
  partAItem("11", "Do you feel upset?", "क्या आप परेशान महसूस करते हैं?"),
  // The form gives only the two anchors for this item: 0 = very restful,
  // 4 = not at all restful. The middle options are "Score 1/2/3", NOT bare
  // "1"/"2"/"3": JavaScript orders integer-like object keys first, which would
  // render them ahead of "0 – Very restful".
  partAItem(
    "12",
    "How restful was your sleep last night? (0 = very restful ... 4 = not at all restful)",
    "पिछली रात आपकी नींद कितनी आरामदायक थी? (0 = बहुत आरामदायक ... 4 = बिल्कुल आरामदायक नहीं)",
    {
      "0 – Very restful": 0,
      "Score 1": 1,
      "Score 2": 2,
      "Score 3": 3,
      "4 – Not at all restful": 4,
    },
  ),
  partAItem("13", "Do you feel weak?", "क्या आप कमज़ोरी महसूस करते हैं?"),
  partAItem(
    "14",
    "Do you think you didn't have enough sleep last night?",
    "क्या आपको लगता है कि पिछली रात आपकी नींद पूरी नहीं हुई?",
  ),
  partAItem(
    "15",
    "Do you have any visual disturbances (sensitivity to light, blurred vision)?",
    "क्या आपको देखने में कोई परेशानी है (रोशनी से संवेदनशीलता, धुंधला दिखना)?",
  ),
  partAItem("16", "Are you fearful?", "क्या आप डरा हुआ महसूस करते हैं?"),
  partAItem(
    "17",
    "Have you been worrying about possible misfortunes lately?",
    "क्या आप हाल ही में किसी संभावित अनहोनी को लेकर चिंता कर रहे हैं?",
  ),

  // ── Part B — clinician-observed ──────────────────────────────────────────
  {
    id: "18",
    part: "B",
    question: {
      en: "Sweating, restlessness and agitation",
      hi: "पसीना, बेचैनी और उत्तेजना",
    },
    type: "multiple",
    score: {
      "0 – None, normal activity": 0,
      "1 – Between 0 and 2": 1,
      "2 – Restless": 2,
      "3 – Between 2 and 4": 3,
      "4 – Paces back and forth, unable to sit still": 4,
    },
    guidance: PART_B_GUIDANCE,
  },
  {
    id: "19",
    part: "B",
    question: { en: "Tremor", hi: "कंपन (काँपना)" },
    type: "multiple",
    score: {
      "0 – No tremor": 0,
      "1 – Not visible; can be felt in fingertips": 1,
      "2 – Visible but mild": 2,
      "3 – Moderate, with arms extended": 3,
      "4 – Severe, even with arms not extended": 4,
    },
    guidance: PART_B_GUIDANCE,
  },
  {
    id: "20",
    part: "B",
    question: {
      en: "Sweating (feel the palms)",
      hi: "पसीना (हथेलियों को छूकर देखें)",
    },
    type: "multiple",
    score: {
      "0 – No sweating visible": 0,
      "1 – Barely perceptible; palms moist": 1,
      "2 – Palms and forehead moist; reports armpit sweating": 2,
      "3 – Beads of sweat on forehead": 3,
      "4 – Severe, drenching sweats": 4,
    },
    guidance: PART_B_GUIDANCE,
  },
];

const sumPart = (answers, part) =>
  ciwaBQuestions
    .filter((q) => !part || q.part === part)
    .reduce((total, q) => {
      const answer = answers[q.id];
      if (answer === undefined) return total;
      return total + (q.score[answer] ?? 0);
    }, 0);

/** { partA, partB, total } — Part A max 68, Part B max 12, total max 80. */
export const calculateScores = (answers) => {
  const partA = sumPart(answers, "A");
  const partB = sumPart(answers, "B");
  return { partA, partB, total: partA + partB };
};

// Bands and actions from the form's "Interpretation & recommendation" table.
// The form starts at 1; a total of 0 (no symptoms at all) is "No Withdrawal".
export const getInterpretationAndRecommendations = (totalScore) => {
  if (totalScore <= 0) {
    return {
      severity: "No Withdrawal",
      interpretation:
        "No benzodiazepine withdrawal symptoms were reported or observed.",
      recommendations:
        "Continue the planned taper. Reassess as per protocol. Seizures can occur at any score, so stay alert to risk factors.",
    };
  }
  if (totalScore <= 20) {
    return {
      severity: "Mild Withdrawal",
      interpretation: "Patient is experiencing mild benzodiazepine withdrawal.",
      recommendations:
        "Supportive care: reassurance, sleep hygiene, hydration, calm environment. Continue the planned taper; extra benzodiazepine usually not needed. Reassess every 4–8 h (daily if stable).",
    };
  }
  if (totalScore <= 40) {
    return {
      severity: "Moderate Withdrawal",
      interpretation:
        "Patient is experiencing moderate benzodiazepine withdrawal.",
      recommendations:
        "Inform the treating psychiatrist. Consider slowing the taper or an extra dose of a long-acting benzodiazepine (e.g., diazepam) as prescribed. Vitals and CIWA-B every 2–4 h.",
    };
  }
  if (totalScore <= 60) {
    return {
      severity: "Severe Withdrawal",
      interpretation:
        "Patient is experiencing severe benzodiazepine withdrawal. Urgent medical review is needed.",
      recommendations:
        "Urgent medical review. Stabilise on a long-acting benzodiazepine, then restart a slower taper. Vitals every 1–2 h; seizure precautions.",
    };
  }
  return {
    severity: "Very Severe Withdrawal",
    interpretation:
      "Patient is experiencing very severe benzodiazepine withdrawal — a medical emergency.",
    recommendations:
      "Medical emergency. Shift to an inpatient / medically equipped unit. Continuous monitoring, seizure and delirium precautions, immediate physician management.",
  };
};
