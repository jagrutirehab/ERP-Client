import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";
import MentalExaminationBody from "../MentalExaminationBody";

const MentalExamination = ({ chart, center, patient, admission }) => {
    return (
        <React.Fragment>
            <Header
                chart={chart}
                center={center}
                patient={patient}
                admission={admission}
            />
            <MentalExaminationBody chart={chart.mentalExamination} patient={patient} />
            <DoctorSignature doctor={chart?.author} />
            <Footer />
        </React.Fragment>
    );
};

export default MentalExamination;
