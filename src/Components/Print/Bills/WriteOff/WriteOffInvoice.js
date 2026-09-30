import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";
import Header from "./Header";
import Table from "./Table";
import Footer from "./Footer";

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    padding: 40,
  },
});

const WriteOffInvoice = ({ bill, patient, center }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header bill={bill} patient={patient} center={center} />
        <Table bill={bill} />
        <Footer />
      </Page>
    </Document>
  );
};

export default WriteOffInvoice;