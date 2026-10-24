import React from "react";

//components
// import Header from "../../ModifiedHeader";
import PrescriptionBody from "../../../Charts/OPD/Prescription/Body";
import ChartHeader from "../ChartHeader";
// import Footer from "../../../Charts/Footer";


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
