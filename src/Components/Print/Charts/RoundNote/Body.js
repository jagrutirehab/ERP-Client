import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import React from "react";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";

Font.register({
  family: "Hindi",
  fonts: [{ src: TroiDevanagariHindi }],
});

Font.register({
  family: "Marathi",
  fonts: [{ src: TroiDevanagariMarathi }],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col5: {
    width: "30%",
  },
  col7: {
    width: "70%",
  },
  fontMarathi: {
    fontFamily: "Marathi",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnTop20: {
    marginTop: 20,
  },
  preLine: {
    whiteSpace: "pre-line",
  },
  badge: {
    backgroundColor: "#e8f0fe",
    color: "#1a56db",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: "8px",
    marginRight: 6,
  },
  badgeInfo: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: "8px",
    marginRight: 6,
  },
  divider: {
    borderBottom: "1px solid #e5e7eb",
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: "13px",
    marginBottom: 4,
  },
  staffRow: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },
  staffChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: "9px",
    marginRight: 5,
    marginBottom: 4,
  },
});

const RoundNoteBody = ({ chart }) => {
  // chart is the roundNoteChart sub-document
  const staffNames = (chart?.roundTakenBy || [])
    .map((m) => m?.name)
    .filter(Boolean);

  return (
    <React.Fragment>
      <View style={{ ...styles.mrgnTop10, ...styles.fontMarathi }}>
        {/* Section heading */}
        <View>
          <Text style={styles.sectionTitle}>Round Note</Text>
        </View>

        <View style={styles.divider} />

        {/* Session + Floor row */}
        <View style={{ ...styles.row, ...styles.mrgnTop10, flexWrap: "wrap" }}>
          {chart?.roundSession && (
            <View style={styles.badge}>
              <Text>{chart.roundSession} Round</Text>
            </View>
          )}
          {chart?.floor && (
            <View style={styles.badgeInfo}>
              <Text>Floor: {chart.floor}</Text>
            </View>
          )}
        </View>

        {/* Note body */}
        {chart?.note && (
          <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
            <Text style={styles.col5}>Note:</Text>
            <Text style={{ ...styles.preLine, ...styles.col7 }}>
              {chart.note}
            </Text>
          </View>
        )}

        {/* Staff who took the round */}
        {staffNames.length > 0 && (
          <View style={styles.mrgnTop10}>
            <View style={{ ...styles.row }}>
              <Text style={{ ...styles.col5, fontSize: "9px" }}>
                Round Taken By:
              </Text>
              <View style={{ ...styles.col7, flexDirection: "row", flexWrap: "wrap" }}>
                {staffNames.map((name, i) => (
                  <View key={i} style={styles.staffChip}>
                    <Text>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default RoundNoteBody;
