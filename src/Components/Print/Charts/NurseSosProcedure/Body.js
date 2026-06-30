import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: "11px",
    color: "#1d1d1d",
  },
  title: {
    fontSize: "13px",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "30%",
  },
  value: {
    width: "70%",
  },
  descLabel: {
    marginBottom: 4,
  },
});

const NurseSosProcedureBody = ({ chart }) => {
  return (
    <React.Fragment>
      <View style={styles.container}>
        <Text style={styles.title}>Nurse SOS Procedure</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Activity Type:</Text>
          <Text style={styles.value}>{chart?.activityType || "-"}</Text>
        </View>
        {chart?.description ? (
          <View>
            <Text style={styles.descLabel}>Description:</Text>
            <Text>{chart.description}</Text>
          </View>
        ) : null}
      </View>
    </React.Fragment>
  );
};

export default NurseSosProcedureBody;
