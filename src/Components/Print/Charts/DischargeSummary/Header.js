import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { format } from "date-fns";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const styles = StyleSheet.create({
  header: {
    textAlign: "center",
  },
  headingWrap: {
    padding: 12,
    borderBottom: "2px dashed black",
  },
  heading: {
    fontSize: "20px",
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  fontSize11: {
    fontSize: "11px",
  },
  marginTop: {
    marginTop: 10,
  },
  marginBottom: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  col4: {
    textAlign: "left",
    marginBottom: 10,
    width: "33.3%",
  },
  col6: {
    textAlign: "left",
    marginBottom: 10,
    width: "50%",
  },
});

const SummaryHeader = ({ patient }) => {
  const addmissionDate =
    patient?.addmission?.addmissionDate &&
    format(new Date(patient?.addmission?.addmissionDate), "dd MMM yyyy");

  const dischargeDate =
    patient?.addmission?.dischargeDate &&
    format(new Date(patient?.addmission?.dischargeDate), "dd MMM yyyy");

  return (
    <React.Fragment>
      <View style={styles.header}>
        <View style={{ ...styles.headingWrap, ...styles.marginBottom }}>
          <Text style={styles.heading}>AROGYA NIDHI PSYCHIATRY UNIT</Text>
        </View>
        <View
          style={{
            ...styles.marginTop,
            padding: 12,
            borderBottom: "2px dashed black",
          }}
        >
          <Text style={{ ...styles.fontSize11, ...styles.marginBottom }}>
            BHARTIYA AROGYA NIDHI HOSPITAL SHETH KANTILAL C. PARIKH GENERAL
            HOSPITAL
          </Text>
          <Text style={{ ...styles.fontSize11, ...styles.marginBottom }}>
            N.S. Road No. 13, Juhu Scheme, Vile Parle (W), Mumbai - 400 049.
          </Text>
          <Text style={{ ...styles.fontSize11, ...styles.marginBottom }}>
            Phone No. : 2620 6493 / 2620 6021 Extn No. 215
          </Text>
          <Text style={{ ...styles.fontSize11, ...styles.marginBottom }}>
            Helpline: 09930203030 / 09930204040 / 09920769207
          </Text>
          <Text style={{ ...styles.fontSize11, ...styles.marginBottom }}>
            E-mail : psychiatry.arogyanidhi@gmail.com
          </Text>
        </View>
        <View
          style={{
            marginTop: 50,
            marginBottom: 50,
          }}
        >
          <Text style={styles.heading}>Discharge Summary</Text>
        </View>
        <View>
          <View style={styles.row} fixed>
            <Text style={styles.col6}>
              Patient&#39;s Name : {patient?.firstName || ""}
            </Text>
            <Text style={{ ...styles.col6, textAlign: "center" }}>
              I.P.D NO: {patient?.IPDFileNo || ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col4}>Age: 40</Text>
            <Text style={styles.col4}>Gender: {patient?.gender || ""}</Text>
            <Text style={styles.col4}>Class: Twin Non AC</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col6}>
              Date of Admission : {addmissionDate || ""}
            </Text>
            <Text style={styles.col6}>Date of Discharge : 18/06/22</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col6}>Time of Admission : 5:00 pm</Text>
            <Text style={styles.col6}>Time of Discharge : 12:00 pm</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col6}>
              Consultant&#39;s Name : Dr. Rashmin Cholera
            </Text>
            <Text style={{ ...styles.col6, textAlign: "center" }}>
              Speciality : Psychiatry
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: "13px",
                fontFamily: "Roboto",
                fontWeight: "heavy",
              }}
            >
              Referred By : {patient?.referedBy || ""}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                fontFamily: "Roboto",
                fontWeight: "heavy",
              }}
            >
              Diagnosis : Schizophrenia
            </Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default SummaryHeader;
