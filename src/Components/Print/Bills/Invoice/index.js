import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

import Table from "./Table";
import Header from "./Header";
import Footer from "./Footer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    // paddingBottom: 30,
    flexDirection: "column",
  },
});

const Invoice = ({ bill, center, patient }) => {
  return (
    <React.Fragment>
      <Document>
        <Page size="A4" style={styles.page}>
          <Header patient={patient} center={center} bill={bill} />
          <Table bill={bill} />
          <Footer center={center} bill={bill} />
        </Page>
      </Document>
    </React.Fragment>
  );
};

export default Invoice;
