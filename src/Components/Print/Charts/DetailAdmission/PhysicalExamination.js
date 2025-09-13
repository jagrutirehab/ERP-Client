import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import separateCamelCase from "../../../../utils/separateCamelCase";

//table
// import PrescriptionTable from "./Table";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const PhysicalExamination = ({ data, styles }) => {
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
          physical status examination:
        </Text>
        {Object.entries(data).map((d, i) => (
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
              style={{ ...styles.w30, ...styles.row, ...styles.textCapitalize }}
            >
              <Text>{separateCamelCase(d[0])}:</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {d[1] || ""}
            </Text>
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default PhysicalExamination;
