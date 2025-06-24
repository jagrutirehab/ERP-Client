import franc from "franc-min";

// Function to extract different languages and style them accordingly
export const languageSpliter = (inputString) => {
  // Define font families for different languages
  const fontFamilies = {
    eng: "Roboto", // English
    mar: "Marathi", // Marathi
    hin: "Hindi", // Hindi
  };

  // Style the text based on detected language
  const styledText = inputString
    .split(" ")
    .map((word) => {
      // Determine language of each word
      const detectedLang = franc(word, { only: ["eng", "mar", "hin"] });

      // Apply corresponding font family
      return `<Text style={{fontFamily: ${
        fontFamilies[detectedLang] || fontFamilies.eng
      }}}>${word}</Text> `;
    })
    .join(" ");

  // Wrap styled text in a single wrapper
  return styledText;
};
