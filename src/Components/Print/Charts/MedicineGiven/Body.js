import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import moment from "moment";
import { capitalizeWords } from "../../../../utils/toCapitalize";

Font.registerHyphenationCallback((word) => Array.from(word));

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: "11px",
    color: "#1d1d1d",
  },
  title: {
    fontSize: "15px",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  colSlot: {
    width: "15%",
    paddingRight: 6,
  },
  colTime: {
    width: "25%",
    paddingRight: 6,
  },
  colBy: {
    width: "25%",
    paddingRight: 6,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
  commentLabel: {
    marginTop: 8,
    marginBottom: 3,
  },
  commentValue: {},
});

const MedicineGivenBody = ({ chart }) => {
  return (
    <React.Fragment>
      <View style={styles.container}>
        <Text style={styles.title}>Medicine Given</Text>
        <View
          style={{ ...styles.row, ...styles.borderBottom, paddingBottom: 5 }}
        >
          <Text style={styles.colSlot}>SLOT</Text>
          <Text style={styles.colTime}>GIVEN AT</Text>
          <Text style={styles.colBy}>GIVEN BY</Text>
        </View>
        <View
          style={{
            ...styles.row,
            paddingTop: 5,
            paddingBottom: 5,
          }}
        >
          <Text style={styles.colSlot}>{chart?.slot || "-"}</Text>
          <Text style={styles.colTime}>
            {chart?.takenAt
              ? moment(chart.takenAt).format("D MMM YYYY, hh:mm A")
              : "-"}
          </Text>
          <Text style={styles.colBy}>{chart?.markedBy?.name || "-"}</Text>
        </View>
        <Text style={styles.commentLabel}>COMMENT</Text>
        <Text style={styles.commentValue}>
          {chart?.comment ? capitalizeWords(chart.comment) : "-"}
        </Text>
      </View>
    </React.Fragment>
  );
};

export default MedicineGivenBody;
