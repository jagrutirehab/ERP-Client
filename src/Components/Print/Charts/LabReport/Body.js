import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import React from "react";
import _ from "lodash";

const styles = StyleSheet.create({
  col: {
    flexDirection: "column",
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  col4: {
    width: "30%",
  },
  col5: {
    width: "33.3%",
  },
  col6: {
    width: "50%",
  },
  col7: {
    width: "70%",
  },
  image: {
    // height: "100%",
    width: "100%",
    objectFit: "fill",
  },
  borderPurple: {
    border: "1px solid purple",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
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

const Body = ({ chart }) => {
  const labReport = chart.labReport;
  return (
    <React.Fragment>
      <View style={{ marginTop: 10, marginBottom: 20 }}>
        {(labReport?.reports || []).map((file) => (
          <View
            // break
            key={file._id}
            // debug
            style={{
              ...styles.textCenter,
              ...styles.mrgnTop30,
              height: "700px",
              //   ...styles.borderPurple,
            }}
            wrap={true}
            // wrap
          >
            <View style={{ marginTop: "auto", marginBottom: "auto" }}>
              <View>
                <Text
                  style={{
                    textTransform: "capitalize",
                    ...styles.paddingBottom10,
                  }}
                >
                  {file.name || ""}
                </Text>
              </View>
              <View style={{ ...styles.borderPurple }}>
                <Image src={file.file.url} style={styles.image} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default Body;
