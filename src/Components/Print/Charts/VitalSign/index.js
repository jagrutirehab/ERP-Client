import React, { useState } from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
import Header from "../Header";
import VitalSignsTable from "./Table";
import Footer from "../Footer";

// const styles = StyleSheet.create({
//   page: {
//     fontFamily: "Helvetica",
//     height: "100%",
//     fontSize: 11,
//     paddingTop: 30,
//     paddingLeft: 30,
//     paddingRight: 30,
//     // paddingBottom: 30,
//     flexDirection: "column",
//   },
// });

const VitalSign = ({ chart, center, patient }) => {
  return (
    <React.Fragment>
      {/* <Document>
        <Page style={styles.page} size="A4" wrap> */}
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
      />
      <VitalSignsTable chart={chart.vitalSign || {}} />
      <Footer />
      {/* </Page>
      </Document> */}
    </React.Fragment>
  );
};

export default VitalSign;
