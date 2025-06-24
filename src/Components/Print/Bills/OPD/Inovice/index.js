import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
import InvHeader from "../../Invoice/Header";
import Header from "./Components/Header";
import Body from "./Components/Body";
import Footer from "./Components/Footer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    // paddingBottom: 30,
    flexDirection: "column",
  },
});

const OPDInvoice = ({ bill, center, patient }) => {
  return (
    <React.Fragment>
      <Document>
        <Page size="A4" style={styles.page}>
          <InvHeader bill={bill} center={center} patient={patient} />
          <Header patient={patient} bill={bill} />
          <Body bill={bill?.receiptInvoice} />
          <Footer bill={bill} />
        </Page>
      </Document>
    </React.Fragment>
  );
};

export default OPDInvoice;
