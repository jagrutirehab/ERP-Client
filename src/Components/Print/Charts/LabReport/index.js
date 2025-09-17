import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import Footer from "../Footer";
import Header from "../Header";
import Body from "./Body";
import DoctorSignature from "../DoctorSignature";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    height: "100%",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 30,
    flexDirection: "column",
  },
});

const LabReport = ({ chart, center, patient }) => {
  const reports = chart?.labReport?.reports || [];
  return (
    <React.Fragment>
      {reports.map((report, idx) => (
        <View key={idx} style={styles.page}>
          {idx === 0 && (
            <Header patient={patient} chart={chart} center={center} />
          )}
          <Body report={report} key={idx} idx={idx} />
        </View>
      ))}
      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default LabReport;
