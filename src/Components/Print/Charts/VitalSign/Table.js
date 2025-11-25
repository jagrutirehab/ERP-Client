import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col4: {
    width: "20%",
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
  mrgnBottom10: {
    marginBottom: 30,
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

const VitalSignsTable = ({ chart }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.fontSm,
          ...styles.mrgnBottom10,
          ...styles.mrgnTop10,
        }}
      >
        <Text style={{ fontSize: "13px" }}>Vital Signs</Text>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            paddingBottom: 5,
            ...styles.mrgnTop10,
          }}
        >
          <Text style={styles.col4}>WEIGHT (kg)</Text>
          <Text style={styles.col4}>B.P. (mmHg)</Text>
          <Text style={styles.col4}>PULSE (Heart beats/min)</Text>
          <Text style={styles.col4}>TEMPERATURE (°C)</Text>
          <Text style={styles.col4}>RESP.RATE (Breaths/min)</Text>
          <Text style={styles.col4}>CNS</Text>
          <Text style={styles.col4}>CVS</Text>
          <Text style={styles.col4}>RS</Text>
          <Text style={styles.col4}>PA</Text>
        </View>
        <View
          style={{
            ...styles.borderBottom,
            paddingTop: 5,
            paddingBottom: 5,
          }}
        >
          <View style={styles.row}>
            <Text style={styles.col4}>{chart.weight || ""}</Text>
            <Text style={styles.col4}>
              {chart.bloodPressure.systolic || ""} {" / "}
              {chart.bloodPressure.diastolic || ""}
            </Text>
            <Text style={styles.col4}>{chart.pulse || ""}</Text>
            <Text style={styles.col4}>{chart.temprature || ""}</Text>
            <Text style={styles.col4}>{chart.respirationRate || ""}</Text>
            <Text style={styles.col4}>{chart.cns || ""}</Text>
            <Text style={styles.col4}>{chart.cvs || ""}</Text>
            <Text style={styles.col4}>{chart.rs || ""}</Text>
            <Text style={styles.col4}>{chart.pa || ""}</Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default VitalSignsTable;
