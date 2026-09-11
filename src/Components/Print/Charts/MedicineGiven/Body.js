import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import moment from "moment";
import { capitalizeWords } from "../../../../utils/toCapitalize";

Font.registerHyphenationCallback((word) => Array.from(word));

const styles = StyleSheet.create({
  title: { fontFamily: "Helvetica-Bold", fontSize: 13, marginTop: 4, marginBottom: 8 },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 8,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginRight: 4,
    flexShrink: 0,
    maxWidth: "50%",
  },
  value: { fontSize: 10, flexGrow: 1, flexBasis: 0, flexShrink: 1 },
});

const rows = (chart) => [
  { label: "Slot", value: chart?.slot || "-" },
  {
    label: "Given At",
    value: chart?.takenAt
      ? moment(chart.takenAt).format("D MMM YYYY, hh:mm A")
      : "-",
  },
  { label: "Given By", value: chart?.markedBy?.name || "-" },
  {
    label: "Comment",
    value: chart?.comment ? capitalizeWords(chart.comment) : "-",
  },
];

const MedicineGivenBody = ({ chart }) => {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={styles.title}>Medicine Given</Text>
      {rows(chart).map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}:</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
};

export default MedicineGivenBody;
