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
            ...styles.justifyBetween,
            ...styles.gap10,
          }}
        >
          <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
            Informant:
          </Text>

          <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
            Self+
          </Text>

          <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
            {data.informant || ""}
          </Text>

          <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
            {data.adequate}
          </Text>

          <Text style={{ ...styles.fontMd, ...styles.textCapitalize }}>
            {data.reliable || ""}
          </Text>
        </View>
        {data?.counsellor && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Counsellor:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.counsellor || ""}
            </Text>
          </View>
        )}
        {data?.referredby && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Referred By:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.referredby || ""}
            </Text>
          </View>
        )}
        {data?.history && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              History / Onset Duration & Progress:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.history || ""}
            </Text>
          </View>
        )}
        {data?.negativeHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Negative History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.negativeHistory || ""}
            </Text>
          </View>
        )}
        {data?.pastHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Past History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.pastHistory || ""}
            </Text>
          </View>
        )}
        {data?.developmentHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Development History & Childhood/Adolescence:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.developmentHistory || ""}
            </Text>
          </View>
        )}
        {data?.occupationHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Occupation History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.occupationHistory || ""}
            </Text>
          </View>
        )}
        {data?.familyHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Family History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.familyHistory || ""}
            </Text>
          </View>
        )}
        {data?.personalHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Personal / Sexual / Marital History:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.personalHistory || ""}
            </Text>
          </View>
        )}
        {data?.personality && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Personality:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.personality || ""}
            </Text>
          </View>
        )}
        {data?.socialSupport && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Social Support:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.socialSupport || ""}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default DetailHistory;
