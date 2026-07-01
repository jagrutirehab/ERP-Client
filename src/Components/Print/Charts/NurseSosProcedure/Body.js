import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: "9px",
    color: "#1d1d1d",
  },
  title: {
    fontSize: "13px",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  colType: {
    width: "35%",
    paddingRight: 6,
  },
  colDesc: {
    width: "65%",
    paddingRight: 6,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

// Reads both the new multi-row shape and legacy single-entry records
const normalizeRows = (data) => {
  if (data?.rows?.length) return data.rows;
  if (data?.activityType || data?.description) {
    return [{ activityType: data.activityType, description: data.description }];
  }
  return [];
};

const NurseSosProcedureBody = ({ chart }) => {
  const rows = normalizeRows(chart);
  return (
    <React.Fragment>
      <View style={styles.container}>
        <Text style={styles.title}>Nurse SOS Procedure</Text>
        <View
          style={{ ...styles.row, ...styles.borderBottom, paddingBottom: 5 }}
        >
          <Text style={styles.colType}>ACTIVITY TYPE</Text>
          <Text style={styles.colDesc}>DESCRIPTION</Text>
        </View>
        {rows.length ? (
          rows.map((row, idx) => (
            <View
              key={idx}
              style={{
                ...styles.row,
                ...styles.borderBottom,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              <Text style={styles.colType}>{row.activityType || "-"}</Text>
              <Text style={styles.colDesc}>{row.description || "-"}</Text>
            </View>
          ))
        ) : (
          <View style={{ paddingTop: 5 }}>
            <Text>No entries</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default NurseSosProcedureBody;
