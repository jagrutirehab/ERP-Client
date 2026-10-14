import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

import Header from "./Header";
import Table from "./Table";
import Footer from "./Footer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    flexDirection: "column",
  },
});

// Patient-wide, read-only invoice-history ledger (bank-statement style).
// Deliberately kept separate from Components/Print/Bills/Invoice (the
// single-bill print template) — this renders the pre-computed rows/totals
// from the ledger endpoint, it never touches invoice creation/edit state.
const Ledger = ({ patient, admission, center, rows, totals }) => {
  const activeCenter =
    (admission?.center && typeof admission.center === "object" && admission.center.name)
      ? admission.center
      : (center && typeof center === "object" && center.name)
      ? center
      : (patient?.center && typeof patient.center === "object" && patient.center.name)
      ? patient.center
      : center || patient?.center;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header patient={patient} admission={admission} center={activeCenter} />
        <Table rows={rows} totals={totals} />
        <Footer />
      </Page>
    </Document>
  );
};

export default Ledger;
