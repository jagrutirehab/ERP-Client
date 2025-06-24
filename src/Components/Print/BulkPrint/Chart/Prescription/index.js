import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";

//components
// import Header from "../../ModifiedHeader";
import PrescriptionBody from "../../../Charts/OPD/Prescription/Body";
import ChartHeader from "../ChartHeader";
// import Footer from "../../../Charts/Footer";

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

const Prescription = ({ chart, center, patient, doctor }) => {
    return (
        <React.Fragment>
            {/* <Header chart={chart} doctor={doctor} center={center} patient={patient} /> */}
            <ChartHeader chart={chart} />
            <PrescriptionBody chart={chart?.prescription} doctor={doctor} />
            {/* <Footer /> */}
        </React.Fragment>
    );
};

export default Prescription;
