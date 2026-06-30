import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const labelMap = {
  physiotherapy: "Physiotherapy",
  walking: "Walking",
  homeMedicines: "Home Medicines",
  exercise: "Exercise",
  foodRequirement: "Food Requirement",
  externalDoctorVisits: "External Doctor Visits",
  extraCareTaker: "Extra Care Taker",
};

const SpecialRequirements = ({ data, styles }) => {
  if (!data) return null;

  const order = Object.keys(labelMap);
  const answered = order.filter(
    (k) => data[k] === true || data[k] === false
  );

  if (answered.length === 0) return null;

  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
        wrap={false}
      >
        <Text style={styles.fontSize13}>Special Requirements:</Text>
        {answered.map((k, i) => (
          <View
            key={i}
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.gap10,
            }}
          >
            <Text style={{ ...styles.fontMd, ...styles.w50 }}>
              {labelMap[k]}:
            </Text>
            <Text style={styles.fontMd}>
              {data[k] === true ? "Yes" : "No"}
            </Text>
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default SpecialRequirements;
