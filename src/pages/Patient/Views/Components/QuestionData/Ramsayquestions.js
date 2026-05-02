export const ramsayQuestions = [
  {
    id: "1",
    question: {
      en: "Current level of sedation / patient state.",
      hi: "वर्तमान बेहोशी स्तर / रोगी की स्थिति।",
    },
    type: "multiple",
    score: {
      "1 – Awake; agitated or restless or both": 1,
      "2 – Awake; cooperative, oriented, and tranquil": 2,
      "3 – Awake; responds to commands only": 3,
      "4 – Asleep; brisk response to light glabellar tap or loud auditory stimulus": 4,
      "5 – Asleep; sluggish response to light glabellar tap or loud auditory stimulus": 5,
      "6 – Asleep; no response to glabellar tap or loud auditory stimulus": 6,
    },
    guidance: {
      en: "Observe the patient's current state. For asleep patients (scores 4–6), apply a light glabellar tap or a loud auditory stimulus and observe the response. Select the single option that best describes the patient's state at the time of assessment.",
      hi: "रोगी की वर्तमान स्थिति देखें। सोए हुए रोगियों (स्कोर 4–6) के लिए, हल्का ग्लैबेलर टैप या तेज़ श्रवण उत्तेजना लागू करें और प्रतिक्रिया देखें। मूल्यांकन के समय रोगी की स्थिति का सबसे अच्छा वर्णन करने वाला एकल विकल्प चुनें।",
    },
  },
];

export const calculateScores = (answers) => {
  const answer = answers["1"];
  if (!answer) return 0;
  const question = ramsayQuestions.find((q) => q.id === "1");
  return question?.score?.[answer] ?? 0;
};

export const getInterpretationAndRecommendations = (totalScore) => {
  let severity = "";
  let interpretation = "";
  let recommendations = "";

  if (totalScore === 1) {
    severity = "Under-sedated";
    interpretation =
      "Patient is awake and agitated or restless. The current level of sedation is insufficient and the patient may be in distress or at risk of self-harm.";
    recommendations =
      "Reassess sedation plan immediately. Consider titrating sedative agent upward. Evaluate and treat underlying cause of agitation (pain, delirium, withdrawal). Ensure patient safety and monitor continuously.";
  } else if (totalScore === 2) {
    severity = "Optimal";
    interpretation =
      "Patient is awake, cooperative, oriented, and tranquil. This is the ideal sedation level for most ICU patients who do not require deeper sedation.";
    recommendations =
      "Maintain current sedation regimen. Reassess at regular intervals. Document response to sedation. Continue monitoring for changes in clinical status.";
  } else if (totalScore === 3) {
    severity = "Optimal";
    interpretation =
      "Patient is awake but responds to commands only. This level is acceptable and may be appropriate for patients requiring more controlled cooperation.";
    recommendations =
      "Continue current sedation regimen. Reassess frequently to ensure no drift toward over-sedation. Target the minimum effective sedation depth. Neurological checks should be maintained.";
  } else if (totalScore === 4) {
    severity = "Adequate";
    interpretation =
      "Patient is asleep with a brisk response to light glabellar tap or loud auditory stimulus. Sedation is adequate for procedures or mechanically ventilated patients.";
    recommendations =
      "Monitor respiratory status closely. Reassess need for this depth of sedation. Implement daily sedation interruption protocol if clinically appropriate. Document response and review sedation goals.";
  } else if (totalScore === 5) {
    severity = "Over-sedated";
    interpretation =
      "Patient is asleep with a sluggish response to stimulation. This level suggests over-sedation, which is associated with prolonged mechanical ventilation and ICU stay.";
    recommendations =
      "Consider reducing sedative dose. Implement sedation interruption (spontaneous awakening trial) if safe to do so. Assess for accumulation of sedative agents. Review analgesic and sedative regimen. Monitor for respiratory depression.";
  } else if (totalScore === 6) {
    severity = "Deeply Over-sedated";
    interpretation =
      "Patient is asleep with no response to glabellar tap or loud auditory stimulus. This level represents deep sedation and may be appropriate only in specific clinical scenarios such as refractory intracranial hypertension or status epilepticus.";
    recommendations =
      "Urgent review of sedation necessity. Reduce or hold sedative infusion if clinically safe. Perform thorough neurological assessment. Monitor for hemodynamic instability and respiratory depression. Consider imaging if unresponsiveness is unexpected. Reassess every 30–60 minutes.";
  }

  return { severity, interpretation, recommendations };
};