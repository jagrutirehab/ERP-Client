import React from "react";
// import { Page, Document, StyleSheet, View, Text } from "@react-pdf/renderer";
// import SummaryHeader from './SummaryHeader';
// import Header from "../Header";
import Body from "../../../Charts/DischargeSummary/Body";
import ChartHeader from "../ChartHeader";
// import Footer from "./Footer";

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

const DischargeSummary = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            {/* <Header chart={chart} center={center} patient={patient} /> */}
            <ChartHeader chart={chart} />
            <Body chart={chart} />
            {/* <Footer chart={chart} patient={patient} center={center} /> */}
        </React.Fragment>
    );
};

export default DischargeSummary;
