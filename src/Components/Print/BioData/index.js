import Footer from "../Charts/Footer";
import PropTypes from "prop-types";
import { Document, Page, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import Body from "./Body";
import Header from "./Header";

Font.register({
  family: "Roboto",
  fonts: [{ src: Roboto, fontWeight: "heavy" }],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
  },
});

const BioDataPdf = ({ patient, user, addmission }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header date={new Date()} patient={patient || {}} user={user || {}} />
        <Body patient={patient} addmission={addmission} />
        <Footer />
      </Page>
    </Document>
  );
};

BioDataPdf.propTypes = {
  patient: PropTypes.object,
  user: PropTypes.object,
};

export default BioDataPdf;
