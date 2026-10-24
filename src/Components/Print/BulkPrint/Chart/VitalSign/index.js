import React from "react";
// import { Page, Document, StyleSheet } from "@react-pdf/renderer";

//components
// import Header from "../Header";
import VitalSignsTable from "../../../Charts/VitalSign/Table";
import ChartHeader from "../ChartHeader";
// import Footer from "../Footer";

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


const VitalSign = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            {/* <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
      /> */}
      <ChartHeader chart={chart} />
            <VitalSignsTable chart={chart.vitalSign || {}} />

            {/* <Footer /> */}
        </React.Fragment>
    );
};

export default VitalSign;
