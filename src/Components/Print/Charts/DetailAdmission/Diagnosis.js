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

const formatDiagnosisValue = (value) => {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return "";

        if (typeof item === "object" && item.code) {
          return item.code;
        }

        if (typeof item === "object") {
          const chars = Object.keys(item)
            .filter((k) => !isNaN(k)) 
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => item[k]);

          return chars.length ? chars.join("") : "";
        }

        if (typeof item === "string") {
          return item;
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  // If already string
  if (typeof value === "string") {
    return value;
  }

  return "";
};

const Diagnosis = ({ data, styles }) => {
  console.log("data", data);

  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        {data?.provisionaldiagnosis && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              Daignosis Plan:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {formatDiagnosisValue(data?.provisionaldiagnosis)}
            </Text>
          </View>
        )}
        {data?.diagnosis && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              diagnosis:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {formatDiagnosisValue(data?.diagnosis)}
            </Text>
          </View>
        )}
        {data?.managmentPlan && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              managment plan: (INDOOR - With Reason For Admission):
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.managmentPlan || ""}
            </Text>
          </View>
        )}
        {data?.investigation?.length > 0 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              investigations:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.investigation.join(", ") || ""}
            </Text>
          </View>
        )}

        {data?.managment && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              special test:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.managment || ""}
            </Text>
          </View>
        )}

        {data?.treatment && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textCapitalize }}>
              treatment:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.treatment || ""}
            </Text>
          </View>
        )}

        {/* <View
          wrap={false}
          style={{
            ...styles.mrgnTop30,
            ...styles.fontHeavy,
            ...styles.row,
            textAlign: "right",
            justifyContent: "flex-end",
          }}
        >
          <View>
            <Text style={{ padding: 10, borderTop: "1px solid black" }}>
              (Doctor Signature)
            </Text>
          </View>
        </View> */}
      </View>
    </React.Fragment>
  );
};

export default Diagnosis;
