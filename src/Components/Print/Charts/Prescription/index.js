import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
import Header from "../Header";
import Body from "./Body";
import Footer from "../Footer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    height: "100%",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
    // paddingBottom: 10,
    flexDirection: "column",
  },
});

const Prescription = ({ chart, center, patient }) => {
  return (
    <React.Fragment>
      {/* <Document>
        <Page style={styles.page} size="A4" wrap> */}
      <Header
        chart={chart}
        doctor={chart?.author}
        center={center}
        patient={patient}
      />
      <Body chart={chart?.prescription} doctor={chart?.author} />
      <Footer />
      {/* </Page>
      </Document> */}
    </React.Fragment>
  );
};

export default Prescription;
