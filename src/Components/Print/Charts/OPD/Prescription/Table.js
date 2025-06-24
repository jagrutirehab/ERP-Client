import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";

import Montserrat from "../../../../../assets/fonts/Montserrat-ExtraBold.ttf";
import RobotoHeavy from "../../../../../assets/fonts/Roboto-Black.ttf";
import Helvetica from "../../../../../assets/fonts/Helvetica-Neue-Bold.ttf";
import HelveticaNarrow from "../../../../../assets/fonts/Helvetica-Neue-Medium.ttf";
import HelveticaItalic from "../../../../../assets/fonts/Helvetica-Bold-Italic.ttf";
import Mukta from "../../../../../assets/fonts/Mukta-ExtraBold.ttf";
import RobotoItalic from "../../../../../assets/fonts/Roboto-BlackItalic.ttf";

// Font.register({
//   family: "Montserrat",
//   fonts: [
//     {
//       src: Montserrat,
//       fontWeight: "heavy",
//     },
//   ],
// });

Font.register({
  family: "Roboto Heavy",
  fonts: [
    {
      src: RobotoHeavy,
      // fontWeight: "heavy",
    },
  ],
});

Font.register({
  family: "Helvetica Neue",
  fonts: [
    {
      src: Helvetica,
      // fontWeight: "heavy",
    },
  ],
});

Font.register({
  family: "Roboto Italic",
  fonts: [
    {
      src: RobotoItalic,
      // fontWeight: "heavy",
    },
  ],
});

Font.register({
  family: "Helvetica Narrow",
  fonts: [
    {
      src: HelveticaNarrow,
      // fontWeight: "heavy",
    },
  ],
});

Font.register({
  family: "Helvetica Neue Italic",
  fonts: [
    {
      src: HelveticaItalic,
      fontWeight: 900,
    },
  ],
});

Font.register({
  family: "Mukta Bold",
  fonts: [
    {
      src: Mukta,
      fontWeight: 900,
    },
  ],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 6,
  },
  tableBody: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
  },
  col3: {
    width: "18%",
  },
  col4: {
    width: "24%",
  },
  col5: {
    width: "28%",
  },
  col6: {
    width: "35%",
  },
  col2: {
    width: "10%",
  },
  col1: {
    width: "5%",
  },
  fontBold: {
    fontFamily: "Helvetica Neue",
    fontSize: "11px",
    letterSpacing: "0.6px",
  },
  fontMd: {
    fontFamily: "Helvetica Narrow",
  },
  fontItalic: {
    fontFamily: "Helvetica Neue Italic",
  },
  fontSizeMd: {
    fontSize: "11px",
  },
  instr: {
    fontFamily: "Helvetica Neue",
    fontSize: "11px",
    letterSpacing: "0.6px",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  paddingTop5: {
    paddingTop: 5,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

const PrescriptionTable = ({ medicines }) => {
  return (
    <React.Fragment>
      <View style={styles.fontSm}>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            ...styles.tableHeader,
            ...styles.instr,
            // paddingBottom: 5,
          }}
        >
          <Text style={styles.col1}></Text>
          <Text style={styles.col5}>Medicine</Text>
          <Text style={styles.col3}>Dose</Text>
          <Text style={styles.col6}>Timing - Freq. - Duration</Text>
          {/* <Text style={styles.col2}>Qty</Text> */}
        </View>
        <View style={{ ...styles.tableBody }}>
          {(medicines || []).map((item, idx) => (
            <View
              key={item._id}
              style={{
                ...styles.borderBottom,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              <View style={styles.row}>
                <Text style={{ ...styles.col1, ...styles.fontBold }}>
                  {idx + 1}
                </Text>
                <Text style={{ ...styles.col5, ...styles.fontBold }}>
                  <Text style={{ textTransform: "uppercase" }}>
                    {item.medicine.type ? `${item.medicine.type} ` : ""}
                  </Text>{" "}
                  {item.medicine?.name} {item.medicine.strength || ""}{" "}
                  <Text style={{ textTransform: "uppercase" }}>
                    {item.medicine.unit || ""}
                  </Text>
                </Text>
                <Text style={{ ...styles.col3, ...styles.fontBold }}>
                  {item.dosageAndFrequency?.morning}
                  {" - "}
                  {item.dosageAndFrequency?.evening}
                  {" - "}
                  {item.dosageAndFrequency?.night}
                </Text>
                <Text
                  style={{
                    ...styles.col6,
                    ...styles.fontMd,
                    // ...styles.fontSizeMd,
                  }}
                >
                  {item.instruction && `${item.instruction} - `}
                  {item.intake} {" - "} {item.duration} {item.unit}
                </Text>
                {/* <Text style={{ ...styles.col2, ...styles.fontMd }}>
                  {item.intake}
                </Text> */}
              </View>
              {/* <View
                style={{
                  ...styles.row,
                  ...styles.paddingTop5,
                  ...styles.mrgnLeft10,
                }}
              >
                <Text style={styles.fontItalic}>Composition: </Text>
                <Text>{item.composition || "Composition goes here"}</Text>
              </View> */}
              {/* <View
                style={{
                  ...styles.row,
                  ...styles.paddingTop5,
                  ...styles.mrgnLeft10,
                }}
              >
                {/* <Text style={{ ...styles.fontItalic }}>Timing: </Text>
                <Text>
                  {item.intake || ""} {item.unit || ""}
                </Text>
              </View> */}
              {item.instructions && (
                <View
                  style={{
                    ...styles.row,
                    ...styles.paddingTop5,
                    ...styles.mrgnLeft10,
                  }}
                >
                  <Text style={{ ...styles.fontItalic }}>Instruction: </Text>
                  <Text>{item.instructions || ""}</Text>
                </View>
              )}
              {/* <View
                style={{
                  ...styles.row,
                  ...styles.paddingTop5,
                  ...styles.mrgnLeft10,
                }}
              >
                <Text style={{ ...styles.fontItalic, ...styles.fontSizeMd }}>
                  Note:{" "}
                </Text>
                <Text>{item.intake || "Intake"}</Text>
              </View> */}
            </View>
          ))}
        </View>
      </View>
    </React.Fragment>
  );
};

export default PrescriptionTable;
