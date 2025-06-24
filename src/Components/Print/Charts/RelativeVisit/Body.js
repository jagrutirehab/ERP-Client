import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import React from "react";
import _ from "lodash";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";

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
    marginBottom: 20,
  },
  mrgnTop30: {
    marginTop: 30,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
  preLine: {
    whiteSpace: "pre-line",
  },
});

const RelativeVisitBody = ({ chart }) => {
  const renderImage = (src) => <Image src={src} style={styles.image} />;
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
          ...styles.fontMarathi,
        }}
      >
        <View>
          <Text style={{ fontSize: "13px" }}>Relative Visit</Text>
        </View>
        <View style={styles.mrgnTop10}>
          {chart.nakInfo && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col6}>Nak (Nearest Available Kin) Info</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                -{chart.nakInfo || ""}
              </Text>
            </View>
          )}
          {chart.complaints && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col6}>Complaints</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                -{chart.complaints || ""}
              </Text>
            </View>
          )}
          {chart.observations && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col6}>Observations</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                -{chart.observations || ""}
              </Text>
            </View>
          )}
          {chart.diagnosis && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col6}>Diagnosis</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                -{chart.diagnosis || ""}
              </Text>
            </View>
          )}
          {chart.notes && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col6}>Notes</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                -{chart.notes || ""}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 40 }}>
          {chart.files?.length && (
            <View>
              <Text style={{ marginBottom: 20 }}>Images</Text>
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

export default RelativeVisitBody;
