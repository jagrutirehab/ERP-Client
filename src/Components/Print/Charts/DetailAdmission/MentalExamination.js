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

const MentalExamination = ({ data, styles }) => {
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
          mental status examination:
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
              <Text>
                {d[0] === "effect" ? "Affect" : separateCamelCase(d[0])}:
              </Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {d[1] || ""}
            </Text>
          </View>
        ))}
        {/* {data.appearance && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>appearance</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.appearance || ""}
            </Text>
          </View>
        )}
        {data.ecc && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>ecc / rapport</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.ecc || ""}
            </Text>
          </View>
        )}
        {data.speech && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>speech</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.speech || ""}
            </Text>
          </View>
        )}
        {data.mood && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>mood</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.mood || ""}
            </Text>
          </View>
        )}
        {data.effect && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>effect</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.effect || ""}
            </Text>
          </View>
        )}
        {data.thinking && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>thinking</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.thinking || ""}
            </Text>
          </View>
        )}
        {data.perception && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>preception</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.perception || ""}
            </Text>
          </View>
        )}
        {data.memory && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>memory</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.memory || ""}
            </Text>
          </View>
        )}
        {data.abstractThinking && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>abstract thinking</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.abstractThinking || ""}
            </Text>
          </View>
        )}
        {data.socialJudgment && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>social judgment</Text>
            </View>
            <Text style={{ ...styles.w70 }}>{data.socialJudgment || ""}</Text>
          </View>
        )}
        {data.insight && (
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.checkBlock,
              ...styles.paddingLeft5,
            }}
          >
            <View
              style={{ ...styles.w30, ...styles.row, ...styles.textUppercase }}
            >
              <Text>insight</Text>
            </View>
            <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
              {data.insight || ""}
            </Text>
          </View>
        )} */}
      </View>
    </React.Fragment>
  );
};

export default MentalExamination;
