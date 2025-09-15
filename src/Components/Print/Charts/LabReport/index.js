import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
import Header from "../Header";
import Footer from "../Footer";
import Body from "./Body";

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
  return (
    <React.Fragment>
      {/* <Document>
        <Page style={{ ...styles.page }} size="A4" wrap> */}
      <Header
            chart={chart}
            center={center}
            patient={patient}
          />
      <Body chart={chart} />
      <Footer />
      {/* </Page>
      </Document> */}
    </React.Fragment>
  );
};

export default LabReport;
