import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import React from "react";
import _ from "lodash";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";
import { format } from "date-fns";

Font.register({
  family: "Hindi",
  fonts: [
    {
      src: TroiDevanagariHindi,
      // fontWeight: '',
    },
  ],
});

Font.register({
  family: "Marathi",
  fonts: [
    {
      src: TroiDevanagariMarathi,
      // fontWeight: '',
    },
  ],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col5: {
    width: "30%",
  },
  fontMarathi: {
    fontFamily: "Marathi",
  },
  col6: {
    width: "33.3%",
  },
  col7: {
    width: "70%",
  },
  image: {
    height: "auto",
    width: "100%",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  mrgnTop5: {
    marginTop: 5,
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnBottom10: {
    marginBottom: 10,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  mrgnTop30: {
    marginTop: 30,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
  preLine: {
    whiteSpace: "pre-line",
  },
});

const CounsellingBody = ({ chart }) => {
  const renderImage = (src) => <Image src={src} style={styles.image} />;
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.mrgnTop10,
          //   ...styles.mrgnBottom10,
          ...styles.fontMarathi,
        }}
      >
        <View>
          <Text style={{ fontSize: "13px" }}>Counselling Notes</Text>
        </View>
        <View style={styles.mrgnTop10}>
          {chart.conclusion && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Conclusion:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.conclusion || ""}
              </Text>
            </View>
          )}
          {chart.endGoalAchieved && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>End Goal Achieved:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.endGoalAchieved || ""}
              </Text>
            </View>
          )}
          {chart.nextEndGoal && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>End Goal for Next Session:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.nextEndGoal || ""}
              </Text>
            </View>
          )}
          {chart.nextSessionDate && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Next Session Date:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {format(new Date(chart.nextSessionDate), "dd MMM yyyy") || ""}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 40 }}>
          {chart.files?.length && (
            <View>
              <Text style={{ marginBottom: 20 }}>Images:</Text>
            </View>
          )}
          {_.chunk(chart.files || [], 3).map((chunk) => {
            return (
              <View
                key={chunk[0]._id}
                style={{
                  ...styles.row,
                  ...styles.mrgnTop10,
                  alignItems: "center",
                }}
              >
                {chunk.map((img, idx) => (
                  <View
                    key={img._id}
                    style={{
                      ...styles.col6,
                      border: "1px solid purple",
                      marginLeft: idx === 1 ? 5 : 0,
                      marginRight: idx === 1 ? 5 : 0,
                    }}
                    wrap={false}
                  >
                    {renderImage(img.url)}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </View>
    </React.Fragment>
  );
};

export default CounsellingBody;
