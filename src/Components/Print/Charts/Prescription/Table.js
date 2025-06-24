import { View, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col4: {
    width: "24%",
  },
  col5: {
    width: "28%",
  },
  instr: {
    fontFamily: "Roboto",
    fontSize: "12px",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

const PrescriptionTable = ({ medicines }) => {
  return (
    <React.Fragment>
      <View style={styles.fontSm}>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            paddingBottom: 5,
          }}
        >
          <Text style={styles.col5}>DRUG NAME</Text>
          <Text style={styles.col4}>FREQUENCY</Text>
          <Text style={styles.col4}>DURATION</Text>
          <Text style={styles.col4}>INSTRUCTIONS</Text>
        </View>
        {(medicines || []).map((item) => (
          <View
            key={item._id}
            style={{
              ...styles.borderBottom,
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <View style={styles.row}>
              <Text style={{ ...styles.col5, textTransform: "capitalize" }}>
                <Text style={{ textTransform: "uppercase" }}>
                  {item.medicine.type ? `${item.medicine.type} ` : ""}
                </Text>
                {item.medicine?.name} {item.medicine?.strength || ""}{" "}
                <Text style={{ textTransform: "uppercase" }}>
                  {item.medicine?.unit || ""}
                </Text>
              </Text>
              <Text style={styles.col4}>
                {item.dosageAndFrequency.morning}-
                {item.dosageAndFrequency.evening}-
                {item.dosageAndFrequency.night}
              </Text>
              <Text style={styles.col4}>
                {item.duration} {item.unit}
              </Text>
              <Text style={styles.col4}>{item.intake}</Text>
            </View>
            <Text style={{ paddingTop: 5 }}>
              instructions: {item.instructions}
            </Text>
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default PrescriptionTable;
