import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import separateCamelCase from "../../../../utils/separateCamelCase";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const MentalExamination = ({ data, styles }) => {
  // 🔧 Rename rules for cleaner field labels
  const renameMap = {
    ecc: "Eye to Eye contact and Rapport",
  };

  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        <Text
          style={{
            ...styles.textCapitalize,
            ...styles.mrgnBottom10,
            ...styles.fontSize13,
          }}
        >
          Mental Status Examination:
        </Text>

        {Object.entries(data).map(([key, value], i) => {
          const normalizedKey = key.toLowerCase();
          const formattedKey =
            renameMap[normalizedKey] || separateCamelCase(key);

          return (
            <View
              key={i}
              style={{
                ...styles.row,
                ...styles.itemsCenter,
                ...styles.checkBlock,
                ...styles.paddingLeft5,
              }}
            >
              <View
                style={{
                  ...styles.w30,
                  ...styles.row,
                  ...styles.textCapitalize,
                }}
              >
                <Text>{formattedKey}:</Text>
              </View>
              <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
                {value || ""}
              </Text>
            </View>
          );
        })}
      </View>
    </React.Fragment>
  );
};

export default MentalExamination;
