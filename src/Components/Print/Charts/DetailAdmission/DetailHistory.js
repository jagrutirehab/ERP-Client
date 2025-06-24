import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

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

const DetailHistory = ({ data, styles }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        <View
          style={{
            ...styles.row,
            ...styles.itemsCenter,
            ...styles.gap10,
            ...styles.jusitfyBetween,
          }}
        >
          <View
            style={{
              ...styles.row,
              ...styles.itemsCenter,
              ...styles.jusitfyBetween,
              ...styles.w50,
            }}
          >
            <Text style={{ ...styles.fontMd, ...styles.textUppercase }}>
              informant{" "}
            </Text>
          </View>

          <View style={{ ...styles.w50 }}>
            <View
              style={{
                ...styles.row,
                ...styles.itemsCenter,
                gap: 10,
                ...styles.mrgnBottom5,
              }}
            >
              <Text style={{ ...styles.fontMd, ...styles.textUppercase }}>
                Self{" "}
              </Text>
              <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
                {data.informant || ""}+
              </Text>
            </View>
            <View
              style={{
                ...styles.row,
                ...styles.itemsCenter,
                ...styles.justifyBetween,
              }}
            >
              <Text style={{ ...styles.fontMd, ...styles.textUppercase }}>
                {data.adequate}
              </Text>
              <Text style={{ ...styles.fontMd, ...styles.textUppercase }}>
                {data.reliable || ""}
              </Text>
            </View>
          </View>
        </View>
        {data?.history && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              History / Onset Duration & Progress:
            </Text>
            <Text style={styles.preText}>{data?.history || ""}</Text>
          </View>
        )}
        {data?.negativeHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Negative History:</Text>
            <Text style={styles.preText}>{data?.negativeHistory || ""}</Text>
          </View>
        )}
        {data?.pastHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Past History:</Text>
            <Text style={styles.preText}>{data?.pastHistory || ""}</Text>
          </View>
        )}
        {data?.developmentHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Development History & Childhood/Adolescence:
            </Text>
            <Text style={styles.preText}>{data?.developmentHistory || ""}</Text>
          </View>
        )}
        {data?.occupationHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Occupation History:</Text>
            <Text style={styles.preText}>{data?.occupationHistory || ""}</Text>
          </View>
        )}
        {data?.familyHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Family History:</Text>
            <Text style={styles.preText}>{data?.familyHistory || ""}</Text>
          </View>
        )}
        {data?.personalHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Personal / Sexual / Marital History:
            </Text>
            <Text style={styles.preText}>{data?.personalHistory || ""}</Text>
          </View>
        )}
        {data?.personality && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Personality:</Text>
            <Text style={styles.preText}>{data?.personality || ""}</Text>
          </View>
        )}
        {data?.socialSupport && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Social Support:</Text>
            <Text style={styles.preText}>{data?.socialSupport || ""}</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default DetailHistory;
