import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";

//fonts
import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";
import DoctorSignature from "../DoctorSignature";

Font.register({
  family: "Marathi",
  fonts: [
    {
      src: TroiDevanagariMarathi,
      // fontWeight: '',
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
      // fontWeight: '',
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
  fontHindi: {
    fontFamily: "Hindi",
  },
  fontMarathi: {
    fontFamily: "Marathi",
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
    // textAlign: 'center',
    borderTop: "1px dashed #1d1d1d",
    marginTop: 25,
    paddingTop: 5,
    paddingBottom: 10,
    fontSize: "10px",
  },
  fixedContactInfo: {
    marginTop: 2,
    flexDirection: "row",
    // justifyContent: 'space-between',
    paddingBottom: 20,
    fontSize: "10px",
  },
  mrgnLeft5: {
    marginLeft: 5,
  },
});
//&#39;s

const SummaryFooter = ({ chart, patient, center }) => {
  const data = chart.dischargeSummary;
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
            Discharge Summary Prepared By: {data?.summaryPreparedBy || ""}
          </Text>
        </View>
        {data?.typeOfDischarge && (
          <View
            style={{ ...styles.row, ...styles.marginBottom, ...styles.col12 }}
          >
            <Text
              style={{
                ...styles.col6,
                ...styles.fontBold,
              }}
            >
              Type of Discharge :{" "}
              <Text style={styles.fontHindi}>
                {data?.typeOfDischarge || ""}
              </Text>
            </Text>
            {/* <Text style={styles.col6}>Date: 18/06/2022</Text> */}
          </View>
        )}
        {data?.dischargeRoutine && (
          <Text
            style={{
              ...styles.fontBold,
              ...styles.marginBottom,
            }}
          >
            Discharge Routine:{" "}
            <Text
              style={{
                ...styles.fontMarathi,
              }}
            >
              {data?.dischargeRoutine || ""}
            </Text>
          </Text>
        )}
        <View style={{ ...styles.row, ...styles.marginBottom }}>
          <Text style={{ ...styles.col6, ...styles.textCapitalize }}>
            Name of Patient:{" "}
            <Text style={styles.textCapitalize}>{patient.name || ""}</Text>
          </Text>
          <Text style={styles.col6}>Signature</Text>
        </View>
        <View style={{ ...styles.row, ...styles.marginBottom }}>
          <Text style={{ ...styles.col6 }}>
            Name of Patient Relative:{" "}
            <Text style={styles.textCapitalize}>
              {patient.guardianName || ""}
            </Text>
          </Text>
          <Text style={styles.col6}>Signature</Text>
        </View>
      </View>
      <DoctorSignature doctor={chart?.author} />

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

export default SummaryFooter;
