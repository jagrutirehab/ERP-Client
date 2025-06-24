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

const Diagnosis = ({ data, styles }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        {data?.diagnosis && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textUppercase }}>
              diagnosis:
            </Text>
            <Text style={styles.preText}>{data?.diagnosis || ""}</Text>
          </View>
        )}
        {data?.managmentPlan && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13 }}>
              MANAGMENT PLAN: (INDOOR - with reason for admission)
            </Text>
            <Text style={styles.preText}>{data?.managmentPlan || ""}</Text>
          </View>
        )}
        {data?.investigation?.length > 0 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textUppercase }}>
              investigations:
            </Text>
            <Text style={styles.preText}>
              {data?.investigation.join(", ") || ""}
            </Text>
          </View>
        )}

        {data?.managment && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textUppercase }}>
              special test:
            </Text>
            <Text style={styles.preText}>{data?.managment || ""}</Text>
          </View>
        )}

        {data?.treatment && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={{ ...styles.fontSize13, ...styles.textUppercase }}>
              treatment:
            </Text>
            <Text style={styles.preText}>{data?.treatment || ""}</Text>
          </View>
        )}

        <View
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
        </View>
      </View>
    </React.Fragment>
  );
};

export default Diagnosis;
