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

const CheifComplaint = ({ data, styles }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        {data?.line1 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Chief Complaint 1:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.line1 || ""}
            </Text>
          </View>
        )}
        {data?.line2 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Chief Complaint 2:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.line2 || ""}
            </Text>
          </View>
        )}
        {data?.line3 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Chief Complaint 3:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.line3 || ""}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default CheifComplaint;
