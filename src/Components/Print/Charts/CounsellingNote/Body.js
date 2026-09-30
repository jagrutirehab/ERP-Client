import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import React from "react";
import _ from "lodash";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";
import { format } from "date-fns";
import DoctorSignature from "../DoctorSignature";

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

const CounsellingBody = ({ chart, doctor }) => {
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
          {chart.objective && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Objective of The session:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.objective || ""}
              </Text>
            </View>
          )}
          {chart.shortTermGoals && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Short term goals:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.shortTermGoals || ""}
              </Text>
            </View>
          )}
          {chart.longTermGoals && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Long term goals:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.longTermGoals || ""}
              </Text>
            </View>
          )}
          {chart.notes && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Notes:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.notes || ""}
              </Text>
            </View>
          )}
          {chart.homework && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Homework/Task assigned:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.homework || ""}
              </Text>
            </View>
          )}
          {chart.reviewPreviousTask && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Review of previous task:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.reviewPreviousTask || ""}
              </Text>
            </View>
          )}

          {chart.conclusion && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Conclusion:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.conclusion || ""}
              </Text>
            </View>
          )}
          {chart.nextEndGoal && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Goal for next session:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.nextEndGoal || ""}
              </Text>
            </View>
          )}
          {chart.endGoalAchieved && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>End goal achieved:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.endGoalAchieved || ""}
              </Text>
            </View>
          )}
          {chart.nextSessionDate && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Next session date:</Text>
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
      <DoctorSignature doctor={doctor} />
    </React.Fragment>
  );
};

export default CounsellingBody;
