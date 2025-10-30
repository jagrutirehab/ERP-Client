export const mmseQuestions = [
  // Orientation Section
  {
    id: "q1_year_score",
    section: "orientation",
    question: {
      en: "What is the year?",
      hi: "वर्ष क्या है?", // Placeholder translation
      mr: "वर्ष कोणतं आहे?"
    },
    guidance: {
      en: "Ask: 'What is the current year?'",
      hi: "पूछें: 'वर्तमान वर्ष क्या है?'",
      mr: "विचारा: 'सध्याचं वर्ष कोणतं आहे?'"
    },
    correctAnswer: {
      en: "Current Year (e.g. 2025)",
      hi: "वर्तमान वर्ष (उदाहरण के लिए, 2025)",
      mr: "सध्याचं वर्ष (उदा. २०२५)"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_season_score",
    section: "orientation",
    question: {
      en: "What is the season?",
      hi: "ऋतु क्या है?",
      mr: "ऋतू कोणता आहे?"
    },
    guidance: {
      en: "Ask: 'What season is it?'",
      hi: "पूछें: 'यह कौन सी ऋतु है?'",
      mr: "विचारा: 'आता कोणता ऋतू आहे?'"
    },
    correctAnswer: {
      en: "Current Season (e.g. Summer)",
      hi: "वर्तमान ऋतु (उदाहरण के लिए, गर्मी)",
      mr: "सध्याचा ऋतू (उदा. उन्हाळा)"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_date_score",
    section: "orientation",
    question: {
      en: "What is the date?",
      hi: "तारीख क्या है?",
      mr: "तारीख काय आहे?"
    },
    guidance: {
      en: "Ask: 'What is today's date (number)?'",
      hi: "पूछें: 'आज की तारीख (संख्या) क्या है?'",
      mr: "विचारा: 'आजची तारीख (क्रमांक) काय आहे?'"
    },
    correctAnswer: {
      en: "Current Date (e.g. 24)",
      hi: "वर्तमान तारीख (उदाहरण के लिए, 24)",
      mr: "सध्याची तारीख (उदा. २४)"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_day_score",
    section: "orientation",
    question: {
      en: "What is the day of the week?",
      hi: "सप्ताह का दिन क्या है?",
      mr: "आज आठवड्याचा कोणता दिवस आहे?"
    },
    guidance: {
      en: "Ask: 'What day of the week is it?'",
      hi: "पूछें: 'यह सप्ताह का कौन सा दिन है?'",
      mr: "विचारा: 'आज आठवड्याचा कोणता दिवस आहे?'"
    },
    correctAnswer: {
      en: "Current Day of the Week (e.g. Thursday)",
      hi: "वर्तमान सप्ताह का दिन (उदाहरण के लिए, गुरुवार)",
      mr: "सध्याचा आठवड्याचा दिवस (उदा. गुरुवार)"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_month_score",
    section: "orientation",
    question: {
      en: "What is the month?",
      hi: "महीना क्या है?",
      mr: "महिना कोणता आहे?"
    },
    guidance: {
      en: "Ask: 'What month is it?'",
      hi: "पूछें: 'यह कौन सा महीना है?'",
      mr: "विचारा: 'आता कोणता महिना आहे?'"
    },
    correctAnswer: {
      en: "Current Month (e.g. July)",
      hi: "वर्तमान महीना (उदाहरण के लिए, जुलाई)",
      mr: "सध्याचा महिना (उदा. जुलै)"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_state_score",
    section: "orientation",
    question: {
      en: "What state are we in?",
      hi: "हम किस राज्य में हैं?",
      mr: "आपण कोणत्या राज्यात आहोत?"
    },
    guidance: {
      en: "Ask: 'What state are we in?'",
      hi: "पूछें: 'हम किस राज्य में हैं?'",
      mr: "विचारा: 'आपण कोणत्या राज्यात आहोत?'"
    },
    correctAnswer: {
      en: "Your Current State/Province",
      hi: "आपका वर्तमान राज्य/प्रांत",
      mr: "तुमचं सध्याचं राज्य/प्रांत"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_county_score",
    section: "orientation",
    question: {
      en: "What county/province are we in?",
      hi: "हम किस काउंटी/प्रांत में हैं?",
      mr: "आपण कोणत्या जिल्ह्यात/प्रांतात आहोत?"
    },
    guidance: {
      en: "Ask: 'What county/province are we in?'",
      hi: "पूछें: 'हम किस काउंटी/प्रांत में हैं?'",
      mr: "विचारा: 'आपण कोणत्या जिल्ह्यात/प्रांतात आहोत?'"
    },
    correctAnswer: {
      en: "Your Current County/District",
      hi: "आपका वर्तमान काउंटी/जिला",
      mr: "तुमचा सध्याचा जिल्हा/परगणा"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_city_score",
    section: "orientation",
    question: {
      en: "What town/city are we in?",
      hi: "हम किस शहर/नगर में हैं?",
      mr: "आपण कोणत्या गावात/शहरात आहोत?"
    },
    guidance: {
      en: "Ask: 'What town/city are we in?'",
      hi: "पूछें: 'हम किस शहर/नगर में हैं?'",
      mr: "विचारा: 'आपण कोणत्या गावात/शहरात आहोत?'"
    },
    correctAnswer: {
      en: "Your Current Town/City",
      hi: "आपका वर्तमान शहर/नगर",
      mr: "तुमचं सध्याचं गाव/शहर"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_building_score",
    section: "orientation",
    question: {
      en: "What is the name of this building/hospital?",
      hi: "इस भवन/अस्पताल का नाम क्या है?",
      mr: "या इमारतीचं/रुग्णालयाचं नाव काय आहे?"
    },
    guidance: {
      en: "Ask: 'What is the name of this building/hospital?'",
      hi: "पूछें: 'इस भवन/अस्पताल का नाम क्या है?'",
      mr: "विचारा: 'या इमारतीचं/रुग्णालयाचं नाव काय आहे?'"
    },
    correctAnswer: {
      en: "Name of Current Building/Hospital",
      hi: "वर्तमान भवन/अस्पताल का नाम",
      mr: "सध्याच्या इमारतीचं/रुग्णालयाचं नाव"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q1_floor_score",
    section: "orientation",
    question: {
      en: "What is the name of the doctor?",
      hi: "डॉक्टर का नाम क्या है?",
      mr: "डॉक्टरचं नाव काय आहे?"
    },
    guidance: {
      en: "Ask: 'What is the name of the doctor?'",
      hi: "पूछें: 'डॉक्टर का नाम क्या है?'",
      mr: "विचारा: 'डॉक्टरचं नाव काय आहे?'"
    },
    correctAnswer: {
      en: "Current Doctor Name",
      hi: "वर्तमान डॉक्टर का नाम",
      mr: "सध्याच्या डॉक्टरचं नाव"
    },
    options: ["Correct", "Incorrect"],
  },
  // Registration Section
  {
    id: "q2_house_score",
    section: "registration",
    question: {
      en: "Name the object: House",
      hi: "वस्तु का नाम बताएं: घर",
      mr: "वस्तूचं नाव सांगा: घर"
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
      mr: "म्हणा: 'मी तीन वस्तूंची नावे सांगणार आहे. माझ्या पाठोपाठ ती नावे तुम्ही पुन्हा म्हणा. ती लक्षात ठेवा, कारण काही मिनिटांनंतर मी तुम्हाला ती नावे पुन्हा सांगायला सांगणार आहे.' (हळू बोला, प्रत्येक शब्दामध्ये १ सेकंदाचं अंतर ठेवा). पहिल्या प्रयत्नात प्रत्येक बरोबर उत्तरासाठी १ गुण द्या."
    },
    correctAnswer: {
      en: "House",
      hi: "घर",
      mr: "घर"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q2_sky_score",
    section: "registration",
    question: {
      en: "Name the object: Sky",
      hi: "वस्तु का नाम बताएं: आकाश",
      mr: "वस्तूचं नाव सांगा: आकाश"
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
      mr: "म्हणा: 'मी तीन वस्तूंची नावे सांगणार आहे. माझ्या पाठोपाठ ती नावे तुम्ही पुन्हा म्हणा. ती लक्षात ठेवा, कारण काही मिनिटांनंतर मी तुम्हाला ती नावे पुन्हा सांगायला सांगणार आहे.' (हळू बोला, प्रत्येक शब्दामध्ये १ सेकंदाचं अंतर ठेवा). पहिल्या प्रयत्नात प्रत्येक बरोबर उत्तरासाठी १ गुण द्या."

    },
    correctAnswer: {
      en: "Sky",
      hi: "आकाश",
      mr: "आकाश"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q2_crow_score",
    section: "registration",
    question: {
      en: "Name the object: Crow",
      hi: "वस्तु का नाम बताएं: कौवा",
      mr: "वस्तूचं नाव सांगा: कावळा"
    },
    guidance: {
      en: "Say: 'I am going to name three objects. I want you to repeat them after me. Remember them, because I will ask you to name them again in a few minutes.' (Say slowly, 1 second per word). Score 1 point for each correct on first attempt.",
      hi: "कहें: 'मैं तीन वस्तुओं के नाम बताने जा रहा हूँ। मैं चाहता हूँ कि आप मेरे बाद उन्हें दोहराएँ। उन्हें याद रखें, क्योंकि मैं कुछ मिनटों में आपको फिर से उनके नाम पूछूंगा।' (धीरे-धीरे कहें, प्रत्येक शब्द के लिए 1 सेकंड)। पहली कोशिश में प्रत्येक सही जवाब के लिए 1 अंक दें।",
      mr: "म्हणा: 'मी तीन वस्तूंची नावे सांगणार आहे. माझ्या पाठोपाठ ती नावे तुम्ही पुन्हा म्हणा. ती लक्षात ठेवा, कारण काही मिनिटांनंतर मी तुम्हाला ती नावे पुन्हा सांगायला सांगणार आहे.' (हळू बोला, प्रत्येक शब्दामध्ये १ सेकंदाचं अंतर ठेवा). पहिल्या प्रयत्नात प्रत्येक बरोबर उत्तरासाठी १ गुण द्या."

    },
    correctAnswer: {
      en: "Crow",
      hi: "कौवा",
      mr: "कावळा"
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
      mr: "सिरियल ७: पहिली वजाबाकी (१०० - ७)"
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 100 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 100 में से 7 घटाएं...?'",
      mr: "म्हणा: 'आता मला हवं आहे की तुम्ही १०० पासून ७ ने उलट मोजा. म्हणजे, १०० वजा ७ म्हणजे...?'"
    },
    correctAnswer: {
      en: "93",
      hi: "93",
      mr: "93"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_2_score",
    section: "attention",
    question: {
      en: "Serial 7s: 2nd Subtraction (93 - 7)",
      hi: "सीरियल 7: दूसरा घटाव (93 - 7)",
      mr: "सिरियल ७: दुसरी वजाबाकी (९३ - ७)"
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 93 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 93 में से 7 घटाएं...?'",
      mr: "म्हणा: 'आता मला हवं आहे की तुम्ही १०० पासून ७ ने उलट मोजा. म्हणजे, ९३ वजा ७ म्हणजे...?'"
    },
    correctAnswer: {
      en: "86",
      hi: "86",
      mr: "86"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_3_score",
    section: "attention",
    question: {
      en: "Serial 7s: 3rd Subtraction (86 - 7)",
      hi: "सीरियल 7: तीसरा घटाव (86 - 7)",
      mr: "सिरियल ७: तिसरी वजाबाकी (८६ - ७)"
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 86 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 86 में से 7 घटाएं...?'",
      mr: "म्हणा: 'आता मला हवं आहे की तुम्ही १०० पासून ७ ने उलट मोजा. म्हणजे, ८६ वजा ७ म्हणजे...?'"
    },
    correctAnswer: {
      en: "79",
      hi: "79",
      mr: "79"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_4_score",
    section: "attention",
    question: {
      en: "Serial 7s: 4th Subtraction (79 - 7)",
      hi: "सीरियल 7: चौथा घटाव (79 - 7)",
      mr: "सिरियल ७: चौथी वजाबाकी (७९ - ७)"
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 79 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 79 में से 7 घटाएं...?'",
      mr: "म्हणा: 'आता मला हवं आहे की तुम्ही १०० पासून ७ ने उलट मोजा. म्हणजे, ७९ वजा ७ म्हणजे...?'"
    },
    correctAnswer: {
      en: "72",
      hi: "72",
      mr: "72"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q3_s7_5_score",
    section: "attention",
    question: {
      en: "Serial 7s: 5th Subtraction (72 - 7)",
      hi: "सीरियल 7: पांचवां घटाव (72 - 7)",
      mr: "सिरियल ७: पाचवी वजाबाकी (७२ - ७)"
    },
    guidance: {
      en: "Say: 'Now I'd like you to count backward by 7s from 100. So, 72 minus 7 is...?'",
      hi: "कहें: 'अब मैं चाहता हूँ कि आप 100 से 7 के अंतर से पीछे की ओर गिनें। तो, 72 में से 7 घटाएं...?'",
      mr: "म्हणा: 'आता मला हवं आहे की तुम्ही १०० पासून ७ ने उलट मोजा. म्हणजे, ७२ वजा ७ म्हणजे...?'"
    },
    correctAnswer: {
      en: "65",
      hi: "65",
      mr: "65"
    },
    options: ["Correct", "Incorrect"],
  },
  // previously version question
  // {
  //   id: "q3_world_total_score",
  //   section: "attention",
  //   question: {
  //     en: "Spell the word 'WORLD' backwards",
  //     hi: "'WORLD' शब्द को पीछे की ओर वर्तनी करें",
  //   },
  //   guidance: {
  //     en: "Say: 'Spell the word \"WORLD\" backwards.' Score 1 point for each letter in correct order.",
  //     hi: "कहें: '\"WORLD\" शब्द को पीछे की ओर वर्तनी करें।' सही क्रम में प्रत्येक अक्षर के लिए 1 अंक दें।",
  //   },
  //   correctAnswer: {
  //     en: "D-L-R-O-W",
  //     hi: "D-L-R-O-W",
  //   },
  //   options: ["0", "1", "2", "3", "4", "5"],
  // },

  // new version question
  {
    id: "q3_week_total_score",
    section: "attention",
    question: {
      en: "Say the days of the week backwards, starting from Sunday.",
      hi: "सप्ताह के दिनों को रविवार से उल्टे क्रम में बोलें।",
      mr: "आठवड्याचे दिवस उलट क्रमाने म्हणा, रविवारीपासून सुरुवात करा."
    },
    guidance: {
      en: "Say: 'Now, tell me the days of the week backwards, starting from Sunday.' Score 1 point for each day said in the correct reverse order.",
      hi: "कहें: 'अब, सप्ताह के दिनों को रविवार से उल्टे क्रम में बताएं।' सही उल्टे क्रम में बोले गए प्रत्येक दिन के लिए 1 अंक दें।",
      mr: "म्हणा: 'आता, मला आठवड्याचे दिवस उलट क्रमाने सांगा, रविवारीपासून सुरुवात करा.' प्रत्येक दिवस योग्य उलट क्रमाने सांगितल्यास १ गुण द्या."
    },
    correctAnswer: {
      en: "Sunday Saturday Friday Thursday Wednesday",
      hi: "Sunday Saturday Friday Thursday Wednesday",
      mr: "Sunday Saturday Friday Thursday Wednesday"
    },
    options: ["0", "1", "2", "3", "4", "5"],
  },
  // Recall Section
  {
    id: "q4_house_score",
    section: "recall",
    question: {
      en: "Recall the object: House",
      hi: "वस्तु याद करें: सेब",
      mr: "वस्तू आठवा: घर"
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
      mr: "म्हणा: 'मी तुम्हाला लक्षात ठेवायला सांगितलेल्या तीन वस्तू कोणत्या होत्या?' (सूचना देऊ नका)."
    },
    correctAnswer: {
      en: "House",
      hi: "घर",
      mr: "घर"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q4_sky_score",
    section: "recall",
    question: {
      en: "Recall the object: Sky",
      hi: "वस्तु याद करें: आकाश",
      mr: "वस्तू आठवा: आकाश"
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
      mr: "म्हणा: 'मी तुम्हाला लक्षात ठेवायला सांगितलेल्या तीन वस्तू कोणत्या होत्या?' (सूचना देऊ नका)."
    },
    correctAnswer: {
      en: "Sky",
      hi: "आकाश",
      mr: "आकाश"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q4_crow_score",
    section: "recall",
    question: {
      en: "Recall the object: Crow",
      hi: "वस्तु याद करें: कौवा",
      mr: "वस्तू आठवा: कावळा"
    },
    guidance: {
      en: "Say: 'What were those three objects I asked you to remember?' (Do not give clues).",
      hi: "कहें: 'वह तीन वस्तुएँ जो मैंने आपको याद रखने को कहा था, वे क्या थीं?' (कोई संकेत न दें)।",
      mr: "म्हणा: 'मी तुम्हाला लक्षात ठेवायला सांगितलेल्या तीन वस्तू कोणत्या होत्या?' (सूचना देऊ नका)."
    },
    correctAnswer: {
      en: "Crow",
      hi: "कौवा",
      mr: "कावळा"
    },
    options: ["Correct", "Incorrect"],
  },
  // Language Section
  {
    id: "q5_naming_pen_score",
    section: "language",
    question: {
      en: "Name the object: Pen",
      hi: "वस्तु का नाम बताएं: पेन",
      mr: "वस्तूचं नाव सांगा: पेन"
    },
    guidance: {
      en: "Point to a pen and ask: 'What is this?'",
      hi: "पेन की ओर इशारा करें और पूछें: 'यह क्या है?'",
      mr: "पेनकडे बोट दाखवा आणि विचारा: 'हे काय आहे?'"
    },
    correctAnswer: {
      en: "Pen",
      hi: "पेन",
      mr: "पेन"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_naming_watch_score",
    section: "language",
    question: {
      en: "Name the object: Watch",
      hi: "वस्तु का नाम बताएं: घड़ी",
      mr: "वस्तूचं नाव सांगा: घड्याळ"
    },
    guidance: {
      en: "Point to a watch and ask: 'What is this?'",
      hi: "घड़ी की ओर इशारा करें और पूछें: 'यह क्या है?'",
      mr: "घड्याळाकडे बोट दाखवा आणि विचारा: 'हे काय आहे?'"
    },
    correctAnswer: {
      en: "Watch",
      hi: "घड़ी",
      mr: "घड्याळ"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_repetition_score",
    section: "language",
    question: {
      en: "Repeat the phrase: 'No ifs, ands, or buts.'",
      hi: "वाक्यांश दोहराएं: 'कोई अगर, और, या लेकिन नहीं।'",
      mr: "वाक्य पुन्हा म्हणा: 'ना जर, ना तर, ना पण.'"
    },
    guidance: {
      en: "Say: 'Now I am going to ask you to repeat a phrase after me: \"No ifs, ands, or buts.\"'",
      hi: "कहें: 'अब मैं आपको मेरे बाद एक वाक्यांश दोहराने के लिए कहने जा रहा हूँ: \"कोई अगर, और, या लेकिन नहीं।\"'",
      mr: "म्हणा: 'आता मी तुम्हाला माझ्या पाठोपाठ एक वाक्य पुन्हा म्हणायला सांगणार आहे: \"ना जर, ना तर, ना पण.\"'"
    },
    correctAnswer: {
      en: "No ifs, ands, or buts.",
      hi: "कोई अगर, और, या लेकिन नहीं।",
      mr: "ना जर, ना तर, ना पण."
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_hand_score",
    section: "language",
    question: {
      en: "3-Stage Command: Take a paper in your right hand",
      hi: "3-चरण कमांड: अपने दाहिने हाथ में कागज लें",
      mr: "३-स्तरीय आज्ञा: उजव्या हातात कागद घ्या"
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
      mr: "रुग्णाला कागदाचा एक तुकडा द्या. म्हणा: 'हा कागद उजव्या हातात घ्या, तो अर्धा दुमडा आणि जमिनीवर ठेवा.'"
    },
    correctAnswer: {
      en: "Takes paper in right hand",
      hi: "दाहिने हाथ में कागज लेता है",
      mr: "उजव्या हातात कागद घेतो"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_fold_score",
    section: "language",
    question: {
      en: "3-Stage Command: Fold it in half",
      hi: "3-चरण कमांड: इसे आधा मोड़ें",
      mr: "३-स्तरीय आज्ञा: तो अर्धा दुमडा"
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
      mr: "रुग्णाला कागदाचा एक तुकडा द्या. म्हणा: 'हा कागद उजव्या हातात घ्या, तो अर्धा दुमडा आणि जमिनीवर ठेवा.'"
    },
    correctAnswer: {
      en: "Folds it in half",
      hi: "इसे आधा मोड़ता है",
      mr: "तो कागद अर्धा दुमडतो"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_command_floor_score",
    section: "language",
    question: {
      en: "3-Stage Command: Put it on the floor",
      hi: "3-चरण कमांड: इसे फर्श पर रखें",
      mr: "३-स्तरीय आज्ञा: तो जमिनीवर ठेवा"
    },
    guidance: {
      en: "Give the patient a piece of paper. Say: 'Take this paper in your right hand, fold it in half and put it on the floor.'",
      hi: "रोगी को एक कागज दें। कहें: 'इस कागज को अपने दाहिने हाथ में लें, इसे आधा मोड़ें, और इसे फर्श पर रखें।'",
      mr: "रुग्णाला कागदाचा एक तुकडा द्या. म्हणा: 'हा कागद उजव्या हातात घ्या, तो अर्धा दुमडा आणि जमिनीवर ठेवा.'"
    },
    correctAnswer: {
      en: "Puts it on the floor",
      hi: "इसे फर्श पर रखता है",
      mr: "तो कागद जमिनीवर ठेवतो"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_reading_score",
    section: "language",
    question: {
      en: "Read and obey: 'CLOSE YOUR EYES'",
      hi: "पढ़ें और पालन करें: 'अपनी आँखें बंद करें'",
      mr: "वाचा आणि पाळा: 'डोळे बंद करा'"
    },
    guidance: {
      en: "Write 'CLOSE YOUR EYES' in large letters on a piece of paper. Say: 'Please read this and do what it says.'",
      hi: "एक कागज पर बड़े अक्षरों में 'अपनी आँखें बंद करें' लिखें। कहें: 'कृपया इसे पढ़ें और जो यह कहता है वह करें।'",
      mr: "कागदाच्या तुकड्यावर मोठ्या अक्षरात 'डोळे बंद करा' असे लिहा. म्हणा: 'कृपया हे वाचा आणि त्यात जे लिहिलं आहे ते करा.'"
    },
    correctAnswer: {
      en: "Patient closes their eyes",
      hi: "रोगी अपनी आँखें बंद करता है",
      mr: "रुग्ण डोळे बंद करतो"
    },
    options: ["Correct", "Incorrect"],
  },
  {
    id: "q5_writing_score",
    section: "language",
    question: {
      en: "Write a sentence",
      hi: "एक वाक्य लिखें",
      mr: "एक वाक्य लिहा"
    },
    guidance: {
      en: "Say: 'Please write a sentence for me about anything you like. It must contain a subject and a verb and make sense.'",
      hi: "कहें: 'कृपया मेरे लिए कोई भी वाक्य लिखें जो आपको पसंद हो। इसमें एक विषय और एक क्रिया होनी चाहिए और इसका अर्थ होना चाहिए।'",
      mr: "म्हणा: 'कृपया मला तुमच्या आवडीच्या कोणत्याही विषयावर एक वाक्य लिहा. त्यात कर्ता आणि क्रियापद असावं आणि वाक्य अर्थपूर्ण असावं.'"
    },
    correctAnswer: {
      en: "A grammatically complete sentence with a subject and a verb",
      hi: "एक व्याकरणिक रूप से पूर्ण वाक्य जिसमें विषय और क्रिया हो",
      mr: "कर्ता आणि क्रियापद असलेलं व्याकरणदृष्ट्या पूर्ण वाक्य"
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
      mr: "दोन एकमेकांना छेदणाऱ्या पंचकोनांचे डिझाइन कॉपी करा."
    },
    guidance: {
      en: "Show the patient a drawing of two intersecting pentagons. Say: 'Please copy this design exactly as it is.' Score 1 point if all 10 angles are present and two pentagons intersect to form a four-sided figure.",
      hi: "रोगी को दो प्रतिच्छेदी पेंटागन का चित्र दिखाएं। कहें: 'कृपया इस डिज़ाइन की ठीक वैसी ही नकल करें।' यदि सभी 10 कोण मौजूद हैं और दो पेंटागन मिलकर एक चार-भुजा वाला आकार बनाते हैं तो 1 अंक दें।",
      mr: "रुग्णाला दोन एकमेकांना छेदणाऱ्या पंचकोनांचे चित्र दाखवा. म्हणा: 'कृपया हे डिझाइन जसंच्या तसं कॉपी करा.' जर सर्व १० कोन उपस्थित असतील आणि दोन पंचकोन एकत्र येऊन चौकोनी आकृती तयार करत असतील, तर १ गुण द्या."
    },
    correctAnswer: {
      en: "A copy of two intersecting pentagons with all 10 angles and a four-sided intersection",
      hi: "दो प्रतिच्छेदी पेंटागन की नकल जिसमें सभी 10 कोण और एक चार-भुजा वाला प्रतिच्छेद हो",
      mr: "दोन एकमेकांना छेदणाऱ्या पंचकोनांची प्रत, ज्यामध्ये सर्व १० कोन आणि चौकोनी छेदनभाग आहे."
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
      if (section === "attention" && question.id === "q3_week_total_score") {
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
  const weekTotalScore = answers.q3_week_total_score
    ? parseInt(answers.q3_week_total_score)
    : 0;
  sections.attention.current = Math.max(serial7sScore, weekTotalScore);

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