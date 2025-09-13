import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";

//table
import PrescriptionTable from "./Table";

import TroiDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import TroiDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";

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
  row: {
    flexDirection: "row",
  },
  instr: {
    fontFamily: "Roboto",
    fontSize: "12px",
  },
  fontMd: {
    fontSize: "11px",
    fontWeight: "normal",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnBottom10: {
    marginBottom: 20,
  },
  mrgnTop60: {
    marginTop: 200,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  col6: {
    width: "50%",
  },
  textRight: {
    textAlign: "right",
  },
  textCapitalize: {
    textTransform: "capitalize",
  },
  textWrap: {
    whiteSpace: "wrap",
  },
});

const Body = ({ chart, doctor }) => {
  return (
    <React.Fragment>
      <View style={{ ...styles.mrgnTop10, ...styles.mrgnBottom10 }}>
        {chart.drNotes && (
          <View>
            <Text style={styles.instr}>Observations / Complaints:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.notes}
            </Text>
          </View>
        )}
        {chart.diagnosis && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Diagnosis:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.diagnosis}
            </Text>
          </View>
        )}
        {chart.medicines.length > 0 && (
          <View style={styles.mrgnTop10}>
            <Text style={{ marginBottom: 10 }}>Prescription</Text>
            <PrescriptionTable medicines={chart.medicines} />
          </View>
        )}
        {chart.drNotes && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Notes:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.drNotes}
            </Text>
          </View>
        )}
        {chart.investigationPlan && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Investigation Plan:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.investigationPlan}
            </Text>
          </View>
        )}
        {doctor && (
          <View
            style={{
              ...styles.row,
              ...styles.mrgnTop60,
              ...styles.textRight,
            }}
          >
            <View style={styles.col6}></View>
            <View
              style={{
                ...styles.col6,
                textAlign: "center",
              }}
            >
              <Text style={{ ...styles.textCapitalize, ...styles.instr }}>
                Dr. {doctor?.name || ""}
              </Text>
              <Text>{doctor?.degrees || ""}</Text>
              {doctor?.speciality && <Text>{doctor?.speciality}</Text>}
              {doctor?.registrationNo && (
                <Text>Reg. No. -{doctor?.registrationNo}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default Body;
