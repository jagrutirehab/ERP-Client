import React from "react";
import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";
import DoctorSignature from "../DoctorSignature";

Font.register({
  family: "Marathi",
  fonts: [
    {
      src: TroiDevanagariMarathi,
    },
  ],
});

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

Font.register({
  family: "Hindi",
  fonts: [
    {
      src: TroiDevanagariHindi,
    },
  ],
});

const styles = StyleSheet.create({
  footer: {},
  row: {
    flexDirection: "row",
    width: "100%",
  },
  col12: {
    width: "100%",
  },
  col6: {
    width: "50%",
  },
  marginBottom: {
    marginBottom: 15,
  },
  fontBold: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
    fontSize: "12px",
  },
  textCapitalize: {
    textTransform: "capitalize",
  },
  textCap: {
    textTransform: "capitalize",
  },
  mrgnTop40: {
    marginTop: 40,
  },
  borderTop: {
    borderTop: "1px solid black",
  },
  textNowrap: {
    whiteSpace: "nowrap",
  },
  paddingTop5: {
    paddingTop: 5,
  },
  textCenter: {
    textAlign: "center",
  },
  fixedHeading: {
    borderTop: "1px dashed #1d1d1d",
    marginTop: 25,
    paddingTop: 5,
    paddingBottom: 10,
    fontSize: "10px",
  },
  fixedContactInfo: {
    marginTop: 2,
    flexDirection: "row",
    paddingBottom: 20,
    fontSize: "10px",
  },
  mrgnLeft5: {
    marginLeft: 5,
  },
});

const ExpirySummaryFooter = ({ chart, patient, center }) => {
  const data = chart?.expirySummary ?? {};
  return (
    <React.Fragment>
      <View wrap={false}>
        <View
          style={{
            ...styles.textNowrap,
            ...styles.fontBold,
            ...styles.textCap,
          }}
        >
          <Text>Consultant Psychiatrist: {data?.consultantName || ""}</Text>
        </View>
        <View
          style={{ ...styles.row, ...styles.marginBottom, ...styles.mrgnTop40 }}
        >
          <View
            style={{
              width: "50%",
              marginRight: 15,
              ...styles.paddingTop5,
              ...styles.textNowrap,
              ...styles.fontBold,
              ...styles.textCenter,
              ...styles.textCap,
              ...styles.borderTop,
            }}
          >
            <Text>{data?.consultantPsychologist || ""}</Text>
            <Text>Consultant Psychologist</Text>
          </View>
          <View
            style={{
              width: "50%",
              marginLeft: 15,
              ...styles.paddingTop5,
              ...styles.borderTop,
              ...styles.textCenter,
              ...styles.fontBold,
              ...styles.textCap,
            }}
          >
            <Text>{data?.consultantSignature || ""}</Text>
            <Text>MO/SMO/CMO/Consultant</Text>
          </View>
        </View>
        <View style={{ ...styles.marginBottom, ...styles.fontBold }}>
          <Text>
            Expiry Summary Prepared By: {data?.summaryPreparedBy || ""}
          </Text>
        </View>
        <View style={{ ...styles.row, ...styles.marginBottom }}>
          <Text style={{ ...styles.col6, ...styles.textCapitalize }}>
            Name of Patient:{" "}
            <Text style={styles.textCapitalize}>{patient?.name || ""}</Text>
          </Text>
          <Text style={styles.col6}>Signature</Text>
        </View>
        <View style={{ ...styles.row, ...styles.marginBottom }}>
          <Text style={{ ...styles.col6 }}>
            Name of Patient Relative:{" "}
            <Text style={styles.textCapitalize}>
              {patient?.guardianName || ""}
            </Text>
          </Text>
          <Text style={styles.col6}>Signature</Text>
        </View>
        <DoctorSignature doctor={patient?.doctorData} />
      </View>

      <View style={{ marginTop: "auto" }} fixed>
        <View style={styles.fixedHeading}>
          <Text>Reg Add: {center?.address?.replace(/\n/g, "") || ""}</Text>
        </View>
        <View style={styles.fixedContactInfo}>
          <Text>Tel: +919822207761 | +919833365230</Text>
          <Text
            style={{
              ...styles.mrgnLeft5,
              textDecoration: "underline",
              color: "#1e90ff",
            }}
          >
            E-mail : jagrutirehabmumbai@gmail.com
          </Text>
          <Text style={styles.mrgnLeft5}>Web: www.jagrutirehab.org</Text>
        </View>
      </View>
    </React.Fragment>
  );
};

export default ExpirySummaryFooter;
