export const mmseQuestions = [
  // Orientation Section
  {
    id: "q1_year_score",
    section: "orientation",
    question: {
      en: "What is the year?",
      hi: "वर्ष क्या है?", // Placeholder translation
    },
    guidance: {
      en: "Ask: 'What is the current year?'",
      hi: "पूछें: 'वर्तमान वर्ष क्या है?'",
    },
    correctAnswer: {
      en: "Current Year (e.g. 2025)",
      hi: "वर्तमान वर्ष (उदाहरण के लिए, 2025)",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_season_score",
    section: "orientation",
    question: {
      en: "What is the season?",
      hi: "ऋतु क्या है?",
    },
    guidance: {
      en: "Ask: 'What season is it?'",
      hi: "पूछें: 'यह कौन सी ऋतु है?'",
    },
    correctAnswer: {
      en: "Current Season (e.g. Summer)",
      hi: "वर्तमान ऋतु (उदाहरण के लिए, गर्मी)",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_date_score",
    section: "orientation",
    question: {
      en: "What is the date?",
      hi: "तारीख क्या है?",
    },
    guidance: {
      en: "Ask: 'What is today's date (number)?'",
      hi: "पूछें: 'आज की तारीख (संख्या) क्या है?'",
    },
    correctAnswer: {
      en: "Current Date (e.g. 24)",
      hi: "वर्तमान तारीख (उदाहरण के लिए, 24)",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_day_score",
    section: "orientation",
    question: {
      en: "What is the day of the week?",
      hi: "सप्ताह का दिन क्या है?",
    },
    guidance: {
      en: "Ask: 'What day of the week is it?'",
      hi: "पूछें: 'यह सप्ताह का कौन सा दिन है?'",
    },
    correctAnswer: {
      en: "Current Day of the Week (e.g. Thursday)",
      hi: "वर्तमान सप्ताह का दिन (उदाहरण के लिए, गुरुवार)",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_month_score",
    section: "orientation",
    question: {
      en: "What is the month?",
      hi: "महीना क्या है?",
    },
    guidance: {
      en: "Ask: 'What month is it?'",
      hi: "पूछें: 'यह कौन सा महीना है?'",
    },
    correctAnswer: {
      en: "Current Month (e.g. July)",
      hi: "वर्तमान महीना (उदाहरण के लिए, जुलाई)",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_state_score",
    section: "orientation",
    question: {
      en: "What state are we in?",
      hi: "हम किस राज्य में हैं?",
    },
    guidance: {
      en: "Ask: 'What state are we in?'",
      hi: "पूछें: 'हम किस राज्य में हैं?'",
    },
    correctAnswer: {
      en: "Your Current State/Province",
      hi: "आपका वर्तमान राज्य/प्रांत",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_county_score",
    section: "orientation",
    question: {
      en: "What county/province are we in?",
      hi: "हम किस काउंटी/प्रांत में हैं?",
    },
    guidance: {
      en: "Ask: 'What county/province are we in?'",
      hi: "पूछें: 'हम किस काउंटी/प्रांत में हैं?'",
    },
    correctAnswer: {
      en: "Your Current County/District",
      hi: "आपका वर्तमान काउंटी/जिला",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_city_score",
    section: "orientation",
    question: {
      en: "What town/city are we in?",
      hi: "हम किस शहर/नगर में हैं?",
    },
    guidance: {
      en: "Ask: 'What town/city are we in?'",
      hi: "पूछें: 'हम किस शहर/नगर में हैं?'",
    },
    correctAnswer: {
      en: "Your Current Town/City",
      hi: "आपका वर्तमान शहर/नगर",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_building_score",
    section: "orientation",
    question: {
      en: "What is the name of this building/hospital?",
      hi: "इस भवन/अस्पताल का नाम क्या है?",
    },
    guidance: {
      en: "Ask: 'What is the name of this building/hospital?'",
      hi: "पूछें: 'इस भवन/अस्पताल का नाम क्या है?'",
    },
    correctAnswer: {
      en: "Name of Current Building/Hospital",
      hi: "वर्तमान भवन/अस्पताल का नाम",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_floor_score",
    section: "orientation",
    question: {
      en: "What floor are we on?",
      hi: "हम किस मंजिल पर हैं?",
    },
    guidance: {
      en: "Ask: 'What floor are we on?'",
      hi: "पूछें: 'हम किस मंजिल पर हैं?'",
    },
    correctAnswer: {
      en: "Current Floor Number",
      hi: "वर्तमान मंजिल संख्या",
    },
    options: ["Correct", "Incorrect"],
  },
  // Registration Section
  {
    id: "q2_apple_score",
    section: "registration",
    question: {
      en: "Name the object: Apple",
      hi: "वस्तु का नाम बताएं: सेब",
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
    },
    correctAnswer: {
      en: "Apple",
      hi: "सेब",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q2_table_score",
    section: "registration",
    question: {
      en: "Name the object: Table",
      hi: "वस्तु का नाम बताएं: मेज",
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
    },
    correctAnswer: {
      en: "Table",
      hi: "मेज",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q2_penny_score",
    section: "registration",
    question: {
      en: "Name the object: Penny",
      hi: "वस्तु का नाम बताएं: पेनी",
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
    },
    correctAnswer: {
      en: "Penny",
      hi: "पेनी",
    },
    options: ["Correct", "Incorrect"],
  },
  // Attention and Calculation Section
  {
    id: "q3_s7_1_score",
    section: "attention",
    question: {
      en: "Serial 7s: 1st Subtraction (100 - 7)",
      hi: "सीरियल 7: पहला घटाव (100 - 7)",
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 100 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 100 में से 7 घटाएं...?'",
    },
    correctAnswer: {
      en: "93",
      hi: "93",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_2_score",
    section: "attention",
    question: {
      en: "Serial 7s: 2nd Subtraction (93 - 7)",
      hi: "सीरियल 7: दूसरा घटाव (93 - 7)",
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 93 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 93 में से 7 घटाएं...?'",
    },
    correctAnswer: {
      en: "86",
      hi: "86",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_3_score",
    section: "attention",
    question: {
      en: "Serial 7s: 3rd Subtraction (86 - 7)",
      hi: "सीरियल 7: तीसरा घटाव (86 - 7)",
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 86 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 86 में से 7 घटाएं...?'",
    },
    correctAnswer: {
      en: "79",
      hi: "79",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_4_score",
    section: "attention",
    question: {
      en: "Serial 7s: 4th Subtraction (79 - 7)",
      hi: "सीरियल 7: चौथा घटाव (79 - 7)",
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 79 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 79 में से 7 घटाएं...?'",
    },
    correctAnswer: {
      en: "72",
      hi: "72",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_5_score",
    section: "attention",
    question: {
      en: "Serial 7s: 5th Subtraction (72 - 7)",
      hi: "सीरियल 7: पांचवां घटाव (72 - 7)",
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 72 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 72 में से 7 घटाएं...?'",
    },
    correctAnswer: {
      en: "65",
      hi: "65",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_world_total_score",
    section: "attention",
    question: {
      en: "Spell the word 'WORLD' backwards",
      hi: "'WORLD' शब्द को पीछे की ओर वर्तनी करें",
    },
    guidance: {
      en: "Say: 'Spell the word \"WORLD\" backwards.' Score 1 point for each letter in correct order.",
      hi: "कहें: '\"WORLD\" शब्द को पीछे की ओर वर्तनी करें।' सही क्रम में प्रत्येक अक्षर के लिए 1 अंक दें।",
    },
    correctAnswer: {
      en: "D-L-R-O-W",
      hi: "D-L-R-O-W",
    },
    options: ["0", "1", "2", "3", "4", "5"],
  },
  // Recall Section
  {
    id: "q4_apple_score",
    section: "recall",
    question: {
      en: "Recall the object: Apple",
      hi: "वस्तु याद करें: सेब",
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
    },
    correctAnswer: {
      en: "Apple",
      hi: "सेब",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q4_table_score",
    section: "recall",
    question: {
      en: "Recall the object: Table",
      hi: "वस्तु याद करें: मेज",
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
    },
    correctAnswer: {
      en: "Table",
      hi: "मेज",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q4_penny_score",
    section: "recall",
    question: {
      en: "Recall the object: Penny",
      hi: "वस्तु याद करें: पेनी",
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
    },
    correctAnswer: {
      en: "Penny",
      hi: "पेनी",
    },
    options: ["Correct", "Incorrect"],
  },
  // Language Section
  {
    id: "q5_naming_pencil_score",
    section: "language",
    question: {
      en: "Name the object: Pencil",
      hi: "वस्तु का नाम बताएं: पेंसिल",
    },
    guidance: {
      en: "Point to a pencil and ask: 'What is this?'",
      hi: "पेंसिल की ओर इशारा करें और पूछें: 'यह क्या है?'",
    },
    correctAnswer: {
      en: "Pencil",
      hi: "पेंसिल",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_naming_watch_score",
    section: "language",
    question: {
      en: "Name the object: Watch",
      hi: "वस्तु का नाम बताएं: घड़ी",
    },
    guidance: {
      en: "Point to a watch and ask: 'What is this?'",
      hi: "घड़ी की ओर इशारा करें और पूछें: 'यह क्या है?'",
    },
    correctAnswer: {
      en: "Watch",
      hi: "घड़ी",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_repetition_score",
    section: "language",
    question: {
      en: "Repeat the phrase: 'No ifs, ands, or buts.'",
      hi: "वाक्यांश दोहराएं: 'कोई अगर, और, या लेकिन नहीं।'",
    },
    guidance: {
      en: "Say: 'Now I am going to ask you to repeat a phrase after me: \"No ifs, ands, or buts.\"'",
      hi: "कहें: 'अब मैं आपको मेरे बाद एक वाक्यांश दोहराने के लिए कहने जा रहा हूँ: \"कोई अगर, और, या लेकिन नहीं।\"'",
    },
    correctAnswer: {
      en: "No ifs, ands, or buts.",
      hi: "कोई अगर, और, या लेकिन नहीं।",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_hand_score",
    section: "language",
    question: {
      en: "3-Stage Command: Take a paper in your right hand",
      hi: "3-चरण कमांड: अपने दाहिने हाथ में कागज लें",
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
    },
    correctAnswer: {
      en: "Takes paper in right hand",
      hi: "दाहिने हाथ में कागज लेता है",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_fold_score",
    section: "language",
    question: {
      en: "3-Stage Command: Fold it in half",
      hi: "3-चरण कमांड: इसे आधा मोड़ें",
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
    },
    correctAnswer: {
      en: "Folds it in half",
      hi: "इसे आधा मोड़ता है",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_floor_score",
    section: "language",
    question: {
      en: "3-Stage Command: Put it on the floor",
      hi: "3-चरण कमांड: इसे फर्श पर रखें",
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
    },
    correctAnswer: {
      en: "Puts it on the floor",
      hi: "इसे फर्श पर रखता है",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_reading_score",
    section: "language",
    question: {
      en: "Read and obey: 'CLOSE YOUR EYES'",
      hi: "पढ़ें और पालन करें: 'अपनी आँखें बंद करें'",
    },
    guidance: {
      en: "Write 'CLOSE YOUR EYES' in large letters on a piece of paper. Say: 'Please read this and do what it says.'",
      hi: "एक कागज पर बड़े अक्षरों में 'अपनी आँखें बंद करें' लिखें। कहें: 'कृपया इसे पढ़ें और जो यह कहता है वह करें।'",
    },
    correctAnswer: {
      en: "Patient closes their eyes",
      hi: "रोगी अपनी आँखें बंद करता है",
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_writing_score",
    section: "language",
    question: {
      en: "Write a sentence",
      hi: "एक वाक्य लिखें",
    },
    guidance: {
      en: "Say: 'Please write a sentence for me about anything you like. It must contain a subject and a verb and make sense.'",
      hi: "कहें: 'कृपया मेरे लिए कोई भी वाक्य लिखें जो आपको पसंद हो। इसमें एक विषय और एक क्रिया होनी चाहिए और इसका अर्थ होना चाहिए।'",
    },
    correctAnswer: {
      en: "A grammatically complete sentence with a subject and a verb",
      hi: "एक व्याकरणिक रूप से पूर्ण वाक्य जिसमें विषय और क्रिया हो",
    },
    options: ["Correct", "Incorrect"],
  },
  // Drawing Section
  {
    id: "q6_drawing_score",
    section: "drawing",
    question: {
      en: "Copy a design of two intersecting pentagons",
      hi: "दो प्रतिच्छेदी पेंटागन के डिज़ाइन की नकल करें",
    },
    guidance: {
      en: "Show the patient a drawing of two intersecting pentagons. Say: 'Please copy this design exactly as it is.' Score 1 point if all 10 angles are present and two pentagons intersect to form a four-sided figure.",
      hi: "रोगी को दो प्रतिच्छेदी पेंटागन का चित्र दिखाएं। कहें: 'कृपया इस डिज़ाइन की ठीक वैसी ही नकल करें।' यदि सभी 10 कोण मौजूद हैं और दो पेंटागन मिलकर एक चार-भुजा वाला आकार बनाते हैं तो 1 अंक दें।",
    },
    correctAnswer: {
      en: "A copy of two intersecting pentagons with all 10 angles and a four-sided intersection",
      hi: "दो प्रतिच्छेदी पेंटागन की नकल जिसमें सभी 10 कोण और एक चार-भुजा वाला प्रतिच्छेद हो",
    },
    options: ["Correct", "Incorrect"],
  },
];


export const getInterpretationAndRecommendations = (totalScore) => {
  let interpretationText = "";
  let recommendationsText = "";

  if (totalScore >= 25 && totalScore <= 30) {
    interpretationText =
      "The patient's MMSE score suggests normal cognitive function. There are no significant signs of cognitive impairment based on this screening tool.";
    recommendationsText =
      "Continue routine follow-up as per standard medical guidelines. No specific cognitive interventions are indicated at this time based on MMSE results alone. Consider further assessment if clinical concerns persist despite the normal MMSE score.";
  } else if (totalScore >= 20 && totalScore <= 24) {
    interpretationText =
      "The patient's MMSE score indicates mild cognitive impairment. This suggests some decline in cognitive abilities, which may affect daily activities.";
    recommendationsText =
      "Further comprehensive neuropsychological evaluation is recommended to identify specific areas of impairment and potential underlying causes. Consider lifestyle modifications, cognitive stimulation activities and regular monitoring. Discuss findings with the patient and family and explore potential medical or neurological consultations if appropriate.";
  } else if (totalScore >= 10 && totalScore <= 19) {
    interpretationText =
      "The patient's MMSE score suggests moderate cognitive impairment. This level of impairment is likely to significantly impact daily functioning and independence.";
    recommendationsText =
      "Urgent and thorough medical and neuropsychological evaluation is strongly recommended to determine the etiology of cognitive decline. Consider interventions such as cognitive rehabilitation, environmental modifications for safety and support for caregivers. A multidisciplinary approach involving neurology, geriatrics and social services may be beneficial. Discuss long-term care planning with the patient and family.";
  } else if (totalScore >= 0 && totalScore <= 9) {
    interpretationText =
      "The patient's MMSE score indicates severe cognitive impairment. This suggests a profound decline in cognitive function, likely leading to significant dependence in most daily activities.";
    recommendationsText =
      "Immediate and comprehensive medical and neurological assessment is crucial to identify the cause and manage symptoms. Focus on ensuring patient safety, comfort and dignity. Provide extensive support for caregivers. Consider palliative care options and discuss advanced care planning. A multidisciplinary team approach is essential for managing complex needs.";
  } else {
    interpretationText =
      "Invalid MMSE score. Please ensure the score is between 0 and 30.";
    recommendationsText =
      "Review the test administration and scoring. Ensure all sections are correctly evaluated.";
  }

  return { interpretationText, recommendationsText };
};


export const calculateScores = (answers) => {
  const sections = {
    orientation: { max: 10, current: 0 },
    registration: { max: 3, current: 0 },
    attention: { max: 5, current: 0 },
    recall: { max: 3, current: 0 },
    language: { max: 8, current: 0 },
    drawing: { max: 1, current: 0 },
  };

  mmseQuestions.forEach((question) => {
    const section = question.section;
    const answer = answers[question.id];
    if (answer && section in sections) {
      if (section === "attention" && question.id === "q3_world_total_score") {
        sections.attention.current = Math.max(
          sections.attention.current,
          parseInt(answer) || 0
        );
      } else if (answer === "Correct") {
        sections[section].current += 1;
      }
    }
  });

  let serial7sScore = 0;
  for (let i = 1; i <= 5; i++) {
    if (answers[`q3_s7_${i}_score`] === "Correct") {
      serial7sScore += 1;
    }
  }
  const worldBackwardsScore = answers.q3_world_total_score
    ? parseInt(answers.q3_world_total_score)
    : 0;
  sections.attention.current = Math.max(serial7sScore, worldBackwardsScore);

  Object.keys(sections).forEach((section) => {
    sections[section].current = Math.min(
      sections[section].current,
      sections[section].max
    );
  });

  const totalScore = Object.values(sections).reduce(
    (sum, section) => sum + section.current,
    0
  );

  return { ...sections, totalScore };
};