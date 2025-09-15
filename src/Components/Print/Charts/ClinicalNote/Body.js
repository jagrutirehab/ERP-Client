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

const ClinicalBody = ({ chart }) => {
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
          <Text style={{ fontSize: "13px" }}>Clinical Notes</Text>
        </View>
        <View style={styles.mrgnTop10}>
          {chart.complaints && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Complaints:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.complaints || ""}
              </Text>
            </View>
          )}
          {chart.observations && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Observations:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.observations || ""}
              </Text>
            </View>
          )}
          {chart.diagnosis && (
            <View style={{ ...styles.row, ...styles.mrgnTop10 }}>
              <Text style={styles.col5}>Diagnosis:</Text>
              <Text style={{ ...styles.preLine, ...styles.col7 }}>
                {chart.diagnosis || ""}
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

export default ClinicalBody;
