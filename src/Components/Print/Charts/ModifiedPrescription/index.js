import React from "react";
import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
import Header from "../ModifiedHeader";
import PrescriptionBody from "./Body";
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

const Prescription = ({ printData, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Document>
        <Page style={styles.page} size="A4" wrap>
          <Header
            printData={printData}
            doctor={printData?.doctor}
            center={center}
            patient={patient}
            admission={admission}
          />
          <PrescriptionBody
            printData={printData.Prescription}
            doctor={printData?.doctor}
          />
          <Footer />
        </Page>
      </Document>
    </React.Fragment>
  );
};

export default Prescription;
