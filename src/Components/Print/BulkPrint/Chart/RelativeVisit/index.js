import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";

//components
// import Header from "../Header";
import Body from "../../../Charts/RelativeVisit/Body";
import ChartHeader from "../ChartHeader";
// import Footer from "../Footer";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        height: "100%",
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 30,
        // paddingBottom: 30,
        flexDirection: "column",
    },
});

const border = "2px dashed #000";

const RelativeVisit = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            {/* <Document>
        <Page style={styles.page} size="A4" wrap> */}
            {/* <Header chart={chart} center={center} patient={patient} /> */}
            <ChartHeader chart={chart} />
            <Body chart={chart.relativeVisit} />
            {/* <Footer /> */}
            {/* </Page>
      </Document> */}
        </React.Fragment>
    );
};

export default RelativeVisit;
